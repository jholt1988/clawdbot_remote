#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-am}" # am|pm
WORKDIR="/home/jordanh316/.openclaw/workspace"
OUTDIR="$WORKDIR/automations/daily-execution-brief/out"
mkdir -p "$OUTDIR"

DATE_UTC=$(date -u +%F)
NOW_UTC=$(date -u +"%Y-%m-%d %H:%M UTC")
OUTFILE="$OUTDIR/${DATE_UTC}-${MODE}.md"

NOTION_KEY="${NOTION_API_KEY:-}"
if [[ -z "$NOTION_KEY" && -f "$HOME/.config/notion/api_key" ]]; then
  NOTION_KEY=$(cat "$HOME/.config/notion/api_key")
fi

DS_ID="2d100994-e5b8-80a0-9f30-000bfb908b7e" # Tasks DB and Tracker data_source_id

# --- Fetch Notion tasks ---
TASKS_MD="- (Notion unavailable)"
if [[ -n "${NOTION_KEY:-}" ]]; then
  QUERY_JSON=$(cat <<'JSON'
{
  "filter": {
    "and": [
      {"property":"Status","select":{"does_not_equal":"Done"}},
      {
        "or": [
          {"property":"Plan Date","date":{"equals":"__TODAY__"}},
          {"property":"Status","select":{"equals":"Next"}}
        ]
      }
    ]
  },
  "sorts": [
    {"property":"Priority Level","direction":"ascending"},
    {"property":"Plan Date","direction":"ascending"}
  ],
  "page_size": 8
}
JSON
)
  QUERY_JSON=${QUERY_JSON/__TODAY__/$DATE_UTC}

  RESP=$(curl -s -X POST "https://api.notion.com/v1/data_sources/$DS_ID/query" \
    -H "Authorization: Bearer $NOTION_KEY" \
    -H "Notion-Version: 2025-09-03" \
    -H "Content-Type: application/json" \
    -d "$QUERY_JSON" || true)

  TASKS_MD=$(echo "$RESP" | jq -r '
    if .results then
      .results[] |
      "- [" + ((.properties["Priority Level"].select.name // "P?")|tostring) + "] " +
      (.properties.Title.title[0].plain_text // "(untitled)") +
      " (" + (.properties.Status.select.name // "?") + ")"
    else
      "- (Notion query failed)"
    end' 2>/dev/null | head -n 8)

  [[ -z "$TASKS_MD" ]] && TASKS_MD="- (No matching tasks found)"
fi

# --- Fetch Calendar events (today, primary) ---
CAL_MD="- (Calendar unavailable)"
FROM_ISO="${DATE_UTC}T00:00:00Z"
TO_ISO="${DATE_UTC}T23:59:59Z"
if command -v gog >/dev/null 2>&1; then
  CAL_RAW=$(gog calendar events primary --from "$FROM_ISO" --to "$TO_ISO" 2>/dev/null || true)
  if [[ -n "$CAL_RAW" ]]; then
    CAL_MD=$(echo "$CAL_RAW" | awk -F '\t' '/^summary\t/{s=$2} /^start-local\t/{st=$2} /^end-local\t/{en=$2; if(s!="") print "- " st " → " en " — " s; s=""}' | head -n 8)
    [[ -z "$CAL_MD" ]] && CAL_MD="- (No events today)"
  fi
fi

# --- Compose brief ---
if [[ "$MODE" == "am" ]]; then
  cat > "$OUTFILE" <<EOF
# Daily Execution Brief (AM)

Generated: $NOW_UTC
Date: $DATE_UTC

## Today’s Top Tasks
$TASKS_MD

## Calendar Snapshot
$CAL_MD

## Focus Prompt
- What are the top 3 must-win outcomes for today?
- Keep WIP low: max 2 concurrent tasks.
- Protect one deep-work block.
EOF
else
  cat > "$OUTFILE" <<EOF
# Daily Execution Brief (PM)

Generated: $NOW_UTC
Date: $DATE_UTC

## Tasks Snapshot
$TASKS_MD

## Calendar Snapshot
$CAL_MD

## Shutdown Prompt
- What got finished today?
- What moves to tomorrow’s Plan Date?
- What blocker needs escalation?
EOF
fi

echo "Wrote: $OUTFILE"
