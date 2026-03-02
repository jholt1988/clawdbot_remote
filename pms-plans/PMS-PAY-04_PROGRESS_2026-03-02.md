# PMS-PAY-04 Progress — 2026-03-02

## Delivered

### 1) Stripe PaymentIntent direct-charge fields
Extended Stripe payment processing contract to support connected-account direct charges:
- `connectedAccountId`
- `applicationFeeAmountCents`

When `connectedAccountId` is present, PaymentIntent creation now includes:
- `transfer_data.destination`
- `application_fee_amount` (when provided)

File:
- `tenant_portal_backend/src/payments/stripe.service.ts`

### 2) Payment creation path wired to active pricing cycle + FeeEngine
In payment create flow:
1. Resolve lease + tenant + payment method.
2. Resolve org connected account from lease property org.
3. Resolve active `OrgPlanCycle` and linked `FeeScheduleVersion`.
4. Compute fee via `calculateFee(...)` from FeeEngine using schedule config.
5. Create Stripe PaymentIntent with connected-account + app fee.
6. Persist resulting payment with external PaymentIntent id.

File:
- `tenant_portal_backend/src/payments/payments.service.ts`

### 3) DTO/ID model alignment
- Updated `CreatePaymentDto.leaseId` to UUID string.
- Updated payment service lease-id parser to UUID-string usage.

File:
- `tenant_portal_backend/src/payments/dto/create-payment.dto.ts`

## Validation evidence
- Tenant payment create flow succeeded using saved Stripe method.
- Response includes mock Stripe `externalId` from PaymentIntent path.
- Flow confirms connected-account capable path is active with FeeEngine fee computation integration.

## QA status
Moved to Review/QA pending live Stripe connected-account verification (non-mock keys) and payload audit in Stripe dashboard logs.
