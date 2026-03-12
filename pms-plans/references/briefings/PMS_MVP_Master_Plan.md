# Property Management Suite (PMS) — Comprehensive Plan to MVP
Date: 2026-02-09 (UTC)
Owner: Jordan Alexander Holt
Prepared by: Aden

> **Purpose**: This is the single “north star” plan to get from the current repo state to a demoable, sellable MVP.
>
> Deliverables in this doc:
> - Summary of intent (from repo documentation + work completed in this chat)
> - Feature-by-feature + workflow-by-workflow MVP plan
> - Market comparison + stakeholder needs + common pain points
> - Differentiation strategy (what sets us apart)
> - Hypothetical final product overview (feature/workflow/user stories)
> - Bite-sized task breakdown (sequenced)
> - Open questions

---

## 0) What I checked (sources)
### Repo docs referenced (high-signal)
- `docs/MVP_PLAN_AND_PRODUCT_OVERVIEW.md`
- `docs/guides/functionality.md`
- `docs/implementation/comprehensive-feature-implementation.md`
- `CODEBASE_ASSESSMENT_REPORT.md`
- `P0_IMPLEMENTATION_STATUS.md`
- plus docs under: `docs/ai-ml/`, `docs/testing/`, `docs/security/`, `docs/setup/`, `docs/guides/wiki/`

### Work completed in this chat (confirmed)
- Maintenance security boundaries E2E test suite created and passing.
- Org scoping guard/decorator updates (org boundary enforcement).
- Owner permissions polish:
  - Owners can **create maintenance requests** (must include `propertyId`).
  - Owners are **read-only** for operational maintenance mutations (status changes, technician assignment).
  - Guardrail: if `propertyId` and `unitId` both supplied on create, validate unit belongs to property.
- E2E runner: set `forceExit` to avoid hanging open handles.
- E2E DB strategy: moved to a dedicated Supabase database URL and use `schema=public`.

---

## 1) Your intent (summary) — what you’re building
From the repo + our conversation, your intended product is:

### 1.1 The product
A **multi-tenant, role-based Property Management Suite** with:
- **Tenant portal** (payments, maintenance, lease/docs, messaging)
- **Property manager portal** (properties/units, leasing funnel, maintenance ops, inspections/estimates, reporting)
- **Admin/back office** (orgs, roles, security, monitoring)
- **AI-assisted workflows** (inspection → work plan/estimate; priority triage; rent optimization; leasing agent)

This matches the repo’s “inferred product overview” and module list in `docs/MVP_PLAN_AND_PRODUCT_OVERVIEW.md`.

### 1.2 The thesis
The suite is not just “feature complete.” It aims to be:
- **Operationally reliable** (contracts don’t drift, tests exist, monitoring exists)
- **Security-first multi-tenant** (org scoping and permission boundaries are enforced in-service)
- **Sleek UX** (role-based navigation, consistent patterns)
- **AI where it creates ROI** (maintenance triage, inspection→estimate, leasing agent)

---

## 2) Where we are today (gap to MVP)
Per `docs/MVP_PLAN_AND_PRODUCT_OVERVIEW.md` and `CODEBASE_ASSESSMENT_REPORT.md`:

### 2.1 Strengths
- Broad feature coverage (auth, properties, leases, maintenance, payments, messaging, inspections, e-sign, integrations)
- Modern stack (React/TS + NestJS/TS + Prisma/Postgres)
- Modular backend and domain-driven frontend structure

### 2.2 MVP risks (must manage)
These are the things that usually kill “MVP demos”:
1) **Contract drift** (frontend expects a different response envelope than backend returns)
2) **Edge cases in core money flows** (payment failure, reconciliation/webhooks, partial payments)
3) **Permission leaks** (cross-org access, cross-lease access)
4) **Maintenance workflow clarity** (status expectations, notifications, audit trail)
5) **Setup friction** (data seeding, onboarding, imports)

`docs/MVP_PLAN_AND_PRODUCT_OVERVIEW.md` calls this out as “P0 contract coherence.”

---

## 3) Competitive landscape (similar products)
### 3.1 Market incumbents (examples)
- **AppFolio** (resident/owner portals, payments, maintenance, docs, mobile)
- **Buildium** (all-in-one: leasing, accounting, portals, payments, maintenance, reporting)
- **Yardi Breeze** (SMB PMS with portal, payments, maintenance, accounting; add-ons)
- (also commonly compared: Rent Manager, Propertyware, DoorLoop, TurboTenant, TenantCloud)

### 3.2 What these products emphasize
From public materials:
- Buildium positions PMS as central ops hub: payments, tenant comms, maintenance, reporting, portals, mobile access. Source: https://www.buildium.com/
- AppFolio’s Online Portal documentation highlights core tenant expectations: pay rent, set up auto pay, maintenance requests (with photos), documents, e-signing, and account management. Source: https://www.appfolio.com/help/online-portal
- Yardi Breeze commercial features emphasize tenant portal + payments + maintenance requests, and “simple pricing / no onboarding fees” messaging. Source: https://www.yardibreeze.com/commercial-features/

