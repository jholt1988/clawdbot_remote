# Notion Event Processor (Webhook → Queue → Worker)

Event-driven governance spine for Notion-triggered automation.

**Key rule:** webhook handler enqueues only. Worker executes after re-validation.

## Why
- Notion public API doesn’t provide native webhooks for all DB updates.
- We implement **Option A**: events are emitted via Notion buttons / Zapier/Make / custom relay.

## Install
From repo root:
```bash
npm install
```

## Configure
Copy `.env.example` → `.env` and fill in.

Required:
- `NOTION_API_KEY`
- `WEBHOOK_SECRET`
- `REDIS_URL`
- `NOTION_EXECUTION_REQUESTS_DB_ID`
- `NOTION_EXECUTION_PERMITS_DB_ID`
- `NOTION_PROJECTS_DB_ID`

## Run
Terminal 1 (ingress):
```bash
node scripts/notion-events/server.mjs
```

Terminal 2 (worker):
```bash
node scripts/notion-events/worker.mjs
```

## Incoming event shape
We expect minimal JSON:
```json
{ "type": "permit.updated", "data": { "page_id": "<permit_page_id>" } }
```

## Idempotency
- Queue jobId = `permitId` → prevents double-run across webhook retries.

## Locks
- Redis project lock: `lock:project:<projectId>`

## Notion property names
Defaults are in `scripts/notion-events/notion-props.mjs`. If your DB uses different names, override via env JSON (`NOTION_PROP_OVERRIDES_JSON`).
