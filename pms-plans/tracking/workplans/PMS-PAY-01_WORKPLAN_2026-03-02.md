# PMS-PAY-01 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-01
- **Title:** Org -> Connected Account model + migrations
- **Dependency:** PMS-A-04 (completed)

## Definition of Done
1. Organization schema includes connected account identifiers/state fields.
2. Migration is applied and backward-safe for existing org rows.
3. Backend read/write path supports onboarding + capabilities status updates.
4. Minimal verification doc confirms migration and API behavior.

## Execution Plan
1. Audit current Organization schema and payments integration touchpoints.
2. Add schema fields for `stripe_account_id`, onboarding status, capability flags/details.
3. Create/apply migration + regenerate Prisma client.
4. Patch backend service/controller DTOs where account status is read/written.
5. Run local validation and produce changelog/evidence note.