### 3.3 Our *pragmatic* competitive stance
We do **not** beat AppFolio/Yardi on “everything” in V1.
We win by being:
- **faster to adopt** (less setup pain)
- **cleaner and more explainable** (less mystery/black box)
- **AI-driven where it reduces labor** (not AI as a gimmick)
- **permission-safe + audit-friendly** out of the box

---

## 4) Stakeholders & what they actually want (needs + pain points)
### 4.1 Stakeholders
1) **Owner / investor** (wants control, approvals, transparency)
2) **Property manager / leasing staff** (wants speed, fewer calls, fewer mistakes)
3) **Tenant / resident** (wants fast service + clarity)
4) **Maintenance tech / vendor** (wants complete info, scheduling, fewer back-and-forths)
5) **Accounting/bookkeeping** (wants clean ledger, reconciliation, exports/sync)

### 4.2 Common pain points (consistent across sources)
From the 2024 PM trends report summary:
- Maintenance and costs are a top daily challenge; investors want to stay involved (especially approvals above a threshold). Source: https://www.tenantcloud.com/blog/property-management-trends-report

From an “automation in PM” guide that compiles industry sources:
- Maintenance is a major source of stress; resident expectations for faster fixes; labor shortages; fraud/security concerns rising. Source: https://partners.apartmentadvisor.com/owner-resource-center/how-automation-solves-the-toughest-challenges-in-property-management

Recurring pain points we should assume are true:
- reactive maintenance + vendor coordination chaos
- fragmented communication (texts/calls/emails, no history)
- confusing tenant ledgers and unreliable reporting
- payment friction (autopay, partials, fees, failures)
- onboarding pain (data migration, training, hidden costs)

### 4.3 Are we addressing them?
Yes, partially — the repo already contains:
- tenant portal basics (payments, maintenance, messaging, docs)
- inspection + estimate workflows (powerful differentiator if made explainable)
- a foundation for AI leasing and maintenance triage
- monitoring/testing docs to raise reliability

But to *really* address market pain, we must make MVP:
- **fast** (triage and self-service)
- **trustworthy** (audit trail, permissions)
- **clear** (status + next action + notification)

---

## 5) What sets us apart (differentiation strategy)
### 5.1 Differentiators worth betting on
1) **Inspection → Work Plan / Estimate** as a first-class workflow
   - Not just an inspection form: it becomes a scoped plan, cost range, timeline, and priority.
2) **Explainable AI** (every AI suggestion includes rationale + confidence + fallback)
3) **Owner involvement model** built-in
   - Owners can create requests and comment, but ops control stays with PM/admin.
   - This directly matches “owners want to be hands-on” and approvals-above-threshold desire.
4) **Contract coherence + test-first boundaries**
   - Many PMS products feel brittle; we can make ours feel “tight” and predictable.

### 5.2 “Sleek + scalable” means design constraints
- One response envelope.
- One permission model.
- One source of truth for org scoping.
- No hidden state in UI.
- Every workflow has: **state**, **history**, **notifications**, **roles**.

---

## 6) MVP definition (feature-by-feature)
This is the MVP that can be demoed to real customers.

### MVP north-star demo (end-to-end story)
1) PM creates property + unit
2) PM adds/assigns lease to tenant (documents visible)
3) Tenant:
   - logs in
   - sees lease + next rent due
   - pays rent
   - submits maintenance request (photos)
4) PM:
   - sees maintenance queue
   - triages and assigns
   - communicates with tenant
   - closes request
5) PM runs inspection and gets an **estimate** from action items
6) Owner:
   - views updates + comments
   - can create a maintenance request tied to a property

If we can demo that without glitches, we’re “MVP-demo ready.”

### 6.1 Foundation (P0)
- API contract coherence (standard envelope)
- Auth, role gating, org scoping
- Seed/demo data
- Error handling consistency
- Logs + monitoring basics

### 6.2 Authentication + Roles
Workflows:
- sign up / invite
- login / logout
- password reset
- role-based routing

### 6.3 Properties + Units
Workflows:
- create property
- create units
- assign staff

### 6.4 Leases + Documents (+ e-sign)
Workflows:
- create lease
- assign tenant
- tenant views lease details
- upload/share docs
- e-sign handshake (can be “phase 1” minimal)

### 6.5 Payments
Workflows:
- tenant adds payment method
- tenant pays rent
- payment receipt
- webhook reconciliation

### 6.6 Maintenance (core differentiator)
Workflows:
- tenant submits request + photos
- PM triage + status + assign
- notes/comments
- completion confirmation

Owner policy (already implemented directionally):
- owner can create maintenance request (requires propertyId)
- owner can comment
- owner cannot status-change/assign

