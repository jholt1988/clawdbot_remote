# Property OS Future Assets — Integration Map (for PMS)

## Objective
Map `/The Future` artifacts into concrete PMS implementation tracks so we can ship safely and incrementally.

---

## 1) Canonical Version Decision
**Primary target:** Property OS **v1.6**  
**Compatibility target:** v1.5.1 (read-only fallback/testing)

Why: v1.6 adds contract-stable confidence handling for reversals (`confidence.reversal_adjustment`) while preserving core state thresholds and settled-at clock assumptions.

---

## 2) Source Artifact Map → PMS Location

## A. Model Contract Specs
### Inputs
- `The Future/property_os_model_contract_spec_v1_6.md`
- `The Future/property_os_model_contract_spec_v1_6.json`

### PMS destination
- `pms-master/docs/contracts/property-os/v1.6/`

### Implementation use
- Product/engineering truth for behavior and invariants
- Versioned release notes and migration docs

---

## B. API Contracts (OpenAPI + Schemas)
### Inputs
- `The Future/property_os_model_contract_api_v1_6_openapi.yaml`
- `The Future/property_os_model_contract_api_v1_6_schemas.json`

### PMS destination
- `pms-master/contracts/property-os/v1.6/`

### Implementation use
- Request/response validation at API boundary
- Contract tests (CI)
- Type generation for frontend/backend clients

---

## C. Reference Engine (Behavior Baseline)
### Inputs
- `The Future/property_os_reference_engine_v1_6_r4.zip`

### PMS destination
- `pms-master/tools/reference-engines/property-os-v1.6/`

### Implementation use
- Golden behavior baseline for expected outputs
- Snapshot test vectors
- Model parity checks during refactors

---

## D. Simulation Harness (QA/Calibration)
### Inputs
- `The Future/property_os_simulation_harness_v1_6_v3.zip`

### PMS destination
- `pms-master/tools/simulation/property-os-v1.6/`

### Implementation use
- Regression checks (Brier/calibration/ES15/extraction error)
- Nightly model quality monitoring
- Change-risk detection before deploy

---

## E. Suite Scaffold (App Architecture)
### Inputs
- `The Future/property_os_suite_nest_prisma_r3.zip`
- `The Future/property_os_suite_repo_scaffold.zip`

### PMS destination
- `pms-master/experimental/property-os-suite/`

### Implementation use
- Starter structure for service decomposition
- Contracts package baseline
- Data-model and worker orchestration patterns

---

## F. MIL/Crypto/Rekey Track
### Inputs
- `The Future/mil_v1_starter_repo_crypto_rekey_stable_r13.zip` (preferred)
- earlier MIL zips for historical context only

### PMS destination
- `pms-master/security/mil/`

### Implementation use
- Tenant key lifecycle
- Rekey job orchestration and recovery behavior
- Crypto envelope patterns for sensitive payloads

---

## 3) PMS Workstreams (phased)

## Phase 1 — Contracts + Validation (Week 1)
1. Import v1.6 contract docs and schemas.
2. Add schema validation middleware for model endpoints.
3. Create contract tests from v1.6 required fields/invariants.

**Exit criteria:** API rejects invalid payloads and always emits contract-compliant `confidence` shape.

---

## Phase 2 — Engine Parity + Test Vectors (Week 1–2)
1. Extract reference engine v1.6 into tools folder.
2. Add fixture-based parity tests against sample request/response.
3. Add explicit tests for reversal-adjustment invariants.

**Exit criteria:** PMS model path matches reference outputs within accepted tolerances.

---

## Phase 3 — Simulation Harness in CI (Week 2)
1. Integrate sim harness run command.
2. Add CI quick run (`n=200`) on PR.
3. Add nightly full run (`n>=2000`) and artifact report storage.

**Exit criteria:** quality metrics trend visible; regressions block merge/deploy per thresholds.

---

## Phase 4 — Runtime Integration in PMS Flows (Week 2–3)
1. Wire ledger extraction (`settled_at` canonical) into inspection/payment analytics path.
2. Surface confidence + reversal adjustment in inspection estimate UI context.
3. Feed ES15/milestone probabilities into PM decision support cards.

**Exit criteria:** model outputs are visible and actionable in PMS inspection + delinquency workflows.

---

## Phase 5 — Security Hardening (Week 3+)
1. Apply MIL stable patterns for key lifecycle and rekey jobs.
2. Add operational runbooks for key rotation/recovery.
3. Add audit logging for model-sensitive payload handling.

**Exit criteria:** key lifecycle is recoverable, observable, and documented.

---

## 4) Required Invariants to Enforce in PMS
- Settled-time clock only for milestone extraction/reversal timing.
- Monotone milestone chain: `0a -> 0b -> 1 -> 2 -> 3`.
- `confidence.reversal_adjustment` required in v1.6 responses.
- `disruption_score` bounded [0,1], penalties (0,1].
- `overall == evidence * drift * unit_richness` post-penalty.

---

## 5) Suggested Folder Actions (immediate)
1. Create:
   - `pms-master/contracts/property-os/v1.6/`
   - `pms-master/tools/reference-engines/property-os-v1.6/`
   - `pms-master/tools/simulation/property-os-v1.6/`
2. Unzip v1.6 engine + harness into those directories.
3. Add `scripts/pms/run-property-os-sim.sh`.
4. Add CI job `property-os-sim-quick`.

---

## 6) Delivery Artifacts to Produce
- Contract compliance report (v1.6)
- Engine parity report (sample vectors)
- Simulation quality baseline report
- PMS UI/UX integration note (where model outputs appear)
- Security/rekey runbook (if MIL integrated)

---

## 7) Decision Log
- Use latest stable artifacts for implementation (`v1.6`, `r4`, `v3`, `r13`).
- Keep older versions for backward compatibility tests only.
- Treat simulation harness metrics as release gate inputs, not optional analytics.
