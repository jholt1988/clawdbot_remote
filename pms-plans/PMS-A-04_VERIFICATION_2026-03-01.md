# PMS-A-04 Verification — 2026-03-01

## Objective
Owner maintenance flow boundaries:
- owner can create requests (with required propertyId)
- owner can comment
- owner cannot perform operational mutations (status/assign)

## Validation performed

### 1) Controller/service policy check
Confirmed explicit boundary enforcement in backend:
- `maintenance.controller.ts`
  - owner create requires `propertyId`
  - owner note/comment path allowed
- `maintenance.service.ts`
  - `updateStatusScoped` blocks owner with message: `Owners are read-only for maintenance status changes`
  - `assignTechnicianScoped` blocks owner with message: `Owners are read-only for technician assignment`

### 2) Added targeted unit tests for owner boundary messages
File updated:
- `tenant_portal_backend/src/maintenance/maintenance.service.spec.ts`

Tests added:
- blocks OWNER org role from status changes with explicit message
- blocks OWNER org role from technician assignment with explicit message

### 3) Executed targeted tests
Command:
```bash
npx jest src/maintenance/maintenance.service.spec.ts -t "scoped owner boundaries" --runInBand
```
Result:
- PASS (2 tests)

## Notes
- Full spec file has a pre-existing unrelated failing case in `assignTechnician - Metrics Integration` path.
- Owner-boundary tests pass and validate the required policy behavior/messages.