### 6.7 Messaging
Workflows:
- tenant ↔ PM thread
- attach context (lease/unit/request)
- history + audit

### 6.8 Inspections + Estimates (key “wow”)
Workflows:
- create inspection
- checklist per room
- photo/signature
- generate estimate
- explain “confidence + rationale”

### 6.9 Notifications (MVP lite)
Workflows:
- email/sms/in-app notifications for status changes and payments

---

## 7) Hypothetical final product (feature-by-feature + workflow-by-workflow)
This is the “best in market” direction. (We won’t ship all in MVP, but it guides architecture.)

### 7.1 Tenant experience
- Onboarding: invite, identity verification (optional), renters insurance upload
- Lease: view terms, renew, sign, notices
- Payments: autopay, split payments, fees, receipts, ledger clarity
- Maintenance: guided troubleshooting, priority detection, appointment scheduling
- Messaging: real-time + attachments + announcement broadcasts

### 7.2 PM experience
- Portfolio dashboard: occupancy, delinquencies, maintenance SLA
- Leasing funnel: leads → tours → application → screening → approval → lease
- Maintenance ops: queue, vendor assignment, cost approvals, SLA, recurring tasks
- Inspections: templates, mobile capture, action items → work plan → estimate
- Accounting: bank sync, owner statements, QuickBooks integration

### 7.3 Owner/investor experience
- Owner portal: statements, documents, distribution tracking
- Approval workflows: repairs above threshold, tenant approvals
- Transparent maintenance: status, cost, photos, history

### 7.4 Admin experience
- orgs, roles, permissions, audit logs
- monitoring, alerts, anomaly detection

---

## 8) User stories (selected, by workflow)
(Format: As a <role>, I want <capability>, so that <benefit>.)

### Tenant
- As a tenant, I want to pay rent in under 60 seconds, so I don’t get late fees.
- As a tenant, I want to submit a maintenance request with photos and see status, so I’m not stuck calling.
- As a tenant, I want a single message thread tied to my unit/lease, so I can reference past decisions.

### Property manager
- As a PM, I want a single maintenance queue with priorities and SLA, so urgent issues don’t get buried.
- As a PM, I want to assign a vendor and track completion with photos, so I can prove work was done.
- As a PM, I want inspections to generate a consistent estimate range, so I can budget and justify costs.

### Owner
- As an owner, I want to see maintenance progress and costs and comment, so I feel in control.
- As an owner, I want to initiate a maintenance request for a property, so I can be proactive.

### Vendor/tech
- As a vendor, I want clear job details (access, photos, priority), so I can fix it on the first visit.

---

## 9) Bite-sized task plan to MVP (sequenced)
This is the “what we do next” list, broken into small shippable tickets.

### Track A — MVP Demo Path (fastest to revenue)
A1) Define MVP demo script + acceptance criteria
A2) Contract coherence sweep (standard envelope + fix any drift)
A3) Payments happy path (pay + receipt + webhook)
A4) Maintenance happy path (tenant submit → PM triage → close)
A5) Messaging thread stability
A6) Inspection → estimate demo path
A7) Owner portal minimum (read + comment + create maintenance request)
A8) Seed/demo data and “one click demo” startup

### Track B — Trust & Security (must keep pace)
B1) Permissions matrix for every endpoint
B2) E2E tests for cross-org and cross-lease boundaries (expand)
B3) Audit log for sensitive actions
B4) Rate limiting + security headers review

### Track C — UX polish (sleek)
C1) Consistent success/error toasts
C2) Loading and empty states
C3) Accessibility pass on core flows

### Track D — ROI features (AI, but grounded)
D1) Maintenance priority triage (explainable)
D2) Inspection action items → work plan suggestion
D3) Rent optimization baseline

---

## 10) Questions (so I don’t build the wrong MVP)
1) Who is MVP buyer #1?
   - Solo landlord / small PM (1–200 units) / mid-market PM (200–2,000)
2) Property types in MVP?
   - Single-family, multifamily, mixed, student, commercial?
3) Payments scope?
   - rent-only vs rent+fees vs partial payments vs cash payments
4) Maintenance scheduling scope?
   - just status updates, or appointment booking windows + vendor calendar sync
5) Messaging scope?
   - in-app only, or SMS/email relay in MVP
6) Inspection scope?
   - do we need mobile-first capture in MVP, or desktop is acceptable for demo
7) Integrations required for MVP?
   - QuickBooks / DocuSign / Stripe (Stripe seems core)

---

## 11) Next actions (what I will do next)
1) Turn Sections 9 + 6 into an `AGENT-BOARD.md` ticket set (bite-sized, timeboxed).
2) Have Research (Planner) deliver a “stakeholder needs + differentiation” memo with citations.
3) Have Writer (Ops) generate a Notion-ready Markdown formatting pack + template folder.
4) Generate a PDF from this Markdown (using a local md→pdf toolchain).
