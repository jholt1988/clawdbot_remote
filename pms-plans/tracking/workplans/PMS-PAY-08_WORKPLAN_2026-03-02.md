# PMS-PAY-08 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-08
- **Title:** Off-session failure recovery UX (needs_auth): tenant re-entry to complete payment on-session
- **Dependency:** PMS-PAY-07

## Definition of Done
1. `NEEDS_AUTH` attempts are surfaced to tenant with actionable status.
2. Tenant can re-enter payment flow on-session and complete authentication.
3. Attempt/payment statuses reconcile after successful recovery.
4. Validation demonstrates failed->needs_auth->recovered path.

## Execution Plan
1. Audit current tenant payments/autopay UI and payment attempt visibility.
2. Add API exposure for `NEEDS_AUTH` attempts and recovery token/info.
3. Implement tenant UI prompt + re-auth/payment completion flow.
4. Update attempt/payment reconciliation logic after recovery.
5. Validate end-to-end and document outcomes.
