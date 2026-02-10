---
title: "Planner Output → Notion Tickets Mapping"
status: "proposed"
version: "v1.0"
last_updated_utc: "2026-02-10"
---

# Planner Output → Notion Tickets (Global) Mapping (v1.0)

Purpose: define how **Domain Planner** outputs are translated into **Notion Tickets (Global)** records.

Cross-links:
- Planner Prompt Pack (v1.0): (to be added)
- Notion bootstrap (canonical): `notion/meta-scheduler/notion-api-bootstrap-v1.0.md`
- PCTM: `AGENT-SYSTEM-PACK.md`

---

## Normalized planner output fields (input)
From the planner output format:
- `project_id`
- `planner_domain`
- `proposed_tickets[]`:
  - `temp_ticket_id`
  - `description`
  - `dependency` (refs)
  - `estimated_effort`
  - `risk_notes`
- `proposed_sequence`
- `time_block_suggestions` (non-binding)
- `assumptions`
- `conflicts_detected`
- `split_risk_indicator`

---

## Mapping to Notion Tickets (Global) (target)
Assuming bootstrap v1.0 fields:
- Title: `Ticket ID` (system-assigned)
- `Ticket Name` ← planner ticket description (short title)
- `Project` ← `project_id` relation
- `Planner Agent` ← planner name/domain
- `Risk Notes` / `Assumptions` ← if present in schema; otherwise place in page body template below
- `Status` ← default `Backlog` or `Planned` (Meta‑Scheduler decides)
- `CTS Task ID` ← if known; else blank until CTS assignment

### Page body template (recommended)
Store the long-form planning content in the ticket page body:
- Summary
- Acceptance criteria
- Dependencies
- Effort estimate
- Risks
- Assumptions
- Demo alignment notes (if any)
- Links/artifacts

---

## Recommended schema extensions (v1.1) (optional)
If we want stronger automation/routing, add to Tickets (Global):
- `Planner Agent` (rich_text) (already in Jordan bootstrap)
- `Risk Notes` (rich_text)
- `Assumptions` (rich_text)
- `Date Confidence` (select)
- `Source Run ID` (rich_text)
- `Idempotency Key` (rich_text)

Minimal-churn set: `Planner Agent`, `CTS Task ID`, `Risk Notes`.
