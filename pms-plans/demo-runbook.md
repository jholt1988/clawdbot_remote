# PMS MVP Demo Runbook

**Version:** 1.2  
**Date:** 2026-02-22  
**Task:** PMS-A-09  
**Status:** Updated

---

## Overview

This runbook walks through the complete north-star MVP demo story for the Property Management Suite (PMS). The demo follows **Morgan**, a property manager in Wichita, Kansas, as she manages **Sunset Apartments** — a 12-unit building.

### Characters

| Role | Name | Description |
|------|------|-------------|
| Property Manager | Morgan | Manages 45 units, uses PMS to run her business |
| Applicant → Tenant | Taylor → Alex | Rents Unit 204 at Sunset Apartments |
| Owner | Jordan | Lives out of state, owns Sunset Apartments |

### Property

**Sunset Apartments**  
- Location: Wichita, KS  
- Units: 12  
- Type: Multifamily (2BR, 1BA units)  
- Rent: $1,200/month

---

## Demo Paths

The demo has **three selectable paths**. Choose based on what you want to showcase:

1. **Path A:** Full Story — Applicant to Tenant (Sections 1–5)  
2. **Path B:** AI Inspections — Move-in, Routine, Move-out (Section 6)  
3. **Path C:** Owner Perspective — Jordan's view (Section 7)

---

## Path A: Full Story (Applicant → Tenant)

### Scene 1: Property Setup

**Objective:** Show Morgan setting up her first property in PMS.

**Steps:**

1. Morgan logs into PMS
   - **Expected UI:** Login screen → Dashboard (empty state with "Add Property" CTA)

2. Morgan clicks "Add Property"
   - **Expected UI:** Property creation form

3. Morgan enters property details:
   - Property Name: Sunset Apartments
   - Address: 1234 Sunset Lane, Wichita, KS 67203
   - Type: Multifamily
   - Units: 12
   - **Expected UI:** Form validation passes → Success toast

4. Morgan adds Unit 204:
   - Unit Number: 204
   - Bedrooms: 2
   - Bathrooms: 1
   - Square Feet: 850
   - Rent: $1,200/month
   - **Expected UI:** Unit appears in property detail

5. Morgan views dashboard
   - **Expected UI:** Dashboard shows 12 units, $0 revenue (no tenants yet)

---

### Scene 2: Applicant → Tenant

**Objective:** Show the full applicant-to-tenant conversion flow.

**Steps:**

1. Taylor discovers Sunset Apartments (externally)
   - *(External — not shown in PMS)*

2. Taylor visits PMS tenant portal → "Apply Now"
   - **Expected UI:** Application form
   - **Form Fields:**
     - Full name: Taylor Smith
     - Email: taylor@email.com
     - Phone: (316) 555-0123
     - Current address: 567 Oak St, Wichita, KS 67202
     - Employer: Wichita General Hospital
     - Income: $3,500/month
     - Desired move-in: 2026-03-01
     - **Legal:** Must accept Terms of Service + Privacy Policy (versioned)

3. Taylor submits application
   - **Expected UI:** Confirmation screen "Application Submitted"

4. Morgan receives notification → reviews application
   - **Expected UI:** Morgan's dashboard shows "1 Pending Application"
   - Morgan clicks application → sees Taylor's details, credit report, background check

5. Morgan approves Taylor's application
   - **Expected UI:** "Approve" button → Confirmation modal → Success toast
   - Auto-generates lease from template

6. Taylor receives approval email → logs in to tenant portal
   - **Expected UI:** Welcome screen with lease for Unit 204

7. Taylor accepts lease → becomes "Alex" (tenant)
   - **Note:** Taylor → Alex name change is a narrative device. In the actual data, keep the same person unless you intentionally remap.
   - **Expected UI:** Lease active in tenant dashboard

---

### Scene 3: Lease & Move-In

**Objective:** Show lease creation and tenant document visibility.

**Steps:**

1. Morgan views Unit 204
   - **Expected UI:** Unit detail shows tenant "Alex Smith"

2. Alex views lease
   - **Expected UI:** Tenant portal shows lease document (PDF), start date, end date, monthly rent, deposit amount

3. Alex views move-in checklist
   - **Expected UI:** Checklist items: "Sign lease," "Pay security deposit," "Set up utilities," "Schedule move-in"

4. Alex completes checklist items (simulated)
   - **Expected UI:** Items checked off, progress bar reaches 100%

---

### Scene 4: Payments

**Objective:** Show tenant payment flow with Stripe.

**Steps:**

1. Alex adds payment method
   - **Expected UI:** "Add Card" button → Stripe Elements form
   - Alex enters card details
   - **Expected UI:** "Card added successfully" → Card shows in payment methods

