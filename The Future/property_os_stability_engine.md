# Property OS -- Cash-Flow Stability Engine (Hybrid + Federated + Hierarchical)

## Core Philosophy

Unit Health = Cash-Flow Stability.

The system models: - Revenue predictability - Expense volatility -
Disruption probability - Hierarchical shrinkage blending (Unit →
Property → Global) - Deterministic guardrails - Federated learning
architecture

------------------------------------------------------------------------

## Net Receipts Definition

### Core Net Receipts (CNR)

Settled rent payments applied to rent ledger. Includes recurring
rent-like charges (optional). Excludes deposits, one-time fees, refunds,
and chargebacks.

### Non-Core Cash Events (NCCE)

Late fees, credits, concessions, refunds, chargebacks. Used as
volatility / shock indicators.

------------------------------------------------------------------------

## Forecasting Architecture

### Blended Forecast

ŷ_u = w_u \* unit_forecast + w_p \* property_forecast + w_g \*
global_forecast

Where: w_u + w_p + w_g = 1

Weights depend on: - Unit history length - Data quality - Volatility

------------------------------------------------------------------------

## Stability Score Formula

Stability = 100 - α \* CV(revenue) - β \* P(disruption) - γ \*
ExpenseVolatility - Guardrail penalties

------------------------------------------------------------------------

## Guardrails (Deterministic Layer)

-   Rent \> X days late
-   Vacancy
-   Work-order backlog threshold
-   Eviction status

------------------------------------------------------------------------

## Federated Learning Model

Local Node: - Stores raw data - Computes forecasts - Sends parameter
updates

Central Coordinator: - Aggregates encrypted updates - Updates global
priors - Redistributes model parameters

------------------------------------------------------------------------

## Hierarchical Time-Series Structure

Level 1: Unit Level 2: Property Level 3: Portfolio / Network

Partial pooling ensures: - Sparse unit data borrows strength from
property/global layers.

------------------------------------------------------------------------

## Explainability Output Example

Unit 3B Stability Score: 74 - Delinquency Risk ↑ 28% - Maintenance
Volatility ↑ - Vacancy Risk ↑
