#!/usr/bin/env bash
# Deploys the full stack (core/client, core/server, Azure SQL Database, and
# every supporting piece: ACR, Key Vault, Container Apps environment) to
# Azure using infra/main.bicep. This script is the orchestrator: it collects
# the admin-user inputs interactively, generates every other secret on its
# own (never prompted, never written to disk — everything ends up in Azure
# Key Vault), and drives the deployment in two passes:
#
#   1. Deploy main.bicep with public placeholder images, so the ACR, SQL
#      database, Key Vault and Container Apps environment all exist.
#   2. Build + push the real core/client and core/server images to that ACR,
#      then re-deploy main.bicep pointing the Container Apps at them.
#
# Works both run locally (./scripts/deploy.sh) and piped from a remote URL
# (curl -fsSL <raw-url>/scripts/deploy.sh | bash), in which case it clones
# the repository into ./sistema-cms-ibgroup first — same as scripts/setup.sh.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ArcGabicho/sistema-cms-ibgroup.git}"
PROJECT_DIR_NAME="sistema-cms-ibgroup"
BICEP_FILE="infra/main.bicep"
DEPLOYMENT_NAME="ibgroup-cms"

RESOURCE_GROUP="${RESOURCE_GROUP:-ibgroup-cms-rg}"
LOCATION="${LOCATION:-eastus}"
NAME_PREFIX="${NAME_PREFIX:-ibgroup}"

log() { printf '\n==> %s\n' "$1"; }
warn() { printf 'Aviso: %s\n' "$1" >&2; }
die() { printf 'Error: %s\n' "$1" >&2; exit 1; }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    die "se requiere '$1' y no está instalado."
  fi
}

require git
require docker
require az
require openssl

# Resolve the project root: prefer the location of this script, fall back to
# the current directory, and clone a fresh copy if neither has the project.
ROOT_DIR=""
SCRIPT_SOURCE="${BASH_SOURCE[0]:-}"
if [ -n "$SCRIPT_SOURCE" ] && [ -f "$SCRIPT_SOURCE" ]; then
  CANDIDATE_ROOT="$(cd "$(dirname "$SCRIPT_SOURCE")/.." && pwd)"
  [ -f "$CANDIDATE_ROOT/$BICEP_FILE" ] && ROOT_DIR="$CANDIDATE_ROOT"
fi
if [ -z "$ROOT_DIR" ] && [ -f "$BICEP_FILE" ]; then
  ROOT_DIR="$(pwd)"
fi
if [ -z "$ROOT_DIR" ]; then
  log "Clonando $REPO_URL en ./$PROJECT_DIR_NAME"
  git clone "$REPO_URL" "$PROJECT_DIR_NAME"
  ROOT_DIR="$(cd "$PROJECT_DIR_NAME" && pwd)"
fi

cd "$ROOT_DIR"
log "Proyecto en: $ROOT_DIR"

az bicep upgrade --only-show-errors >/dev/null 2>&1 || az bicep install --only-show-errors >/dev/null 2>&1 || true

if ! az account show >/dev/null 2>&1; then
  log "No hay una sesión activa de Azure CLI. Iniciando az login..."
  az login >/dev/null
fi

SUBSCRIPTION_NAME="$(az account show --query name -o tsv)"
log "Usando la suscripción: $SUBSCRIPTION_NAME"

# ---------------------------------------------------------------------------
# Único input que pide este script: los datos del usuario administrador del
# panel. Todo lo demás (contraseña del admin de SQL, del usuario de
# aplicación y la clave de firma JWT) se genera aquí mismo y nunca se
# imprime ni se guarda en disco — solo vive en Azure Key Vault.
# ---------------------------------------------------------------------------
log "Configura el usuario administrador del panel (/dashboard):"

read -r -p "Usuario administrador [admin]: " SEED_ADMIN_USERNAME_INPUT
SEED_ADMIN_USERNAME="${SEED_ADMIN_USERNAME_INPUT:-admin}"

while true; do
  read -r -s -p "Contraseña del administrador (mínimo 8 caracteres): " SEED_ADMIN_PASSWORD
  echo
  [ "${#SEED_ADMIN_PASSWORD}" -ge 8 ] && break
  warn "La contraseña debe tener al menos 8 caracteres."
done

read -r -s -p "Confirma la contraseña: " SEED_ADMIN_PASSWORD_CONFIRM
echo
[ "$SEED_ADMIN_PASSWORD" = "$SEED_ADMIN_PASSWORD_CONFIRM" ] || die "las contraseñas no coinciden."

