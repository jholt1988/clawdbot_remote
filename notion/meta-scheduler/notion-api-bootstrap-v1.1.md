---
title: "Meta‑Scheduler — Notion API Bootstrap (v1.1 proposal)"
status: "proposed"
version: "v1.1"
last_updated_utc: "2026-02-10"
---

# Notion API Bootstrap v1.1 (Proposal)

This document proposes **minimal additive changes** to the v1.0 bootstrap to better support planner→ticket routing, auditability, and idempotency.

Canonical v1.0:
- `notion/meta-scheduler/notion-api-bootstrap-v1.0.md`

---

## Tickets (Global) — proposed additional properties
Additive properties (no renames):

```json
{
  "Risk Notes": { "rich_text": {} },
  "Assumptions": { "rich_text": {} },
  "Source Run ID": { "rich_text": {} },
  "Idempotency Key": { "rich_text": {} }
}
```

Notes:
- `Planner Agent` and `CTS Task ID` already exist in v1.0.
- If we want to keep DB schema lean, we can omit these and store the details in the page body instead.
