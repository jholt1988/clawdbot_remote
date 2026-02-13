# Prod Readiness Checklist v1.0 — Agent Pack System (Meta‑Scheduler + TEA/CEEG)

Version: v1.0  
Last updated (UTC): 2026-02-13

Scope: this checklist covers the **agent pack system** as implemented in this repo:
- Planner prompts + Meta‑Scheduler governance layer
- TEA/CEEG execution model (ERQ/EXP)
- Audit logging
- Notion execution layer automations
- Event-driven spine (webhook → queue → worker)

Definition of “production-ready” here means:
- Safe to run continuously
- Deterministic gating
- Auditable
- Resistant to duplication/replay
- Does not execute external mutations without explicit, scoped authorization

---

## A) Governance + Authority (must pass)

A1. **Non‑dry‑run requires permit (EXP)**
- Pass condition: any attempt to execute with `dry_run=false` without a valid EXP is rejected.
- Implemented:
  - Node wrapper validator (`scripts/tea/validate-and-log.mjs`) + schemas
  - TEA prompt v1.1/v1.2

A2. **High‑risk external non‑dry‑run requires Project‑Red** (EEP v1.0)
- Pass condition: worker refuses to execute when risk is high, target is external, and project state != Red.
- Implemented:
  - EEP doc in governance
  - Notion worker gate in `scripts/notion-events/worker.mjs`

A3. **Permit is the sole authority for execution**
- Pass condition: execution begins only on `Permit.Status == Approved` and correct mode match.
- Implemented:
  - webhook handler enqueues only on Approved
  - worker re-reads Notion and re-validates status + mode

---

## B) Deterministic Interfaces (must pass)

B1. **Canonical schemas for ERQ/EXP**
- Pass condition: ERQ/EXP are validated against canonical JSON Schemas.
- Implemented:
  - Node schemas in `governance/tea-*-schema-v1.2.json`
  - Python schema-driven validation

B2. **Event schema for ingress**
- Pass condition: webhook ingress validates incoming event shape and rejects unknown/invalid events.
- Implemented:
  - `scripts/notion-events/event-validate.mjs`

B3. **Exit codes are deterministic**
- Pass condition: validation commands use consistent 0/1/2 semantics.
- Implemented:
  - Node validator already uses this
  - Python CLI documents and follows the same

---

## C) Safety: Idempotency, Replay Protection, Concurrency (must pass)

C1. **Idempotency key**
- Pass condition: permit execution is idempotent (retries/webhook duplicates do not double-run).
- Implemented:
  - BullMQ jobId = permitId

C2. **Replay protection (ingress)**
- Pass condition: webhook duplicates are detected and rejected (or no-op) using an event id + TTL.
- Implemented:
  - Redis-backed dedupe key (`eventId`) when Redis is configured

C3. **Composite locking**
- Pass condition: project serialization + target serialization with deterministic lock ordering.
- Implemented:
  - `lock:project:<projectId>` + `lock:target:<targetKey>` sorted before acquire

C4. **State machine discipline**
- Pass condition: worker respects permit state machine; does not re-run Executed/Failed/Revoked permits.
- Implemented:
  - worker refuses non-Approved permits and treats already-terminal permits as no-op

---

## D) Observability + Audit (must pass)

D1. **Structured audit log exists and is append-only**
- Pass condition: each attempt records pre-validation and result events.
- Implemented:
  - JSONL: `logs/tea/YYYY-MM-DD.jsonl`

D2. **Notion-level observability**
- Pass condition: on Running, we write lock keys + worker id + attempt count to Permit and Request.
- Implemented:
  - `Lock Keys`, `Worker ID`, `Run Attempt` fields

D3. **Worker health checks**
- Pass condition: worker refuses to start if required env is missing.
- Implemented:
  - `scripts/notion-events/healthcheck.mjs`

---

## E) Notion Contract (must pass)

E1. **Schema verification before enabling automation**
- Pass condition: a script can verify required DB properties exist with expected types.
- Implemented:
  - `scripts/notion-events/notion-schema-verify.mjs`

E2. **Property name drift controls**
- Pass condition: property mapping lives in code and can be overridden without code changes.
- Implemented:
  - `NOTION_PROP_OVERRIDES_JSON`

---

## F) Credential Safety (required for external non-dry-run)

F1. **No secrets in ERQ**
- Pass condition: ERQ payloads are rejected if they contain obvious secret fields.
- Implemented:
  - ERQ linter (`scripts/tea/erq-lint.mjs`)

F2. **Credential Broker**
- Pass condition: external non-dry-run execution obtains **short-lived scoped creds** via broker; long-lived tokens are not handed to TEA.
- Implemented (framework):
  - `scripts/credential-broker/` interface + deny-by-default broker
- Operational requirement (must be configured):
  - Connect to a real broker (Vault / cloud identity / GitHub App / etc.)

---

## G) Execution Isolation (required for unattended production)

G1. **Sandboxed execution runner**
- Pass condition: scripts do not run with full host environment by default; env is minimized; script paths are allowlisted.
- Implemented:
  - allowlist + cleaned env runner
- Operational requirement (recommended):
  - container runner (Docker/Cloud Run/K8s). This host currently lacks Docker.

---

## Minimal “green light” criteria
- All **A–E** must pass.
- **F2 + G1 operational requirements** must be satisfied *before* enabling external non‑dry‑run against prod.
