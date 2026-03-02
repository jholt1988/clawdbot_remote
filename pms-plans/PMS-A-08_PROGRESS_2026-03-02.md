# PMS-A-08 Progress — 2026-03-02

## Delivered

### 1) Explicit maintenance transition state machine
Added explicit transition guard in maintenance service:
- `PENDING -> IN_PROGRESS`
- `IN_PROGRESS -> COMPLETED`
- `COMPLETED -> (no transitions)`

Invalid transitions now return business-precondition error.

### 2) Assignment constraints + lifecycle coupling
Assignment flow now enforces:
- cannot assign technician when request is already `COMPLETED`
- assigning a technician to `PENDING` request automatically advances request to `IN_PROGRESS`
- sets `acknowledgedAt` when assignment triggers start of work

### 3) Closure integrity constraints
When changing status to `COMPLETED`, service now requires:
- assigned technician present
- non-empty closure note

This creates audit-ready close semantics and prevents silent/incomplete closures.

## File changed
- `tenant_portal_backend/src/maintenance/maintenance.service.ts`

## Validation
- Backend boot sanity check passes after changes (`/api/properties/public` 200).
- Transition/closure guards compile in service path.

## QA status
✅ Verified in API matrix:
- assign technician -> 200
- complete without note -> 400
- complete with note -> 200
Moved to Done.
