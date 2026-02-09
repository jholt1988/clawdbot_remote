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

## Current Goal
- (unset)

## Tickets
### Backlog
- (none)

### In Progress
- (none)

### Review
- (none)

### Done
- (none)

## Decisions Log
- 2026-02-09: Oversight workflow set to STRICT; sub-agents cannot commit; Conductor applies commits.

## Open Questions
- (none)
