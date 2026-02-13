# Meta-Scheduler Enforcement Wrapper — TEA/CEEG (v1.0)

Purpose: provide **deterministic gating + audit logging** for TEA executions.

Design lock:
- **B:** Domain Orchestrators may spawn TEA for **dry-run**.
- **C:** **Any non-dry-run requires Meta-Scheduler-issued EXP**.
- **EEP v1.0 (Locked:C):** High-risk external non-dry-run additionally requires **Project-Red** + target-bound permit.

Canonical validator + audit tooling:
- `scripts/tea/validate-and-log.mjs`
- `scripts/tea/log-result.mjs`
- Audit log: `logs/tea/YYYY-MM-DD.jsonl`

---

## Wrapper algorithm (must be followed)

### Inputs
- ERQ JSON (required)
- EXP JSON (required iff ERQ.dry_run=false)

### Step 1 — Validate + audit (pre-exec)
Run:
```bash
node scripts/tea/validate-and-log.mjs --erq <erq.json> [--exp <exp.json>]
```

Exit codes (deterministic):
- `0` approved
- `1` rejected
- `2` usage error

Rules:
- If ERQ.dry_run=true: validation MUST pass, but EXP is not required.
- If ERQ.dry_run=false: validation MUST pass AND EXP MUST be present and valid.
- If validation fails: **do not spawn TEA**.

### Step 2 — Spawn TEA (Clawdbot)
- If validation approved=true, spawn TEA via `sessions_spawn` using:
  - `agents/prompts/tea-v1.1.md` for local-only requests
  - `agents/prompts/tea-v1.2-ceeg.md` for external-target requests
- Provide TEA only:
  - ERQ
  - EXP (if non-dry-run)
  - minimal context necessary

### Step 3 — Log result (post-exec)
Store TEA’s structured JSON output to a file, then run:
```bash
node scripts/tea/log-result.mjs --erq <erq.json> [--exp <exp.json>] --result <tea-output.json>
```

---

## Non-negotiable enforcement
- **Non-dry-run without EXP is forbidden**.
- **Out-of-scope execution is forbidden**.
- Any scope expansion requires a **new ERQ** and **new EXP**.

---

## Audit record kinds
- `tea.wrapper.validation` — pre-exec gating outcome
- `tea.wrapper.result` — post-exec result capture
