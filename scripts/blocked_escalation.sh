#!/usr/bin/env bash
set -euo pipefail
Q="/home/jordanh316/.openclaw/workspace/tasks/QUEUE.md"
OUT="/home/jordanh316/.openclaw/workspace/automations/blocked-escalation/$(date -u +%F).md"
mkdir -p "$(dirname "$OUT")"

BLOCKED=$(awk '
BEGIN{inB=0}
{
  if(tolower($0)=="## blocked"){inB=1; next}
  if($0 ~ /^## / && tolower($0)!="## blocked"){inB=0}
  if(inB && $0 ~ /^[[:space:]]*- \[[^]]*\]/) print $0
}' "$Q")

{
echo "# Blocked Task Escalation"
echo "Generated: $(date -u +"%F %T UTC")"
echo
echo "## Blocked items"
if [[ -n "$BLOCKED" ]]; then
  echo "$BLOCKED"
else
  echo "- none"
fi
echo
echo "## Unblock options"
echo "- clarify dependency owner + due date"
echo "- split task into smaller executable step"
echo "- convert to waiting task with next check date"
} > "$OUT"

echo "Wrote $OUT"
