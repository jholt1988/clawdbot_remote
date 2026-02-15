# Notion Governance Automation (Meta-Scheduler)

Node scripts that wire real automation against the Notion API aligned with the governance stack:
- Risk computation
- Project split detection (lightweight signal)
- Project-Red gating enforcement
- Auto-creating Execution Permits

## Install
From repo root:
```bash
npm install @notionhq/client dotenv
```

## Configure (.env)
Required:
- `NOTION_API_KEY`
- `NOTION_PROJECTS_DB_ID`
- `NOTION_TICKETS_DB_ID`
- `NOTION_EXECUTION_REQUESTS_DB_ID`
- `NOTION_EXECUTION_PERMITS_DB_ID`

Optional:
- `NOTION_PAGE_SIZE` (default 50)

## Run
```bash
node scripts/notion-governance/risk-evaluator.mjs
node scripts/notion-governance/red-gate-check.mjs
node scripts/notion-governance/project-split-detector.mjs
node scripts/notion-governance/auto-permit.mjs
node scripts/notion-governance/auto-permit-low-risk.mjs
```

## Safety
These scripts update Notion pages. Use with the TEA/CEEG governance model:
- dry-run mode for simulations
- EXP + Project-Red gating where applicable
