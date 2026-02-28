# Property OS -- Cash-Flow Stability Engine

## Complete Model Contract Specification (v1.3 -- Payment Plans + Residual Risk Memory)

Version: 1.3.0\
Generated: 2026-02-28T06:15:32.035033

------------------------------------------------------------------------

# 0. Change Log (v1.3.0)

-   Adds **Payment Plan signals** (authorized vs unauthorized partials)
-   Adds **Residual Risk Memory**: each payment plan adds mandatory
    **90-day residual risk tail**
-   Updates derived features, outputs, explainability, and coordinator
    priors to support payment-plan regime detection
-   Retains segmentation keys: region, property_class, rent_band,
    building_age_bucket

------------------------------------------------------------------------

# 1. Model Identity

**Model Name:** CashFlowStabilityEngine\
**Architecture:** Hybrid Hierarchical Time-Series + Shrinkage +
Deterministic Guardrails\
**Learning Mode:** Federated Parameter Aggregation + Global Priors +
Regime Detection\
**Primary Objective:** Probabilistic cash-flow stability at Unit and
Property levels with multi-horizon outputs.

------------------------------------------------------------------------

# 2. Canonical Definitions

## 2.1 Core Net Receipts (CNR)

Settled rent payments applied to rent ledger.\
Optional includes: pet_rent, rubs, parking_rent (recurring rent-like
charges).\
Excludes: deposits, one-time fees, credits, refunds, chargebacks.

## 2.2 Non-Core Cash Events (NCCE)

Late fees, credits, concessions, refunds, chargebacks.\
Used as volatility and shock indicators (secondary risk channel).

## 2.3 Payment Plan (Authorized)

Structured installment agreement flagged explicitly: -
is_payment_plan_authorized = true - payment_plan_id + active date range
Authorized partials are lower-risk than ad hoc partials, but still
increase uncertainty.

## 2.4 Residual Risk Memory (90-day tail)

Each payment plan imposes a mandatory 90-day residual risk tail after
plan end: - residual risk decays over 90 days (configurable decay
curve) - residual risk contributes to hazard/volatility even after
completion - cumulative: each plan adds tail memory

## 2.5 Stability Definition

Predictability of CNR over horizons (D5, D15, R30, R90), incorporating
behavior patterns and shocks.

------------------------------------------------------------------------

# 3. Segmentation Keys (Network Priors)

-   region (string): "US-KS-Wichita" preferred, or "US-KS"
-   property_class (enum): A \| B \| C
-   rent_band (enum): LT900 \| B900_1199 \| B1200_1499 \| B1500_1999 \|
    GE2000
-   building_age_bucket (enum): PRE1970 \| B1970_1979 \| B1980_1989 \|
    B1990_1999 \| B2000_2009 \| B2010_2019 \| GE2020

------------------------------------------------------------------------

# 4. Input Schema

## 4.1 Ledger Event Required Fields

-   unit_id (string)
-   property_id (string)
-   tenant_id (string, nullable)
-   event_date (ISO datetime)
-   settlement_date (ISO datetime)
-   amount (float; positive/negative)
-   category (enum): rent, pet_rent, rubs, late_fee, credit, refund,
    chargeback, deposit, other
-   is_settled (boolean)
-   applied_to (enum): rent_balance, fee_balance, deposit, other

## 4.2 Unit/Property Context Required Fields

-   region
-   property_class
-   rent_band
-   building_age_bucket

## 4.3 Payment Plan Fields (NEW)

-   is_payment_plan_authorized (boolean; default false)
-   payment_plan_id (string, nullable)
-   payment_plan_start_date (ISO date, nullable)
-   payment_plan_end_date (ISO date, nullable)
-   payment_plan_status (enum): ACTIVE \| COMPLETED \| CANCELLED
    (nullable)

------------------------------------------------------------------------

# 5. Derived Features (Minimum Set)

## 5.1 Liquidity and volatility

-   receipts_cnr_30d
-   receipts_cnr_90d
-   cnr_volatility_90d
-   delinquency_days_30d
-   vacancy_flag
-   shock_event_count_90d
-   concession_amount_90d
-   maintenance_cost_variance_90d (optional)

## 5.2 Behavioral pattern features (NEW)

-   partial_payment_rate_90d
-   authorized_partial_rate_90d
-   unauthorized_partial_rate_90d
-   time_to_completion_p50
-   installment_pattern_score

## 5.3 Residual memory features (NEW)

-   payment_plan_residual_days_remaining (0--90)
-   payment_plan_residual_risk_multiplier
-   payment_plan_event_count_180d

------------------------------------------------------------------------

# 6. Forecasting Contract

## 6.1 Hierarchical Shrinkage Blend

ŷ_u = w_u \* ŷ_unit + w_p \* ŷ_property + w_g \* ŷ_global\
w_u + w_p + w_g = 1

## 6.2 Weight Inputs

-   unit_history_months
-   data_quality_score
-   volatility_score
-   property_history_months
-   regime_uncertainty_boost (optional)

Weights MUST be exported and explainable.

------------------------------------------------------------------------

# 7. Multi-Horizon Outputs

-   D5: Day-5 CNR completion distribution (semi-parametric CDF)
-   D15: Expected shortfall by Day 15 (rent-only)
-   R30: Rolling 30-day CNR forecast + CI
-   R90: Rolling 90-day structural risk

------------------------------------------------------------------------

# 8. Behavioral Hazard Adjustment (Payment Plans)

logit(P) = logit(P0) + θ_u \* unauthorized_partial_rate_90d + θ_a \*
authorized_partial_rate_90d + θ_r \*
payment_plan_residual_risk_multiplier

Defaults: - θ_u \> θ_a ≥ 0 - θ_r ≥ 0

------------------------------------------------------------------------

# 9. D15 Expected Shortfall (Rent-only; Deposits excluded)

ES15 = E\[max(0, E(CNR) - R(15))\]\
NS15 = 1 - ES15 / max(E(CNR), ε)

------------------------------------------------------------------------

# 10. Stability Score (Composite)

Vector-first, then headline stability score combining: S5, NS15, S30,
S90, minus deterministic penalties.

------------------------------------------------------------------------

# 11. Deterministic Guardrails

-   rent_late_days \> X
-   vacancy_flag
-   work_order_backlog \> Y
-   eviction_flag

------------------------------------------------------------------------

# 12. Federated Learning Protocol

Local nodes send aggregated updates only (no raw data). Coordinator
publishes Prior Packs.

------------------------------------------------------------------------

# 13. Prior Pack Updates (NEW)

Adds per-segment priors: - payment_plan_rate_90d -
authorized_plan_share_90d - residual_risk_prior

Adds regime_type: - PAYMENT_PLANS

------------------------------------------------------------------------

# 14. Residual Risk Memory Rules (Required)

If plan ended and residual window active: - residual_days_remaining =
clamp(90 - days_since_end, 0, 90) - residual_risk_multiplier computed
from decay curve Default decay: linear (days_remaining/90).

------------------------------------------------------------------------

# 15. Output Contract (Updated)

Unit output adds: - authorized_plan_active -
payment_plan_residual_days_remaining -
payment_plan_residual_risk_multiplier

Explainability must include payment_plan_effect (authorized vs
unauthorized + residual tail).
