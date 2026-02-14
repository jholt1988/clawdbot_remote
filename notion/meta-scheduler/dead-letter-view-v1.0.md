# Dead-Letter Views v1.0 (Notion)

Purpose: operational views that surface permits/requests that need human attention.

Notion does not reliably support creating filtered database views via the public API across all workspaces, so this doc specifies the view filters to create manually.

---

## A) Execution Permits DB — “Dead Letter: Permits”

Database: **Execution Permits DB**

Filter (OR):
- `Status` is `Failed`
- `Status` is `Expired`

Optional additional filters:
- `Last Run At` is not empty

Sort:
- `Last Run At` descending

Visible columns (recommended):
- Name / EXP ID
- Status
- Execution Request (relation)
- Last Error
- Worker ID
- Run Attempt
- Lock Keys
- Expires At

---

## B) Execution Requests DB — “Dead Letter: Requests”

Database: **Execution Requests DB**

Filter (OR):
- `Execution Status` is `Failed`
- `Execution Status` contains `Blocked`

Sort:
- `Created At` descending (or Last Edited)

Visible columns (recommended):
- Name / ERQ ID
- Execution Status
- Project
- Target System
- Target Scope ID
- Target Branch
- Script Path
- Rollback Plan

---

## Operational loop
- Check dead-letter views daily.
- For each Failed/Expired permit:
  - verify scope and reason
  - Reset for Retry if safe
  - or Revoke if unsafe
  - if repeated, reduce scope (new permit) or split project (governance)
