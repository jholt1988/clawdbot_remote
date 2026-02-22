#!/usr/bin/env bash
set -euo pipefail

# Managed Postgres dev flow runner.
# - DB is managed (must exist); we run migrate deploy + seeds.
# - Redis is started locally (docker) unless PMS_REDIS_MODE=system|skip.
# - Starts backend + frontend.

usage() {
  cat <<'EOF'
Usage:
  bash scripts/pms-dev/dev-managed-up.sh --root ./pms-master

Env knobs:
  PMS_REDIS_MODE=docker|system|skip   (default docker)
  TICK: none
EOF
}

ROOT=""
while (( "$#" )); do
  case "$1" in
    --root)
      ROOT="$2"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

[[ -n "$ROOT" ]] || { echo "--root is required" >&2; usage; exit 2; }

ROOT_DIR="$(cd "$ROOT" && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BE_DIR="$ROOT_DIR/tenant_portal_backend"
FE_DIR="$ROOT_DIR/tenant_portal_app"

log() { echo "[dev] $*"; }

die() { echo "[dev][ERROR] $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

load_dotenv_if_present() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local k="${BASH_REMATCH[1]}"
      local v="${BASH_REMATCH[2]}"
      v="${v%\"}"; v="${v#\"}"
      v="${v%\'}"; v="${v#\'}"
      if [[ -z "${!k:-}" ]]; then
        export "$k=$v"
      fi
    fi
  done < "$file"
}

ensure_env_files() {
  if [[ ! -f "$BE_DIR/.env" && -f "$BE_DIR/.env.example" ]]; then
    log "Backend .env missing — creating from .env.example"
    cp "$BE_DIR/.env.example" "$BE_DIR/.env"
  fi

  if [[ ! -f "$FE_DIR/.env" && -f "$FE_DIR/.env.example" ]]; then
    log "Frontend .env missing — creating from .env.example"
    cp "$FE_DIR/.env.example" "$FE_DIR/.env"
  fi
}

check_env() {
  ensure_env_files
  load_dotenv_if_present "$BE_DIR/.env"

  local missing=()
  [[ -z "${DATABASE_URL:-}" ]] && missing+=("DATABASE_URL")

  [[ -z "${JWT_SECRET:-}" ]] && log "WARN: JWT_SECRET not set (recommended)."
  if [[ -f "$FE_DIR/.env" ]] && ! grep -q "^VITE_API_URL=" "$FE_DIR/.env"; then
    log "WARN: tenant_portal_app/.env missing VITE_API_URL"
  fi

  if (( ${#missing[@]} > 0 )); then
    die "Missing required env: ${missing[*]}. Set it in $BE_DIR/.env or export it before running."
  fi

  log "Preflight OK"
  log "- DATABASE_URL: set"
  log "- Redis mode: ${PMS_REDIS_MODE:-docker}"
}

start_redis() {
  if [[ "${PMS_REDIS_MODE:-docker}" == "skip" ]]; then
    log "Redis start skipped (PMS_REDIS_MODE=skip)"
    return
  fi

  if [[ "${PMS_REDIS_MODE:-docker}" == "system" ]]; then
    log "Using system redis (PMS_REDIS_MODE=system). Ensure redis-server is running."
    return
  fi

  require_cmd docker
  log "Starting Redis via docker compose..."
  (cd "$SCRIPT_DIR" && docker compose -f docker-compose.redis.yml up -d)
}

install_deps() {
  require_cmd npm
  log "Installing backend deps (npm install)..."
  (cd "$BE_DIR" && npm install)

  log "Installing frontend deps (npm install)..."
  (cd "$FE_DIR" && npm install)
}

migrate_and_seed() {
  log "Running Prisma migrations (deploy)..."
  (cd "$BE_DIR" && npx prisma migrate deploy)

  log "Generating Prisma client..."
  (cd "$BE_DIR" && npx prisma generate)

  log "Seeding base demo data (db:seed)..."
  (cd "$BE_DIR" && npm run db:seed)

  log "Seeding inspection demo (robust)..."
  (cd "$BE_DIR" && npm run seed:inspection-demo:robust)
}

start_servers() {
  log "Starting backend + frontend (two processes)."
  log "Backend: npm run start"
  log "Frontend: npm run dev"

  (cd "$BE_DIR" && npm run start) &
  BE_PID=$!

  sleep 2

  (cd "$FE_DIR" && npm run dev) &
  FE_PID=$!

  trap 'log "Stopping..."; kill $BE_PID $FE_PID 2>/dev/null || true' INT TERM
  wait $BE_PID $FE_PID
}

main() {
  require_cmd bash
  check_env
  start_redis
  install_deps
  migrate_and_seed
  start_servers
}

main
