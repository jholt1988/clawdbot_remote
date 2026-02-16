# Notion CTS Enforcement — Remaining Automations + Buttons (To Implement)

Date: 2026-02-13

This document lists what is **still left to implement** in the Notion “CTS Enforcement / Meta-Scheduler” setup.

## Current Status (already implemented)

### Databases + formulas
- **Projects / Tickets / Calendar DB** databases exist (inline on Meta‑Scheduler page).
- Key formulas and relations are in place.

### Automations confirmed working
- Tickets: **Guard Accepted (missing Project)**
- Tickets: **Guard Scheduled (Calendar Event Required)**
- Calendar DB: **Write Gate Violation** property exists and your **calendar gate automation** is done.

> Note: Notion does not reliably allow automations to trigger on formula changes (e.g., `Invalid State`), so enforcement is implemented via *status-transition guards*.

---

## Automations LEFT to Implement (recommended)

### A) Tickets → Projects handshake (Planner intake)
**Goal:** Planners can propose; Meta‑Scheduler decides. When planner proposes tickets, the project enters a planning state.

**Automation:** `Planner Proposal Intake`
- **Database:** Tickets
- **Trigger:** When `Status` is set to **Proposed**
- **Conditions (AND):**
  - `Created By` is **Planner**
  - `Project` is **not empty**
- **Actions:**
  - Edit related **Project** → set `Scheduler State` to **Planning**
  - Add comment to Project (or write to a Project log property):
    - `📥 Planner proposal received. Awaiting Meta‑Scheduler evaluation.`

---

### B) Projects split pressure → force review
**Goal:** Detect fragmentation early and pause.

**Automation:** `Project Split Risk High → Review`
- **Database:** Projects
- **Trigger:** When `Split Risk` is set to **High** (or when it changes)
- **Conditions:** (optional) Project `Status` is not Archived/Complete
- **Actions:**
  - Set Project `Status` → **Review**
  - Comment:
    - `🪓 Project Split Risk HIGH. Meta‑Scheduler review required before proceeding.`

---

### C) Project completion guard
**Goal:** Prevent “Complete” if tickets are still open.

**Recommended approach:** add a rollup first (because Notion automation conditions against relations are limited).

1) **Add rollup property** on Projects:
- Property name: `Open Tickets Count`
- Rollup: Tickets → Status → **Count** (filtered where Status ≠ Done)

2) **Automation:** `Completion Guard`
- **Database:** Projects
- **Trigger:** When `Status` is set to **Complete**
- **Condition:** `Open Tickets Count` > 0
- **Actions:**
  - Set `Status` → **Review**
  - Comment:
    - `❌ Project cannot complete with open tickets. Close/Done all related tickets first.`

---

### D) Calendar human override detection
**Goal:** Explicit human overrides are visible and logged.

**Automation:** `Human Override Detection`
- **Database:** Calendar DB
- **Trigger:** When `Locked` is set to **Checked**
- **Actions:**
  - Comment on related **Project** (or on the Calendar item if cross-page comments aren’t supported):
    - `🧍 Human override detected (Locked event). Governance rules paused for this event.`

---

### E) Calendar write-gate messaging (optional improvement)
You already have the **flag-only** gate. Recommended addition:

**Automation:** `Write Gate Violation → add explanation`
- **Database:** Calendar DB
- **Trigger:** When `Write Gate Violation` is checked
- **Action:** Comment on the Calendar item:
  - `❌ Calendar event flagged (Source=Human). If this should be scheduled, change Source to Meta‑Scheduler or keep Locked=true as an explicit override.`

---

## Buttons LEFT to Implement (optional but high leverage)
Notion “Buttons” are best used for **Meta‑Scheduler actions** that are deterministic.

### 1) Tickets: `Accept Ticket`
- **Where:** Tickets DB
- **Button action(s):**
  - Set `Created By` → Meta‑Scheduler
  - Set `Status` → Accepted
  - Set `Last Reviewed` → Now

### 2) Tickets: `Schedule Ticket (Create Calendar Event)`
- **Where:** Tickets DB
- **Button action(s):**
  - Create a new page in **Calendar DB**
  - Populate:
    - `Ticket` = this Ticket
    - `Project` = this Ticket’s Project
    - `Source` = Meta‑Scheduler
    - `When` = (prompt user or set placeholder)
  - Set Ticket `Status` → Scheduled
  - Set Ticket `Calendar Event` relation → the new Calendar item

> If Notion can’t link the newly created Calendar item back into `Calendar Event` in the same button run, we’ll use a two-step: create event first, then link.

### 3) Projects: `Freeze Project`
- **Where:** Projects DB
- **Button action(s):**
  - Set Project `Status` → Blocked
  - Set `Scheduler State` → Conflict
  - Add comment: `🧊 Frozen by Meta‑Scheduler pending review.`

### 4) Projects: `Force Split Review`
- **Where:** Projects DB
- **Button action(s):**
  - Set `Status` → Review
  - Set `Last Meta Review` → Now
  - Comment: `🪓 Split review requested.`

---

## Suggested “Done” Definition for the enforcement layer
You’re done when:
1) Planner proposal intake flips project into **Planning**.
2) Split Risk High forces **Review**.
3) Project can’t be marked Complete if tickets remain.
4) Human overrides are logged.
5) Meta‑Scheduler buttons exist for Accept + Schedule.

