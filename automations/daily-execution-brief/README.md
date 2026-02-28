# Daily Execution Brief Automation

Status: Implemented (v1)
Owner: Jordan + Aden

## Purpose
Generate a concise AM/PM execution brief from:
- Notion Tasks DB (top tasks)
- Google Calendar (today's schedule)
- OpenLoops priorities

## Script
`/home/jordanh316/.openclaw/workspace/scripts/daily_execution_brief.sh`

## Output
Writes markdown brief to:
`/home/jordanh316/.openclaw/workspace/automations/daily-execution-brief/out/YYYY-MM-DD-{am|pm}.md`

## Modes
- `am`: morning planning brief
- `pm`: evening shutdown/review brief

## Manual run
```bash
bash scripts/daily_execution_brief.sh am
bash scripts/daily_execution_brief.sh pm
```

## Optional scheduling (cron)
AM (8:45 CT) and PM (8:15 CT) examples:
```bash
45 8 * * * cd /home/jordanh316/.openclaw/workspace && bash scripts/daily_execution_brief.sh am
15 20 * * * cd /home/jordanh316/.openclaw/workspace && bash scripts/daily_execution_brief.sh pm
```

## Failure behavior
If Notion or Calendar fetch fails, script still produces brief with fallback notes instead of exiting.
