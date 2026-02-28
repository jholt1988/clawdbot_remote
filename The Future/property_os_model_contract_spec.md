# Property OS -- Cash-Flow Stability Engine

## Complete Model Contract Specification

Version: 1.0.0 Generated: 2026-02-28T05:16:23.911120

------------------------------------------------------------------------

# 1. Model Identity

**Model Name:** CashFlowStabilityEngine\
**Architecture:** Hybrid Hierarchical Time-Series + Deterministic
Guardrails\
**Learning Mode:** Federated Parameter Aggregation\
**Primary Objective:** Estimate probabilistic cash-flow stability at
Unit and Property levels.

------------------------------------------------------------------------

# 2. Canonical Definitions

## 2.1 Core Net Receipts (CNR)

Settled rent payments applied to rent ledger. Includes recurring
rent-like charges. Excludes deposits, one-time fees, chargebacks,
refunds.

## 2.2 Non-Core Cash Events (NCCE)

Late fees, credits, concessions, refunds, chargebacks. Used as
volatility and shock indicators.

## 2.3 Stability Definition

Cash-flow stability = Predictability of net receipts over forecast
horizon.

------------------------------------------------------------------------

# 3. Input Schema (Per Unit)

## 3.1 Required Fields

-   unit_id (string)
-   property_id (string)
-   tenant_id (string, nullable)
-   event_date (ISO datetime)
-   settlement_date (ISO datetime)
-   amount (float)
-   category (enum: rent, pet_rent, rubs, late_fee, credit, refund,
    chargeback, deposit, other)
-   is_settled (boolean)
-   applied_to (enum: rent_balance, fee_balance, deposit, other)

## 3.2 Derived Features

-   rolling_receipts_30d
-   rolling_receipts_90d
-   receipt_volatility
-   delinquency_days
-   vacancy_flag
-   maintenance_cost_variance
-   shock_event_count_90d

------------------------------------------------------------------------

# 4. Forecasting Contract

## 4.1 Hierarchical Forecast Equation

ŷ_u = w_u \* ŷ_unit + w_p \* ŷ_property + w_g \* ŷ_global\
Where w_u + w_p + w_g = 1

## 4.2 Weight Inputs

-   unit_history_months
-   data_quality_score
-   volatility_score
-   property_history_months

Weights are tunable configuration parameters.

------------------------------------------------------------------------

# 5. Stability Score Computation

StabilityScore = 100 - α \* CV(revenue_forecast) - β \*
P(disruption_30d) - γ \* expense_volatility - deterministic_penalties

Output range: 0--100

------------------------------------------------------------------------

# 6. Deterministic Guardrails

Triggers: - Rent \> X days late - Vacancy active - Work-order backlog
threshold - Eviction flag

Each guardrail applies a fixed penalty weight.

------------------------------------------------------------------------

# 7. Federated Learning Protocol

## 7.1 Local Node Responsibilities

-   Store raw ledger data
-   Compute time-series parameters
-   Compute gradients / parameter deltas
-   Encrypt and transmit updates

## 7.2 Central Coordinator Responsibilities

-   Aggregate encrypted parameter updates
-   Update global priors
-   Redistribute model weights
-   Maintain model versioning

## 7.3 Data Privacy

No raw tenant ledger data transmitted. Only aggregated statistical
updates shared.

------------------------------------------------------------------------

# 8. Output Contract

## 8.1 Per Unit Output

-   stability_score (0--100)
-   revenue_confidence_30d (%)
-   delinquency_probability_30d (%)
-   vacancy_probability_90d (%)
-   maintenance_spike_probability (%)
-   forecasted_receipts_30d (float)
-   confidence_interval_lower
-   confidence_interval_upper
-   explainability_breakdown (array)

## 8.2 Per Property Output

-   property_stability_score
-   aggregated_revenue_confidence
-   units_at_risk_count
-   forecasted_property_receipts_30d

------------------------------------------------------------------------

# 9. Versioning & Drift Management

-   model_version (semantic versioning)
-   training_round_id
-   last_calibration_timestamp
-   drift_indicator_score

------------------------------------------------------------------------

# 10. Explainability Contract

Each unit must provide:

-   top_3\_risk_drivers
-   weight_contribution_breakdown
-   guardrail_flags_triggered

------------------------------------------------------------------------

# 11. Error Handling & Fallback

If insufficient data: - Increase shrinkage toward property/global
layer. - Flag low_confidence_forecast.

------------------------------------------------------------------------

# 12. Extensibility Hooks

Reserved fields for: - macroeconomic overlays - acquisition scoring -
reserve optimization modeling - stress scenario simulation
