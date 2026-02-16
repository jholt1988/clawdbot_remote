#!/usr/bin/env node
/**
 * Plan Compiler — PMS MVP
 *
 * Operationalizes `governance/pms/PMS_MVP_AGENT_INPUT_*.json` into Notion:
 * - Projects DB acts as Plan DB
 * - Tickets DB acts as Tasks DB
 *
 * Compile trigger: Plan Status == "Ready for Decomposition" (unless --force)
 *
 * Additive-only policy:
 * - creates/updates pages, does not delete
 */

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@notionhq/client';

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

function argFlag(name) {
  return process.argv.includes(name);
}

function argValue(name, def = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  return process.argv[i + 1] ?? def;
}

function nowISO() {
  return new Date().toISOString();
}

function richText(str) {
  return { rich_text: [{ text: { content: String(str).slice(0, 1900) } }] };
}

function title(str) {
  return { title: [{ text: { content: String(str).slice(0, 200) } }] };
}

function select(name) {
  return { select: { name } };
}

function checkbox(v) {
  return { checkbox: !!v };
}

function dateISO(iso) {
  return { date: { start: iso } };
}

function relation(ids) {
  return { relation: (ids || []).map((id) => ({ id })) };
}

// Do not pin an old Notion API version; this workspace uses dataSources endpoints.
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function getDataSourceId(database_id) {
  const db = await notion.databases.retrieve({ database_id });
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error(`Missing data_source_id for database ${database_id}`);
  return dsId;
}

// Note: Tickets DB uses a legacy Status select with existing options (Proposed/Accepted/etc.).
// We intentionally do not mutate select options here; schema migrations are handled elsewhere.

async function findOneByRichTextContains(dsId, propName, needle) {
  const resp = await notion.dataSources.query({
    data_source_id: dsId,
    page_size: 5,
    filter: {
      property: propName,
      rich_text: { contains: String(needle) },
    },
  });
  return resp.results?.[0] ?? null;
}

async function findOneByTitleContains(dsId, needle) {
  const resp = await notion.dataSources.query({
    data_source_id: dsId,
    page_size: 5,
    filter: {
      property: 'Name',
      title: { contains: String(needle).slice(0, 50) },
    },
  });
  return resp.results?.[0] ?? null;
}

async function findTicketByTaskId(dsId, taskId) {
  // Prefer exact match by contains (Task IDs are unique and short)
  return findOneByRichTextContains(dsId, 'Task ID', taskId);
}

function getSelectName(page, propName) {
  return page?.properties?.[propName]?.select?.name ?? null;
}

async function upsertPlan({ projectsDbId, projectsDsId, input }) {
  const planId = input.plan_spec.plan_id;
  const titleText = input.plan_spec.title;

  // Some Notion API versions can lag on newly-added properties; identify plan by title.
  let planPage = await findOneByTitleContains(projectsDsId, titleText);

  if (!planPage) {
    // Create new Plan page in Projects DB
    const created = await notion.pages.create({
      parent: { database_id: projectsDbId },
      properties: {
        Name: title(titleText),
        'Plan ID': richText(planId),
        'Plan Status': select('Draft'),
        'PlanSpec JSON': richText(JSON.stringify(input).slice(0, 1800)),
        Objective: richText((input.plan_spec.definition_of_done || []).join('\n').slice(0, 1800)),
      },
    });
    planPage = created;
  } else {
    // Keep Plan Status as-is; update PlanSpec JSON and Objective
    await notion.pages.update({
      page_id: planPage.id,
      properties: {
        Name: title(titleText),
        'Plan ID': richText(planId),
        'PlanSpec JSON': richText(JSON.stringify(input).slice(0, 1800)),
        Objective: richText((input.plan_spec.definition_of_done || []).join('\n').slice(0, 1800)),
      },
    });
  }

  const fresh = await notion.pages.retrieve({ page_id: planPage.id });
  return fresh;
}

function teamToDomain(team) {
  const map = {
    PMS_DEV: 'PMS-Dev',
    BUILD: 'PMS-Build',
    BUSINESS: 'PMS-Business',
    MARKETING: 'PMS-Marketing',
    QA: 'PMS-Dev',
    R_AND_D: 'R&D',
    LIBRARY: 'Library',
    PANEL: 'R&D',
  };
  return map[team] || 'PMS-Dev';
}

function riskToRiskFlag(risk) {
  if (risk === 'High') return 'High';
  if (risk === 'Medium') return 'Medium';
  return 'None';
}

