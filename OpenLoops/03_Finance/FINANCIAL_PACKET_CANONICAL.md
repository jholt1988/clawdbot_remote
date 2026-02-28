# Financial Packet Canonical Selection

Date: 2026-02-28
Owner: Jordan + Aden
Status: Active

## Canonical Packet (Primary)
- **Primary lender packet:**
  - `Statements/Personal_Financial_Statement_Two_Page_Lender_Standard.pdf`

## Canonical Packet (Supplemental)
- **Real-estate schedule addendum:**
  - `Statements/Personal_Financial_Statement_with_Real_Estate_Schedule.pdf`
- **Optional banking variant (if requested by institution):**
  - `Statements/Personal_Financial_Statement_Banking_Standard.pdf`

---

## Normalization actions taken
Moved superseded/draft variants to archive:
- `99_Archive/Finance_Superseded/Personal_Financial_Statement_Interactive.pdf`
- `99_Archive/Finance_Superseded/Personal_Financial_Statement_Professional_Interactive.pdf`
- `99_Archive/Finance_Superseded/Personal_Financial_Statement_Two_Page_Aligned (1).pdf`
- `99_Archive/Finance_Superseded/Personal_Financial_Statement_Two_Page_Modern_AutoCalc_Locked (1).pdf`
- `99_Archive/Finance_Superseded/Personal_Financial_Statement_Two_Page_Modern_Stable.pdf`

Execution log:
- `pms-plans/finance-normalization-log-2026-02-28.tsv`

---

## Usage rule
1. Send **Primary** by default.
2. Add **Real-estate schedule** when lender requests asset schedule detail.
3. Use **Banking variant** only when the receiving party specifically prefers that format.

---

## Next step
- Add date/version footer to primary packet naming when generating future updates (e.g., `..._Lender_Standard_YYYY-MM.pdf`).
