# PMS-A-05 Progress — 2026-03-02

## Scope addressed in this pass
- Property/Unit CRUD hardening for UUID-based Unit IDs
- Unit create payload expansion (bed/bath/sqft/features booleans)
- FE Doors counter logic updated to count only `ACTIVE|MANAGED` when status is present
- Added org-context guard coverage on key property routes

## Backend changes
- `tenant_portal_backend/src/property/property.service.ts`
  - Fixed `updateUnit` to handle UUID unit IDs (removed numeric coercion path)
  - Expanded `createUnit` to accept/persist:
    - `unitNumber`, `bedrooms`, `bathrooms`, `squareFeet`
    - `hasParking`, `hasLaundry`, `hasBalcony`, `hasAC`, `isFurnished`, `petsAllowed`
- `tenant_portal_backend/src/property/property.controller.ts`
  - `POST /properties/:id/units` now passes full `CreateUnitDto` to service
  - Added `OrgContextGuard` to additional PM-only property endpoints
- `tenant_portal_backend/src/property/dto/property.dto.ts`
  - Expanded `CreateUnitDto` with full unit field set

## Frontend changes
- `tenant_portal_app/src/PropertyManagementPage.tsx`
  - Updated `Property`/`Unit` id typing to UUID strings
  - Bulk unit creation now sends full unit payload (not name-only)
  - Added `normalizeUnitStatus` + `getDoorCount` helper
  - Property list and detail unit count now use DoorsCounter logic (`ACTIVE|MANAGED`)

## Validation performed
- `tenant_portal_app`: `npm run build` ✅
- Runtime API checks ✅
  - `PATCH /api/properties/:id/units/:unitId` works with UUID unit id
  - `POST /api/properties/:id/units` accepts extended payload and persists fields

## Notes
- `tenant_portal_backend` typecheck command currently fails before app code check due existing tsconfig flag (`--ignoreDeprecations 6.0`) on this host toolchain.
- Unit status persistence (`active|managed|archived`) is not yet backed by a DB column in current Prisma schema; FE DoorsCounter is ready to honor it once schema/API adds status.
