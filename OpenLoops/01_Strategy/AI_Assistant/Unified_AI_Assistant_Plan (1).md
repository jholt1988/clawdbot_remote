# Unified Personal AI Assistant — Project Plan (MVP-first)
**Core:** Knowledge Management + Planning  
**Systems of record:** Google Calendar (time), Notion (tasks/projects), Obsidian (knowledge)  
**Date:** December 22, 2025  
**Version:** v0.1 (Living Document)

---

## Executive Summary
This plan defines the scope, architecture, steps, and resources required to build a unified personal AI assistant with an MVP focused on Knowledge Management and Planning. The assistant uses Google Calendar as the source of truth for time, Notion as the source of truth for execution (tasks/projects), and Obsidian as the source of truth for knowledge. Implementation is staged to prioritize reliability, security, and consistent daily operations before deeper automation.

## Defined Scope

### 1) Primary Functional Goals (MVP)
- Unified capture -> organize -> retrieve (single inbox, auto-categorization, fast lookup with citations)
- Daily + weekly planning loop (Big 3 priorities, realistic time-block proposals, approvals for writes)
- Knowledge synthesis (project briefs, status summaries, decision recall, “what changed” reporting)

### 2) Integrations and Environment
- Calendar: Google Calendar
- Tasks/Projects: Notion Tasks database
- Notes/Knowledge: Obsidian vault
- Operating model: Hybrid (cloud orchestration + local Obsidian bridge)

### 3) Data Sensitivity and Access
- Read access: calendar, tasks, selected notes for retrieval/synthesis
- Write access (approval-gated in MVP): Notion tasks + Google Calendar blocks
- No default access (MVP): financial accounts, health records, government IDs

### 4) Interaction Model
- Chat-first (desktop + mobile)
- Proactive insights allowed; autonomous actions disallowed in MVP (propose -> approve)

### 5) Success Metrics (KPIs)
- Retrieval precision (top results include correct source)
- Time saved per day (planning + searching)
- Planning adherence (missed deadlines/conflicts reduced)
- Capture reliability (less manual cleanup)
- Trust metric (proposal acceptance rate)

## Architecture Overview
Layers:
- **Memory Layer:** ingestion, normalization, indexing, semantic search, citations
- **Planning & Execution Layer:** daily/weekly planning workflows + tool actions (Notion/GCal)
- **Governance Layer:** permissions, approval gates, audit logs, encryption, retention

### Key Design Rule: Systems of Record
- Time truth: **Google Calendar**
- Execution truth: **Notion Tasks**
- Knowledge truth: **Obsidian**

## Operating Procedure: Daily Plan Habit
The Daily Plan is the MVP backbone.

### Placement (Where It Lives)
- Obsidian: Daily Note contains plan + links (command center)
- Notion: Today view is execution list (Plan Date = today, Status != Done)
- Google Calendar: time blocks created from plan (approval-gated)

### Morning Plan (7-12 minutes)
1. Scan Google Calendar for commitments + real free blocks
2. Open Notion Today view
3. Select Big 3 (Must-Win, Maintenance, Momentum) + optional 0-2 bonus tasks
4. Draft time blocks (Must-Win first; max 60-70% of free time; include 1 buffer)
5. Write outputs: update Notion, create draft calendar blocks, log plan in Obsidian

### Evening Shutdown (3-6 minutes)
1. Mark completed tasks done; capture outcomes in Obsidian
2. Reschedule/re-scope unfinished tasks (clear Plan Date if not tomorrow)
3. Capture loose thoughts into Obsidian Inbox
4. Record “one thing tomorrow depends on”

### Daily Plan Output Package
- Obsidian Daily Note: Big 3, constraints, minimum viable day, task links
- Notion Today view: 3-6 tasks tagged via Plan Date; statuses set
- Google Calendar: 2-4 blocks + buffer; descriptions include Notion links

## Implementation Roadmap

### Phase 0 — Foundation
- Create Notion Tasks DB schema + views (Today/Next/Overdue)
- Create Obsidian folder structure + templates
- Define write policy and approval rules

### Phase 1 — Memory MVP (Knowledge Core)
- Obsidian indexing (markdown parsing + chunking + metadata)
- Embeddings + vector search (hybrid retrieval)
- Citations to exact notes
- Basic chat/search UI

### Phase 2 — Planning MVP (Daily Plan + Write Actions)
- Notion connector (fetch/update/create tasks)
- Google Calendar connector (free/busy + draft blocks)
- Planning rules engine (Big 3, effort sizing, buffers, conflicts)

### Phase 3 — Reliability + Governance
- Dedup + idempotency
- Audit logs + approvals
- Security baseline (least privilege, encryption, secrets)
- Evaluation harness (retrieval + planning scenarios)

### Phase 4 — Automation v1 (after 7 days consistent manual use)
- Auto-create daily note + embed Notion Today link
- Auto-pull Today tasks as links (read-only)
- Propose (not execute) time blocks; execute only after approval

## Resource Inventory

### Platforms & Components
- Backend: Node/TS or Python (standardize)
- Database: Postgres + pgvector
- Obsidian bridge (local) or synced vault pipeline
- LLM + embeddings (hosted API recommended for MVP)
- OAuth + secrets manager
- Logging + audit tables

### Knowledge & Skills to Learn (User Training)
- Notion DB properties/views/filters
- Obsidian daily notes/templates/frontmatter/linking
- Planning SOP (Big 3, effort sizing, shutdown)
- Security hygiene (password manager, token discipline)

### Time & Budget Drivers
- LLM + embeddings usage (control via caching + selective indexing)
- Compute/storage (small VPS + Postgres is enough for MVP)
- Connector maintenance (APIs drift)

---

## Appendix A — Templates

### A1) Obsidian Daily Note Template
Paste into: `99_Templates/Daily Note Template.md`

```markdown
---
type: daily
date: {date}
---

## Today (Command Center)
- [Open Notion - Today Tasks](PASTE_NOTION_TODAY_VIEW_URL)

## Daily Plan
**Must-Win:**
**Maintenance:**
**Momentum:**

## Today Tasks (Top 3 links)
- 
- 
- 

## Time Blocks (Draft)
- 

## Notes / Captures
- 
```
