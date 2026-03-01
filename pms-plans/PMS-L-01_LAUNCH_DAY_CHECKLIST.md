# PMS-L-01 — Launch-Day Checklist

Date: 2026-03-01
Owner: Jordan + Aden

## 1) Pre-Launch (T-24h to T-2h)
- [ ] Confirm production env vars are present and valid
- [ ] Confirm database backup snapshot completed
- [ ] Confirm rollback point/tag is created
- [ ] Confirm Stripe/API keys and webhook endpoints are correct
- [ ] Confirm email/SMS provider credentials are valid
- [ ] Confirm DNS/SSL status green
- [ ] Confirm monitoring + alert channels are active (errors, latency, queue depth)
- [ ] Confirm seed/demo data is NOT enabled in production
- [ ] Confirm feature flags/defaults are set for launch posture
- [ ] Confirm support owner-on-call schedule

## 2) Final QA Gate (T-2h to T-30m)
- [ ] Smoke test auth/login/logout
- [ ] Smoke test property + unit CRUD
- [ ] Smoke test application → lease path
- [ ] Smoke test payment method + payment + receipt
- [ ] Smoke test maintenance request + PM triage + owner comment
- [ ] Smoke test inspection → estimate generation
- [ ] Verify key mobile responsive views
- [ ] Run fast CI gate and confirm green
- [ ] Verify no P0 regressions open

## 3) Launch Execution (T-30m to T+30m)
- [ ] Freeze non-launch changes
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run migrations (if any)
- [ ] Validate app health endpoints
- [ ] Validate first-user login
- [ ] Validate first transaction flow
- [ ] Post launch confirmation in team channel

## 4) Post-Launch Monitoring (T+30m to T+4h)
- [ ] Watch error rate (5xx, client errors)
- [ ] Watch p95 latency and CPU/memory
- [ ] Watch background jobs/queue lag
- [ ] Watch payment and webhook processing
- [ ] Watch notification delivery success
- [ ] Log incidents/issues in launch log

## 5) Rollback Triggers (Immediate)
Rollback if any of the following:
- [ ] Auth failures > 5% for 10+ min
- [ ] Payment failure spike above baseline
- [ ] Core workflow unavailable (application, maintenance, inspections)
- [ ] Sustained 5xx elevated above threshold

## 6) Rollback Steps
- [ ] Announce rollback start
- [ ] Revert to prior deploy artifact
- [ ] Restore DB only if migration requires
- [ ] Verify restored health + core flows
- [ ] Post rollback incident note and follow-up owner

## 7) Communications
### Internal launch message
- [ ] "PMS launch started — freeze in effect"
- [ ] "PMS launch complete — monitoring phase active"

### User-facing status (if needed)
- [ ] Planned maintenance/update notice
- [ ] Completion notice + known issues (if any)

## 8) Launch Artifacts
- [ ] Deployment SHA(s):
- [ ] Migration IDs:
- [ ] Monitoring dashboard links:
- [ ] Incident log link:
- [ ] Launch owner sign-off:
