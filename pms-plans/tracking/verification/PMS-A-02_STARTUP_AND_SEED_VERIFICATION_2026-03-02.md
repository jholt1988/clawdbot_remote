# PMS-A-02 — Local Startup + Demo Seed Verification

Date: 2026-03-02 (UTC)
Owner: Aden

## Objective
Validate local startup and demo data seeding for a reliable MVP demo path.

## Execution Summary
- Ran `scripts/start-all.sh`.
- Initial run failed at Rent Optimization ML startup with `Illegal instruction (core dumped)`.
- Re-ran startup with `--skip-rent-opt --skip-ngrok`.
- Confirmed backend on `http://localhost:3001` and frontend on `http://localhost:3000`.
- Ran demo seed script in backend.
- Patched robust seed script to satisfy current schema constraints.
- Re-ran robust seed successfully.
- Verified auth endpoint works via `POST /api/auth/login`.

## Verification Evidence
- FE service reachable: HTTP 200 from `http://localhost:3000`.
- BE service reachable: API responses from `http://localhost:3001`.
- Login success at `/api/auth/login` with seeded admin credentials.
- Seed completion output includes inspection creation (`Inspection ID` returned).

## Changes Made
File updated:
- `tenant_portal_backend/scripts/seed-inspection-demo-robust.js`

Adjustments:
1. Lease fallback create now includes required fields (`startDate`, `endDate`, etc.).
2. Added defensive cleanup for unique tenant lease constraint (`deleteMany` by `tenantId` before lease upsert).

## ML Runtime Compatibility Fix (Resolved)
### Root Cause
- `scripts/start-all.sh` selected `python3` from Homebrew (`/home/linuxbrew/.linuxbrew/bin/python3`), which crashes on this host with `Illegal instruction` during runtime execution.

### Remediation
1. Patched `scripts/start-all.sh` to run a Python runtime smoke test and fallback to `/usr/bin/python3` if `python3` is unstable.
2. Added minimal runtime dependencies for system Python and installed them via:
   - `requirements.runtime.txt`
   - `/usr/bin/python3 -m pip install --user -r requirements.runtime.txt`
3. Removed/renamed failed local venv so startup does not attempt a broken interpreter path.

### Verification
- Ran: `bash scripts/start-all.sh --skip-ngrok`
- Confirmed:
  - `Rent Optimization ML is ready on port 8000`
  - `GET http://localhost:8000/health` returns healthy payload

## Status Recommendation
- Move **PMS-A-02** to **Done** (FE/BE startup + demo seed + ML startup compatibility validated).
