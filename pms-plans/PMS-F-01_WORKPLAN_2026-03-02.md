# PMS-F-01 Workplan (2026-03-02)

## Card
- **ID:** PMS-F-01
- **Title:** Staging deploy + seeded demo org pipeline
- **Dependencies:** PMS-A-02, PMS-B-04

## Definition of Done
1. Staging environment is deployable and reachable.
2. Seed pipeline creates a deterministic demo org with representative data.
3. Reset/reseed workflow is documented and repeatable.
4. Basic smoke checks pass after deploy + seed.

## Execution Plan
1. Audit current deploy scripts/env assumptions.
2. Implement or patch staging deployment workflow.
3. Implement deterministic demo-org seed pipeline + reset script.
4. Run staging smoke checks and capture evidence.
5. Document staging runbook and known issues.
