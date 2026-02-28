# Unified Personal AI Assistant — Canonical Plan (MVP-first)

- **Canonical owner:** Jordan + Aden
- **Canonical date:** 2026-02-28
- **Source basis:** `Unified_AI_Assistant_Plan (1).md` (Dec 22, 2025)
- **Status:** Active canonical strategy doc
- **Version:** v1.0-canonical

---

## Executive Summary
Build a unified personal AI assistant with MVP focus on **Knowledge Management + Planning** using:
- **Google Calendar** as source of truth for time
- **Notion** as source of truth for tasks/projects
- **Obsidian** as source of truth for knowledge

Operating model is **chat-first** with approval-gated writes during MVP (propose → approve → execute).

---

## MVP Scope
1. Unified capture → organize → retrieve (with citations)
2. Daily/weekly planning loop (Big 3 priorities + realistic time blocks)
3. Knowledge synthesis (status summaries, decision recall, change reporting)

### Data access model (MVP)
- Read: calendar, tasks, selected notes
- Write (approval-gated): Notion tasks + calendar blocks
- Excluded by default: financial/health/government ID systems

---

## Success Metrics (KPIs)
- Retrieval precision with correct sources
- Time saved daily (planning + searching)
- Better planning adherence (fewer misses/conflicts)
- Capture reliability (less cleanup)
- Trust metric (proposal acceptance rate)

---

## Architecture (MVP)
### 1) Memory Layer
Ingestion, normalization, indexing, semantic retrieval, citations.

### 2) Planning & Execution Layer
Daily/weekly planning workflows + connector actions (Notion/GCal).

### 3) Governance Layer
Permissions, approvals, audit logs, encryption, retention.

### System-of-record rule
- Time truth: **Google Calendar**
- Execution truth: **Notion Tasks**
- Knowledge truth: **Obsidian**

---

## Daily Operating Procedure (Backbone)
### Morning plan (7–12 min)
1. Review hard commitments + free blocks in calendar
2. Open Notion Today
3. Select Big 3 (Must-Win / Maintenance / Momentum)
4. Draft time blocks (60–70% max utilization + one buffer)
5. Write outputs to Notion, draft blocks in Calendar, log in Obsidian

### Evening shutdown (3–6 min)
1. Close tasks + capture outcomes
2. Reschedule/re-scope unfinished work
3. Capture loose thoughts to inbox
4. Record one dependency for tomorrow

---

## Roadmap
### Phase 0 — Foundation
Schema/views/templates + approval policy.

### Phase 1 — Memory MVP
Index Obsidian, embeddings retrieval, citations, basic UI.

### Phase 2 — Planning MVP
Notion + Calendar connectors, planning rules, conflict checks.

### Phase 3 — Reliability/Governance
Dedup/idempotency, audit logs, security baseline, evaluation harness.

### Phase 4 — Automation v1
Auto daily note + task pull + block proposals (approval required).

---

## Immediate Execution Checklist
- [ ] Confirm canonical Notion task schema + Today/Next/Overdue views
- [ ] Confirm Obsidian folder/template structure
- [ ] Define approval matrix for write actions
- [ ] Implement retrieval with citations on top selected note folders
- [ ] Pilot 7-day daily-plan loop and measure KPI baseline

---

## Change Log
- **2026-02-28:** Created canonical consolidation doc from Dec 2025 strategy source.
