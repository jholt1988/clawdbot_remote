# PMS-A-07 Progress — 2026-03-02

## Delivered

### Tenant maintenance submission + photo attachment flow
- Updated tenant maintenance UI to support optional photo URLs during request submission.
- After creating a request, UI now posts each provided URL to `POST /maintenance/:id/photos`.
- Added photo visibility in tenant request cards.

File:
- `tenant_portal_app/src/domains/tenant/features/maintenance/MaintenancePage.tsx`

### Backend UUID alignment fixes for maintenance request IDs
Maintenance request IDs are UUIDs in Prisma schema; controller/service still used numeric assumptions.

Updated:
- `tenant_portal_backend/src/maintenance/maintenance.controller.ts`
  - Request `:id` params moved to string handling (removed numeric parse assumptions).
- `tenant_portal_backend/src/maintenance/maintenance.service.ts`
  - `toRequestId` now validates UUID (`isUUID`) and returns string.
  - Request/unit ID handling aligned to UUID model where needed.
- `tenant_portal_backend/src/maintenance/dto/create-maintenance-request.dto.ts`
  - `unitId` switched to UUID string validation.

## Validation Evidence
1. Tenant create request succeeds:
   - `POST /api/maintenance` with tenant auth returns request object with UUID id.
2. Tenant add photo succeeds:
   - `POST /api/maintenance/:id/photos` returns photo record.
3. Tenant request detail includes photo:
   - `GET /api/maintenance/:id` shows `photos.length === 1` for test request.
4. PM queue fields validated:
   - `GET /api/maintenance?page=1&pageSize=5` includes status/priority/assignee fields.
5. Frontend build passes:
   - `tenant_portal_app npm run build` ✅

## Notes
- Backend full typecheck build remains blocked by existing tsconfig flag/toolchain mismatch (`--ignoreDeprecations 6.0`) unrelated to this card’s runtime behavior.
- During execution, fixed pre-existing backend runtime regressions in leasing files that blocked server boot; these were required to run end-to-end API verification.
