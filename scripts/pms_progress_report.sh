#!/usr/bin/env bash
set -euo pipefail
REPO="/home/jordanh316/.openclaw/workspace"
OUT="/home/jordanh316/.openclaw/workspace/automations/pms-progress/$(date -u +%F).md"
mkdir -p "$(dirname "$OUT")"
{
  echo "# PMS Progress Report"
  echo "Generated: $(date -u +"%F %T UTC")"
  echo
  echo "## Git status"
  git -C "$REPO" status --short | head -n 100 || true
  echo
  echo "## Recent commits"
  git -C "$REPO" log --oneline -n 10 || true
} > "$OUT"
echo "Wrote $OUT"
