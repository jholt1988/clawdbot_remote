# PMS Execution Board — Notion Mirror

Last updated: 2026-03-01
Source of truth: `pms-plans/PMS_EXECUTION_BOARD.md`

## Suggested Notion Database Properties
- **Name** (title)
- **ID** (text)
- **Status** (select): Ready | In Progress | Review/QA | Blocked | Done
- **Track** (select): MVP Core | AI Workflow | UX Polish | Reliability/Security | Launch/GTM
- **Priority** (select): P0 | P1 | P2
- **Owner** (people or text)
- **Definition of Done** (rich text)
- **Acceptance Tests** (rich text)
- **Dependencies** (rich text)
- **Estimate** (text)
- **Due Window** (select/text)
- **Evidence/Links** (url or rich text)

## Rows to Sync

### Ready
- **PMS-B-01** | Backend verification pass for fixed services  
  - Status: Ready | Track: Reliability/Security | Priority: P0 | Owner: Aden  
  - DoD: Validate startup + health checks for maintenance/payments/quickbooks/rent-estimator/rent-optimization/rental-application/schedule.  
  - Acceptance: clean boot logs + smoke checks; exact repro for issues.  
  - Dependencies: env consistency + local startup scripts  
  - Estimate: M (4–6h) | Due: This week  
  - Links: `scripts/pms-dev/dev-managed-up.sh`, `scripts/pms/ci-fast.mjs`

- **PMS-A-04** | Owner maintenance flow polish (request + comment boundaries)  
  - Status: Ready | Track: MVP Core | Priority: P0 | Owner: Aden  
  - DoD: owner can create request (`propertyId` required) + comment; cannot status/assign/ops mutate.  
  - Acceptance: permission tests pass + explicit UI errors.  
  - Dependencies: existing maintenance guardrails  
  - Estimate: S-M (2–4h) | Due: This week  
  - Links: `tenant_portal_backend` maintenance auth tests

- **PMS-D-01** | MVP demo script finalization + acceptance checklist  
  - Status: Ready | Track: Launch/GTM | Priority: P0 | Owner: Jordan + Aden  
  - DoD: one runbook for tenant→PM→owner with fallback.  
  - Acceptance: dry run in <15 min with no ambiguous step.  
  - Dependencies: P0 readiness above  
  - Estimate: S (1–2h) | Due: This week  
  - Links: `pms-plans/demo-runbook.md`, `pms-plans/DEMO_GUIDE.md`

### Review/QA
- **PMS-A-03** | Inspection → estimate demo path hardening  
  - Status: Review/QA | Track: AI Workflow | Priority: P0 | Owner: Aden  
  - QA Focus: happy path estimate + forced-failure fallback + standardized output block.  
  - Evidence: `pms-plans/PMS-A-03_EVIDENCE_2026-03-01.md`  
  - Links: `tenant_portal_app/src/InspectionDetailPage.tsx`, `tenant_portal_app/src/components/ui/AIOperatingSystem.tsx`

### Inbox / Backlog
- **PMS-L-01** | Build launch-day checklist | Status: Backlog/Inbox | Track: Launch/GTM | Priority: P1
- **PMS-UX-02** | Empty/loading/error states consistency sweep | Status: Backlog/Inbox | Track: UX Polish | Priority: P1
- **PMS-R-03** | Audit log coverage matrix for sensitive endpoints | Status: Backlog/Inbox | Track: Reliability/Security | Priority: P1

### Done
- **PMS-A-01** | Demo runbook drafted | Status: Done
- **PMS-E-01** | Pricing decision baseline completed | Status: Done
- **PMS-E-02** | Tiered fee structure decisions completed | Status: Done

## Optional: Import-friendly CSV payload
If you want, I can also generate `briefings/PMS_EXECUTION_BOARD_NOTION.csv` for direct Notion CSV import.
