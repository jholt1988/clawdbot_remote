#!/usr/bin/env node
/**
 * PMS Notion schema sync
 *
 * Align existing Projects/Tickets/Exec Requests/Permits DBs with the
 * `notion_schema_recommendation` fields captured in governance/pms/*.
 *
 * Policy: additive-only (no deletions). Safe to re-run.
 */

import 'dotenv/config';
import { Client } from '@notionhq/client';

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

// Do not pin an old Notion API version; this workspace uses dataSources endpoints.
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function getDb(database_id) {
  return notion.databases.retrieve({ database_id });
}

async function getDataSourceId(database_id) {
  const db = await getDb(database_id);
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error(`Missing data_source_id for database ${database_id}`);
  return dsId;
}

async function getDataSource(dsId) {
  return notion.dataSources.retrieve({ data_source_id: dsId });
}

function hasProp(ds, name) {
  return !!ds.properties?.[name];
}

async function ensureProps(database_id, propsToAdd) {
  const dsId = await getDataSourceId(database_id);
  const ds = await getDataSource(dsId);

  const add = {};
  for (const [name, schema] of Object.entries(propsToAdd)) {
    if (!hasProp(ds, name)) add[name] = schema;
  }
  if (Object.keys(add).length === 0) return { changed: false, added: [] };

  await notion.dataSources.update({
    data_source_id: dsId,
    properties: add,
  });

  return { changed: true, added: Object.keys(add) };
}

async function main() {
  requireEnv([
    'NOTION_API_KEY',
    'NOTION_PROJECTS_DB_ID',
    'NOTION_TICKETS_DB_ID',
    'NOTION_EXECUTION_REQUESTS_DB_ID',
    'NOTION_EXECUTION_PERMITS_DB_ID',
  ]);

  const projectsDb = process.env.NOTION_PROJECTS_DB_ID;
  const ticketsDb = process.env.NOTION_TICKETS_DB_ID;
  const execDb = process.env.NOTION_EXECUTION_REQUESTS_DB_ID;
  const permitsDb = process.env.NOTION_EXECUTION_PERMITS_DB_ID;

  // Note: relation-property schema creation via dataSources.update requires more metadata
  // (single_property/dual_property) than we want to hardcode. This script is additive-only
  // for non-relation properties.

  const results = [];

  // === Projects DB as Plan DB ===
  results.push({
    db: 'Projects',
    ...(await ensureProps(projectsDb, {
      // PlanSpec JSON (text)
      'PlanSpec JSON': { rich_text: {} },
      // Plan Status (select)
      'Plan Status': {
        select: {
          options: [
            { name: 'Draft', color: 'gray' },
            { name: 'Ready for Decomposition', color: 'yellow' },
            { name: 'Active', color: 'green' },
            { name: 'Complete', color: 'blue' },
          ],
        },
      },
      // Milestone (select)
      Milestone: {
        select: {
          options: [
            { name: 'M0 — Foundation Ready', color: 'gray' },
            { name: 'M1 — Full Demo Path', color: 'yellow' },
            { name: 'M2 — Hardening', color: 'orange' },
            { name: 'M3 — Sellable Demo', color: 'green' },
          ],
        },
      },
      // Last Compiled At (date)
      'Last Compiled At': { date: {} },
      // Plan ID (text)
      'Plan ID': { rich_text: {} },
    })),
  });

  // === Tickets DB as Tasks DB ===
  results.push({
    db: 'Tickets',
    ...(await ensureProps(ticketsDb, {
      Workstream: {
        select: {
          options: [
            { name: 'WS_E', color: 'gray' },
            { name: 'WS_A', color: 'blue' },
            { name: 'WS_PAY', color: 'purple' },
            { name: 'WS_PRIC', color: 'yellow' },
            { name: 'WS_B', color: 'red' },
            { name: 'WS_C', color: 'green' },
            { name: 'WS_D', color: 'orange' },
            { name: 'WS_F', color: 'pink' },
          ],
        },
      },
      Epic: { rich_text: {} },
      Team: {
        select: {
          options: [
            { name: 'PMS_DEV', color: 'blue' },
            { name: 'BUILD', color: 'orange' },
            { name: 'BUSINESS', color: 'yellow' },
            { name: 'MARKETING', color: 'purple' },
            { name: 'LIBRARY', color: 'gray' },
            { name: 'R_AND_D', color: 'green' },
            { name: 'PANEL', color: 'red' },
            { name: 'QA', color: 'pink' },
          ],
        },
      },
      'QA Team': {
        select: {
          options: [
            { name: 'QA', color: 'pink' },
            { name: 'PANEL', color: 'red' },
          ],
        },
      },
      Risk: {
        select: {
          options: [
            { name: 'Low', color: 'green' },
            { name: 'Medium', color: 'yellow' },
            { name: 'High', color: 'red' },
          ],
        },
      },
      'Acceptance Criteria': { rich_text: {} },
      'Artifacts Expected': { rich_text: {} },
      'External Execution Needed': { checkbox: {} },

      // WIP enforcement fields
      'Assigned At': { date: {} },
      'Started At': { date: {} },
      'Blocked Reason': { rich_text: {} },
      'WIP Slot Token': { rich_text: {} },
      // Execution Request / Permit relations are not created by this script.

      'QA Verdict': {
        select: {
          options: [
            { name: 'Pass', color: 'green' },
            { name: 'Fail', color: 'red' },
          ],
        },
      },
      'ERCS Code': { rich_text: {} },
      'Notes/Log': { rich_text: {} },
    })),
  });

  // === Exec Requests DB ===
  results.push({
    db: 'ExecRequests',
    ...(await ensureProps(execDb, {
      // Task relation is not created here (see note above).
      Logs: { rich_text: {} },
    })),
  });

  // === Permits DB (minimal additive) ===
  results.push({
    db: 'Permits',
    ...(await ensureProps(permitsDb, {
      'Permit ID': { rich_text: {} },
    })),
  });

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
