# PMS-PAY-MAN-03 — Workplan (2026-03-06)

**Title:** PM/Admin UI — Add Payment + Add Charge  
**Owner:** Jordan  
**Priority:** P1  
**Estimate:** 1 day

## Scope
- Add UI actions in PM/Admin tenant/lease pages
- Implement modal forms for manual posting
- Refresh ledger and balances instantly

## Tasks
1. Add **Add Payment** modal:
   - amount, method, ref#, date, applied-to, memo
2. Add **Add Charge** modal:
   - type, amount, charge date, due date, description
3. Add reverse/void actions with reason prompt
4. Wire API calls + optimistic/refresh flow
5. Add UX handling:
   - inline validation
   - duplicate ref warning
   - success/error toasts

## Acceptance Criteria
- PM/Admin can post manual payment/charge from UI
- Ledger and balance update immediately
- Reverse/void works and remains visible in history
- No hard-delete path exists in UI
