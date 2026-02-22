#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/pms-dev/demo-reset.sh --root ./pms-master

Description:
  Hard-reset the demo database to a known baseline:
  - prisma migrate reset --force --skip-seed
  - prisma generate
  - npm run db:seed
  - npm run seed:inspection-demo:robust
  - npm run seed:verify:demo (optional, default on)

Env knobs:
  DEMO_RESET_VERIFY=1|0   (default 1)
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
BE_DIR="$ROOT_DIR/tenant_portal_backend"

log() { echo "[demo-reset] $*"; }

die() { echo "[demo-reset][ERROR] $*" >&2; exit 1; }

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

check_env() {
  if [[ ! -f "$BE_DIR/.env" && -f "$BE_DIR/.env.example" ]]; then
    log "Backend .env missing — creating from .env.example"
    cp "$BE_DIR/.env.example" "$BE_DIR/.env"
  fi

  load_dotenv_if_present "$BE_DIR/.env"

  [[ -z "${DATABASE_URL:-}" ]] && die "Missing DATABASE_URL. Set in $BE_DIR/.env or export before running."

  log "Preflight OK"
  log "- DATABASE_URL: set"
}

main() {
  check_env

  log "Resetting database (prisma migrate reset --force --skip-seed)..."
  (cd "$BE_DIR" && npx prisma migrate reset --force --skip-seed)

  log "Generating Prisma client..."
  (cd "$BE_DIR" && npx prisma generate)

  log "Seeding base demo data (db:seed)..."
  (cd "$BE_DIR" && npm run db:seed)

  log "Seeding inspection demo (robust)..."
  (cd "$BE_DIR" && npm run seed:inspection-demo:robust)

  if [[ "${DEMO_RESET_VERIFY:-1}" == "1" ]]; then
    log "Verifying demo seed..."
    (cd "$BE_DIR" && npm run seed:verify:demo)
  else
    log "Seed verification skipped (DEMO_RESET_VERIFY=0)"
  fi

  log "Demo reset complete"
}

main
