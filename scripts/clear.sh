#!/usr/bin/env bash
# Stops the stack and permanently removes this project's containers,
# images, and volumes — including the SQL Server data volume. Destructive
# and irreversible. Pass -y/--yes to skip the confirmation prompt.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker/docker-compose.yml"

# Compose still needs to interpolate the file's ${VAR} placeholders for a
# `down`, so fall back to .env.example if .env was already removed.
ENV_FILE=""
if [ -f ".env" ]; then
  ENV_FILE=".env"
elif [ -f ".env.example" ]; then
  ENV_FILE=".env.example"
fi

ENV_FILE_ARGS=()
[ -n "$ENV_FILE" ] && ENV_FILE_ARGS=(--env-file "$ENV_FILE")

FORCE=false
for arg in "$@"; do
  case "$arg" in
    -y|--yes) FORCE=true ;;
  esac
done

if [ "$FORCE" != true ]; then
  echo "Esto eliminará los contenedores, imágenes y volúmenes de este proyecto,"
  echo "incluyendo los datos de la base de datos SQL Server. No se puede deshacer."
  read -r -p "¿Continuar? [y/N] " confirm
  case "$confirm" in
    y|Y|yes|YES) ;;
    *)
      echo "Cancelado."
      exit 0
      ;;
  esac
fi

echo "==> Eliminando contenedores, imágenes y volúmenes..."
docker compose -f "$COMPOSE_FILE" "${ENV_FILE_ARGS[@]}" down --volumes --rmi all --remove-orphans

echo "Listo."
