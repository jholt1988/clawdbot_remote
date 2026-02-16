# Notion Event Processor (Webhook → Queue → Worker)

Event-driven governance spine for Notion-triggered automation.

**Key rule:** webhook handler enqueues only. Worker executes after re-validation.

## Why
- Notion public API doesn’t provide native webhooks for all DB updates.
- We support two modes:
  - **Public webhook ingress** (Zapier/Make/relay) → `server.mjs`
  - **IAP/private button-driven queueing** (no inbound HTTP) → `poller.mjs`

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

### Mode 1: Webhook ingress (public/relay)
Terminal 1 (ingress):
```bash
node scripts/notion-events/server.mjs
```

Terminal 2 (worker):
```bash
node scripts/notion-events/worker.mjs
```

### Mode 2: Private (IAP) button-driven queueing
Terminal 1 (poller):
```bash
node scripts/notion-events/poller.mjs
```

Terminal 2 (worker):
```bash
node scripts/notion-events/worker.mjs
```

In Notion, add permit properties and a button that sets:
- `Status = Approved`
- `Queue Requested = true`
- `Queue Requested At = now`

## Incoming event shape
We expect minimal JSON:
```json
{ "type": "permit.updated", "data": { "page_id": "<permit_page_id>" } }
```

Governance events (Tickets):
```json
{ "type": "ticket.updated", "data": { "page_id": "<ticket_page_id>" } }
```

## Idempotency
- Queue jobId = `permitId` → prevents double-run across webhook retries.

## Locks
Composite locks (deadlock-safe):
- `lock:project:<projectId>`
- `lock:target:<targetKey>`

Lock acquisition order is deterministic (`sort()`), so overlapping jobs don’t deadlock.

`targetKey` is derived from optional request properties:
- Target Kind
- Target Scope ID
- Credential Profile

## Notion property names
Defaults are in `scripts/notion-events/notion-props.mjs`. If your DB uses different names, override via env JSON (`NOTION_PROP_OVERRIDES_JSON`).
