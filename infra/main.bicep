// Infraestructura de Azure para el CMS de IBGroup S.A.C.
//
// Aprovisiona todo lo necesario para correr core/server y core/client en
// producción: un Azure Container Registry, un entorno de Azure Container
// Apps con una app para cada servicio, una base de datos Azure SQL (con un
// usuario de aplicación de mínimo privilegio, nunca el admin del servidor),
// un Key Vault donde viven todos los secretos, y la identidad administrada
// que conecta unas piezas con otras.
//
// Este archivo NO se ejecuta solo: scripts/deploy.sh es el orquestador —
// crea el resource group, junta las credenciales del administrador del
// panel, genera el resto de secretos, y llama a este template dos veces
// (una para crear la infraestructura base con imágenes de marcador de
// posición, y otra para apuntar los Container Apps a las imágenes reales
// que build+push a este mismo ACR entre ambas llamadas).

@minLength(3)
@maxLength(10)
@description('Prefijo corto usado para nombrar todos los recursos.')
param namePrefix string = 'ibgroup'

@description('Región de Azure donde se crean todos los recursos.')
param location string = resourceGroup().location

@description('Object ID (Entra ID) de quien ejecuta el deployment. Recibe permisos de escritura sobre el Key Vault para poder crear los secretos en este mismo despliegue.')
param deployerPrincipalId string

@description('Imagen completa del backend (registry/repo:tag). Usa una imagen pública de marcador de posición hasta que exista una imagen real en el ACR creado por este template.')
param serverImage string = 'mcr.microsoft.com/dotnet/samples:aspnetapp'

@description('Imagen completa del frontend (registry/repo:tag).')
param clientImage string = 'mcr.microsoft.com/azuredocs/aci-helloworld:latest'

@description('Login administrador del servidor lógico de Azure SQL (equivalente a "sa"). El backend nunca se conecta con este usuario.')
param sqlAdminLogin string = 'ibgroupsqladmin'

@secure()
@description('Password del administrador del servidor lógico de Azure SQL.')
param sqlAdminPassword string

@description('Nombre de la base de datos de la aplicación.')
param appDbName string = 'IBGroupCMS'

@description('Usuario dedicado y de mínimo privilegio (db_owner solo en esta base de datos) que usa el backend para conectarse — nunca el admin del servidor.')
param appDbUser string = 'ibgroup_app'

@secure()
@description('Password del usuario de aplicación.')
param appDbPassword string

@description('SKU de Azure SQL Database.')
param sqlSkuName string = 'Basic'

@secure()
@description('Clave de firma de los JWT del backend. Genera una con: openssl rand -hex 32')
param jwtKey string

@description('Usuario administrador inicial del panel, sembrado por el backend en su primer arranque si la tabla de usuarios está vacía.')
param seedAdminUsername string = 'admin'

@secure()
@description('Password del usuario administrador inicial del panel.')
param seedAdminPassword string

@description('Nombre completo del usuario administrador inicial del panel.')
param seedAdminFullName string = 'Administrador'

@secure()
@description('Clave de API de Anthropic para el módulo de Automatización IA. Déjala vacía para desactivar ese módulo.')
param anthropicApiKey string = ''

@description('Modelo de IA usado por el módulo de Automatización IA.')
param aiModel string = 'claude-haiku-4-5-20251001'

var uniqueSuffix = substring(uniqueString(resourceGroup().id), 0, 8)
var acrName = toLower(replace('${namePrefix}acr${uniqueSuffix}', '-', ''))
var keyVaultName = toLower('${namePrefix}-kv-${uniqueSuffix}')
var sqlServerName = toLower('${namePrefix}-sql-${uniqueSuffix}')
var logAnalyticsName = '${namePrefix}-log-${uniqueSuffix}'
var containerEnvName = '${namePrefix}-env-${uniqueSuffix}'
var identityName = '${namePrefix}-identity-${uniqueSuffix}'
var serverAppName = '${namePrefix}-server'
var clientAppName = '${namePrefix}-client'

var acrPullRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a904-e2b370133697')

// ---------------------------------------------------------------------------
// Identidad compartida: los Container Apps la usan para hacer pull del ACR y
// para leer secretos del Key Vault, sin credenciales de por medio.
// ---------------------------------------------------------------------------
resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

// ---------------------------------------------------------------------------
// Registro de contenedores
// ---------------------------------------------------------------------------
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}

resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, identity.id, 'AcrPull')
  scope: acr
  properties: {
    roleDefinitionId: acrPullRoleId
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// ---------------------------------------------------------------------------
// Azure SQL: servidor lógico + base de datos de la aplicación.
// ---------------------------------------------------------------------------
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// Los Container Apps de Consumption no tienen una IP de salida estática, así
// que se permite el rango de servicios de Azure (equivalente al toggle
// "Allow Azure services" del portal) en vez de una IP concreta.
resource sqlFirewallAllowAzureServices 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: appDbName
  location: location
  sku: {
    name: sqlSkuName
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
}

// Crea (o sincroniza la password de) un usuario de base de datos contenido,
// de mínimo privilegio — el equivalente en Azure SQL a docker/database/init.sql:
// nunca se usa el login admin del servidor para que el backend se conecte,
// solo para aprovisionar este usuario. Es idempotente, igual que init.sql.
resource appDbUserScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'create-app-db-user'
  location: location
  kind: 'AzurePowerShell'
  properties: {
    azPowerShellVersion: '11.0'
    retentionInterval: 'PT1H'
    timeout: 'PT10M'
    cleanupPreference: 'OnSuccess'
    environmentVariables: [
      { name: 'SQL_SERVER_FQDN', value: sqlServer.properties.fullyQualifiedDomainName }
      { name: 'SQL_DB_NAME', value: appDbName }
      { name: 'SQL_ADMIN_LOGIN', value: sqlAdminLogin }
      { name: 'SQL_ADMIN_PASSWORD', secureValue: sqlAdminPassword }
      { name: 'APP_DB_USER', value: appDbUser }
      { name: 'APP_DB_PASSWORD', secureValue: appDbPassword }
    ]
    scriptContent: '''
      $ErrorActionPreference = "Stop"
      Install-Module -Name SqlServer -Force -Scope CurrentUser -AllowClobber -Repository PSGallery
      Import-Module SqlServer

      $query = @"
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'$env:APP_DB_USER')
BEGIN
    CREATE USER [$env:APP_DB_USER] WITH PASSWORD = N'$env:APP_DB_PASSWORD';
END
ELSE
BEGIN
    ALTER USER [$env:APP_DB_USER] WITH PASSWORD = N'$env:APP_DB_PASSWORD';
END

IF NOT EXISTS (
    SELECT 1
    FROM sys.database_role_members rm
    JOIN sys.database_principals r ON r.principal_id = rm.role_principal_id
    JOIN sys.database_principals m ON m.principal_id = rm.member_principal_id
    WHERE r.name = N'db_owner' AND m.name = N'$env:APP_DB_USER'
)
BEGIN
    ALTER ROLE db_owner ADD MEMBER [$env:APP_DB_USER];
END
"@

      Invoke-Sqlcmd -ServerInstance $env:SQL_SERVER_FQDN -Database $env:SQL_DB_NAME `
        -Username $env:SQL_ADMIN_LOGIN -Password $env:SQL_ADMIN_PASSWORD `
        -Query $query -TrustServerCertificate -ErrorAction Stop
    '''
  }
  dependsOn: [
    sqlDatabase
    sqlFirewallAllowAzureServices
  ]
}

