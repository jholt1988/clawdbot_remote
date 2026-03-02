# PMS Execution Board

Date: 2026-03-01
Owner: Jordan + Aden

---

## Workflow Columns
1. **Inbox** — raw ideas/requests
2. **Ready** — scoped, unblocked, can start now
3. **In Progress** — actively being worked
4. **Review/QA** — validation + acceptance checks
5. **Done** — shipped, with changelog/evidence
6. **Blocked** — waiting on dependency/decision

## Global WIP Limits
- **In Progress:** max 3 cards total
- **Review/QA:** max 4 cards total

## Card Template (Required Fields)
- **ID:**
- **Title:**
- **Track:** MVP Core | AI Workflow | UX Polish | Reliability/Security | Launch/GTM
- **Priority:** P0 | P1 | P2
- **Owner:**
- **Definition of Done:**
- **Acceptance Tests:**
- **Dependencies:**
- **Estimate:**
- **Due Window:**
- **Links:**

---

## Board

### Inbox
- [ ] _(empty)_

### Ready
- [ ] _(empty)_

### In Progress
- [ ] _(empty)_

### Review/QA
- [ ] _(empty)_

### Done
- [x] **PMS-R-04** — Audit log implementation rollout completed (see `pms-plans/PMS-R-04_AUDIT_LOG_IMPLEMENTATION_2026-03-01.md`)
- [x] **PMS-R-03** — Audit log coverage matrix completed (see `pms-plans/PMS-R-03_AUDIT_LOG_COVERAGE_MATRIX_2026-03-01.md`)
- [x] **PMS-UX-02** — Empty/loading/error state consistency sweep completed (PropertySearchPage standardized empty/error cards)
- [x] **PMS-L-01** — Launch-day checklist completed (see `pms-plans/PMS-L-01_LAUNCH_DAY_CHECKLIST.md`)
- [x] **PMS-A-03** — Inspection → estimate demo path hardening completed (see `pms-plans/PMS-A-03_EVIDENCE_2026-03-01.md`)
- [x] **PMS-D-01** — MVP demo script finalization + acceptance checklist completed (see `pms-plans/PMS-D-01_DEMO_FINALIZATION_2026-03-01.md`)
- [x] **PMS-A-04** — Owner maintenance flow polish completed (see `pms-plans/PMS-A-04_VERIFICATION_2026-03-01.md`)
- [x] **PMS-B-01** — Backend verification pass completed (see `pms-plans/PMS-B-01_VERIFICATION_2026-03-01.md`)
- [x] **PMS-A-01** — Demo runbook drafted (see `pms-plans/demo-runbook.md`)
- [x] **PMS-E-01** — Pricing decision baseline completed
- [x] **PMS-E-02** — Tiered fee structure decisions completed
- [x] **PMS-A-02** — Local startup + demo seed data completed incl. ML startup compatibility fix (see `pms-plans/PMS-A-02_STARTUP_AND_SEED_VERIFICATION_2026-03-02.md`)

### Blocked
- [ ] _(empty)_

---

## Operating Rules
- Only pull from **Ready** into **In Progress** if WIP limit allows.
- Any card in **In Progress** >48h must include a status note.
- Any card moved to **Blocked** must include:
  - blocker reason
  - unblock owner
  - expected unblock date
- Any card moved to **Done** must include a changelog note link.

## Weekly Cadence
- **Monday:** pick top 3 (must include at least one P0)
- **Midweek:** unblock review + resequence
- **Friday:** closeout summary + next-week prep
