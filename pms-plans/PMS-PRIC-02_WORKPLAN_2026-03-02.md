# PMS-PRIC-02 Workplan (2026-03-02)

## Card
- **ID:** PMS-PRIC-02
- **Title:** PlanCycle scheduler job (monthly open/close + nightly tier projection) with org-scoped locks
- **Dependency:** PMS-PRIC-01

## Definition of Done
1. Scheduler opens/closes org plan cycles on monthly cadence.
2. Nightly projection job runs per org with lock protection.
3. Locking prevents duplicate transitions/races per org.
4. Minimal runbook/evidence confirms idempotent behavior.

## Execution Plan
1. Audit existing cron/job infrastructure and reusable lock utilities.
2. Implement cycle transition scheduler service.
3. Add org-scoped lock mechanism for monthly + nightly jobs.
4. Add logging/observability hooks and dry-run pathway.
5. Validate with manual trigger and document results.
