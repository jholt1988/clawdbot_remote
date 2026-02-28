# Property Management Gap Analysis (Companion to `property_management_gap_matrix.json`)

## Overview
- Scope: feature parity, operational resilience, infra scaling, security, and observability readiness for tenant/owner portals and back-office flows.
- Source: synthesized from simulated gap matrix; this doc narrates the why/impact, owners, and near-term execution plan.

## Highest priority gaps (P0/P1)
- FP-1.2-B — Concurrent rent updates overwrite values: add optimistic locking/version fields on rent edits; surface conflict prompts in UI.
- SD-3.1-B — File storage single-AZ: enable multi-AZ (or cross-region) replication with tested failover; document RPO/RTO.
- OW-2.1-B — Lease renewal missing rent-increase approval gate: enforce approval workflow before DocuSign envelope creation.
- SD-3.3-A — Admin MFA optional: enforce MFA for privileged roles; block access until enrolled; add periodic checks.
- OW-2.2-A — Payment webhook queue spikes: autoscale consumers and ensure idempotent handlers with poison-queue isolation.
- FP-1.2-C — Payment initiation timeouts: idempotent initiation API + timeout-aware UX with compensating logic.
- OW-2.4-C — DocuSign callbacks not persisted: store webhook events with tamper-evident logs and replay support.

## Cross-cutting remediations
- Reliability: Circuit breaker + exponential backoff on payment gateway (SD-3.2-C); timeout-aware flows (FP-1.2-C); resumable uploads for maintenance photos (FP-1.2-A).
- Data integrity: Optimistic locking/versioning on mutable financial/lease records (FP-1.2-B); audit trails with user/time/version and before/after values (OW-2.4-A/B).
- Security: Enforce MFA (SD-3.3-A); tighten RBAC export scopes + approval workflow (SD-3.3-C); patch vulnerable deps and add automated scans (SD-3.3-B).
- Observability: Synthetic login checks (SD-3.4-A); distributed tracing on payment paths (SD-3.4-B); latency SLO-based alerts (SD-3.4-C).
- Scale/Performance: Index unit search and add caching/search service (OW-2.2-B); paginate vendor directory (OW-2.2-C); include I/O/latency in autoscaling (SD-3.1-A).

## Ownership and near-term plan
- Platform/Infra: SD-3.1-B, SD-3.1-A, SD-3.4-*, SD-3.2-C.
- Payments/FinOps: FP-1.2-C, OW-2.2-A, OW-2.3-A/C, SD-3.2-B/C.
- Leasing/Docs: OW-2.1-B, OW-2.4-C, FP-1.3-A, FP-1.3-B.
- Maintenance: FP-1.1-A, FP-1.2-A, OW-2.1-A, OW-2.3-B, OW-2.2-C.
- Security: SD-3.3-* (MFA, deps, RBAC).

### 0–2 week actions (unblockers)
- Implement DocuSign webhook persistence with audit logging (OW-2.4-C); wire into esign webhook handler to store events.
- Enforce admin MFA and add periodic checks (SD-3.3-A).
- Add optimistic locking/version column on rent/lease updates and conflict handling in API/UI (FP-1.2-B).
- Enable payment gateway circuit breaker + idempotent initiation with timeout messaging (SD-3.2-C, FP-1.2-C).
- Add synthetic login monitor and payment flow tracing; set latency SLO alerts (SD-3.4-A/B/C).

### 2–4 week actions
- Multi-AZ storage with tested failover; document RPO/RTO (SD-3.1-B, SD-3.1-C).
- Autoscale webhook consumers and add dead-letter queues; monitor ACH failure thresholds (OW-2.2-A, OW-2.3-C).
- Index/search optimization for units; paginate vendor directory (OW-2.2-B/C).
- Resumable maintenance photo uploads; validation copy alignment and accessibility focus states (FP-1.2-A, FP-1.3-A/B).

## Traceability (owners/ETA)
- P0 (must): FP-1.2-B, SD-3.1-B, OW-2.1-B, SD-3.3-A, SD-3.2-C, FP-1.2-C, OW-2.4-C — target completion: 2 weeks.
- P1 (high): FP-1.2-A, OW-2.2-A, OW-2.3-A/B, SD-3.4-*, SD-3.3-B/C, SD-3.1-A/C — target: 4 weeks.
- P2 (medium): FP-1.1-*, FP-1.3-*, OW-2.1-A/C, OW-2.2-B/C — target: 6–8 weeks.

## Next steps for implementation
- If proceeding now: begin with DocuSign webhook persistence + audit logging, payment circuit breaker/idempotency, and admin MFA enforcement.
- Confirm owners and dates in the matrix; keep both JSON matrix and this narrative in sync when statuses change.
