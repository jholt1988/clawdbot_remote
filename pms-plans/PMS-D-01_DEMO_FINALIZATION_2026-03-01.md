# PMS-D-01 Demo Script Finalization — 2026-03-01

## Finalized Assets
- Primary runbook: `pms-plans/demo-runbook.md`
- User guide: `pms-plans/DEMO_GUIDE.md`

## Final Demo Sequence (Tenant → PM → Owner)
1. PM creates property + unit
2. Applicant submits application (legal acceptance included)
3. PM approves application and lease is generated
4. Tenant views lease/docs and pays rent
5. Tenant submits maintenance request with photos
6. PM triages, assigns, and updates request
7. PM runs inspection flow and generates estimate
8. Owner reviews dashboard/history and leaves comment (read-only operationally)

## Acceptance Checklist Status
Validation command:
```bash
node scripts/pms/demo-acceptance-validate.mjs --json
```

Result:
- `AUTO_PASS: 19`
- `AUTO_FAIL: 0`

## Fallback Plan (Demo Safety)
- If AI estimate generation fails, Inspection Detail now renders fallback estimate mode with explicit notice and standardized output sections.
- If local services drift, reset with:
```bash
bash scripts/pms-dev/demo-reset.sh --root ./pms-master
```

## Notes
- Runbook + guide are now aligned to one story and acceptance set.
- This closes PMS-D-01 definition: single script + acceptance checklist + fallback path.
