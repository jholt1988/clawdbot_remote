# PMS-PAY-MAN-01 — Workplan (2026-03-06)

**Title:** Manual Payment + Manual Charges Foundation (Schema + Ledger)  
**Owner:** Jordan  
**Priority:** P0  
**Estimate:** 1 day

## Scope
- Add `manual_payments` + `manual_charges` tables
- Add enum types and constraints
- Integrate with existing tenant ledger posting service
- Add reversal/void behavior (no hard deletes)

## Tasks
1. Create DB migrations for both tables + indexes
2. Add unique partial index for check/MO posted references
3. Add ledger service methods:
   - `postManualPayment`
   - `reverseManualPayment`
   - `postManualCharge`
   - `voidManualCharge`
4. Add unit tests for:
   - balance math
   - duplicate ref blocking
   - reversal/void integrity

## Acceptance Criteria
- Migration succeeds in local + docker
- Manual payment reduces tenant balance
- Manual charge increases tenant balance
- Reverse/void creates offset, preserves history
- Duplicate check/MO ref blocked with clear error
