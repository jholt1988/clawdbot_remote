# Project Creation Playbook v1.0 (Jordan)

This playbook defines the **standard, repeatable sequence** for creating a new project with minimal drift.

It is designed to be compatible with:
- **PCTM (Project-Centric Truth Model)** — canonicality and anti-drift rules: `AGENT-SYSTEM-PACK.md`
- **APSDR** — split detection + delivery ritual anchor: `governance/APSDR-v1.0.md`
- **Domain‑Level Planner Prompt Pack v1.0** — reusable planner prompts: `agents/prompts/planners-v1.0.md`

> Scope: This is the *project bootstrapping* procedure. It tells you what to create, where to put it, and what to decide up front.

---

## 1) Prime Rule (Non-Negotiable)
A Project exists to hold a **single, coherent objective** with a shared definition of **done**.

If two pieces of work cannot agree on what “done” means, they do **not** belong in the same Project.

---

## 2) The Three Legitimate Reasons to Create a New Project
A new Project is created **only** if at least **one** of these is true.

### R1 — Objective Divergence
- Success criteria differ
- Completion of one does not imply completion of the other

Example:
- “Build PMS core” vs “Market PMS beta” → separate Projects

### R2 — Risk Boundary Shift
- Risk Sensitivity differs (Low vs High)
- One can safely Fast-Path, the other cannot

Example:
- Internal refactor vs external demo delivery → separate Projects

### R3 — Lifecycle Mismatch
- Timelines are meaningfully different
- One ends long before the other

Example:
- One-off migration vs ongoing product development → separate Projects

---

## 3) Reasons That Are *Not* Valid (Common Traps)
Not valid reasons to create a Project:
- “It feels big”
- “It has many tickets”
- “Different agents are involved”
- “We want a clean board”
- “It’s annoying to look at”

These are management problems, not Project problems.

---

## 4) Split vs Extend — Decision Tree
Step 1 — Does this work change the definition of done?
- Yes → New Project
- No → Extend existing Project

Step 2 — Does it introduce a new risk profile?
- Yes → New Project
- No → Continue

Step 3 — Does it require independent shutdown?
- Yes → New Project
- No → Same Project

If all three answers are No, you must extend, not split.

---

## 5) Extension Protocol (When You Do *Not* Create a New Project)
If extending an existing Project, you must:
1. Update Project Objective (CTS)
2. Update Deliverables
3. Update Risk Sensitivity (if needed)
4. Log the extension rationale

Failure to update Objective = silent scope creep (**ER-5.3**).

---

## 6) Project Creation Checklist (Mandatory)
Before creating a Project, answer all:
- Single sentence objective
- What does done look like?
- What will not be done? (non-goals)
- Risk sensitivity
- Owner (DRI)
- How will it be archived?

If any answer is unclear → do not create.

---

## 7) Naming Convention
Format:
- `[Domain] — [Outcome]`

Good:
- PMS — Core MVP Build
- PMS — Beta Launch Marketing
- Personal — Daily Ops Automation

Bad:
- PMS Stuff
- Phase 2
- Misc Tasks

Names are contracts.

---

## 8) Archival Rules
Archive only when:
- All tickets are Done or explicitly abandoned
- All calendar items are closed
- A closing note exists (“Why this ended”)

Archival freezes:
- Ticket creation
- Calendar creation
- Triggers

Nothing re-enters without explicit unarchive.

---

## 9) Orchestrator Enforcement
When a task arrives without a clear Project:
1. Ask: “Is this a new objective or an extension?”
2. If unclear → request clarification
3. If forced → create a Project request, not a Project

No silent creation.

---

## 10) AR Monitoring Signals
AR flags Orange when:
- Projects exceed X active tickets
- Frequent scope extensions
- Repeated ER-5.3

AR flags Red when:
- Projects never archive
- Projects mutate objectives without logging

---

## 11) Human Heuristic
Projects end. If you’re afraid to end it, it’s too big.

---

## Versioning
- Project Creation Playbook v1.0
