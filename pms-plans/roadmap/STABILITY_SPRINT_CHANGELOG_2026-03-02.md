# Stability Sprint Changelog
## Date: 2026-03-02
## Owner: Aden

## Summary
Focused stability sprint to reduce test/runtime noise and improve reliability in frontend + backend support layers.

---

## 1) Frontend test/runtime resilience
### Change
Hardened auth token storage access to avoid crashes when `localStorage` is partially mocked/unavailable in tests.

### Files
- `pms-master/tenant_portal_app/src/AuthContext.tsx`

### Details
- Introduced safe storage wrapper methods:
  - `storage.getItem(...)`
  - `storage.setItem(...)`
  - `storage.removeItem(...)`
- Replaced direct `localStorage.*` calls with guarded wrapper calls.

### Outcome
- Resolved failing suites caused by:
  - `TypeError: localStorage.removeItem is not a function`
- Previously failing suites now passing:
  - `src/MainDashboard.test.tsx`
  - `src/components/ui/MaintenanceCard.test.tsx`

### Commit
- `pms-master`: `bac71fa`
- `workspace pointer`: `a0e149f`

---

## 2) PropertySearch warning cleanup
### Change
Fixed test mock prop leakage (`startContent`) to DOM element in Property Search test mocks.

### Files
- `pms-master/tenant_portal_app/src/pages/properties/PropertySearchPage.test.tsx`

### Details
- Updated mocked `Input` to destructure and drop NextUI-only props (`startContent`, `endContent`) before spreading to `<input>`.

### Outcome
- Removed React warning in suite:
  - `React does not recognize the startContent prop on a DOM element`
- Target suite status:
  - `2/2 tests passing`

### Commit
- `pms-master`: `2511e2d`
- `workspace pointer`: `969cd2e`

---

## 3) Current test health snapshot
### Command
```bash
cd pms-master/tenant_portal_app
npx vitest run
```

### Result
- **Test Files:** 13 passed / 13 total
- **Tests:** 96 passed, 2 skipped

---

## 4) Related backend stability context (already shipped this run)
- QuickBooks constructor runtime fix (`super()` in minimal service) restored backend boot.
- Audit log rollout implemented across quickbooks, rental-application, schedule, payments modules.

---

## 5) Recommended next stability tasks
1. Trim noisy test stdout in `LeasingAgentService` tests (optional quality-of-life).
2. Add a CI test profile that suppresses expected logs but keeps failures verbose.
3. Add regression tests for audit logging writes on critical mutation endpoints.
