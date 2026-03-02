# PMS-PAY-05 Progress — 2026-03-02

## Delivered

### 1) Stripe webhook event idempotency store
Added Prisma model/table:
- `StripeWebhookEvent`

Fields include:
- `eventId` (unique)
- `eventType`
- `stripeAccountId`
- `organizationId` (nullable FK)
- `payload`
- `processedAt`

Migration:
- `20260302072500_stripe_webhook_event_idempotency`

### 2) Raw-body capture for Stripe signature verification
Updated app bootstrap JSON parser to capture raw request bytes for Stripe webhook route:
- stores `req.rawBody` for `/webhooks/stripe`

File:
- `tenant_portal_backend/src/index.ts`

### 3) Webhook controller raw-body usage
Updated Stripe webhook controller to:
- require stripe signature header
- pass `req.rawBody` buffer to Stripe signature verification
- return structured response including event id + dedupe flag

File:
- `tenant_portal_backend/src/payments/stripe-webhook.controller.ts`

### 4) Webhook service org routing + idempotency
Enhanced webhook handler in Stripe service:
- verifies signature via Stripe SDK
- deduplicates using persisted `eventId`
- routes org via:
  - `event.data.object.metadata.organizationId` (preferred)
  - fallback: stripe account id -> organization lookup via `stripeConnectedAccountId`
- persists processed events to `StripeWebhookEvent`
- handles `account.updated` by updating org onboarding/capability status

File:
- `tenant_portal_backend/src/payments/stripe.service.ts`

## Validation
- Migration applied and Prisma client regenerated successfully.
- Backend booted successfully after changes.
- Route + service path compiled and loaded.

## QA status
Moved to Review/QA pending live Stripe signed event replay test (duplicate replay should return deduped path).
