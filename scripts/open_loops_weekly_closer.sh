#!/usr/bin/env bash
set -euo pipefail
ROOT="/home/jordanh316/.openclaw/workspace/OpenLoops"
OUT="/home/jordanh316/.openclaw/workspace/automations/open-loops-weekly-closer/$(date -u +%F).md"
mkdir -p "$(dirname "$OUT")"
{
echo "# Open Loops Weekly Closer"
echo "Generated: $(date -u +"%F %T UTC")"
echo
for d in 01_Strategy 02_Repertoire 03_Finance 04_Legal_Operations 99_Archive; do
  c=$(find "$ROOT/$d" -type f 2>/dev/null | wc -l)
  echo "- $d files: $c"
done
echo
echo "## Close / Carry / Archive"
echo "- Close: tasks finished this week"
echo "- Carry: active priorities"
echo "- Archive: superseded drafts"
} > "$OUT"
echo "Wrote $OUT"
