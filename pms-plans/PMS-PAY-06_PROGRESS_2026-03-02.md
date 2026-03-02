# PMS-PAY-06 Progress — 2026-03-02

## Delivered

### 1) Append-only ledger model for webhook finalization
Added `PaymentLedgerEntry` model with immutable webhook-derived fields:
- `sourceEventId` (unique for replay safety)
- `grossAmountMinor`
- `platformFeeMinor`
- `netAmountMinor`
- `tierSnapshot` (JSON)
- payment/org/lease linkage

Files:
- `tenant_portal_backend/prisma/schema.prisma`
- `prisma/migrations/20260302073300_payment_ledger_finalization/migration.sql`

### 2) PaymentIntent metadata enrichment (for finalization context)
Payment create path now injects metadata used by webhook finalization:
- `organizationId`
- `platform_fee_minor`
- `tier_snapshot` (JSON string)
- existing lease/tenant metadata

File:
- `tenant_portal_backend/src/payments/payments.service.ts`

### 3) Webhook payment success finalization -> ledger append
On `payment_intent.succeeded`:
- update payment to COMPLETED
- append ledger row once per `sourceEventId`
- resolve platform fee from `application_fee_amount` (fallback metadata)
- compute net as `gross - platformFee`
- persist tier snapshot when present

File:
- `tenant_portal_backend/src/payments/stripe.service.ts`

## Validation
- Migration applied successfully.
- Prisma client generated successfully.
- Backend compiles/boots with updated schema + handlers.

## Replay safety
- Ledger append path dedupes by unique `sourceEventId`.
- Combined with webhook event dedupe from PMS-PAY-05, this protects finalization from duplicate replay writes.

## QA status
Moved to Review/QA pending live signed webhook replay in Stripe test mode to confirm end-to-end ledger append/no-duplicate behavior.
