# PMS-PAY-01 Progress — 2026-03-02

## Delivered

### 1) Organization connected-account schema
Added Stripe connected-account fields to `Organization` model:
- `stripeConnectedAccountId` (unique)
- `stripeOnboardingStatus` (`NOT_STARTED | PENDING | IN_REVIEW | COMPLETED | RESTRICTED`)
- `stripeChargesEnabled`
- `stripePayoutsEnabled`
- `stripeDetailsSubmitted`
- `stripeCapabilities` (JSON)
- `stripeOnboardingCompletedAt`
- `stripeLastOnboardingCheckAt`

Files:
- `tenant_portal_backend/prisma/schema.prisma`

### 2) Migration added + applied
Migration:
- `prisma/migrations/20260302064600_org_connected_account_fields/migration.sql`

Applied with:
- `npx prisma migrate deploy`

### 3) Backend read/write API for connected-account state
Added PM endpoints under billing:
- `GET /api/billing/connected-account`
- `PATCH /api/billing/connected-account`

Files:
- `tenant_portal_backend/src/billing/billing.controller.ts`
- `tenant_portal_backend/src/billing/billing.service.ts`

### 4) Prisma client regenerated
- `npx prisma generate` ✅

## Validation evidence
- `GET /api/billing/connected-account` returns org connected-account fields.
- `PATCH /api/billing/connected-account` updates onboarding/status/capabilities and returns updated payload.

## Additional cleanup completed during execution
- Resolved pre-existing duplicate `Property` schema definitions that prevented `prisma generate`.

## QA status
Moved to Review/QA pending broader payments integration checks (Stripe onboarding flow wiring).