# Docker (`docker/`)

Todo lo relacionado a contenedores vive en `docker/`, pero el archivo de
variables de entorno (`.env`) vive **en la raíz del repositorio**, junto a su
plantilla `.env.example`. Esto es intencional: mantiene los secretos en un
único lugar, fuera de la carpeta de infraestructura, y por eso todos los
comandos de este documento (y los scripts de `scripts/`) invocan `docker
compose` con `--env-file .env` apuntando a la raíz.

En la práctica no necesitas recordar esto: usa los scripts documentados en
[`bash-scripts-guide.md`](./bash-scripts-guide.md) (`setup.sh`, `run.sh`,
`clear.sh`). Esta guía es para cuando necesitas entender o tocar la
infraestructura directamente.

## Archivos

| Archivo                | Propósito                                                        |
| ----------------------- | ----------------------------------------------------------------- |
| `Dockerfile.client`     | Build multi-stage de `core/client` (Next.js).                    |
| `Dockerfile.server`     | Build multi-stage de `core/server` (ASP.NET Core + EF Core).      |
| `docker-compose.yml`    | Orquesta `db`, `db-init`, `server` y `client` en una sola red.    |
| `database/init.sql`     | Script T-SQL: crea la base de datos y un login/usuario de aplicación con permisos mínimos. |
| `database/init.sh`      | Orquesta `init.sql`: espera a que SQL Server acepte conexiones y luego lo ejecuta con `sqlcmd`. |
| `../.env.example`       | Plantilla de variables de entorno (sí se versiona en git).        |
| `../.env`               | Variables reales para tu máquina (ignorado por git, nunca se commitea). |

## `Dockerfile.server`

Build de dos etapas:

1. **`build`** (`mcr.microsoft.com/dotnet/sdk:10.0`): restaura y publica
   `core/server/server.csproj` en modo `Release`.
2. **runtime** (`mcr.microsoft.com/dotnet/aspnet:10.0`): copia solo el
   resultado de `dotnet publish`, expone el puerto `8080` y arranca con
   `dotnet server.dll`.

Al iniciar, el propio `Program.cs` aplica las migraciones de EF Core
pendientes (`Database.MigrateAsync()`) y siembra el usuario admin si la
tabla `Users` está vacía — no hace falta ningún paso manual dentro del
contenedor.

## `Dockerfile.client`

Build de tres etapas, pensado para el modo `output: "standalone"` de
Next.js:

1. **`deps`** (`node:22-alpine`): instala dependencias con `npm ci`.
2. **`build`**: copia el código y corre `npm run build`.
3. **runtime**: copia únicamente `public/`, `.next/standalone` y
   `.next/static` — una imagen final mucho más liviana que copiar
   `node_modules` completo. Expone el puerto `3000` y arranca con `node
   server.js`.

## `docker-compose.yml`

Cuatro servicios en una red compartida:

### `db`

- Imagen `mcr.microsoft.com/mssql/server:2022-latest`.
- Contraseña `sa` tomada de `DB_SA_PASSWORD`. **`sa` solo se usa para
  aprovisionar la base de datos** (servicio `db-init`, más abajo) — la
  aplicación nunca se conecta con `sa`.
- Datos persistidos en el volumen nombrado `db-data` (`/var/opt/mssql`).
- Healthcheck vía `sqlcmd`; `db-init` espera a que este servicio esté
  `healthy` antes de arrancar (`depends_on: condition: service_healthy`).
- Puerto `1433` publicado, útil para conectarte con un cliente SQL desde el
  host mientras desarrollas.

### `db-init`

- Misma imagen que `db`, pero con `entrypoint` reemplazado para correr
  `database/init.sh` en vez de arrancar un motor SQL Server — la imagen se
  reutiliza únicamente porque trae `sqlcmd` incluido.
- Monta `./database` (es decir, `docker/database/`) en `/opt/init` dentro
  del contenedor.
- `init.sh` espera a que `db` acepte conexiones y luego ejecuta
  `init.sql` como `sa`, que:
  1. Crea la base de datos `IBGroupCMS` si no existe.
  2. Crea el login `APP_DB_USER` (por defecto `ibgroup_app`) con la
     contraseña `APP_DB_PASSWORD` si no existe (o sincroniza la contraseña
     si ya existe).
  3. Crea el usuario correspondiente dentro de `IBGroupCMS` y lo agrega al
     rol `db_owner` — **de esa base de datos únicamente**, nunca `sysadmin`
     a nivel de servidor. `db_owner` es necesario porque el backend aplica
     migraciones de EF Core (DDL) al arrancar.
- Todo el script es idempotente: se puede volver a correr sin error contra
  una base ya aprovisionada (ver "Comandos manuales" para probarlo).
- Es un contenedor de un solo uso: corre, aprovisiona, y termina con código
  `0`. `server` declara `depends_on: db-init: condition:
  service_completed_successfully`, así que no arranca hasta que el
  aprovisionamiento termina con éxito.