read -r -p "Nombre completo del administrador [Administrador]: " SEED_ADMIN_FULLNAME_INPUT
SEED_ADMIN_FULLNAME="${SEED_ADMIN_FULLNAME_INPUT:-Administrador}"

read -r -p "Clave de API de Anthropic para Automatización IA (opcional, Enter para omitir): " ANTHROPIC_API_KEY_INPUT
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY_INPUT:-}"

gen_password() { printf '%sAa1!' "$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 24)"; }

SQL_ADMIN_LOGIN="${NAME_PREFIX}sqladmin"
SQL_ADMIN_PASSWORD="$(gen_password)"
APP_DB_PASSWORD="$(gen_password)"
JWT_KEY="$(openssl rand -hex 32)"

# Resolve the object id of whoever is running this, so main.bicep can grant
# it write access to the Key Vault it creates.
USER_TYPE="$(az account show --query user.type -o tsv)"
if [ "$USER_TYPE" = "servicePrincipal" ]; then
  DEPLOYER_PRINCIPAL_ID="$(az ad sp show --id "$(az account show --query user.name -o tsv)" --query id -o tsv)"
else
  DEPLOYER_PRINCIPAL_ID="$(az ad signed-in-user show --query id -o tsv)"
fi

log "Creando resource group '$RESOURCE_GROUP' en '$LOCATION' (si no existe)..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

COMMON_PARAMS=(
  namePrefix="$NAME_PREFIX"
  deployerPrincipalId="$DEPLOYER_PRINCIPAL_ID"
  sqlAdminLogin="$SQL_ADMIN_LOGIN"
  sqlAdminPassword="$SQL_ADMIN_PASSWORD"
  appDbPassword="$APP_DB_PASSWORD"
  jwtKey="$JWT_KEY"
  seedAdminUsername="$SEED_ADMIN_USERNAME"
  seedAdminPassword="$SEED_ADMIN_PASSWORD"
  seedAdminFullName="$SEED_ADMIN_FULLNAME"
  anthropicApiKey="$ANTHROPIC_API_KEY"
)

log "Fase 1/3: aprovisionando infraestructura base (ACR, Azure SQL, Key Vault, Container Apps)..."
az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters "${COMMON_PARAMS[@]}" \
  --output none

ACR_LOGIN_SERVER="$(az deployment group show --name "$DEPLOYMENT_NAME" --resource-group "$RESOURCE_GROUP" --query properties.outputs.acrLoginServer.value -o tsv)"
ACR_NAME="${ACR_LOGIN_SERVER%%.*}"

log "Fase 2/3: construyendo y publicando las imágenes en $ACR_LOGIN_SERVER..."
az acr login --name "$ACR_NAME" --output none

IMAGE_TAG="$(date -u +%Y%m%d%H%M%S)"
SERVER_IMAGE="$ACR_LOGIN_SERVER/ibgroup-server:$IMAGE_TAG"
CLIENT_IMAGE="$ACR_LOGIN_SERVER/ibgroup-client:$IMAGE_TAG"

docker build -f docker/Dockerfile.server -t "$SERVER_IMAGE" .
docker push "$SERVER_IMAGE"

docker build -f docker/Dockerfile.client -t "$CLIENT_IMAGE" .
docker push "$CLIENT_IMAGE"

log "Fase 3/3: apuntando los Container Apps a las imágenes publicadas..."
az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters "${COMMON_PARAMS[@]}" serverImage="$SERVER_IMAGE" clientImage="$CLIENT_IMAGE" \
  --output none

KEY_VAULT_NAME="$(az deployment group show --name "$DEPLOYMENT_NAME" --resource-group "$RESOURCE_GROUP" --query properties.outputs.keyVaultName.value -o tsv)"
CLIENT_URL="$(az deployment group show --name "$DEPLOYMENT_NAME" --resource-group "$RESOURCE_GROUP" --query properties.outputs.clientUrl.value -o tsv)"
SQL_SERVER_FQDN="$(az deployment group show --name "$DEPLOYMENT_NAME" --resource-group "$RESOURCE_GROUP" --query properties.outputs.sqlServerFqdn.value -o tsv)"

log "Listo."
echo "Frontend:        $CLIENT_URL"
echo "Azure SQL:       $SQL_SERVER_FQDN"
echo "Key Vault:       $KEY_VAULT_NAME (aquí quedaron guardados todos los secretos generados)"
echo "Resource group:  $RESOURCE_GROUP"
echo
echo "Inicia sesión en el panel con el usuario '$SEED_ADMIN_USERNAME' y la contraseña que ingresaste."