2. Alex pays rent
   - **Expected UI:** "Pay Rent" button → Amount $1,200 → Confirm
   - Stripe processes payment
   - **Expected UI:** "Payment Successful" → Receipt shown

3. Morgan views payment in dashboard
   - **Expected UI:** Revenue widget shows $1,200 received
   - Transaction list shows "Rent - Unit 204 - Alex Smith"

---

### Scene 5: Maintenance Request

**Objective:** Show tenant submitting request and PM handling it.

**Steps:**

1. Alex discovers issue: AC not cooling
   - *(Real-world scenario)*

2. Alex submits maintenance request
   - **Expected UI:** "Submit Request" → Form
     - Category: HVAC
     - Description: "AC is running but not cooling. It's 85°F inside."
     - Photos: *(attach 2 photos of thermostat/AC unit)*
     - Urgency: High
   - **Expected UI:** Success → Request appears in "My Requests"

3. Morgan receives notification
   - **Expected UI:** Bell icon shows "1 new request"
   - Morgan opens queue → sees AC request at top

4. Morgan triages request
   - **Expected UI:** Request detail → Priority dropdown → Assign to vendor
   - Morgan adds note: "Scheduled HVAC Pro for tomorrow AM"

5. Morgan assigns to vendor
   - **Expected UI:** Status changes to "In Progress"

6. Message thread opens
   - **Expected UI:** Morgan and Alex can message about the request
   - Alex: "Thanks for quick response!"
   - Morgan: "Technician arriving between 8-10 AM"

7. Morgan closes request
   - **Expected UI:** Status → "Completed" → Resolution notes entered

---

## Path B: AI Inspections

This path showcases the AI-powered inspection feature — the north-star differentiation for PMS.

### Overview

AI Inspections generate:
- **Work Plan:** Action items with priorities
- **Cost Estimate:** Min/max range with confidence level
- **Timeline:** Suggested completion timeframe
- **Explainability:** Why the AI made these recommendations

### Demo Seed: Inspection → Estimate (Local)

**Goal:** Confirm the end-to-end Inspection Detail → Generate/Regenerate Estimate flow with seeded data.

**Prereqs (local):**
- Backend running on `http://localhost:3005`
- Frontend running on `http://localhost:3001`
- Frontend env:
  - `tenant_portal_app/.env.local`
    - `VITE_USE_MSW=false`
    - `VITE_API_URL=http://localhost:3005/api`
- Seed data:
  - From `tenant_portal_backend/`: `npm run seed:inspection-demo:robust`
  - Login: **admin / Admin123!@#**

**Steps:**
1. Open **Inspection Management** (`/inspection-management`).
2. Click the most recent **Unit 101** inspection (IN_PROGRESS).
3. On **Inspection Detail**, click **Regenerate Estimate** → confirm.
4. Verify:
   - **Estimate** section appears with bid range + line items.
   - **Estimate history** shows the newest estimate at top.
   - **Last generated** updates to current timestamp.

**Expected:**
- Estimate is created (may be **LOW** confidence with fallback if AI is unavailable).

---

### Scenario B1: Move-In Inspection

**Context:** Alex is moving into Unit 204. Morgan performs move-in inspection.

**Steps:**

1. Morgan opens Inspections → New Inspection
   - **Expected UI:** Inspection type selector: Move-In / Routine / Move-Out

2. Morgan selects "Move-In"
   - **Expected UI:** Inspection form for Unit 204

3. Morgan walks through checklist:
   - Kitchen: Refrigerator (Working), Stove (Working), Dishwasher (Working), Sink (Working), Cabinets (Good), Countertops (Good)
   - Bathroom: Toilet (Working), Sink (Working), Shower/Tub (Working), Mirror (Good)
   - Living: Walls (Good), Flooring (Good), Windows (Good), Light fixtures (Working)
   - Bedrooms: Walls (Good), Flooring (Good), Windows (Good), Closet (Good)
   - Photos: *(attach 8 photos of rooms)*

4. Morgan submits inspection
   - **Expected UI:** "Generating AI Report..." loading state

5. AI generates report:
   ```
   MOVE-IN CONDITION REPORT
   Unit: 204 Sunset Apartments
   
   OVERALL: Good Condition
   
   Work Plan:
   - None required at move-in
   
   Cost Estimate:
   - Immediate: $0
   - 6-Month Projection: $0
   
   Notes:
   - All systems operational
   - Recommend scheduling routine inspection in 90 days
   ```

---

### Scenario B2: Routine Inspection

**Context:** 90 days later. Morgan performs quarterly routine inspection.

**Steps:**

