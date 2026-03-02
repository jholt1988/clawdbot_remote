# Task Queue

Last updated: 2026-03-01
Mirror source: `pms-plans/PMS_EXECUTION_BOARD.md`

## Ready

## In Progress
- [~] _(empty)_
- [ ] _(empty)_

## Review/QA






- [ ] **PMS-PRIC-02**: PlanCycle scheduler job (monthly open/close + nightly tier projection)
  **Status:** Scheduler + org-scoped advisory locks implemented; pending scheduled-run QA in integrated environment.
- [ ] **PMS-PRIC-03**: FeeEngine library (tiered % + min fee + fee<amount guard)
  **Status:** FeeEngine + unit tests implemented and passing; integrated into nightly pricing projection calculations.
- [ ] **PMS-PAY-04**: PaymentIntents direct charges + application_fee_amount from active PlanCycle
  **Status:** Stripe direct-charge path wired with connected account + FeeEngine-computed application fee; validated via payment create flow.
- [ ] **PMS-PAY-05**: Connect webhooks endpoint (raw-body signature + org routing + idempotency)
  **Status:** Raw-body signature path, org routing, and event id idempotency persistence implemented; pending live Stripe replay QA.
- [ ] **PMS-PAY-06**: Ledger finalization from webhooks (append-only)
  **Status:** Append-only ledger model + webhook finalization write path implemented with source-event dedupe; pending live signed webhook replay QA.
- [ ] **PMS-PAY-07**: Autopay scheduler worker + PaymentAttempt state machine
  **Status:** PaymentAttempt schema + per-org locked autopay worker transitions implemented; pending timed-run QA with due invoices.
- [ ] **PMS-PAY-08**: Off-session failure recovery UX (needs_auth)
  **Status:** Tenant `NEEDS_AUTH` attempt visibility + recover endpoint/UI flow implemented; pending live 3DS/on-session auth QA.

- [ ] **PMS-A-09**: Messaging threads tenant↔PM with attachments + audit trail
  **Status:** Threaded messaging now supports attachment URL payload + UI rendering and audit event logging for conversation/message actions; pending role-flow QA.
- [ ] **PMS-A-10**: Owner portal minimum (view + comment + initiate maintenance request)
  **Status:** Owner read/comment/create-maintenance paths confirmed with PM-only mutation guards preserved; messaging conversation send path now audit-logged including attachments.
- [ ] **PMS-A-11**: Inspection capture mobile-first (checklist + photos + notes + drafts)
  **Status:** Added resilient local draft persistence/restore for inspection checklist edits and mobile-friendly draft recovery notice; pending mobile device walkthrough QA.
- [ ] **PMS-A-12**: Inspection -> action items -> deterministic estimate range + explainability text
  **Status:** Deterministic range synthesis + stable line-item ordering + explainability reason text implemented in estimate service; pending repeat-run consistency QA.







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
- [x] **PMS-B-04** — Monitoring MVP endpoint verified (`/api/monitoring/performance/ops-summary`, queue+webhook metrics) (`pms-plans/PMS-B-04_PROGRESS_2026-03-02.md`)
- [x] **PMS-A-08** — Maintenance transition guard QA validated (assign=200, complete w/o note=400, complete w note=200)
- [x] **PMS-B-02** — Boundary/replay e2e suite passing (2/2) with local-compatible test config (`pms-plans/PMS-B-02_PROGRESS_2026-03-02.md`)
- [x] **PMS-F-01** — Staging seed pipeline unblocked and passing smoke checks 6/6 (`pms-plans/PMS-F-01_PROGRESS_2026-03-02.md`)
- [x] **PMS-B-03** — Audit log v1 coverage validated in runtime (maintenance + lease events confirmed in AUDIT_EVENT stream)
- [x] **PMS-C-01** — Unified feedback/loading/empty states validated across Messaging/AuditLog/LeaseManagement
- [x] **PMS-C-02** — Accessibility label pass validated on core messaging + lease assignment flows
- [x] **PMS-A-06** — Lease assignment + tenant lease visibility validated via API (`/api/leases`, `/api/leases/my-lease`)
- [x] **PMS-A-07** — Maintenance request + photo + queue visibility validated via API
- [x] **PMS-PAY-01** — Connected account read/write endpoints validated
- [x] **PMS-PAY-02** — Connected account onboarding link + refresh endpoints validated
- [x] **PMS-PAY-03** — SetupIntent init + payment method save path validated
- [x] **PMS-PRIC-01** — Fee schedule + plan cycle + pricing snapshot CRUD validated
