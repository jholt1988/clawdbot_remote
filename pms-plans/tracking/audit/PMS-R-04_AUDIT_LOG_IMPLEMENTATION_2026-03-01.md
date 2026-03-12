# PMS-R-04 — Audit Log Implementation (Initial Rollout)

Date: 2026-03-01
Owner: Aden

## Objective
Implement a shared audit logging path and wire high-value mutation endpoints in gap modules identified by PMS-R-03.

## Implemented

### 1) Shared audit service
- Added `tenant_portal_backend/src/shared/audit-log.service.ts`
- Provides standardized event recording surface:
  - `orgId`, `actorId`, `module`, `action`, `entityType`, `entityId`, `result`, `metadata`
- Current persistence mode: structured app logs (JSON via Nest logger)

### 2) QuickBooks module wiring
- `tenant_portal_backend/src/quickbooks/quickbooks.controller.ts`
- `tenant_portal_backend/src/quickbooks/quickbooks.module.ts`
- Added audit events for:
  - `SYNC` (success/failure)
  - `DISCONNECT` (success/failure)

### 3) Rental Application module wiring
- `tenant_portal_backend/src/rental-application/rental-application.service.ts`
- `tenant_portal_backend/src/rental-application/rental-application.module.ts`
- Added audit events for:
  - `SUBMIT`
  - `STATUS_UPDATE`
  - `SCREEN`
  - `ADD_NOTE`
  - `AI_REVIEW`

### 4) Schedule module wiring
- `tenant_portal_backend/src/schedule/schedule.controller.ts`
- `tenant_portal_backend/src/schedule/schedule.service.ts`
- `tenant_portal_backend/src/schedule/schedule.module.ts`
- Added audit event:
  - `CREATE_EVENT`

### 5) Payments module wiring
- `tenant_portal_backend/src/payments/payments.controller.ts`
- `tenant_portal_backend/src/payments/payment-methods.controller.ts`
- `tenant_portal_backend/src/payments/payments.module.ts`
- Added audit events for:
  - `CREATE_INVOICE`
  - `CREATE_PAYMENT`
  - `CREATE_PAYMENT_PLAN`
  - `CREATE_PAYMENT_METHOD`
  - `DELETE_PAYMENT_METHOD`

### 6) QuickBooks runtime unblock fix
- `tenant_portal_backend/src/quickbooks/quickbooks-minimal.service.ts`
- Fixed constructor error by adding missing `super()` call.
- Backend startup now reaches successful boot state.

## Validation Notes
- Backend startup check passes after QuickBooks constructor fix (`Nest application successfully started`).
- Existing unrelated warnings remain (SMTP credentials, AI mock mode, legacy wildcard route warnings).

## Commits (pms-master branch: fix/typescript-errors)
- `9f098c1` — shared audit service + QuickBooks + rental application wiring
- `8aa702f` — schedule audit logging
- `1cdf69a` — payments audit logging
- `b831009` — QuickBooks constructor `super()` fix

## Follow-up (R-04.2)
- Persist audit events to dedicated DB table (`audit_log`) via Prisma migration.
- Add endpoint-level tests that assert audit write on critical mutations.
- Extend coverage to remaining modules where needed (rent-optimization apply/delete verification path).