1. Morgan opens Inspections → New Inspection
2. Selects "Routine" → Unit 204
3. Morgan walks through checklist:
   - Kitchen: Refrigerator (Working), Stove (Working - minor issue: burner knob loose), Dishwasher (Not Working), Sink (Working), Cabinets (Fair - drawer sticking), Countertops (Good)
   - Bathroom: Toilet (Running - needs flush valve), Sink (Working), Shower/Tub (Good), Mirror (Good)
   - Living: Walls (Fair - small hole in bedroom wall), Flooring (Good), Windows (Good), Light fixtures (Working)
   - Photos: *(attach 12 photos)*

4. Morgan submits inspection

5. AI generates report:
   ```
   ROUTINE INSPECTION REPORT
   Unit: 204 Sunset Apartments
   
   OVERALL: Fair Condition - Action Required
   
   Work Plan:
   1. [HIGH] Replace toilet flush valve ($80-120)
   2. [MEDIUM] Repair dishwasher ($200-400)
   3. [MEDIUM] Fix cabinet drawer ($50-100)
   4. [LOW] Patch wall hole ($75-150)
   
   Cost Estimate:
   - Immediate: $405-670
   - 6-Month Projection: $405-670
   - Confidence: 85%
   
   Timeline:
   - Urgent: Within 1 week (toilet)
   - Standard: Within 30 days (appliance, cabinets)
   - Cosmetic: Within 90 days (wall)
   
   Explainability:
   - Toilet running wastes ~$100/year in water; prompt repair prevents floor damage
   - Dishwasher leak risk increases with age; early repair prevents cabinet damage
   - Wall hole likely from move-in; cosmetic but should seal for energy efficiency
   ```

---

### Scenario B3: Move-Out Inspection

**Context:** Alex is moving out. Morgan performs move-out inspection to assess deposit.

**Steps:**

1. Morgan opens Inspections → New Inspection
2. Selects "Move-Out" → Unit 204
3. Morgan walks through checklist:
   - Kitchen: Refrigerator (Working), Stove (Working), Dishwasher (Not Working), Sink (Working), Cabinets (Poor - water damage), Countertops (Fair - burn mark)
   - Bathroom: Toilet (Working), Sink (Working), Shower/Tub (Good), Mirror (Cracked)
   - Living: Walls (Poor - large hole, multiple scuffs), Flooring (Fair - carpet stain), Windows (Good), Light fixtures (Not Working)
   - Photos: *(attach 15 photos)*

4. Morgan submits inspection

5. AI generates report:
   ```
   MOVE-OUT INSPECTION REPORT
   Unit: 204 Sunset Apartments
   Tenant: Alex Smith
   Move-Out Date: 2026-02-28
   
   OVERALL: Poor Condition - Deposit Likely Insufficient
   
   Work Plan:
   1. [CRITICAL] Replace flooring ($800-1200) - carpet stain unrecoverable
   2. [HIGH] Repair cabinet water damage ($400-600) - leak left unreported
   3. [HIGH] Replace cracked mirror ($150-250)
   4. [HIGH] Repair/replace light fixture ($100-200)
   5. [MEDIUM] Replace burner knobs ($40-60)
   6. [MEDIUM] Patch/paint walls ($300-500)
   7. [LOW] Replace countertop burn mark ($200-400)
   
   Cost Estimate:
   - Total Repairs: $1,990-3,210
   - Security Deposit: $1,200
   - Shortfall: $790-2,010
   
   Timeline:
   - Must complete before next tenant (5-7 days)
   
   Deposit Recommendation:
   - Withhold full deposit $1,200
   - Pursue additional $790-810 for flooring (largest item)
   - Or negotiate: tenant agrees to $1,500 settlement
   
   Explainability:
   - Water damage to cabinets indicates unreported leak - tenant responsible
   - Carpet stain too severe for standard cleaning - replacement required
   - Wall damage exceeds normal wear and tear
   - Light fixture may be salvageable with bulb replacement (not included in estimate)
   ```

---

## Path C: Owner Perspective

**Context:** Jordan (owner) logs in to see how his investment is performing.

**Steps:**

1. Jordan logs into Owner Portal
   - **Expected UI:** Owner dashboard

2. Jordan views property overview
   - **Expected UI:** 
     - Property: Sunset Apartments
     - Units: 12/12 occupied
     - Monthly Revenue: $14,400
     - Maintenance YTD: $2,400

3. Jordan views maintenance history
   - **Expected UI:** List of requests with status
   - AC request from Unit 204 shows: "In Progress"

4. Jordan views latest AI inspection report
   - **Expected UI:** Routine inspection summary for Unit 204
   - Cost projections shown

5. Jordan reviews AC request details
   - **Expected UI:** Read-only request detail view

6. Jordan adds a comment on the AC request (Owner role)
   - **Expected UI:** Comment box enabled on request detail → submits "Please prioritize this—tenant is without cooling"
   - Comment appears in request thread with **Owner** badge
   - PM receives notification of owner comment

