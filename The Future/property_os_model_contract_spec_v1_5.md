# Property OS Model Contract Specification v1.5

## Core Architecture

-   Continuous-time survival model
-   Lease due-date anchored cycles
-   5-state monotone milestone chain (\<30, 30--70, 70--90, 90--100,
    100%)

## Baseline Intensity

Gamma mixture with 3 components, normalized over cycle horizon.

## Hazard Structure

h_ab(t) = kappa_ab,g \* lambda_u(t)

lambda_u(t) = lambda_base(t;g) \* exp(eta_u + phi_u(t))

## Learning Method

Direct transition timing likelihood with federated sufficient
statistics: - Event count N - Exposure integral X

Raw estimator: kappa_hat = N / X

## Expected Shortfall (Day 15)

ES15 = E \* sum_s p_s(15) \* (1 - c_bar_s,g)

Bucket priors: Scaled Beta on bounded ranges: - 0a: \[0, 0.30\] - 0b:
\[0.30, 0.70\] - 1: \[0.70, 0.90\] - 2: \[0.90, 1.00\]

## Regime Detection

Drift statistic: - JS divergence on baseline intensity shape - Absolute
log-kappa shifts

Regime states: NORMAL, WATCH, SHIFT

## Confidence Score

conf = evidence_term \* drift_term \* unit_richness_term

## Coupling

eta_u = lambda_mix \* eta_local + (1 - lambda_mix) \* eta_property
lambda_mix = n_u / (n_u + k)

## Governance

-   Transparent parameter deltas
-   Published exposure counts
-   Confidence decomposition
