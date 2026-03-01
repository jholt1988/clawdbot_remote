#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/jordanh316/.openclaw/workspace"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT/.env"
  set +a
fi

node "$ROOT/scripts/openloops-import-to-notion-hub.mjs"
