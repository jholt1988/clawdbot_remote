# PMS-PAY-04 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-04
- **Title:** Create PaymentIntents as direct charges on connected account + apply application_fee_amount from active PlanCycle
- **Dependencies:** PMS-PAY-03, PMS-PRIC-02, PMS-PRIC-03

## Definition of Done
1. PaymentIntent creation supports connected-account direct charge path.
2. `application_fee_amount` is computed from active plan cycle/fee schedule via FeeEngine.
3. Safeguards enforce fee < amount and fallback behavior when pricing config missing.
4. Validation demonstrates charge payload correctness and fee application.

## Execution Plan
1. Audit current payments charge path and Stripe intent creation calls.
2. Add active plan-cycle lookup + fee computation integration.
3. Add connected-account PaymentIntent options (`transfer_data` / `application_fee_amount`).
4. Validate with test-mode flow and log request/response evidence.
5. Document outcomes and move to review.
