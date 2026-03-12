# PMS-PAY-05 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-05
- **Title:** Connect webhooks endpoint: raw-body signature verification + routing to org + store event.id for idempotency
- **Dependency:** PMS-PAY-02

## Definition of Done
1. Webhook endpoint validates Stripe signature using raw body.
2. Events are routed to the correct org context via metadata/account mapping.
3. Processed `event.id` values are persisted and deduplicated.
4. Basic replay test confirms idempotent behavior.

## Execution Plan
1. Audit current Stripe webhook controller/handler flow.
2. Add raw-body signature verification hardening.
3. Add event-to-org routing strategy and persistence mapping.
4. Add processed-events store/check for idempotency.
5. Validate with replayed sample event and document evidence.
