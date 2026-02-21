# PMS Pricing & Stripe Connect Decisions

**Task:** PMS-E-01 & PMS-E-02  
**Date:** 2026-02-21  
**Status:** Draft for Jordan's Review

---

## 1. Stripe Connect: Express vs Standard

### Recommendation: **Express**

### Rationale

| Factor | Express | Standard |
|--------|---------|----------|
| Onboarding UX | Stripe handles KYC/Dashboard | You build everything |
| Control | Less (Stripe manages UI) | Full (your UI) |
| Payouts | Managed by Stripe | You control timing |
| MVP Speed | Fastest | Slower to build |
| Liability | More on Stripe | More on you |

### For MVP (1-200 units per PM)

**Express is the right choice because:**
- ✅ Faster time-to-market — Stripe handles onboarding UI
- ✅ Less compliance burden — Stripe manages KYC/identity verification
- ✅ Good enough for MVP — PMs can receive payouts directly
- ✅ Easier to upgrade later — migrate to Custom/Express if needed

### Decision for MVP

> **Use Stripe Connect Express** for MVP. Target migration to Custom if/when enterprise demand warrants.

---

## 2. Tier Table Proposal

### Model: Tiered Application Fee (per payment)

The PM pays a percentage of each rent payment as the platform fee. This aligns with usage (more rent collected = more fee) and is predictable.

### Proposed Tiers

| Tier | Doors | Application Fee | Min Monthly | Example ($1,200/door) |
|------|-------|----------------|-------------|------------------------|
| **Startup** | 1-10 | 3.0% | $50 | $360 ($1200×10×3%) |
| **Growth** | 11-30 | 2.5% | $150 | $900 ($1200×30×2.5%) |
| **Scale** | 31-75 | 2.0% | $350 | $1,800 ($1200×75×2%) |
| **Enterprise** | 76-200 | 1.5% | $600 | $3,600 ($1200×200×1.5%) |

### Notes

- **Doors = active/managed units** in the billing period
- **Minimum fee** ensures viability even for small PMs
- **Fee decreases as volume increases** — incentivizes growth
- **Gateway/transaction fees** are separate (Stripe's ~2.9% + $0.30)

### Alternative: Flat Per-Door Model

If you prefer predictable subscription pricing:

| Tier | Doors | $/Door/Month | Min Monthly |
|------|-------|--------------|-------------|
| Startup | 1-10 | $15 | $100 |
| Growth | 11-30 | $12 | $200 |
| Scale | 31-75 | $10 | $400 |
| Enterprise | 76-200 | $8 | $800 |

### Recommendation

**Start with tiered application fee (first table)** — it aligns with PM revenue (they take a cut of rent) and is easier to sell than a flat subscription.

---

## 3. Implementation Notes

### Database Fields Needed

From `OrgPlanCycle` schema:
- `doors_snapshot` — count at cycle start
- `tier_code_snapshot` — which tier applied
- `fee_schedule_version_snapshot` — for future pricing changes
- `projected_next_tier` — for UI display

### Fee Calculation Rules

1. Fee computed **server-side only** (never trust client)
2. Fee always < amount (guard: `fee < amount`)
3. Tier snapshot does **not change** mid-cycle
4. Use `PricingPlanCycle` to track changes over time

---

## 4. Open Questions for Jordan

1. **Gateway fees** — Should PM pay Stripe fees directly, or does the platform fee include them?
2. **Effective date** — When do these tiers go live? (MVP launch?)
3. **Minimums** — Are the proposed minimums too high/low for Wichita market?
4. **Add-ons** — Should we price AI inspections, SMS, e-sign separately?

---

## 5. Next Steps

- [ ] Jordan reviews and approves/revises
- [ ] Update `PMS_MVP_AGENT_INPUT_2026-02-15.json` with final decisions
- [ ] Create Prisma seed for FeeScheduleVersion
- [ ] PMS-PRIC-01 (OrgPlanCycle schema) can proceed after this is locked
