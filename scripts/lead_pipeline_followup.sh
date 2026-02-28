#!/usr/bin/env bash
set -euo pipefail
OUT="/home/jordanh316/.openclaw/workspace/automations/lead-pipeline/followup-$(date -u +%F).md"
mkdir -p "$(dirname "$OUT")"
cat > "$OUT" <<EOF
# Lead Pipeline Follow-up
Generated: $(date -u +"%F %T UTC")

- Review leads lacking next action.
- Create follow-up tasks + due dates.
- Draft outreach template updates.
EOF
echo "Wrote $OUT"
