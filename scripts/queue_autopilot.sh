#!/usr/bin/env bash
set -euo pipefail
Q="/home/jordanh316/.openclaw/workspace/tasks/QUEUE.md"
TMP="$(mktemp)"
TMP_CLEAN="$(mktemp)"
MOVED_FILE="/tmp/queue_autopilot_moved_task.txt"
: > "$MOVED_FILE"
[[ -f "$Q" ]] || { echo "QUEUE missing"; exit 1; }

# Guard 1: remove placeholder/empty task rows globally before any move logic.
awk '
  /^[[:space:]]*- \[[ ~x]\][[:space:]]*[_*]?\(empty\)[_*]?[[:space:]]*$/ { next }
  { print }
' "$Q" > "$TMP_CLEAN"
mv "$TMP_CLEAN" "$Q"

# Move first unchecked item under "## Ready" into "## In Progress" as [~]
awk -v moved_file="$MOVED_FILE" '
BEGIN{inReady=0;inProg=0;found=0;moved=""}
{
  line=$0
  if(tolower(line)=="## ready"){inReady=1; inProg=0; print; next}
  if(tolower(line)=="## in progress"){inReady=0; inProg=1; print; if(moved!="") print moved; next}
  if(line ~ /^## /){inReady=0; inProg=0; print; next}

  if(inReady && !found && line ~ /^[[:space:]]*- \[ \]/){
    moved=line
    sub(/- \[ \]/,"- [~]",moved)
    found=1
    next
  }

  print
}
END{
  if(found){
    t=moved
    gsub(/^[[:space:]]*- \[[^]]*\][[:space:]]*/, "", t)
    print t > moved_file
  } else {
    print "NO_READY_TASKS" > "/dev/stderr"
  }
}
' "$Q" > "$TMP"

# Clean accidental duplicate headers like repeated "## Blocked"
awk 'BEGIN{prev=""}
{ if($0 ~ /^## / && $0==prev) next; print; prev=$0 }
' "$TMP" > "$Q"
rm -f "$TMP" "$TMP_CLEAN"

if [[ -s "$MOVED_FILE" ]]; then
  echo "MOVED_TASK: $(cat "$MOVED_FILE")"
else
  echo "MOVED_TASK:"
fi
echo "QUEUE_AUTOPILOT_DONE"
