# PMS-A-11 Workplan (2026-03-02)

## Card
- **ID:** PMS-A-11
- **Title:** Inspection capture mobile-first (checklist + photos + notes + drafts)
- **Dependency:** PMS-A-05

## Definition of Done
1. Mobile-first inspection UI supports checklist completion with stable form state.
2. Photo capture/upload and note entry work per checklist item/room.
3. Drafts persist reliably and can be resumed without data loss.
4. Validation covers create/edit/resume/submit on common mobile viewport sizes.

## Execution Plan
1. Audit current inspection capture flows in FE/BE.
2. Patch checklist/photo/note payload handling for mobile reliability.
3. Harden draft save/load and resume behavior.
4. Run targeted mobile viewport QA and fix regressions.
5. Document evidence and move card to review.
