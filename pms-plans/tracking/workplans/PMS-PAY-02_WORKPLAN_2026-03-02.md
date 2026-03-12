# PMS-PAY-02 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-02
- **Title:** Create connected account + onboarding link flow (Account Links) and status callbacks
- **Dependencies:** PMS-PAY-01, PMS-E-01

## Definition of Done
1. Backend can create/connect Stripe connected account for org if missing.
2. PM can request onboarding account link (refresh + return URLs supported).
3. Callback/status refresh endpoint updates org onboarding/capability fields.
4. Minimal PM-facing integration endpoint contract documented/validated.

## Execution Plan
1. Audit payments/Stripe service for existing account-link scaffolding.
2. Implement connected-account create/get-or-create service path.
3. Implement onboarding link generation endpoint(s).
4. Implement callback/status refresh route + org field updates.
5. Validate with test-mode keys/path and document evidence.
