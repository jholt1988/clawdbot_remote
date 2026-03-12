# PMS-A-06 Workplan (2026-03-02)

## Card
- **ID:** PMS-A-06
- **Title:** Lease assign flow + tenant doc visibility (minimal)
- **Dependency:** PMS-A-05 (completed)

## Definition of Done
1. PM can assign an existing/new lease to a tenant account.
2. Tenant can view their active lease and associated docs in tenant-facing UI/API.
3. Lease assignment action creates an auditable event.
4. Basic QA pass covers PM flow + tenant visibility path.

## Execution Plan
1. Audit current lease assignment endpoints/services and tenant lease/doc read endpoints.
2. Implement/patch assignment flow wiring (API + UI if needed).
3. Ensure tenant-scoped lease/doc visibility restrictions are enforced.
4. Add/verify audit log emission on lease assignment.
5. Validate with seeded users and capture completion evidence/changelog.