### `server`

- Se construye desde `Dockerfile.server` con `context: ..` (la raíz del
  repo, para poder copiar `core/server/`).
- Se conecta a `IBGroupCMS` como `APP_DB_USER` (no `sa`) — un usuario con
  permisos acotados a esa única base de datos.
- Variables de entorno inyectadas desde `.env` (ver tabla más abajo):
  cadena de conexión a `db`, clave y parámetros JWT, y credenciales del
  usuario admin sembrado.
- Puerto `8080` publicado.

### `client`

- Se construye desde `Dockerfile.client`, mismo `context: ..`.
- `BACKEND_URL=http://server:8080`: el cliente Next.js llama al backend
  **por el nombre del servicio dentro de la red de Docker**, no por
  `localhost` — esto solo ocurre en llamadas servidor-a-servidor (API
  routes y Server Components de Next.js); el navegador nunca contacta al
  backend directamente, así que no hace falta configurar CORS.
- Puerto `3000` publicado.

## Variables de entorno (`.env`, en la raíz)

| Variable               | Usado por | Descripción                                                                 |
| ----------------------- | --------- | ---------------------------------------------------------------------------- |
| `DB_SA_PASSWORD`        | `db`, `db-init` | Contraseña de `sa`, usada solo para aprovisionar la base de datos. |
| `APP_DB_USER`           | `db-init`, `server` | Login de aplicación con permisos mínimos (por defecto `ibgroup_app`). Es el que realmente usa el backend. |
| `APP_DB_PASSWORD`       | `db-init`, `server` | Contraseña de `APP_DB_USER`. |
| `JWT_KEY`               | `server`  | Clave de firma HMAC para los JWT de autenticación. Genera la tuya con `openssl rand -hex 32`. |
| `SEED_ADMIN_USERNAME`   | `server`  | Usuario admin sembrado en el primer arranque (por defecto `admin`).         |
| `SEED_ADMIN_PASSWORD`   | `server`  | Contraseña del admin sembrado (por defecto `Admin123!`, cámbiala).          |
| `SEED_ADMIN_FULLNAME`   | `server`  | Nombre completo mostrado en el dashboard.                                    |
| `ANTHROPIC_API_KEY`     | `server`  | Opcional. Habilita el generador de borradores de blog con IA (módulo Automatización IA). Sin ella, ese módulo responde con un error claro en vez de fallar. |
| `AI_MODEL`              | `server`  | Opcional. Modelo de Claude usado para generar borradores (por defecto `claude-haiku-4-5-20251001`). |

`docker-compose.yml` usa la sintaxis `${VAR:?mensaje}` para las variables
obligatorias: si `.env` no las define, Compose falla inmediatamente con un
mensaje indicando qué falta, en lugar de arrancar con un valor vacío.
`ANTHROPIC_API_KEY` y `AI_MODEL` usan `${VAR:-valor}` porque son opcionales.

## Comandos manuales

Si necesitas invocar Compose directamente (sin los scripts), siempre desde
la raíz del repo y siempre con `--env-file .env`:

```bash
# Levantar todo
docker compose -f docker/docker-compose.yml --env-file .env up -d --build

# Ver logs de un servicio
docker compose -f docker/docker-compose.yml --env-file .env logs -f server

# Estado de los contenedores
docker compose -f docker/docker-compose.yml --env-file .env ps

# Apagar sin borrar nada
docker compose -f docker/docker-compose.yml --env-file .env down

# Re-correr solo el aprovisionamiento de base de datos (idempotente)
docker compose -f docker/docker-compose.yml --env-file .env run --rm db-init
```

Para confirmar con qué usuario se está conectando realmente el backend, y
que no tiene privilegios de `sysadmin`:

```bash
docker exec ibgroup-db /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P '<DB_SA_PASSWORD>' -Q "
SELECT s.login_name, DB_NAME(s.database_id) AS db_name
FROM sys.dm_exec_sessions s
WHERE DB_NAME(s.database_id) = 'IBGroupCMS';

SELECT IS_SRVROLEMEMBER('sysadmin', '<APP_DB_USER>') AS is_sysadmin;
"
```

Omitir `--env-file .env` hace que Compose busque un `.env` junto al propio
`docker-compose.yml` (es decir, dentro de `docker/`) y falle, porque ese
archivo no vive ahí — vive en la raíz del repo a propósito.

## Primera vez / reinicio completo

Usa los scripts en vez de recordar todo esto:

```bash
./scripts/setup.sh   # clona (si hace falta), crea .env, construye e inicia
./scripts/run.sh      # arranques posteriores
./scripts/clear.sh    # borra contenedores, imágenes y volúmenes de este proyecto
```

Ver [`bash-scripts-guide.md`](./bash-scripts-guide.md) para el detalle de
cada uno.
