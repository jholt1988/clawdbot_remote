# PMS-PAY-07 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-07
- **Title:** Autopay scheduler worker (per org) + PaymentAttempt state machine (scheduled/attempting/succeeded/failed/needs_auth)
- **Dependencies:** PMS-PAY-04, PMS-PAY-06

## Definition of Done
1. PaymentAttempt model/state machine is defined and persisted.
2. Per-org autopay scheduler queues due attempts as `scheduled`.
3. Worker transitions attempts through lifecycle states safely/idempotently.
4. Validation demonstrates successful and failed/needs-auth transitions.

## Execution Plan
1. Audit existing autopay enrollment + billing scheduler paths.
2. Add PaymentAttempt schema/migration and status enum.
3. Implement per-org autopay scheduling and worker transition logic.
4. Add idempotency/locking protections for repeated runs.
5. Validate with seeded due invoices and document outcomes.
