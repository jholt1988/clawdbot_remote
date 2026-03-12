# PMS-PAY-MAN-02 — Workplan (2026-03-06)

**Title:** Manual Transactions API + RBAC + Audit  
**Owner:** Jordan  
**Priority:** P0  
**Estimate:** 0.5–1 day

## Scope
- Create PM/Admin endpoints
- Validate payloads
- Emit auditable events

## Endpoints
- `POST /api/payments/manual`
- `POST /api/payments/manual/:id/reverse`
- `POST /api/charges/manual`
- `POST /api/charges/manual/:id/void`
- `GET /api/ledger/tenant/:tenantId`

## Tasks
1. Add DTO validation + schema checks
2. Enforce RBAC (`PM|ADMIN`)
3. Add org ownership checks for tenant/lease/property linkage
4. Add audit event writes:
   - `manual_payment_posted`
   - `manual_payment_reversed`
   - `manual_charge_posted`
   - `manual_charge_voided`
5. API tests for 200/400/403/404/409 flows

## Acceptance Criteria
- PM/Admin can call all endpoints
- Tenant/user role blocked appropriately
- All actions generate audit records
- Error shape matches existing API envelope standards
