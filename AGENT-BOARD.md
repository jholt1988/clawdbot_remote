# AGENT-BOARD.md — Sub-agent Oversight (STRICT)

Owner: Jordan
Conductor (main agent): Aden
Last updated: 2026-02-09 (UTC)

## Operating Mode
- **STRICT**: sub-agents produce proposals + evidence; Conductor approves and applies.
- **No direct commits by sub-agents.** Only Conductor edits/commits.
- **Definition of Done required** for every ticket.
- **Timeboxed** work by default.

## Rules of Engagement
### When we spawn a sub-agent
Spawn only if one of the following is true:
1) Work can run **in parallel** with other tasks.
2) Task is **research-heavy** (docs, API behavior, comparisons).
3) Task benefits from a **second opinion** (security, permissions, schema, migration risk).
4) Task is **long-running / multi-step** and can be isolated cleanly.

### Ticket template (required)
Copy/paste for every sub-agent task:

**Ticket ID:** (YYYYMMDD-HHMM-<slug>)
- Objective:
- Context (paths/links):
- Constraints:
- Deliverables:
- Definition of Done:
- Timebox:
- Output format: (use standard report below)

### Standard report format (required)
Sub-agent must respond with:
1) Summary (≤5 lines)
2) Decisions / Assumptions
3) Evidence & Deliverables (paths, commands, links)
4) Risks / Unknowns
5) Next 3 actions
6) Questions for Conductor (only if blocked)

### Conductor review outcomes
- **ACCEPT** → apply changes + commit + close ticket
- **REVISE** → send back with requested changes
- **SPLIT** → break into smaller tickets
- **REJECT** → close as invalid direction

## Sub-agent Lanes
### Research (default = Planner agent)
- Responsibilities: docs reading, API comparisons, options analysis, risk/edge-case list, recommended approach.
- Output: concise memo + links, plus a clear recommendation.

### Writer (default = Ops agent)
- Responsibilities: docs, changelogs, SOPs, user-facing explanations, PR descriptions, onboarding notes.
- Output: ready-to-paste Markdown (and optional PDF outline if asked).

## Current Goal
- Establish weekly Research + Writer cadence with strict oversight; produce actionable memos + docs to support PMS delivery.

## Cadence (Weekly)
Time zone: America/Chicago (confirm)

- **Mon (Research):** upcoming work risk scan (security/permissions + migrations)
- **Tue (Writer):** changelog + release notes for prior week; draft SOPs for anything we touched
- **Wed (Research):** deep dive on 1 high-risk area (pick from backlog)
- **Thu (Writer):** user-facing docs (how-to) + internal ADR drafts for decisions made
- **Fri (Research):** “edge cases & tests to add next week” memo

Conductor action: open 1–2 tickets/day max; keep each ticket timeboxed to 20–40 min.

## Tickets
### Backlog
- **20260209-0054-research-lane**
  - Objective: Define the Research sub-agent workflow (lanes, triggers, output standards) and propose a first 2-week research cadence for the PMS project.
  - Context: AGENT-BOARD.md; current PMS work in /home/jordanh316/clawd/pms-master/
  - Constraints: STRICT mode; no commits by sub-agent.
  - Deliverables: Proposed cadence + ticket templates + example research ticket ideas.
  - Definition of Done: Conductor can copy/paste the cadence + templates into AGENT-BOARD.md and start using them.
  - Timebox: 20 minutes
  - Output format: Standard report format

- **20260209-0054-writer-lane**
  - Objective: Define the Writer sub-agent workflow and produce a doc template set (changelog, release notes, ADR, user-facing explanation).
  - Context: AGENT-BOARD.md; PMS backend in /home/jordanh316/clawd/pms-master/
  - Constraints: STRICT mode; no commits by sub-agent.
  - Deliverables: Markdown templates for (1) CHANGELOG entry (2) Release notes (3) ADR (4) SOP/checklist.
  - Definition of Done: Templates are ready-to-paste into repo.
  - Timebox: 20 minutes
  - Output format: Standard report format

### In Progress
- **20260209-0057-research-weekly-kickoff**
  - Objective: Produce the Week-1 Research Kickoff memo (top risks + recommended next 5 tickets).
  - Context: /home/jordanh316/clawd/pms-master/ ; recent maintenance security work in tenant_portal_backend
  - Constraints: STRICT mode; propose only.
  - Deliverables: Memo + 5 tickets.
  - Definition of Done: Conductor can paste memo into AGENT-BOARD.md and open next tickets.
  - Timebox: 30 minutes
  - Output format: Standard report format

- **20260209-0057-writer-templates-pack**
  - Objective: Deliver a ready-to-paste docs/template pack (CHANGELOG, release notes, ADR, SOP) tailored to this repo.
  - Context: /home/jordanh316/clawd/pms-master/ ; existing changelog style files.
  - Constraints: STRICT mode; propose only.
  - Deliverables: Markdown templates + suggested folder path + naming convention.
  - Definition of Done: Conductor can add the templates to the repo without further edits.
  - Timebox: 30 minutes
  - Output format: Standard report format

### Review
- (none)

### Done
- (none)

## Decisions Log
- 2026-02-09: Oversight workflow set to STRICT; sub-agents cannot commit; Conductor applies commits.

## Open Questions
- (none)
