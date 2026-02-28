#!/usr/bin/env bash
set -euo pipefail
OUT="/home/jordanh316/.openclaw/workspace/automations/finance-maintenance/$(date -u +%F).md"
mkdir -p "$(dirname "$OUT")"
cat > "$OUT" <<EOF
# Finance Packet Monthly Check
Generated: $(date -u +"%F %T UTC")

Checklist:
- Verify canonical lender packet file current
- Verify real-estate schedule addendum current
- Archive superseded variants
EOF
echo "Wrote $OUT"
