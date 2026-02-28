#!/usr/bin/env bash
set -euo pipefail
STATE="/home/jordanh316/.openclaw/workspace/automations/workout-compliance/state.md"
mkdir -p "$(dirname "$STATE")"
cat > "$STATE" <<EOF
# Workout Compliance Check
Generated: $(date -u +"%F %T UTC")
Prompt: Did you complete today’s workout block? (done/rescheduled)
EOF
echo "Wrote $STATE"
