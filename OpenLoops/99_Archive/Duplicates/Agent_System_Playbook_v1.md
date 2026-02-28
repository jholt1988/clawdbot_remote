
# AGENT SYSTEM PLAYBOOK (v1.0)

## 1. SYSTEM OVERVIEW

This document defines the complete architecture for a governed multi-agent system including:

- Meta-Orchestrator
- Meta-Scheduler
- Meta-Archivist
- Meta-Communicator
- Quality Reviewer
- Agent Resources (AR)
- Domain Teams (Personal, PMS Dev, Build, Business, Marketing)
- Library Team
- R&D Team
- Panel Team
- Generic Task Executor Agent (TEA)
- Webhook-Driven Execution Engine
- Queue + Locking Layer
- Notion Governance Schema

The system enforces deterministic governance, explicit execution permits, and project-scoped safety.

---

## 2. GOVERNANCE MODEL

Authority Hierarchy:
- Jordan (Human) — Final Authority
- Meta-Orchestrator — Routing Authority
- Meta-Scheduler — Planning & Permit Authority
- Domain Orchestrators — Domain Control
- Sub-Agents — Execution Support
- TEA — Mechanical Execution Only

Key Rule:
No execution occurs without an explicit Execution Permit.

---

## 3. EXECUTION FRAMEWORK

Execution Flow:

1. Execution Request (ERQ) created
2. Risk evaluation
3. Project-Red check (if high-risk external)
4. Execution Permit (EXP) approval
5. Webhook event triggered
6. Job enqueued
7. Worker validates permit again
8. Project + Target locks acquired
9. Script executed
10. Logs written
11. Permit marked Executed / Failed

---

## 4. LOCKING MODEL

Two-layer locking:

Project Lock:
lock:project:<projectId>

Target Lock:
lock:target:<targetKind>:<targetScope>:<credentialProfile>

Locks are acquired in sorted order to prevent deadlocks.

---

## 5. RISK MODEL

High Risk Conditions:

- target_environment == prod
- infra_mutation
- iam_change
- firewall_change
- db_schema_migration
- delete_or_purge
- mass_write
- admin credential usage

High-risk external execution requires:
Project State = Red

---

## 6. NOTION DATABASE SCHEMA

### Projects DB
- Project State (Green / Yellow / Red)
- Project Red Activated At
- Project Red Reason
- Project Red Owner
- Project Split Flag

### Execution Requests DB
- Project (relation)
- Script Path
- Target System
- Target Kind
- Target Scope ID
- Credential Profile
- Dry Run
- Risk Level
- Execution Status

### Execution Permits DB
- Execution Request (relation)
- Status (Draft / Approved / Running / Executed / Failed / Revoked)
- Approved Mode
- Expires At
- Lock Keys
- Worker ID
- Last Run At
- Last Output
- Last Error

---

## 7. META-SCHEDULER RESPONSIBILITIES

- Permit issuance
- Risk validation
- Project state transitions
- Conflict detection
- Ticket scheduling
- Calendar authority enforcement

---

## 8. TEA (TASK EXECUTOR AGENT)

Non-negotiable rules:

- Requires ERQ
- Requires EXP for non-dry-run
- Validates permit at runtime
- Enforces project-red for high risk
- Never broadens scope
- Logs execution

---

## 9. QUEUED WORKER SYSTEM

- BullMQ Queue
- Redis Backend
- Redlock distributed locking
- Idempotent jobId = permitId
- Concurrency controlled
- Backoff + retry supported

---

## 10. RED BUTTON PROTOCOL

Project-Scoped by Default.
Optional Global Escalation.

Red State activates:
- High-risk execution authority
- Elevated monitoring
- Recovery requirement before return to Green

---

## 11. SYSTEM PRINCIPLES

- Explicit > Implicit
- Permit > Intent
- State > Conversation
- Lock Before Mutate
- Deterministic > Clever
- Audit Everything

---

END OF PLAYBOOK
