# PMS-PRIC-03 Workplan (2026-03-02)

## Card
- **ID:** PMS-PRIC-03
- **Title:** FeeEngine library (tiered % + min fee + fee<amount guard) with unit tests
- **Dependency:** PMS-PRIC-01

## Definition of Done
1. FeeEngine computes tiered percentage fees deterministically.
2. Minimum fee floor is enforced when configured.
3. Guardrail ensures fee never exceeds charge amount.
4. Unit tests cover tiers, boundaries, minimums, and guardrail behavior.

## Execution Plan
1. Audit existing pricing/billing calculation utilities.
2. Implement FeeEngine module with typed input/output contract.
3. Integrate in billing/pricing path where appropriate.
4. Add focused unit tests for all fee scenarios.
5. Run tests and document results.
