#!/usr/bin/env bash
set -euo pipefail
NOTION_KEY=${NOTION_API_KEY:-$(cat ~/.config/notion/api_key 2>/dev/null || true)}
DS_ID="2d100994-e5b8-80a0-9f30-000bfb908b7e"
OUT="/home/jordanh316/.openclaw/workspace/automations/content-pipeline/last-sync.md"
mkdir -p "$(dirname "$OUT")"

if [[ -z "$NOTION_KEY" ]]; then
  echo "No Notion key" > "$OUT"
  echo "Wrote $OUT"
  exit 0
fi

RESP=$(curl -s -X POST "https://api.notion.com/v1/data_sources/$DS_ID/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"filter":{"property":"Status","select":{"equals":"Next"}},"page_size":50}')

IDEAS=$(echo "$RESP" | jq -r '.results[]?.properties.Title.title[0].plain_text // empty' \
  | grep -Ei 'brand|content|post|linkedin|instagram|social|production' || true)

COUNT=$(echo "$IDEAS" | sed '/^$/d' | wc -l | tr -d ' ')

{
echo "# Content Pipeline Sync"
echo "Generated: $(date -u +"%F %T UTC")"
echo
echo "## Matched Next tasks (content-related): $COUNT"
if [[ "$COUNT" -gt 0 ]]; then
  echo "$IDEAS" | sed 's/^/- /'
else
  echo "- none"
fi
echo
echo "## Next action"
echo "- Move top 3 matched tasks into publish queue for this week."
} > "$OUT"

echo "Wrote $OUT"
