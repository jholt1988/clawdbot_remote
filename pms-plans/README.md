# PMS Plans Index

This directory is organized by topic, with delivery artifacts split by document type for easier scanning.

## Structure

- `tracking/` — execution artifacts by status type
  - `workplans/` — `*_WORKPLAN_*`
  - `progress/` — `*_PROGRESS_*`
  - `verification/` — verification evidence and startup checks
  - `audit/` — audit log coverage/implementation docs
  - `checklists/` — acceptance, completion, and execution checklists
- `strategy/` — business plans, launch plans, long-term goals, pricing, and integration strategy
- `roadmap/` — milestone-level readiness/finalization/changelog docs
- `marketing/` — launch messaging, briefs, social/email/blog copy
- `technical/` — rendering/tooling files (`package.json`, lockfile, PDF renderer)
- `evidence/` — demo guide/runbook/evidence snapshots
- `references/` — supporting logs/inventories/recommendations
  - `archive/` — bundled archival artifact(s)

## Key docs quick links

- Strategy board: `strategy/PMS_EXECUTION_BOARD.md`
- Launch readiness: `strategy/MVP_LAUNCH_READINESS.md`
- Launch day checklist: `tracking/checklists/PMS-L-01_LAUNCH_DAY_CHECKLIST.md`
- Demo guide: `evidence/DEMO_GUIDE.md`
- Audit coverage: `tracking/audit/PMS-R-03_AUDIT_LOG_COVERAGE_MATRIX_2026-03-01.md`

## Notes

- Moves were done with `git mv` to preserve history.
- File content was preserved (no substantive rewrites).
- Internal markdown-link check completed after reorg; no broken local links detected.
