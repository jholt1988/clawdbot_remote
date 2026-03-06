# PMS-PAY-MAN-04 — Workplan (2026-03-06)

**Title:** Reporting + Statements + Exports for Manual Transactions  
**Owner:** Jordan  
**Priority:** P1  
**Estimate:** 0.5 day

## Scope
- Include manual transactions in statements, aging, and exports

## Tasks
1. Update tenant statement composition logic
2. Add filters/report segments for:
   - manual payments by method
   - manual charges by type
   - reversals/voids
3. Ensure CSV export includes source type + status + ref/reason fields
4. Add reconciliation check in QA script

## Acceptance Criteria
- Statements reflect manual items correctly
- CSV totals reconcile with ledger totals for date range
- Reverse/void entries displayed clearly (not hidden)
