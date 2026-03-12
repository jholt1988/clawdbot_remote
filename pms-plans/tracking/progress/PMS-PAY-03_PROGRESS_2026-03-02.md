# PMS-PAY-03 Progress — 2026-03-02

## Delivered

### 1) SetupIntent initialization endpoint (tenant)
Added endpoint:
- `POST /api/payments/payment-methods/setup-intent`

Behavior:
- Ensures tenant has Stripe customer (create-if-missing).
- Creates SetupIntent with `usage: off_session`.
- Returns `clientSecret` + setup intent identifiers.

Files:
- `tenant_portal_backend/src/payments/payment-methods.controller.ts`
- `tenant_portal_backend/src/payments/payment-methods.service.ts`

### 2) Stripe service mock/real SetupIntent support
- Updated Stripe mock path to return a usable `client_secret`.
- Keeps existing real Stripe SetupIntent creation path.

File:
- `tenant_portal_backend/src/payments/stripe.service.ts`

### 3) Tenant frontend add-card flow switched to SetupIntent
In tenant payments UI:
1. Request setup-intent from backend.
2. `stripe.confirmCardSetup(clientSecret, { payment_method: { card } })`.
3. Persist confirmed payment method id via backend payment-method create endpoint.

Also aligned endpoint paths to backend route namespace (`/payments/payment-methods`).

File:
- `tenant_portal_app/src/domains/tenant/features/payments/PaymentsPage.tsx`

## Validation evidence
- `POST /api/payments/payment-methods/setup-intent` returns `clientSecret`.
- `POST /api/payments/payment-methods` with provider PM id succeeds and stores method.
- Frontend build passes (`tenant_portal_app npm run build`).

## QA status
Moved to Review/QA pending live Stripe Elements/browser walkthrough against non-mock Stripe keys.
