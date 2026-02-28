#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%F)
OUT="/home/jordanh316/.openclaw/workspace/OpenLoops/02_Repertoire/session-log-$DATE.md"
if [[ ! -f "$OUT" ]]; then
cat > "$OUT" <<EOF
# Repertoire Session Log — $DATE

## Entry Template
- Focus:
- Song:
- Win:
- Main issue:
- Tomorrow priority:
EOF
fi
echo "$OUT"
