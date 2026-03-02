# PMS-A-10 Workplan (2026-03-02)

## Card
- **ID:** PMS-A-10
- **Title:** Owner portal minimum: view + comment + initiate maintenance request (no operational mutation)
- **Dependencies:** PMS-A-04, PMS-A-08

## Definition of Done
1. Owner role can view relevant lease/maintenance/property data.
2. Owner can add comments/notes where allowed.
3. Owner can initiate maintenance requests.
4. Owner cannot perform operational mutation actions reserved for PM/tenant workflows.

## Execution Plan
1. Audit role guards and owner-facing endpoints/UI paths.
2. Add/patch owner read/comment/create-request access.
3. Explicitly block operational mutation endpoints for owner role.
4. Validate owner permissions matrix across key flows.
5. Document outcomes and move to review.
