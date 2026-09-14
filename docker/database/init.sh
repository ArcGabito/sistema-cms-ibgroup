#!/usr/bin/env bash
# Orchestrates database provisioning: waits for SQL Server to accept
# connections, then runs init.sql (as `sa`) to create the application
# database and a dedicated least-privilege login/user for the backend.
#
# Runs inside the db-init service in docker-compose.yml, using the mssql
# server image purely for its bundled sqlcmd — it never starts a SQL Server
# engine of its own.
set -euo pipefail

SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

: "${DB_HOST:?DB_HOST is required}"
: "${SA_PASSWORD:?SA_PASSWORD is required}"
: "${APP_DB_NAME:?APP_DB_NAME is required}"
: "${APP_DB_USER:?APP_DB_USER is required}"
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"

echo "Esperando a que SQL Server ($DB_HOST) acepte conexiones..."
until "$SQLCMD" -C -S "$DB_HOST" -U sa -P "$SA_PASSWORD" -Q "SELECT 1" -b -o /dev/null 2>/dev/null; do
  sleep 2
done
echo "SQL Server disponible."

echo "Creando base de datos, login y usuario de la aplicación..."
"$SQLCMD" -C -S "$DB_HOST" -U sa -P "$SA_PASSWORD" \
  -v APP_DB_NAME="$APP_DB_NAME" APP_DB_USER="$APP_DB_USER" APP_DB_PASSWORD="$APP_DB_PASSWORD" \
  -i "$SCRIPT_DIR/init.sql"

echo "Listo."
