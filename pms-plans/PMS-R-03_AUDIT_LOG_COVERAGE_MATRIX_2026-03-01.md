# PMS-R-03 — Audit Log Coverage Matrix (Sensitive Endpoints)

Date: 2026-03-01  
Scope: `tenant_portal_backend` services — maintenance, payments, quickbooks, rent-estimator, rent-optimization, rental-application, schedule.

## Legend
- **Covered**: explicit history/audit write observed in service path
- **Partial**: some related tracking exists, but not explicit per-operation audit trail
- **Gap**: no clear audit/history write observed in module path

---

## Coverage Matrix

| Module | Sensitive Endpoint(s) | Current Coverage | Evidence | Recommendation |
|---|---|---|---|---|
| maintenance | `POST /maintenance`, `PATCH/PUT /maintenance/:id/status`, `PATCH /maintenance/:id/assign`, `POST /maintenance/:id/notes`, `POST /maintenance/:id/confirm-complete` | **Covered** | `maintenance.service.ts` uses `recordHistory(...)` in create/status/assign/escalate/confirm paths | Keep as reference implementation; ensure history table retention policy |
| payments | `POST /payments`, `POST /payments/invoices`, `POST /payments/payment-plans`, `DELETE /payments/payment-methods/:id` | **Partial** | payment history endpoint exists; no clear explicit audit write pattern found in quick scan | Add `payment_audit_log` writes for create/refund/failure/plan changes/method deletion |
| quickbooks | `POST /quickbooks/sync`, `POST /quickbooks/disconnect` | **Gap** | controller endpoints found; no explicit audit trail write found in quick scan | Add org-scoped audit events for sync/disconnect + actor + timestamps + result |
| rent-estimator | estimator generation endpoints (controller + service) | **Gap** | module present; no explicit audit/history write found in quick scan | Add audit for estimate generation requests and overrides |
| rent-optimization | `POST /rent-recommendations/generate`, `POST :id/apply`, `DELETE :id`, accept/reject/update | **Partial** | module docs mention audit trail for critical ops (`NEW_ENDPOINTS_SUMMARY.md`) but implementation linkage should be verified/enforced | Implement/verify concrete audit write in apply/delete/accept/reject/update paths |
| rental-application | `POST /rental-applications`, `PUT :id/status`, `POST :id/screen`, `POST :id/notes`, `POST :id/ai-review` | **Gap** | sensitive mutation endpoints present; no explicit audit/history write found in quick scan | Add application lifecycle audit entries (submission, status changes, screening, review decisions) |
| schedule | `POST /schedule` (and schedule mutations) | **Gap** | schedule controller mutation endpoint found; no explicit audit/history write found in quick scan | Add scheduling mutation audit events (create/update/cancel) |

---

## Prioritized Action List

### P0
1. Add standardized `AuditLogService` interface and shared write helper.
2. Backfill **quickbooks**, **rental-application**, and **schedule** mutation endpoints with explicit audit writes.
3. Ensure actor identity + org context + entity id + action + result/error are always captured.

### P1
4. Normalize **payments** and **rent-optimization** to explicit, queryable audit records.
5. Add retention/archival policy for audit tables.

### P2
6. Add regression tests asserting audit write on key mutation endpoints.

---

## Suggested Standard Audit Event Shape
```json
{
  "orgId": "org_123",
  "actorId": "user_456",
  "module": "maintenance",
  "action": "REQUEST_STATUS_UPDATED",
  "entityType": "maintenanceRequest",
  "entityId": "789",
  "result": "SUCCESS",
  "metadata": { "fromStatus": "PENDING", "toStatus": "IN_PROGRESS" },
  "createdAt": "2026-03-01T00:00:00.000Z"
}
```

## Notes
- This matrix is a code-level coverage pass, not a compliance certification.
- Next step: implement shared audit helper + patch listed gap modules.
