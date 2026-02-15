# Automated Execution Requests (WhatsApp-triggerable)

This repo includes a helper script that creates a Notion **Execution Request** + **Execution Permit**, auto-approves, and queues it.

## Script

- `scripts/notion-governance/exec-run.mjs`

## Usage

```bash
node scripts/notion-governance/exec-run.mjs tenant-inspections-backend --branch ops --dry-run=false
node scripts/notion-governance/exec-run.mjs tenant-inspections-frontend --branch ops --dry-run=false
```

It prints JSON with the created Request + Permit URLs.

## Env requirements

Reads from `.env`:
- `NOTION_API_KEY`
- `NOTION_EXECUTION_REQUESTS_DB_ID`
- `NOTION_EXECUTION_PERMITS_DB_ID`

Also relies on canonical property names from `scripts/notion-events/notion-props.mjs`.
