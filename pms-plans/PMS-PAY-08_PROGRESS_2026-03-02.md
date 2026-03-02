# PMS-PAY-08 Progress — 2026-03-02

## Delivered

### 1) Backend: expose NEEDS_AUTH attempts for tenant
Added billing endpoint/service path:
- `GET /api/billing/autopay/needs-auth-attempts`
- Returns tenant-scoped `PaymentAttempt` rows with `status=NEEDS_AUTH` and invoice context.

### 2) Backend: recovery action endpoint
Added endpoint/service path:
- `POST /api/billing/autopay/needs-auth-attempts/:attemptId/recover`

Behavior:
- Validates actor ownership/org scope.
- Transitions attempt `NEEDS_AUTH -> ATTEMPTING`.
- Tries on-session recovery payment path (`recordPaymentForInvoice`).
- Finalizes attempt as `SUCCEEDED` or `FAILED` with reason.

Files:
- `tenant_portal_backend/src/billing/billing.controller.ts`
- `tenant_portal_backend/src/billing/billing.service.ts`

### 3) Tenant UI: action-needed recovery panel
Updated tenant payments UI:
- fetches needs-auth attempts
- displays actionable cards when attempts exist
- provides “Complete payment now” CTA per attempt
- triggers recovery endpoint and refreshes billing/payment data

File:
- `tenant_portal_app/src/PaymentsPage.tsx`

## Validation
- Frontend build succeeds.
- Backend route check for tenant returns HTTP 200 with list response.
- Recovery flow wiring compiles and is callable.

## QA status
Moved to Review/QA pending live Stripe SCA scenario validation (real `requires_action` / 3DS challenge completion).
