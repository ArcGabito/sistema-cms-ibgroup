#!/usr/bin/env bash
# Starts the Docker stack locally using the images already built by
# scripts/setup.sh. Pass --build to rebuild images before starting (useful
# after pulling changes to the Dockerfiles or dependencies).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker/docker-compose.yml"

if [ ! -f ".env" ]; then
  echo "Error: no se encontró .env en la raíz del proyecto. Ejecuta scripts/setup.sh primero." >&2
  exit 1
fi

UP_ARGS=(up -d)
if [ "${1:-}" = "--build" ]; then
  UP_ARGS+=(--build)
fi

echo "==> Levantando contenedores..."
docker compose -f "$COMPOSE_FILE" --env-file .env "${UP_ARGS[@]}"

echo
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
docker compose -f "$COMPOSE_FILE" --env-file .env ps
