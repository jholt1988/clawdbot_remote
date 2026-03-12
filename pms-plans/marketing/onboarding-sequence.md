# PMS MVP Onboarding Sequence Outline

**Target:** New user activation and core feature adoption for each role.
**Goal:** Get users to their "Aha! Moment" within the first session.

---

## 1. Property Manager (PM) Onboarding Flow

**Aha! Moment:** A property and unit are successfully added, or the first AI inspection report is generated.

### Stage 1: Account Creation & Initial Welcome
- **Action:** PM signs up (email/password).
- **Expected UI:** Welcome screen, brief intro to PMS value.
- **Key Action:** Prompt to "Add Your First Property."

### Stage 2: Property & Unit Setup
- **Action:** PM clicks "Add Property" CTA.
- **Expected UI:** Guided form for property details (name, address, type, units count).
- **Key Action:** PM adds at least one unit (number, beds, baths, rent).
- **Confirmation:** Success message, dashboard updates with basic property overview.

### Stage 3: Core Feature Introduction (AI Inspections)
- **Action:** Prompt PM to "Perform Your First Inspection" for the newly added unit.
- **Expected UI:** Inspection type selection (Move-In, Routine, Move-Out).
- **Key Action:** PM completes a simple inspection (e.g., "Move-In") for one room.
- **Aha! Moment Trigger:** AI generates the initial work plan and cost estimate.
- **Next Step:** Prompt to invite tenants or explore other features.

### Stage 4: Payments Setup (Stripe Connect Express)
- **Action:** Prompt PM to set up payments to receive rent.
- **Expected UI:** Clear guidance on connecting their Stripe account (redirect to Stripe Connect Express onboarding).
- **Confirmation:** "Stripe Connected!" message upon return to PMS.

### Stage 5: Tenant & Owner Invitation
- **Action:** Guide PM to invite their first tenant or owner.
- **Expected UI:** Simple forms for inviting users by email.

---

## 2. Applicant / Tenant Onboarding Flow

**Aha! Moment:** Lease accepted, first payment successfully made, or first maintenance request submitted.

### Stage 1: Application Submission (Pre-Tenant)
- **Action:** Applicant accesses PMS tenant portal via external link, submits application.
- **Expected UI:** Application form, legal acceptance.
- **Confirmation:** "Application Submitted" screen.

### Stage 2: Lease Acceptance (Becoming a Tenant)
- **Action:** Applicant receives approval email, clicks link to log in.
- **Expected UI:** Welcome message, presented with digital lease for review.
- **Key Action:** Tenant reviews and digitally accepts the lease.
- **Aha! Moment Trigger:** Lease status changes to active, access to tenant dashboard with lease details, payment options, and maintenance request form.

### Stage 3: Initial Setup (Post-Lease Acceptance)
- **Action:** Prompt to "Set Up Payment Method" and "Review Move-In Checklist."
- **Expected UI:** Stripe Elements form for card details, interactive checklist.
- **Key Action:** Tenant adds payment method, marks checklist items as complete.

### Stage 4: First Payment / First Maintenance Request
- **Action:** Guide tenant to pay their first rent installment or submit a maintenance request.
- **Aha! Moment Trigger:** Successful payment confirmation or maintenance request confirmation.

---

## 3. Owner Onboarding Flow

**Aha! Moment:** Viewing property performance in their dashboard, or seeing an AI inspection report/maintenance update.

### Stage 1: Account Activation & First Login
- **Action:** Owner receives invitation email from PM, clicks link to set password.
- **Expected UI:** Welcome to Owner Portal, property overview.
- **Key Action:** Owner logs in.

### Stage 2: Dashboard Overview
- **Action:** Owner lands on their dashboard.
- **Expected UI:** Read-only dashboard showing key metrics (occupancy, monthly revenue, maintenance YTD).
- **Aha! Moment Trigger:** Clearly seeing their property's financial performance and status at a glance.

### Stage 3: Exploring Details (Maintenance & Inspections)
- **Action:** Guide owner to click on "Maintenance History" or "Latest Inspection Report."
- **Expected UI:** Read-only views of requests/reports, ability to comment on maintenance.
- **Key Action:** Owner views a specific maintenance request or an AI inspection report.

---

## 4. Cross-Cutting Considerations

- **Clear CTAs:** Each stage should have a prominent, single call to action.
- **Progress Indicators:** Show users how far along they are (e.g., "Step 1 of 3").
- **Minimal Friction:** Only ask for essential information at each step.
- **Contextual Help:** Small info icons or tooltips where users might get stuck.
- **Email Nurturing:** Complement in-app onboarding with welcome emails, tips, and reminders.
- **Mobile First:** Ensure all onboarding steps are seamless on mobile devices.
- **Analytics:** Track completion rates for each stage to identify drop-off points.
