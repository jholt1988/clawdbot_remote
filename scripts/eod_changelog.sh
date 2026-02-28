#!/usr/bin/env bash
set -euo pipefail
OUT="/home/jordanh316/.openclaw/workspace/automations/eod-changelog/$(date -u +%F).md"
mkdir -p "$(dirname "$OUT")"
{
echo "# End of Day Changelog"
echo "Generated: $(date -u +"%F %T UTC")"
echo
echo "## Completed"
echo "-"
echo
 echo "## In Progress"
echo "-"
echo
echo "## Blockers"
echo "-"
} > "$OUT"
echo "Wrote $OUT"
