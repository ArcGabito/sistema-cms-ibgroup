#!/usr/bin/env bash
# Bootstraps the project from scratch: clones the repo if it isn't already
# present, installs local dependencies (for tooling outside Docker), and
# builds + starts the full Docker stack.
#
# Works both run locally (./scripts/setup.sh) and piped from a remote URL
# (curl -fsSL <raw-url>/scripts/setup.sh | bash), in which case it clones
# the repository into ./sistema-cms-ibgroup first.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ArcGabicho/sistema-cms-ibgroup.git}"
PROJECT_DIR_NAME="sistema-cms-ibgroup"
COMPOSE_FILE="docker/docker-compose.yml"

log() { printf '\n==> %s\n' "$1"; }
warn() { printf 'Aviso: %s\n' "$1" >&2; }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: se requiere '$1' y no está instalado." >&2
    exit 1
  fi
}

require git
require docker
if ! docker compose version >/dev/null 2>&1; then
  echo "Error: se requiere el plugin 'docker compose' (Docker Compose v2)." >&2
  exit 1
fi

# Resolve the project root: prefer the location of this script, fall back to
# the current directory, and clone a fresh copy if neither has the project.
ROOT_DIR=""
SCRIPT_SOURCE="${BASH_SOURCE[0]:-}"
if [ -n "$SCRIPT_SOURCE" ] && [ -f "$SCRIPT_SOURCE" ]; then
  CANDIDATE_ROOT="$(cd "$(dirname "$SCRIPT_SOURCE")/.." && pwd)"
  [ -f "$CANDIDATE_ROOT/$COMPOSE_FILE" ] && ROOT_DIR="$CANDIDATE_ROOT"
fi
if [ -z "$ROOT_DIR" ] && [ -f "$COMPOSE_FILE" ]; then
  ROOT_DIR="$(pwd)"
fi
if [ -z "$ROOT_DIR" ]; then
  log "Clonando $REPO_URL en ./$PROJECT_DIR_NAME"
  git clone "$REPO_URL" "$PROJECT_DIR_NAME"
  ROOT_DIR="$(cd "$PROJECT_DIR_NAME" && pwd)"
fi

cd "$ROOT_DIR"
log "Proyecto en: $ROOT_DIR"

# .env always lives at the repo root.
if [ ! -f ".env" ]; then
  log "Creando .env a partir de .env.example"
  cp .env.example .env
  if command -v openssl >/dev/null 2>&1; then
    NEW_JWT_KEY="$(openssl rand -hex 32)"
    NEW_APP_DB_PASSWORD="$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9')Aa1!"
    TMP_ENV="$(mktemp)"
    sed \
      -e "s#^JWT_KEY=.*#JWT_KEY=$NEW_JWT_KEY#" \
      -e "s#^APP_DB_PASSWORD=.*#APP_DB_PASSWORD=$NEW_APP_DB_PASSWORD#" \
      .env > "$TMP_ENV" && mv "$TMP_ENV" .env
    log "Se generaron JWT_KEY y APP_DB_PASSWORD únicos para esta instalación."
  else
    warn "'openssl' no está disponible; se mantienen JWT_KEY y APP_DB_PASSWORD de ejemplo. Cámbialos manualmente en .env."
  fi
  warn "Revisa .env y ajusta las contraseñas antes de exponer este entorno fuera de tu máquina."
else
  log ".env ya existe, se conserva tal cual."
fi

# Local dependencies, only useful for running tooling outside Docker
# (lint, dotnet ef, etc.) — the containers install their own regardless.
if command -v npm >/dev/null 2>&1; then
  log "Instalando dependencias de core/client (npm install)"
  (cd core/client && npm install)
else
  warn "'npm' no está disponible; se omite la instalación de dependencias del cliente."
fi

if command -v dotnet >/dev/null 2>&1; then
  log "Restaurando dependencias de core/server (dotnet restore)"
  dotnet restore core/server/server.csproj
else
  warn "'dotnet' no está disponible; se omite la restauración del backend."
fi

log "Construyendo imágenes Docker desde cero (sin caché)"
docker compose -f "$COMPOSE_FILE" --env-file .env build --no-cache

log "Levantando contenedores"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d

log "Listo."
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
