# PMS-PRIC-02 Progress — 2026-03-02

## Delivered

### Scheduler service for plan cycle transitions + projections
Added new jobs service:
- `tenant_portal_backend/src/jobs/pricing-cycle-scheduler.service.ts`

Includes two cron jobs:
1. **Monthly cycle transition** (`15 0 1 * *`)
   - Closes expired ACTIVE cycles.
   - Opens a new ACTIVE cycle for the current month if none exists.
   - Assigns latest effective fee schedule version when available.

2. **Nightly projection** (`20 2 * * *`)
   - For each org active cycle, creates one daily `NIGHTLY_TIER_PROJECTION` snapshot (idempotent per day).
   - Stores projection payload in `PricingSnapshot`.

### Org-scoped advisory locks
For both jobs, each org run is protected by Postgres advisory lock:
- lock key format: `<jobName>:<orgId>`
- uses `pg_try_advisory_lock(hashtext(lockKey))`
- always unlocks with `pg_advisory_unlock(hashtext(lockKey))`

This prevents duplicate transitions/projection writes across parallel instances.

### Module wiring
Registered scheduler service in jobs module:
- `tenant_portal_backend/src/jobs/jobs.module.ts`

## Validation
- Backend boots successfully with new scheduler service.
- HTTP sanity check passes (`/api/properties/public` 200).
- Logic uses idempotent checks (existing active cycle; existing nightly snapshot for same day).

## QA status
Moved to Review/QA pending timed-scheduler observation in integrated runtime window.
