---
title: "Meta‑Scheduler — APSDR v1.0 Enforcement Prompt Pack"
owner: "Jordan"
status: "proposed"
version: "v1.0"
last_updated_utc: "2026-02-10"
precedence: |
  APSDR rules are canonical. This file defines enforcement mechanics.
  Project-centric invariant (PCTM) remains non-negotiable: no Ticket/Calendar without Project.
---

# Meta‑Scheduler — APSDR v1.0 Enforcement Prompt Pack

This document is the **enforcement mechanics** for Jordan’s **Automatic Project‑Split Detection Rules (APSDR v1.0)**.

## Guiding constraints
- **No side effects before PLAN.** Detection must not mutate Projects/Tickets/Calendar.
- **Project‑centric invariant (PCTM):** no Ticket/Calendar item exists without Project.
- **Schedulers reflect reality; they do not invent it.**

Cross‑links:
- PCTM canonical enforcement: `AGENT-SYSTEM-PACK.md`
- Notion bootstrap (canonical schema): `notion/meta-scheduler/notion-api-bootstrap-v1.0.md`

---

## Lifecycle contract (APSDR)
**Assess → Plan → Split → Do → Report**

1) **ASSESS** (read-only)
- Read Projects + linked Tickets + Calendar items + Drift.
- Compute derived signals.
- Evaluate APSDR rules.

2) **PLAN** (still read-only)
- Produce a **Split Plan** artifact for any Hard Split trigger.
- Plan includes: rule(s) triggered, evidence, proposed new project(s), and migration steps.

3) **SPLIT** (authorized side-effects)
- Only after explicit authorization (Jordan or Orchestrator policy).
- Apply idempotent changes.

4) **DO** (execution)
- Issue Worker Instruction Packets (WIP) to relevant team orchestrators.

5) **REPORT**
- Emit ERCS events + Drift log entries.
- Summarize outcomes and open items.

---

## Required input bundle (per evaluation run)
Minimum data required to evaluate APSDR non-noisily:
- Project record (ID, Objective, Risk Sensitivity, Status, Owning Team, Primary Domain)
- Tickets (IDs, CTS Task IDs, Status, Owning Team, Planner Agent, proposed dates, dependencies)
- Calendar items (IDs, Project, linked tickets, type, dates, commitment type)
- Recent ERCS events (by Project) in window
- Recent Drift items (by Project) in window

If any critical field is missing, the evaluator must:
- **fail closed** for that rule ("insufficient data")
- log drift as `insufficient_data`

---

## Derived signals (examples)
- `deliverable_count` (from tickets marked as deliverables)
- `domain_span` (teams/domains implicated)
- `timeline_divergence` (short-term vs long-horizon tasks coexist)
- `risk_escalated` (Risk Sensitivity increased)
- `objective_mutated` (Objective changed materially)
- `phase2_smells` (tickets tagged Phase 2/Later/Eventually)
- `ercs_instability_count` (>= 3 ER-3.x in window)

---

## Enforcement checks (anti-noise)
- Dedupe key: `project_id + rule_id + evidence_signature`
- Suppression window: configurable (default 7d for repeated triggers)
- Hysteresis: clear conditions differ from trigger conditions
- Minimum duration: condition must persist for N hours/days (rule-specific)

---

## ERCS emission spec (JSONL)
Write ERCS events as append-only JSONL with required fields:
- `ts_utc`
- `project_id`
- `rule_id`
- `er_code`
- `severity`
- `entity_type` + `entity_id` (ticket/calendar/project)
- `evidence`
- `correlation_id`

Example:
```json
{"ts_utc":"2026-02-10T17:00:00Z","project_id":"PMS-001","rule_id":"APSDR.A1","er_code":"ER-1.3","severity":"HIGH","entity_type":"project","entity_id":"PMS-001","evidence":{"delta":"objective mutated"},"correlation_id":"apsdr-run-0001"}
```

---

## Drift log spec (append-only)
Maintain an append-only drift log (file-backed) for auditability:
- `logs/meta-scheduler/drift.jsonl`

Drift entries must include:
- project context
- expected vs observed
- source of truth
- timestamps
- ER code (if any)

---

## Split execution protocol (two-phase)
**Prepare → Commit**

Prepare phase:
- Freeze original project scope (no new tickets/calendar)
- Draft new project(s) and link siblings
- Generate migration steps for tickets/calendar items

Commit phase:
- Create new project(s) (only via approved creation protocol)
- Move/link tickets
- Update calendar references
- Record split rationale (archivist)
- Update AR metrics

---

## Worker Instruction Packet (WIP v1.0)
A WIP is the payload sent to team orchestrators for execution.

Required fields:
- `wip_id`
- `project_id` (source)
- `new_project_ids` (targets)
- `tickets_to_move`
- `calendar_items_to_move`
- `constraints` (PCTM invariant, no silent scope)
- `acceptance_criteria`

---

## APSDR Enforcer — system/policy prompt (copy/paste)
You are the Meta‑Scheduler APSDR Enforcer.
- You do not plan; you detect, log, and propose splits.
- You do not mutate state before producing a Split Plan.
- You must treat Project as the root container; reject unscoped entities.
- Emit ERCS events and Drift logs for all violations.

---

## Failure modes
- Partial failures: continue batch; mark run degraded; emit drift.
- Retries: exponential backoff + circuit breaker.
- Missed windows: log `missed_window` drift; do not fabricate.

---

## Compliance checklist
- [ ] No side effects before PLAN
- [ ] PCTM invariant enforced
- [ ] Dedupe + suppression active
- [ ] ERCS + drift logs emitted
- [ ] Split execution uses prepare/commit
