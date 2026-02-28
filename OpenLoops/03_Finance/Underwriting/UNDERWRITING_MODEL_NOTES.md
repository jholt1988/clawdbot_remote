# Underwriting Model Notes

Date: 2026-02-28
Owner: Jordan + Aden
Model file: `Portfolio_Underwriting_Model.xlsx`
Status: Baseline structural validation complete

## 1) Structural validation (completed)
- File format valid (`.xlsx` / Office Open XML)
- Workbook contains **2 sheets**:
  1. `PFS Summary`
  2. `Real Estate Schedule`
- Formula presence:
  - `PFS Summary`: 9 formulas
  - `Real Estate Schedule`: 17 formulas

## 2) Key model design checks (confirmed)
- `PFS Summary` includes borrower info + income/expense/debt sections.
- `Real Estate Schedule` includes columns for:
  - Property Address
  - Units
  - Monthly Rent
  - Monthly PITI
  - Net Cash Flow
  - Optional value/balance fields
- Cross-sheet dependency present:
  - `PFS Summary!B12` references `'Real Estate Schedule'!C17`
- Totals and conditional formulas exist (e.g., SUM, IF guards).

## 3) Observations
- Spreadsheet is structured for underwriting workflows and appears logically organized.
- Model uses empty-cell guards (`IF(OR(...),"",...)`) to reduce bad outputs from partial entries.
- Suitable as a working baseline for lender packet support and portfolio screening.

## 4) Recommended next validation pass (manual in Excel)
1. Populate one full test scenario (2–3 properties + borrower income/debt).
2. Verify all summary totals update correctly.
3. Stress-test edge cases:
   - zero rent
   - high PITI
   - missing optional values
4. Confirm print/export layout for lender-facing use.
5. Add version stamp tab (date, editor, assumptions).

## 5) Suggested assumptions tab fields
- Vacancy assumption
- Maintenance reserve %
- Tax/insurance assumptions
- Debt service assumptions
- Income verification confidence

## 6) Conclusion
The underwriting workbook is structurally sound and ready for live-data test scenarios. Next step is scenario validation + assumptions documentation to make it presentation/lender-ready.
