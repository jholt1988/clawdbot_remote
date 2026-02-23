# Agent-Pack + TEA/CEEG Integration Specification

**Version:** 1.0  
**Created:** 2026-02-23  
**Status:** Draft  

---

## 1. Overview

This spec defines how the **Agent-Pack System** (sub-agent orchestration) integrates with the **TEA/CEEG governance framework** for safe, auditable, and risk-managed execution of multi-step agent tasks.

---

## 2. Current State

### Agent-Pack System
- Spawns multiple sub-agents in parallel or sequentially
- Tasks defined by: `label`, `task`, `cleanup`, `mode`
- No formal risk classification
- No integration with TEA/CEEG

### TEA/CEEG Governance
- **CEEG**: Evaluates Execution Requests (ERQs) for eligibility
- **TEA**: Executes approved actions with permit tracking
- **Project‑Red**: High‑risk oversight layer
- **Execution Permits (EXP)**: Scope‑limited authorizations

---

## 3. Integration Model

### 3.1 Task → ERQ Mapping

Every agent-pack task becomes an **Execution Request (ERQ)**:

```json
{
  "erq_id": "auto-generated",
  "parent_pack_id": "pms-a-03-b-03",
  "task_id": "PMS-A-04",
  "task_label": "owner-role",
  "task_definition": "PMS A-04: Owner perspective demo polish...",
  
  // Risk Classification (NEW)
  "risk_level": "low | medium | high | critical",
  "side_effects_declared": [
    "repo_push",           // writes to repository
    "db_read",            // reads database
    "db_write",           // modifies data
    "infra_mutation",     // changes infrastructure
    "external_api_call",  // calls external service
    "delete_or_purge"    // deletes data
  ],
  "target_system": "github | supabase | openai | local",
  "target_environment": "dev | staging | production",
  
  // TEA/CEEG Fields
  "requested_by": "agent-pack",
  "execution_context": "MVP demo preparation",
  "estimated_duration_minutes": 5,
  "dry_run": false
}
```

### 3.2 Pack-Level ERQ (Optional)

For convenience, a pack can request a single **Execution Permit (EXP)** covering all tasks:

```json
{
  "exp_id": "auto-generated",
  "pack_id": "pms-demo-pack-2026-02-22",
  "tasks": [...],  // Array of task ERQs
  
  "scope": {
    "allowed_actions": ["read", "write"],
    "max_writes": 50,
    "max_duration_minutes": 60,
    "target_systems": ["github", "local"]
  },
  
  "risk_summary": {
    "highest_risk": "medium",
    "requires_project_red": false,
    "side_effects": ["repo_push", "db_write"]
  }
}
```

---

## 4. Execution Flow

### 4.1 Current Flow (No Governance)
```
User → Agent-Pack → Spawn Sub‑Agents → Execute → Report
```

### 4.2 Proposed Flow (With TEA/CEEG)

```
User → Agent-Pack → Classify Risks → 
  → For Each Task (or Pack):
    → CEEG Evaluates (risk, eligibility) →
      → If HIGH/CRITICAL → Require Project‑Red →
      → TEA Executes (with EXP if needed) →
      → Log Result →
    → Continue to Next Task
```

### 4.3 Decision Matrix

| Risk Level | CEEG Action | TEA Action | Project‑Red |
|------------|-------------|-------------|-------------|
| **low** | Auto‑approve | Execute | No |
| **medium** | Review + Approve | Execute with EXP | No |
| **high** | Review + Approve | Execute with EXP | Yes |
| **critical** | Manual Review | Execute with EXP | Yes + Human Sign‑off |

---

## 5. Implementation

### 5.1 Task Classifier

Add a classifier function to agent-pack:

