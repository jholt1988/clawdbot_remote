# PMS-B-03 Workplan (2026-03-02)

## Card
- **ID:** PMS-B-03
- **Title:** Audit log v1 (payments, maintenance, messaging, lease changes) append-only
- **Dependencies:** PMS-PAY-06, PMS-A-08, PMS-A-09, PMS-A-06

## Definition of Done
1. Append-only audit events are emitted for key payment actions.
2. Maintenance assignment/status/closure emits audit events.
3. Messaging and lease change flows emit audit events.
4. Event schema is consistent enough for downstream reporting/forensics.

## Execution Plan
1. Audit existing audit-log coverage across target modules.
2. Fill gaps in payments/maintenance/messaging/lease event emissions.
3. Normalize event metadata fields and action naming where needed.
4. Add verification checks for representative domain actions.
5. Document delivered coverage and outstanding gaps.
