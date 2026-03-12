# PMS-A-03 — Inspection → Estimate Demo Path Hardening

Date: 2026-03-01
Owner: Aden
Target Duration: 60–90 minutes
Board Card: PMS-A-03

## Objective
Make the inspection → estimate flow demo-safe: predictable inputs, stable output, and a clear fallback.

## Definition of Done
- End-to-end demo run works from inspection checklist to generated estimate.
- Output clearly includes: **scope**, **cost**, **timeline**, and **rationale/confidence**.
- A fallback path exists if generation fails (no dead-end during demo).

## Timeboxed Execution Plan

### 0) Prep (5 min)
- [ ] Open references:
  - `scripts/pms/estimate-to-maintenance.mjs`
  - `pms-plans/demo-runbook.md`
  - `pms-plans/DEMO_GUIDE.md`
- [ ] Confirm expected demo account/data assumptions.

### 1) Baseline dry run (10–15 min)
- [ ] Execute current estimate path with existing sample data.
- [ ] Capture raw output (success/fail + logs).
- [ ] Note exactly where the flow is brittle (missing field, schema mismatch, timeout, etc.).

### 2) Input contract lock (15–20 min)
- [ ] Define minimal required inspection payload for estimate generation.
- [ ] Add/verify guard validation for required fields.
- [ ] Normalize any known field naming mismatch.
- [ ] Ensure user-facing errors are explicit and recoverable.

### 3) Output standardization (15–20 min)
- [ ] Ensure generated output shape always returns these sections:
  - `scope`
  - `cost` (range or itemized)
  - `timeline`
  - `rationale`
  - `confidence`
- [ ] Add default placeholders when optional values are missing.
- [ ] Verify output is demo-readable (not raw internals).

### 4) Fallback + resilience (10–15 min)
- [ ] Implement a fallback summary when AI/generation fails:
  - basic scope from checklist items
  - coarse cost band
  - rough timeline
  - note that it's fallback mode
- [ ] Confirm no hard crash / blank screen state.

### 5) Final demo verification (10 min)
- [ ] Run full flow once as happy path.
- [ ] Run one forced failure case to prove fallback works.
- [ ] Record final evidence notes for board card.

## Acceptance Test Script
1. Start from an inspection with at least one room + actionable items.
2. Trigger estimate generation.
3. Verify response includes all 5 sections (scope/cost/timeline/rationale/confidence).
4. Simulate failure (e.g., missing optional AI dependency) and verify fallback renders.
5. Confirm result can be read out during demo in <60 seconds.

## Evidence to Attach (for card move to Review/QA)
- Command(s) run
- Before/after behavior notes
- Example output snippet (happy path)
- Example output snippet (fallback)
- Any known caveat + mitigation line

## If Blocked
Move card to **Blocked** and include:
- blocker reason
- required dependency/person
- next retry time