```typescript
function classifyTaskRisk(task: Task): RiskClassification {
  const sideEffects = detectSideEffects(task);
  const targetEnv = task.target_environment || 'dev';
  
  let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (sideEffects.includes('delete_or_purge') || 
      sideEffects.includes('infra_mutation')) {
    risk = 'critical';
  } else if (sideEffects.includes('external_api_call')) {
    risk = 'high';
  } else if (sideEffects.includes('db_write') || 
             sideEffects.includes('repo_push')) {
    risk = 'medium';
  }
  
  if (targetEnv === 'production' && risk !== 'critical') {
    risk = risk === 'low' ? 'medium' : 'critical';
  }
  
  return {
    risk_level: risk,
    side_effects_declared: sideEffects,
    requires_project_red: risk === 'critical' || risk === 'high'
  };
}
```

### 5.2 CEEG Adapter

```typescript
interface CEEGAdapter {
  submitERQ(erq: ExecutionRequest): Promise<CEEGResponse>;
  submitEXP(exp: ExecutionPermit): Promise<EXPResponse>;
  checkEligibility(task: Task): Promise<EligibilityResult>;
}
```

### 5.3 TEA Executor Wrapper

```typescript
interface TEAExecutor {
  executeWithPermit(task: Task, exp?: ExecutionPermit): Promise<TaskResult>;
  dryRun(task: Task): Promise<DryRunResult>;
}
```

---

## 6. Observability

### 6.1 Task Dashboard

| Pack ID | Tasks | Status | Highest Risk | CEEG Approved | TEA Executing |
|---------|-------|--------|--------------|---------------|---------------|
| pms-a-03 | 2 | ✅ Done | low | yes | yes |
| pms-b-08 | 1 | 🔄 Running | medium | yes | yes |
| infra-upgrade | 3 | ⏸️ Blocked | critical | pending | no |

### 6.2 Audit Log

Every task logs:
- `erq_id`, `pack_id`
- `risk_classification`
- `ceeg_decision`, `ceeg_decided_at`
- `tea_permit_id`, `tea_executed_at`
- `result`, `duration_ms`

---

## 7. Migration Path

### Phase 1: Add Risk Classification (Now)
- Add `risk_level`, `side_effects_declared`, `target_system` to task definitions
- No governance changes yet

### Phase 2: CEEG Integration (Week 2)
- Implement CEEG adapter
- Submit ERQs for medium+ risk tasks
- Log CEEG decisions

### Phase 3: TEA Execution (Week 3)
- Wrap execution in TEA permits
- Add audit logging
- Project‑Red for high/critical

### Phase 4: Full Automation (Week 4)
- Pack‑level EXP requests
- Dashboard + observability
- Auto‑retry with governance

---

## 8. Example: PMS Demo Pack (Revised)

```json
{
  "pack_id": "pms-demo-pack-2026-02-22",
  "description": "MVP demo prep tasks",
  "tasks": [
    {
      "task_id": "PMS-A-04",
      "label": "owner-role",
      "risk_level": "medium",
      "side_effects_declared": ["repo_push"],
      "target_system": "github",
      "target_environment": "dev"
    },
    {
      "task_id": "PMS-B-08",
      "label": "photo-analysis",
      "risk_level": "low",
      "side_effects_declared": ["repo_push", "external_api_call"],
      "target_system": "openai",
      "target_environment": "dev"
    }
  ],
  "risk_summary": {
    "highest_risk": "medium",
    "requires_project_red": false
  },
  "scope": {
    "allowed_actions": ["read", "write"],
    "max_writes": 20,
    "max_duration_minutes": 30
  }
}
```

---

## 9. Success Metrics

- **100% of tasks** have risk classification
- **Zero unauthorized executions** in production
- **Audit coverage** for all TEA actions
- **< 5 min** additional overhead per pack for CEEG review

---

## 10. Open Questions

1. Should low‑risk tasks skip CEEG entirely or just log?
2. How to handle task retries — re‑submit to CEEG?
3. Who approves Project‑Red for critical tasks?
4. Should packs be atomic (all or nothing) or incremental?

---

*End of Specification*