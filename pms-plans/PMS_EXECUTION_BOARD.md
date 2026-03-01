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
- [ ] **PMS-L-01** — Build launch-day checklist (Track: Launch/GTM, Priority: P1)
- [ ] **PMS-UX-02** — Empty/loading/error states consistency sweep (Track: UX Polish, Priority: P1)
- [ ] **PMS-R-03** — Audit log coverage matrix for sensitive endpoints (Track: Reliability/Security, Priority: P1)

### Ready
- [ ] **PMS-B-01** — Backend verification pass for fixed services  
  - Track: Reliability/Security  
  - Priority: P0  
  - Owner: Aden  
  - Definition of Done: Validate startup and basic health checks for `maintenance`, `payments`, `quickbooks`, `rent-estimator`, `rent-optimization`, `rental-application`, `schedule`.  
  - Acceptance Tests: Service boot logs clean; smoke checks pass; issues documented with exact repro.  
  - Dependencies: Env consistency + local startup scripts.  
  - Estimate: M (4–6h)  
  - Due Window: This week  
  - Links: `scripts/pms-dev/dev-managed-up.sh`, `scripts/pms/ci-fast.mjs`

- [ ] **PMS-A-04** — Owner maintenance flow polish (request + comment boundaries)  
  - Track: MVP Core  
  - Priority: P0  
  - Owner: Aden  
  - Definition of Done: Owner can create request (with required `propertyId`) and comment; owner cannot perform operational mutations.  
  - Acceptance Tests: Permission tests pass for allowed/denied paths; UI messages are explicit.  
  - Dependencies: Existing guardrails in maintenance service.  
  - Estimate: S-M (2–4h)  
  - Due Window: This week  
  - Links: `tenant_portal_backend` maintenance auth tests

- [ ] **PMS-D-01** — MVP demo script finalization + acceptance checklist  
  - Track: Launch/GTM  
  - Priority: P0  
  - Owner: Jordan + Aden  
  - Definition of Done: Single runbook for tenant→PM→owner journey with acceptance checklist and fallback plan.  
  - Acceptance Tests: Dry run complete in <15 minutes with no ambiguity in steps.  
  - Dependencies: Above P0 cards.  
  - Estimate: S (1–2h)  
  - Due Window: This week  
  - Links: `pms-plans/demo-runbook.md`, `pms-plans/DEMO_GUIDE.md`

### In Progress
- [ ] _(empty)_

### Review/QA
- [ ] **PMS-A-03** — Inspection → estimate demo path hardening  
  - Track: AI Workflow  
  - Priority: P0  
  - Owner: Aden  
  - QA Focus: Verify happy path estimate, forced-failure fallback estimate, and standardized output block (Scope/Cost/Timeline/Confidence/Rationale).  
  - Evidence: `pms-plans/PMS-A-03_EVIDENCE_2026-03-01.md`  
  - Links: `tenant_portal_app/src/InspectionDetailPage.tsx`, `tenant_portal_app/src/components/ui/AIOperatingSystem.tsx`

### Done
- [x] **PMS-A-01** — Demo runbook drafted (see `pms-plans/demo-runbook.md`)
- [x] **PMS-E-01** — Pricing decision baseline completed
- [x] **PMS-E-02** — Tiered fee structure decisions completed

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