async function upsertTasks({ ticketsDbId, ticketsDsId, planPageId, input }) {
  const tasks = input.cts_tasks || [];

  const idMap = new Map(); // task_id -> pageId

  // pass 1: create/update all tasks (without dependencies)
  for (const t of tasks) {
    const taskId = t.task_id;
    let page = await findTicketByTaskId(ticketsDsId, taskId);

    const props = {
      Name: title(t.title),
      'Task ID': richText(taskId),
      Project: relation([planPageId]),

      // Classification
      Team: select(t.team),
      Domain: select(teamToDomain(t.team)),
      'QA Team': select(t.qa_team || 'QA'),
      Risk: select(t.risk || 'Medium'),
      'Risk Flag': select(riskToRiskFlag(t.risk || 'Medium')),

      Workstream: select(t.workstream),
      Epic: richText(t.epic || ''),
      'Acceptance Criteria': richText((t.acceptance_criteria || []).join('\n')),
      'Artifacts Expected': richText((t.artifacts_expected || []).join('\n')),
      'External Execution Needed': checkbox(!!t.external_execution_needed),

      ...(page ? {} : { 'Created By': select('Planner') }),
    };

    if (!page) {
      const created = await notion.pages.create({
        parent: { database_id: ticketsDbId },
        properties: {
          ...props,
          Status: select('Proposed'),
        },
      });
      page = created;
    } else {
      await notion.pages.update({
        page_id: page.id,
        properties: props,
      });
    }

    idMap.set(taskId, page.id);
  }

  // Build a status map in one query (avoids N^2 page.retrieve)
  const statusByPageId = new Map();
  {
    const resp = await notion.dataSources.query({
      data_source_id: ticketsDsId,
      page_size: 200,
      filter: {
        property: 'Project',
        relation: { contains: planPageId },
      },
    });

    for (const p of resp.results) {
      statusByPageId.set(p.id, getSelectName(p, 'Status'));
    }
  }

  // pass 2: wire dependencies + compute status
  for (const t of tasks) {
    const pageId = idMap.get(t.task_id);
    if (!pageId) continue;

    const depIds = (t.dependencies || []).map((d) => idMap.get(d)).filter(Boolean);

    let satisfied = true;
    for (const depPageId of depIds) {
      const st = statusByPageId.get(depPageId);
      if (st !== 'Done') {
        satisfied = false;
        break;
      }
    }

    const statusName = satisfied ? 'Accepted' : 'Proposed';

    await notion.pages.update({
      page_id: pageId,
      properties: {
        Dependency: relation(depIds),
        Status: select(statusName),
        ...(satisfied ? { 'Assigned At': dateISO(nowISO()) } : {}),
      },
    });
  }

  return { taskCount: tasks.length };
}

async function main() {
  requireEnv(['NOTION_API_KEY', 'NOTION_PROJECTS_DB_ID', 'NOTION_TICKETS_DB_ID']);

  const force = argFlag('--force');
  const fileArg = argValue('--file', path.join('governance', 'pms', 'PMS_MVP_AGENT_INPUT_2026-02-15.json'));
  const repoRoot = process.cwd();
  const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(repoRoot, fileArg);

  const raw = await fs.readFile(filePath, 'utf8');
  const input = JSON.parse(raw);

  const projectsDbId = process.env.NOTION_PROJECTS_DB_ID;
  const ticketsDbId = process.env.NOTION_TICKETS_DB_ID;
  const projectsDsId = await getDataSourceId(projectsDbId);
  const ticketsDsId = await getDataSourceId(ticketsDbId);

  // Status options are currently legacy (Proposed/Accepted/etc.).
  // We do not mutate select options here.

  const planPage = await upsertPlan({ projectsDbId, projectsDsId, input });

  const planStatus = getSelectName(planPage, 'Plan Status');
  if (!force && planStatus !== 'Ready for Decomposition') {
    console.log(JSON.stringify({ ok: true, skipped: true, reason: 'plan_not_ready', planStatus, planUrl: planPage.url }, null, 2));
    return;
  }

  const compileResult = await upsertTasks({
    ticketsDbId,
    ticketsDsId,
    planPageId: planPage.id,
    input,
  });

  // Stamp plan metadata
  await notion.pages.update({
    page_id: planPage.id,
    properties: {
      'Last Compiled At': dateISO(nowISO()),
      'Plan Status': select('Active'),
    },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        file: filePath,
        plan: { id: planPage.id, url: planPage.url },
        compileResult,
        ts: nowISO(),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
