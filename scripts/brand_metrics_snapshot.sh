#!/usr/bin/env bash
set -euo pipefail
OUT="/home/jordanh316/.openclaw/workspace/automations/brand-metrics/$(date -u +%F).md"
mkdir -p "$(dirname "$OUT")"
cat > "$OUT" <<EOF
# Brand Metrics Snapshot
Generated: $(date -u +"%F %T UTC")

Track weekly:
- Posts published
- Engagement
- DMs / replies
- Calls booked
- Revenue-attributed leads
EOF
echo "Wrote $OUT"
