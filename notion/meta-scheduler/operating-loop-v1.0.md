---
title: "Meta‑Scheduler Operating Loop"
owner: "Jordan"
status: "proposed"
version: "v1.0"
last_updated_utc: "2026-02-10"
---

# Meta‑Scheduler Operating Loop (v1.0)

This document defines the **day-to-day operating loop** for Meta‑Scheduler and domain schedulers.

It is intentionally **procedural** and **maps to Notion**. Canonicality/anti‑drift enforcement is owned by **PCTM**.

Cross-links:
- Meta‑Scheduler Agent system prompt (authority layer): `notion/meta-scheduler/meta-scheduler-agent-system-prompt-v1.0.md`
- PCTM (canonical enforcement): `AGENT-SYSTEM-PACK.md`
- APSDR v1.0 (split tripwires): `governance/APSDR-v1.0.md`
- APSDR enforcement pack (checklists): `governance/APSDR-enforcement-pack-v1.0.md`
- Notion bootstrap (canonical schema): `notion/meta-scheduler/notion-api-bootstrap-v1.0.md`

---

## Truth anchors (required for any operating loop to be real)
For each Project, the system must be able to point to:
- Canonical location (per truth domain)
- Owner
- Last verified
- Lightweight change log

If these don’t exist, schedule work to create them before proceeding.

---

## Loop: Assess → Prioritize → Schedule → Do → Review

### 1) ASSESS (read-only)
Goal: establish reality.
- Read Projects (Global)
- Read Tickets (Global) for each Project
- Read Calendar (Global)
- Read Drift (Scheduler Drift Log)
- Summarize: blockers, due items, conflicts, and drift indicators

### 2) PRIORITIZE (coordination, not planning)
Goal: reflect declared priorities without inventing them.
- Use project status/risk fields as declared inputs
- If priorities conflict, raise for Orchestrator/Jordan (do not resolve)

### 3) SCHEDULE (make time claims explicit)
Goal: ensure planned work has calendar claims.
- Create/update Calendar items tied to Projects (and Tickets where applicable)
- Enforce PCTM: reject any Calendar item missing Project
- Flag conflicts; do not silently override

### 4) DO (execution routing)
Goal: route work to the right team.
- Issue WIP packets to team orchestrators for execution
- Track completion back to Tickets/Calendar

### 5) REVIEW (truth maintenance)
Goal: prevent drift.
- Close loop on Calendar status (Done/Canceled)
- Update Ticket statuses as appropriate
- Emit Drift entries for reschedules/cancels/major slips
- If APSDR triggers: produce Split Plan and escalate

---

## Notion mapping (by database)
- **Projects (Global)**: container of meaning (top-level truth)
- **Tickets (Global)**: claims about progress (must relate to Project)
- **Calendar (Global)**: claims about time (must relate to Project)
- **Scheduler Drift Log**: integrity issues + drift signals (append-only)

---

## PCTM alignment
- PCTM is the invariant layer (canonical/derived rules).
- This operating loop must never create “dual canon” by updating competing truth sources without an explicit domain map.

---

## Versioning
- Operating loop v1.0
