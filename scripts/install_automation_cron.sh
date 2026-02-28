#!/usr/bin/env bash
set -euo pipefail
WORKDIR="/home/jordanh316/.openclaw/workspace"
BLOCK_START="# >>> jordan-automation-stack >>>"
BLOCK_END="# <<< jordan-automation-stack <<<"

read -r -d '' BLOCK <<'TXT' || true
# >>> jordan-automation-stack >>>
CRON_TZ=America/Chicago
45 8 * * *  cd /home/jordanh316/.openclaw/workspace && bash scripts/daily_execution_brief.sh am
15 20 * * * cd /home/jordanh316/.openclaw/workspace && bash scripts/daily_execution_brief.sh pm
0 9 * * 1   cd /home/jordanh316/.openclaw/workspace && bash scripts/brand_metrics_snapshot.sh
30 9 * * 1  cd /home/jordanh316/.openclaw/workspace && bash scripts/lead_pipeline_followup.sh
0 18 * * 5  cd /home/jordanh316/.openclaw/workspace && bash scripts/open_loops_weekly_closer.sh
15 18 * * * cd /home/jordanh316/.openclaw/workspace && bash scripts/eod_changelog.sh
0 10 * * *  cd /home/jordanh316/.openclaw/workspace && bash scripts/queue_autopilot_notion_sync.sh
# <<< jordan-automation-stack <<<
TXT

EXISTING=$(crontab -l 2>/dev/null || true)
CLEANED=$(echo "$EXISTING" | awk -v s="$BLOCK_START" -v e="$BLOCK_END" '
BEGIN{skip=0}
$0==s{skip=1;next}
$0==e{skip=0;next}
skip==0{print}
')

{
  echo "$CLEANED"
  [[ -n "$CLEANED" ]] && echo
  echo "$BLOCK"
} | crontab -

echo "CRON_INSTALLED"
crontab -l
