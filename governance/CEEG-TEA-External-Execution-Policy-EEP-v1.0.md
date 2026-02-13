# CEEG/TEA External Execution Policy (EEP v1.0)

Status: **Locked: C**
Date captured: 2026-02-13

This is the authoritative spec for gating high-risk external execution.

## Core rule (non‑negotiable)
**High‑risk external execution (non‑dry‑run) requires Project‑Red**, plus an explicit Execution Permit (EXP) bound to the target+action.

No cooldowns. No auto-blocks. **State + permits + audit** only.

---

## 0) Definitions
- **TEA** = Task Executor Agent (execution utility)
- **ERQ** = Execution Request
- **EXP** = Execution Permit (Meta‑Scheduler authorization)
- **Project‑Red** = project‑scoped “stop‑the‑world” control state

---

## 1) Risk Classification (Deterministic)
Risk Level computed from requested effects.

### Risk level = High if any:
- `target_environment == "prod"`
- `side_effects_declared` contains any of:
  - `infra_mutation`
  - `security_policy_change`
  - `firewall_change`
  - `iam_change`
  - `db_schema_migration`
  - `payment_or_billing_change`
  - `delete_or_purge`
  - `mass_write` (bulk updates > configured threshold)
- permit requests **admin** credential profile

### Otherwise Risk level = Medium if:
- non‑prod writes to external systems
- repo pushes to protected‑ish branches
- Notion writes outside a single project scope

### Else Low.

**Rule:** If requester sets `risk_level`, Meta‑Scheduler recomputes and may upgrade it (never downgrade silently).

---

## 2) Hard Gate: High‑Risk External Requires Project‑Red
If:
- `target_system != local`
- AND `dry_run == false`
- AND computed `risk_level == "high"`

Then TEA must verify:
1) **Project‑Red is ACTIVE for `project_id`**
2) A valid **EXP** exists for this ERQ
3) EXP explicitly allows requested target + action

If any check fails → **REJECT**

---

## 3) ERQ v1.3 (External‑Ready) — Required Fields
```json
{
  "erq_id": "ERQ-<uuid>",
  "project_id": "PRJ-XXXX",
  "task_id": "TCK-XXXX",
  "requesting_team": "PMS Dev | PMS Build | Personal | Library | R&D | Panel",
  "requesting_agent": "AgentName",
  "intent_summary": "1-2 sentences",

  "execution_type": "shell | python | node | internal-script | api",
  "script_body": "string",
  "inputs": { "k": "v" },

  "target_system": "notion | github | gcp | custom-api",
  "target_environment": "dev | staging | prod",
  "target_identifier": "workspace/repo/project/etc",
  "credential_profile": "scoped-write | deploy | admin",

  "expected_outputs": {
    "type": "json | text | file",
    "success_criteria": ["..."]
  },

  "side_effects_declared": [
    "none | notion_write | repo_push | infra_mutation | db_schema_migration | delete_or_purge | mass_write"
  ],

  "timeout_seconds": 60,
  "dry_run": true,

  "rollback_plan": "required if dry_run=false OR side_effects_declared != none",
  "observability": { "log_level": "normal | verbose" }
}
```

---

## 4) EXP v1.2 (Target‑Bound Permit)
```json
{
  "exp_id": "EXP-<uuid>",
  "erq_id": "ERQ-<uuid>",
  "approved_by": "Meta-Scheduler",
  "approved_at": "ISO-8601",
  "expires_at": "ISO-8601",

  "approved_mode": "non-dry-run",

  "approved_scope": {
    "target_system": "notion | github | gcp | custom-api",
    "target_environment": "dev | staging | prod",
    "allowed_resources": ["..."],

    "allowed_actions": ["read | write | create | update | delete | deploy"],
    "allowed_side_effects": ["notion_write | repo_push | infra_mutation | ..."],

    "max_timeout_seconds": 120,
    "max_writes": 50,

    "blocked_actions": ["delete"],
    "blocked_paths_or_endpoints": ["..."]
  },

  "risk_level_confirmed": "low | medium | high",
  "rollback_verified": true
}
```

TTL defaults:
- Low: 30m
- Medium: 15m
- High: 5m

---

## 5) Project‑Red State Proof (Machine‑Checkable)
Single source of truth: **Notion Projects DB** properties.

### Projects DB properties
- **Project State** (Select): Green / Yellow / **Red**
- **Project Red Activated At** (Date)
- **Project Red Reason** (Text)
- **Project Red Owner** (Person)
- **Project Red Recovery Required** (Checkbox) default true

Validation logic:
- If `Project State != "Red"` → reject high‑risk external non‑dry‑run.

---

## 6) TEA System Prompt Patch (External + Project‑Red Gate)
- External non‑dry‑run requires EXP
- High‑risk external non‑dry‑run requires Project‑Red
- Permit scope must match: `target_system`, `target_environment`, `allowed_resources`
- Write ceiling: reject if implied writes > `max_writes`

---

## 7) Notion Implementation
### A) Projects DB additions
- Project State
- Project Red Activated At
- Project Red Reason
- Project Red Owner
- Project Red Recovery Required

Formula: **Project Red Active?**
```notion
prop("Project State") == "Red"
```

### B) Execution Requests DB additions
Add:
- Target System (Select)
- Target Environment (Select)
- Target Identifier (Text)
- Credential Profile (Select)
- Side Effects Declared (Multi-select)
- Risk Level (Select)
- Requires Project Red? (Formula)
- Project Red Active? (Rollup)
- Eligible to Execute? (Formula)

**Requires Project Red?**
```notion
and(
  prop("Dry Run") == false,
  prop("Target System") != "local",
  or(
    prop("Target Environment") == "prod",
    contains(prop("Side Effects Declared"), "infra_mutation"),
    contains(prop("Side Effects Declared"), "security_policy_change"),
    contains(prop("Side Effects Declared"), "firewall_change"),
    contains(prop("Side Effects Declared"), "iam_change"),
    contains(prop("Side Effects Declared"), "db_schema_migration"),
    contains(prop("Side Effects Declared"), "delete_or_purge"),
    contains(prop("Side Effects Declared"), "mass_write"),
    prop("Credential Profile") == "admin"
  )
)
```

**Eligible to Execute?**
```notion
if(
  prop("Dry Run"),
  true,
  and(
    prop("Permit Active?"),
    if(prop("Requires Project Red?"), prop("Project Red Active?"), true)
  )
)
```

---

## 8) Buttons
### Projects DB: Activate Project‑Red
- Set Project State → Red
- Set Project Red Activated At → now
- Set Project Red Owner → me
- Prompt Project Red Reason

### Projects DB: Exit Project‑Red
- Set Project State → Yellow

### Execution Requests DB: Request Permit
- Set Status → Submitted

### Execution Requests View: Ready to Execute
Filter:
- Dry Run = false
- Permit Active? = true
- Eligible to Execute? = true

---

## 9) Global Escalation (Optional, Logged)
- Global Escalation Requested (checkbox)
- Global Escalation Approved (checkbox)

Does not replace Project‑Red.

---

## Stop Point
This completes “C layered B” external execution policy:
- EXP required for non‑dry‑run
- Project‑Red required for high‑risk external non‑dry‑run
- Notion formulas provide eligibility visibility
- TEA enforces execution reality
