# QA Acceptance Sweep Checklist (2026-03-02)

Use this to close remaining **Review/QA** cards quickly.

## How to use
- Mark each check: ✅ Pass / ❌ Fail / ⚠️ N/A
- If fail: capture endpoint/UI path + screenshot/log + short reason.
- Promote card to **Done** when all required checks pass.

---

## PMS-A-06 — Lease assign flow + tenant doc visibility
### Required checks
1. PM can create/assign lease to tenant from Lease Management screen.
2. Tenant `My Lease` view shows active lease details.
3. Tenant lease view includes associated documents section.
4. Lease assignment action emits audit event.

### Evidence
- API: `POST /api/leases`
- API: `GET /api/leases/my-lease`
- Audit log entry for lease create/update

---

## PMS-A-07 — Maintenance request + photos + PM queue
### Required checks
1. Tenant creates maintenance request.
2. Tenant attaches photo(s) (URL/file path based on current flow).
3. PM queue shows request with status/priority/assignee fields.
4. Request detail returns photo metadata.

### Evidence
- API: `POST /api/maintenance`
- API: `POST /api/maintenance/:id/photos`
- API: `GET /api/maintenance?page=1&pageSize=...`

---

## PMS-A-09 — Messaging threads + attachments + audit trail
### Required checks
1. Tenant starts conversation with PM.
2. Message send succeeds with `attachmentUrls`.
3. Attachment links render in thread UI.
4. Audit log contains conversation/message events (including attachment metadata).

### Evidence
- API: `POST /api/messaging/conversations`
- API: `POST /api/messaging/conversations/:id/messages`
- Backend `AUDIT_EVENT` logs for messaging actions

---

## PMS-A-10 — Owner portal minimum
### Required checks
1. Owner can view relevant records (read access).
2. Owner can add comments/notes where allowed.
3. Owner can initiate maintenance request.
4. Owner cannot perform PM-only operational mutation actions.

### Evidence
- Owner role session + endpoint responses (200 for allowed, 403/400 for disallowed)

---

## PMS-A-11 — Inspection mobile-first drafts
### Required checks
1. Checklist edits persist locally while navigating/reloading.
2. Draft restore notice appears when draft is recovered.
3. Photo + notes remain associated after restore.
4. Save/submit still functions after restore.

### Evidence
- Mobile viewport walkthrough (browser devtools is acceptable)

---

## PMS-A-12 — Deterministic estimate + explainability
### Required checks
1. Same inspection input run twice => same line ordering and range outputs.
2. Line items include confidence/explainability reason text.
3. Summary includes deterministic confidence reason.

### Evidence
- Compare two estimate payload snapshots for same input

---

## PMS-PAY-01 — Org connected account model
### Required checks
1. Org connected account fields are readable/writable.
2. PATCH updates onboarding/capability fields correctly.

### Evidence
- API: `GET /api/billing/connected-account`
- API: `PATCH /api/billing/connected-account`

---

## PMS-PAY-02 — Connected account onboarding link + refresh
### Required checks
1. Onboarding link endpoint returns account + URL.
2. Refresh endpoint updates connected account status.

### Evidence
- API: `POST /api/billing/connected-account/onboarding-link`
- API: `POST /api/billing/connected-account/refresh`

---

## PMS-PAY-03 — SetupIntent add-card flow
### Required checks
1. SetupIntent init returns client secret.
2. Frontend confirms setup and persists payment method.
3. Saved payment method appears in tenant payments list.

### Evidence
- API: `POST /api/payments/payment-methods/setup-intent`
- API: `POST /api/payments/payment-methods`

---

## PMS-PAY-04 — Direct charge + application fee
### Required checks
1. Payment create path uses Stripe PaymentIntent path.
2. Connected account destination included when configured.
3. `application_fee_amount` derived from active cycle + FeeEngine.

### Evidence
- API: `POST /api/payments`
- Payment `externalId` present
- Metadata includes fee/tier context

---

## PMS-PAY-05 — Webhook signature + idempotency + org routing
### Required checks
1. Signed webhook accepted.
2. Replay of same event id dedupes (no duplicate effects).
3. Org routing resolves via metadata/account mapping.

### Evidence
- `StripeWebhookEvent` contains one row per event id
- Webhook handler response includes `deduped` status

---

## PMS-PAY-06 — Ledger finalization from webhooks
### Required checks
1. `payment_intent.succeeded` creates one ledger entry append.
2. Ledger row contains gross/platform/net minors + tier snapshot.
3. Replay does not create second ledger row.

### Evidence
- `PaymentLedgerEntry` rows by `sourceEventId`

---

## PMS-PAY-07 — Autopay worker + PaymentAttempt state machine
### Required checks
1. Due invoices create `SCHEDULED` attempts.
2. Worker transitions `SCHEDULED -> ATTEMPTING -> SUCCEEDED/FAILED/NEEDS_AUTH`.
3. Locking prevents duplicate processing in repeated run.

### Evidence
- `PaymentAttempt` table transitions

---

## PMS-PAY-08 — NEEDS_AUTH recovery flow
### Required checks
1. Tenant sees `NEEDS_AUTH` attempts.
2. Recovery endpoint transitions attempt and retries payment.
3. Final status reconciles correctly in UI/API.

### Evidence
- API: `GET /api/billing/autopay/needs-auth-attempts`
- API: `POST /api/billing/autopay/needs-auth-attempts/:attemptId/recover`

---

## PMS-PRIC-01 — Cycle/version/snapshot schema + endpoints
### Required checks
1. Can create fee schedule version.
2. Can create plan cycle referencing active fee schedule.
3. Can create/list pricing snapshots.

### Evidence
- Billing pricing endpoint responses + IDs

---

## PMS-PRIC-02 — Scheduler cycle transitions + nightly projection
### Required checks
1. Monthly transition logic closes stale active cycles.
2. Opens new active cycle when absent.
3. Nightly projection writes one snapshot/day (idempotent).

### Evidence
- `OrgPlanCycle` + `PricingSnapshot` records over reruns

---

## PMS-PRIC-03 — FeeEngine tests + integration
### Required checks
1. FeeEngine test suite passes.
2. Scheduler projection uses FeeEngine output.

### Evidence
- `npx jest src/billing/fee-engine.spec.ts --runInBand`

---

## Final closeout
When each card passes:
1. Move card from Review/QA -> Done in `tasks/QUEUE.md` and `PMS_EXECUTION_BOARD.md`.
2. Add a one-line evidence summary under Done.
3. Commit/push workspace updates.
