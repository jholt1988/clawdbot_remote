# PMS-A-05 Workplan (2026-03-02)

## Card
- **ID:** PMS-A-05
- **Title:** Properties/Units CRUD (list/detail/create/edit) with doors counted correctly
- **Dependencies:** PMS-A-04 (completed)

## Definition of Done
1. PM role can create/read/update properties and units.
2. Tenant role cannot access mutation paths for property/unit resources.
3. Unit status includes active/managed/archived and is persisted.
4. DoorsCounter counts only active + managed units.
5. Basic QA checks documented for list/detail/create/edit and role restrictions.

## Execution Plan
1. Audit existing property/unit endpoints and UI forms.
2. Patch RBAC guards on mutation routes.
3. Normalize unit status enum usage in FE + BE.
4. Implement/verify DoorsCounter filter logic.
5. Run local validation and produce changelog/evidence note.
