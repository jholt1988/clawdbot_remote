# PMS-B-02 Workplan (2026-03-02)

## Card
- **ID:** PMS-B-02
- **Title:** E2E boundary tests: org/lease/payment isolation + webhook replay
- **Dependencies:** PMS-B-01, PMS-PAY-06

## Definition of Done
1. E2E tests validate org-level data isolation across lease/payment operations.
2. Tests assert payment operations cannot cross lease/org boundaries.
3. Webhook replay scenarios confirm idempotent behavior (no duplicate effects).
4. Test suite is runnable in CI/local and documented.

## Execution Plan
1. Audit current E2E/integration test harness and fixtures.
2. Add org/lease/payment isolation test cases.
3. Add webhook replay idempotency test cases.
4. Wire tests into existing test command grouping.
5. Run suite and document results.
