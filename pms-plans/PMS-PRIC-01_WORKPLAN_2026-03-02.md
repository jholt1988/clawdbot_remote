# PMS-PRIC-01 Workplan (2026-03-02)

## Card
- **ID:** PMS-PRIC-01
- **Title:** OrgPlanCycle schema + FeeScheduleVersion + snapshots
- **Dependencies:** PMS-E-02, PMS-A-05, PMS-PAY-01

## Definition of Done
1. Schema includes OrgPlanCycle + FeeScheduleVersion + snapshot entities/relations.
2. Migration applied safely for existing org/billing data.
3. Backend write/read path supports versioned fee schedule retrieval.
4. Evidence doc confirms migration + sample snapshot read/write behavior.

## Execution Plan
1. Audit existing pricing/billing schema and fee-related services.
2. Implement Prisma models and migration for cycle/version/snapshot tables.
3. Patch backend services/controllers for minimal CRUD/read path.
4. Validate with local DB and seeded org data.
5. Document outcomes and move card to review.