// ---------------------------------------------------------------------------
// Key Vault: todos los secretos que consumen los Container Apps.
// Usa el modelo clásico de access policies (en vez de RBAC) para que el
// deployer pueda escribir los secretos en el mismo despliegue que crea el
// vault, sin esperar a la propagación de un role assignment de Azure RBAC.
// ---------------------------------------------------------------------------
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: false
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: deployerPrincipalId
        permissions: {
          secrets: [ 'get', 'list', 'set', 'delete' ]
        }
      }
      {
        tenantId: subscription().tenantId
        objectId: identity.properties.principalId
        permissions: {
          secrets: [ 'get', 'list' ]
        }
      }
    ]
  }
}

resource secretSqlConnection 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'sql-connection-string'
  properties: {
    value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${appDbName};User Id=${appDbUser};Password=${appDbPassword};TrustServerCertificate=True;Encrypt=True;'
  }
}

resource secretJwtKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'jwt-key'
  properties: {
    value: jwtKey
  }
}

resource secretSeedAdminPassword 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'seed-admin-password'
  properties: {
    value: seedAdminPassword
  }
}

resource secretAnthropicApiKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'anthropic-api-key'
  properties: {
    // Key Vault secret values can't be empty strings; a single space is
    // indistinguishable from "not configured" to AiDraftGenerator, which
    // checks IsNullOrWhiteSpace before using it.
    value: empty(anthropicApiKey) ? ' ' : anthropicApiKey
  }
}

// ---------------------------------------------------------------------------
// Entorno de Azure Container Apps (necesita un Log Analytics workspace).
// ---------------------------------------------------------------------------
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: containerEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ---------------------------------------------------------------------------
// core/server — solo accesible dentro del entorno (ingress interno), nunca
// expuesto directamente a internet. core/client le habla por su FQDN interno.
// ---------------------------------------------------------------------------
resource serverApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: serverAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 8080
        transport: 'auto'
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: identity.id
        }
      ]
      secrets: [
        {
          name: 'sql-connection-string'
          keyVaultUrl: secretSqlConnection.properties.secretUriWithVersion
          identity: identity.id
        }
        {
          name: 'jwt-key'
          keyVaultUrl: secretJwtKey.properties.secretUriWithVersion
          identity: identity.id
        }
        {
          name: 'seed-admin-password'
          keyVaultUrl: secretSeedAdminPassword.properties.secretUriWithVersion
          identity: identity.id
        }
        {
          name: 'anthropic-api-key'
          keyVaultUrl: secretAnthropicApiKey.properties.secretUriWithVersion
          identity: identity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'server'
          image: serverImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'ASPNETCORE_ENVIRONMENT', value: 'Production' }
            { name: 'ConnectionStrings__DefaultConnection', secretRef: 'sql-connection-string' }
            { name: 'Jwt__Key', secretRef: 'jwt-key' }
            { name: 'Jwt__Issuer', value: 'IBGroupCMS' }
            { name: 'Jwt__Audience', value: 'IBGroupCMS' }
            { name: 'Seed__AdminUsername', value: seedAdminUsername }
            { name: 'Seed__AdminPassword', secretRef: 'seed-admin-password' }
            { name: 'Seed__AdminFullName', value: seedAdminFullName }
            { name: 'Ai__ApiKey', secretRef: 'anthropic-api-key' }
            { name: 'Ai__Model', value: aiModel }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
    appDbUserScript
  ]
}

// ---------------------------------------------------------------------------
// core/client — el único servicio con ingress externo (público).
// ---------------------------------------------------------------------------
resource clientApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: clientAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: identity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'client'
          image: clientImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'BACKEND_URL', value: 'https://${serverApp.properties.configuration.ingress.fqdn}' }
            { name: 'COOKIE_SECURE', value: 'true' }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
  ]
}

output acrLoginServer string = acr.properties.loginServer
output keyVaultName string = keyVault.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output serverInternalUrl string = 'https://${serverApp.properties.configuration.ingress.fqdn}'
output clientUrl string = 'https://${clientApp.properties.configuration.ingress.fqdn}'
