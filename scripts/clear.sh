#!/usr/bin/env bash
# Stops the stack and permanently removes this project's containers,
# images, and volumes — including the SQL Server data volume. Destructive
# and irreversible. Pass -y/--yes to skip the confirmation prompt.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker/docker-compose.yml"

# Compose interpolates the file's required ${VAR:?} placeholders even for a
# `down`, which never uses their values. Placeholders keep it working when
# .env is missing or incomplete (shell variables take precedence over it).
export DB_SA_PASSWORD="placeholder" JWT_KEY="placeholder"

ENV_FILE_ARGS=()
[ -f ".env" ] && ENV_FILE_ARGS=(--env-file ".env")

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
