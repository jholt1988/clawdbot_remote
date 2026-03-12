# PMS-A-07 Workplan (2026-03-02)

## Card
- **ID:** PMS-A-07
- **Title:** Maintenance request (tenant) + photos + PM queue
- **Dependency:** PMS-A-04 (completed)

## Definition of Done
1. Tenant can submit maintenance requests including image uploads.
2. PM queue lists incoming requests with clear status/priority and assignment visibility.
3. Request details preserve tenant notes + attached photos.
4. Basic end-to-end validation documented (tenant submit -> PM queue visibility).

## Execution Plan
1. Audit current maintenance create API + upload handling and PM queue/list endpoints.
2. Patch backend payload handling for photo attachments and queue metadata if missing.
3. Patch tenant UI submission flow to include photos reliably.
4. Patch PM queue UI for triage signals (status/priority/assignee).
5. Run seeded E2E verification and write completion evidence/changelog.
