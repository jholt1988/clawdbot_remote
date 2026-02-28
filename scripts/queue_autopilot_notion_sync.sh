#!/usr/bin/env bash
set -euo pipefail

NOTION_KEY=${NOTION_API_KEY:-$(cat ~/.config/notion/api_key 2>/dev/null || true)}
DS_ID="2d100994-e5b8-80a0-9f30-000bfb908b7e"
TODAY=$(date -u +%F)
DRY_RUN="${DRY_RUN:-0}"
LOG_DIR="/home/jordanh316/.openclaw/workspace/automations/queue-autopilot/logs"
LOG_FILE="$LOG_DIR/$(date -u +%F).log"
mkdir -p "$LOG_DIR"

log(){
  local msg="$1"
  echo "[$(date -u +"%F %T UTC")] $msg" | tee -a "$LOG_FILE"
}

OUT=$(bash /home/jordanh316/.openclaw/workspace/scripts/queue_autopilot.sh 2>&1)
log "$OUT"

TASK=$(echo "$OUT" | awk -F': ' '/^MOVED_TASK:/{print $2}')
if [[ -z "$TASK" ]]; then
  log "NOTION_SYNC_SKIPPED: no moved task"
  exit 0
fi

if [[ -z "$NOTION_KEY" ]]; then
  log "NOTION_SYNC_SKIPPED: no notion key"
  exit 0
fi

SEARCH_RESP=$(curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d "{\"query\":$(jq -Rn --arg v "$TASK" '$v'),\"page_size\":20}")

PAGE_ID=$(echo "$SEARCH_RESP" | jq -r --arg DS "$DS_ID" '
  .results[]?
  | select(.object=="page")
  | select(.parent.data_source_id==$DS)
  | .id' | head -n 1)

if [[ -z "$PAGE_ID" ]]; then
  log "NOTION_SYNC_SKIPPED: no matching task page for '$TASK'"
  exit 0
fi

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN: would update page $PAGE_ID -> Status=Doing, Plan Date=$TODAY"
  exit 0
fi

PATCH_RESP=$(curl -s -X PATCH "https://api.notion.com/v1/pages/$PAGE_ID" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"properties":{"Status":{"select":{"name":"Doing"}},"Plan Date":{"date":{"start":"'"$TODAY"'"}}}}')

OK=$(echo "$PATCH_RESP" | jq -r '.id // empty')
if [[ -n "$OK" ]]; then
  log "NOTION_SYNC_DONE: $PAGE_ID -> Doing ($TODAY)"
else
  log "NOTION_SYNC_FAILED: $PATCH_RESP"
fi
