# PMS-PAY-03 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-03
- **Title:** Tenant add-card flow using SetupIntent (off_session ready) scoped per org
- **Dependencies:** PMS-PAY-01, PMS-A-06

## Definition of Done
1. Tenant can initialize SetupIntent for card setup.
2. Frontend captures card details and confirms setup intent.
3. Payment method metadata is persisted and scoped correctly to tenant/org context.
4. Added verification path for successful add-card and list/reuse behavior.

## Execution Plan
1. Audit existing payment-method endpoints + SetupIntent support in backend/frontend.
2. Patch missing setup-intent init/confirm endpoints and org guard behavior.
3. Patch tenant UI flow for add-card and success/error handling.
4. Validate end-to-end with seeded tenant account.
5. Write progress/completion evidence.
