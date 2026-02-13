# TEA / CEEG Meta-Scheduler Enforcement Wrapper + Audit Log

This folder provides **deterministic enforcement + auditing** for TEA executions.

Design lock:
- **B:** Domain Orchestrators may spawn TEA for **dry-run**.
- **C:** **Any non-dry-run requires a valid EXP** issued by Meta-Scheduler.
- **EEP v1.0 (Locked:C):** High-risk external non-dry-run additionally requires **Project-Red** + target-bound permit.

## What this is
- A **validator** that rejects unsafe/invalid ERQ/EXP combinations.
- An **audit logger** that records every attempted execution (approved or rejected).

## What this is NOT
- It does not mint credentials (Credential Broker comes later).
- It does not itself spawn TEA (spawning is done by Clawdbot via `sessions_spawn`).

---

## Quick start

### 1) Validate + log an ERQ/EXP pair

Dry-run ERQ:
```bash
node scripts/tea/validate-and-log.mjs --erq /path/to/erq.json
```

Non-dry-run ERQ (requires EXP):
```bash
node scripts/tea/validate-and-log.mjs --erq /path/to/erq.json --exp /path/to/exp.json
```

### 2) Spawn TEA (manual, via Clawdbot tools)
Once the validator says `approved=true`, spawn TEA using the prompt pack:
- `agents/prompts/tea-v1.1.md` (local)
- `agents/prompts/tea-v1.2-ceeg.md` (external)

Then write TEA’s JSON output to a file and log it:
```bash
node scripts/tea/log-result.mjs --erq /path/to/erq.json --exp /path/to/exp.json --result /path/to/tea-output.json
```

---

## Audit log location
- `logs/tea/YYYY-MM-DD.jsonl`

Each line is a JSON object event.
