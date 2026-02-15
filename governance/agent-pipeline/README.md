# Agent Pipeline (Restored) — v1 (MVP)

This folder restores the **Agent System Pack** pipeline in an *operational* form.

## Goals

- Every substantive PMS task produces a **CTS** (Canonical Task Schema) artifact.
- PMS planning produces a **Run Pack** (planned TEA runs; no code execution here).
- A **Quality Review** gate is required before a Run Pack can be executed.
- Execution remains script-driven via TEA Requests/Permits.
- `exec run ...` remains allowed as a **manual override** (Jordan decision 1A), but should be logged.

## Artifacts

- `governance/tasks/CTS-<taskId>.json` — canonical task schema (source of truth)
- `governance/run-packs/RUNPACK-<taskId>.md` — human-readable run plan
- `governance/run-packs/RUNPACK-<taskId>.json` — machine-readable run plan
- `governance/reviews/QA-<taskId>.md` — QRS rubric result (Approve/Reject/Flag)

## Scripts

- `scripts/agent-pipeline/new-task.mjs` — create CTS + empty runpack stubs
- `scripts/agent-pipeline/review-runpack.mjs` — record QA decision (Approve/Reject/Flag)

## WhatsApp commands (human layer)

For now, WhatsApp is the *intake surface*; the agent will:
1) run `new-task.mjs`
2) generate a run pack (chat output + saved to repo)
3) run `review-runpack.mjs` after QA
4) queue executions via `exec-run.mjs`

Once stable, a timer-driven meta-scheduler can operate only on **Approved** run packs.
