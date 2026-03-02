#!/usr/bin/env bash
set -euo pipefail

NOTION_KEY=${NOTION_API_KEY:-$(cat ~/.config/notion/api_key 2>/dev/null || true)}
# PMS execution board data source (override with NOTION_PMS_DS_ID)
DS_ID="${NOTION_PMS_DS_ID:-31600994-e5b8-81ab-92a7-000b227b3c31}"
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
TASK_CLEAN=$(echo "$TASK" | sed -E 's/^\s+|\s+$//g')
if [[ -z "$TASK_CLEAN" || "$TASK_CLEAN" == "_(empty)_" ]]; then
  log "NOTION_SYNC_SKIPPED: no valid moved task"
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
  -d "{\"query\":$(jq -Rn --arg v "$TASK_CLEAN" '$v'),\"page_size\":50}")

# Prefer exact title match inside configured PMS data source.
PAGE_ID=$(echo "$SEARCH_RESP" | jq -r --arg DS "$DS_ID" --arg T "$TASK_CLEAN" '
  .results[]?
  | select(.object=="page")
  | . as $p
  | (($p.properties.Title.title[0].plain_text // $p.properties.Name.title[0].plain_text // "") == $T)
  | select(. == true)
  | $p
  | select(.parent.data_source_id==$DS)
  | .id' | head -n 1)

# Fallback: exact title match in any data source (log the detected DS).
if [[ -z "$PAGE_ID" ]]; then
  PAGE_ID=$(echo "$SEARCH_RESP" | jq -r --arg T "$TASK_CLEAN" '
    .results[]?
    | select(.object=="page")
    | . as $p
    | (($p.properties.Title.title[0].plain_text // $p.properties.Name.title[0].plain_text // "") == $T)
    | select(. == true)
    | $p.id' | head -n 1)

  if [[ -n "$PAGE_ID" ]]; then
    FOUND_DS=$(echo "$SEARCH_RESP" | jq -r --arg PID "$PAGE_ID" '
      .results[]? | select(.id==$PID) | (.parent.data_source_id // "")' | head -n 1)
    log "NOTION_SYNC_FALLBACK_DS: task found outside configured DS ($FOUND_DS)"
  fi
fi

if [[ -z "$PAGE_ID" ]]; then
  log "NOTION_SYNC_SKIPPED: no matching task page for '$TASK_CLEAN'"
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
