# Task Queue

Last updated: 2026-03-01
Mirror source: `pms-plans/PMS_EXECUTION_BOARD.md`

## Ready
- [ ] _(empty)_

## In Progress
- [ ] _(empty)_

## Review/QA
- [ ] **PMS-A-06**: Lease assign flow + tenant doc visibility (minimal)
  **Status:** Backend UUID lease-path fixes + PM assignment UI delivered; pending manual PM UI walkthrough QA.
- [ ] **PMS-A-07**: Maintenance request (tenant) + photos + PM queue
  **Status:** Tenant submit+photo E2E validated; PM queue fields verified (status/priority/assignee). Pending UI walkthrough QA.
- [ ] **PMS-PAY-01**: Org -> Connected Account model + migrations
  **Status:** Schema + migration + billing read/write endpoints validated; pending integration QA.
- [ ] **PMS-PAY-02**: Connected account creation + onboarding link flow
  **Status:** Onboarding link generation + status refresh endpoints validated; pending callback wiring QA.
- [ ] **PMS-PAY-03**: Tenant add-card flow using SetupIntent (off_session ready)
  **Status:** SetupIntent init + tenant add-card save path validated; pending live Stripe UI QA.

## Blocked
- [ ] **Organize Files**: Move files from `home_downloads` to a structured set of folders in `home_documents`.  
  **Reason:** Permission denied + directory-not-empty errors persist; requires manual user intervention.

## Done
- [x] **PMS-R-04** — Audit log implementation rollout completed (`pms-plans/PMS-R-04_AUDIT_LOG_IMPLEMENTATION_2026-03-01.md`)
- [x] **PMS-R-03** — Audit log coverage matrix completed (`pms-plans/PMS-R-03_AUDIT_LOG_COVERAGE_MATRIX_2026-03-01.md`)
- [x] **PMS-UX-02** — Empty/loading/error state consistency sweep completed (`PropertySearchPage` standardized empty/error cards)
- [x] **PMS-L-01** — Launch-day checklist completed (`pms-plans/PMS-L-01_LAUNCH_DAY_CHECKLIST.md`)
- [x] **PMS-A-03** — Inspection → estimate demo path hardening completed (`pms-plans/PMS-A-03_EVIDENCE_2026-03-01.md`)
- [x] **PMS-D-01** — MVP demo script finalization + acceptance checklist completed (`pms-plans/PMS-D-01_DEMO_FINALIZATION_2026-03-01.md`)
- [x] **PMS-A-04** — Owner maintenance flow polish completed (`pms-plans/PMS-A-04_VERIFICATION_2026-03-01.md`)
- [x] **PMS-B-01** — Backend verification pass for fixed services completed (`pms-plans/PMS-B-01_VERIFICATION_2026-03-01.md`)
- [x] **PMS-A-01** — Demo runbook drafted (`pms-plans/demo-runbook.md`)
- [x] **PMS-E-01** — Pricing decision baseline completed
- [x] **PMS-E-02** — Tiered fee structure decisions completed
- [x] **PMS-A-02** — Local startup + demo seed data verified; ML startup compatibility fixed (`pms-plans/PMS-A-02_STARTUP_AND_SEED_VERIFICATION_2026-03-02.md`)
- [x] **PMS-A-05** — Properties/Units CRUD + door counting scoping completed (`pms-plans/PMS-A-05_COMPLETION_2026-03-02.md`)
