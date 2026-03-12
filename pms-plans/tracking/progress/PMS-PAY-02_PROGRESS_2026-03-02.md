# PMS-PAY-02 Progress — 2026-03-02

## Delivered

### Connected account onboarding link flow
Added PM endpoint:
- `POST /api/billing/connected-account/onboarding-link`

Behavior:
1. Reads org connected-account state.
2. Creates Stripe connected account if org has none.
3. Persists created account id and initial onboarding status.
4. Generates Stripe Account Link (or mock link in Stripe-disabled mode).

### Connected account status refresh callback path
Added PM endpoint:
- `POST /api/billing/connected-account/refresh`

Behavior:
- Pulls account status from Stripe (or mock), updates org status fields:
  - onboarding status
  - charges/payouts enabled
  - details submitted
  - capabilities
  - check timestamps

## Files changed
- `tenant_portal_backend/src/payments/stripe.service.ts`
  - Added connected-account create/link/status methods.
- `tenant_portal_backend/src/payments/payments.module.ts`
  - Exported `StripeService` for billing module usage.
- `tenant_portal_backend/src/billing/billing.service.ts`
  - Added onboarding-link + status-refresh orchestration methods.
- `tenant_portal_backend/src/billing/billing.controller.ts`
  - Added new billing connected-account endpoints.

## Validation evidence
- `POST /api/billing/connected-account/onboarding-link` returns onboarding URL + accountId.
- `POST /api/billing/connected-account/refresh` returns updated connected-account status payload.

## QA status
Moved to Review/QA pending full frontend callback wiring/integration pass.
