#!/usr/bin/env bash
set -euo pipefail
TITLE=${1:-}
ARTIST=${2:-}
[[ -n "$TITLE" && -n "$ARTIST" ]] || { echo "Usage: song_intake.sh <title> <artist>"; exit 1; }
BASE="/home/jordanh316/.openclaw/workspace/OpenLoops/02_Repertoire"
SLUG=$(echo "$TITLE-$ARTIST" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')
OUTDIR="$BASE/songs/$SLUG"
mkdir -p "$OUTDIR"
cp "$BASE/song-breakdown-template.md" "$OUTDIR/song-brief-$SLUG.md"
cat > "$OUTDIR/drill-sheet-$SLUG.md" <<EOF
# Drill Sheet — $TITLE ($ARTIST)
- Hard moment 1:
- Exercise A:
- Exercise B:
- Re-test:
EOF
cat > "$OUTDIR/7-day-plan-$SLUG.md" <<EOF
# 7-Day Plan — $TITLE ($ARTIST)
Day 1 mapping
Day 2 section A
Day 3 section B
Day 4 integration
Day 5 stamina
Day 6 performance take
Day 7 review + lock
EOF
echo "Created $OUTDIR"