7. Jordan remains read-only for status/actions (no reassignment or status change)
   - **Expected UI:** Status controls disabled for Owner role

---

## Demo Data Assumptions

| Entity | Values |
|--------|--------|
| Property | Sunset Apartments, 1234 Sunset Lane, Wichita, KS 67203 |
| Unit 204 | 2BR, 1BA, 850 sq ft, $1,200/mo |
| Morgan | PM, email: morgan@pms-demo.com |
| Taylor/Alex | Tenant, email: alex@email.com, phone: (316) 555-0124 |
| Jordan | Owner, email: jordan@owner.com |
| Lease | Start: 2026-03-01, End: 2027-02-28, Deposit: $1,200 |
| Rent | Due: 1st, Grace: 5th, Late Fee: $25 |
| Legal | Terms v0.1 + Privacy v0.1 accepted at submission |

---

## Mobile Responsiveness Validation

**Goal:** Demonstrate the UI remains fully usable on mobile breakpoints.

**Viewports to verify (DevTools):**
- iPhone 14 Pro: **393 × 852**
- Pixel 7: **412 × 915**

**Pages to capture:**
1. PM Dashboard (cards stack, no horizontal scroll)
2. Maintenance request form (inputs full-width, photo upload visible)
3. Inspection checklist (sections collapse/expand cleanly, buttons reachable)
4. Owner maintenance request detail (comment box visible, thread readable)

**Expected:**
- No horizontal scrolling
- Navigation collapses to mobile menu
- Primary CTA buttons remain visible without overlap

---

## Acceptance Checklist

| # | Criteria | Pass/Fail | Notes |
|---|----------|-----------|-------|
| 1 | PM can create property + unit | [ ] | |
| 2 | Applicant can submit application (legal acceptance captured) | [ ] | |
| 3 | PM can approve application → create lease | [ ] | |
| 4 | Tenant can view lease and documents | [ ] | |
| 5 | Tenant can add payment method (Stripe) | [ ] | |
| 6 | Tenant can pay rent | [ ] | |
| 7 | PM receives payment notification | [ ] | |
| 8 | Tenant can submit maintenance request with photos | [ ] | |
| 9 | PM can triage and assign request | [ ] | |
| 10 | Messaging thread works between PM and tenant | [ ] | |
| 11 | PM can complete inspection on mobile | [ ] | |
| 12 | AI generates work plan + cost estimate for Move-In | [ ] | |
| 13 | AI generates work plan + cost estimate for Routine | [ ] | |
| 14 | AI generates work plan + cost estimate for Move-Out | [ ] | |
| 15 | Owner can view property dashboard | [ ] | |
| 16 | Owner can view maintenance history | [ ] | |
| 17 | Owner can comment on requests | [ ] | Evidence: Owner comment screenshot + PM notification note |
| 18 | All UI is responsive on mobile | [ ] | Evidence: Mobile viewport screenshots + no horizontal scroll |
| 19 | Demo can be reset to clean state (dev-managed-up.sh + robust seed) | [ ] | |

---

## Screenshots Needed

| Scene | Screenshot |
|-------|------------|
| 1.1 | Empty dashboard |
| 1.2 | Property creation form |
| 1.3 | Property detail with units |
| 2.1 | Application form |
| 2.2 | Application review (PM view) |
| 2.3 | Tenant welcome screen |
| 3.1 | Lease document view |
| 4.1 | Payment method added |
| 4.2 | Payment confirmation |
| 5.1 | Maintenance request form |
| 5.2 | PM queue view |
| 5.3 | Request detail with messaging |
| 6.1 | Inspection type selector |
| 6.2 | Inspection checklist |
| 6.3 | AI report (Routine) |
| 6.4 | AI report (Move-Out) |
| 7.1 | Owner dashboard |
| 7.2 | Owner maintenance view |
| 7.3 | Owner comment on request (with Owner badge) |
| 8.1 | Mobile: PM dashboard (stacked cards, no overflow) |
| 8.2 | Mobile: Maintenance request form |
| 8.3 | Mobile: Inspection checklist |
| 8.4 | Mobile: Owner request detail with comment box |

---

## Evidence Index

- See `pms-plans/demo-evidence.md` for required artifacts and filenames.

---

## Notes

- This runbook assumes a **seeded demo org** with no pre-existing data
- **Demo reset (hard reset + reseed):**
  - `bash scripts/pms-dev/demo-reset.sh --root ./pms-master`
  - Verify only: `cd pms-master/tenant_portal_backend && npm run seed:verify:demo`
- Screenshots should be captured on **mobile viewport** for inspection scenes
- AI inspection feature is the **primary differentiation** — spend extra time here
- Demo reset script must clear all data back to Scene 1 state
- Owner path is **read-only** (no mutations) by design
