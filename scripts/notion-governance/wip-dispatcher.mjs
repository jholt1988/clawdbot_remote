#!/usr/bin/env node
/**
 * WIP Dispatcher (deterministic)
 *
 * - Enforces WIP limits at Ready -> In Progress transition
 * - Claims tasks fairly per team
 * - Uses a short redlock per team to avoid double-claim
 *
 * Additive-only schema requirements:
 * - Tickets DB has: Team, Status, Dependency, Created time, Notes/Log
 * - WIP fields: Assigned At, Started At, Blocked Reason, WIP Slot Token
 */

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Client } from '@notionhq/client';

import { connection } from '../notion-events/infra/queue.mjs';
import { buildRedlock } from '../notion-events/infra/lock.mjs';

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

function nowISO() {
  return new Date().toISOString();
}

function token() {
  return crypto.randomBytes(8).toString('hex');
}

function rt(text) {
  return { rich_text: [{ text: { content: String(text).slice(0, 1900) } }] };
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: process.env.NOTION_SCHEMA_VERSION || undefined,
});

const redlock = buildRedlock(connection);

async function getTicketsDataSourceId(ticketsDbId) {
  const db = await notion.databases.retrieve({ database_id: ticketsDbId });
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error('Tickets data_source_id missing');
  return dsId;
}

async function loadCapacity() {
  const repoRoot = process.cwd();
  const p = path.join(repoRoot, 'governance/pms/team-capacity.json');
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function countWip(dsId, team, statuses) {
  const resp = await notion.dataSources.query({
    data_source_id: dsId,
    page_size: 100,
    filter: {
      and: [
        { property: 'Team', select: { equals: team } },
        { property: 'Status', select: { in: statuses } },
      ],
    },
  });
  return resp.results.length;
}

async function listReady(dsId, team) {
  const resp = await notion.dataSources.query({
    data_source_id: dsId,
    page_size: 50,
    filter: {
      and: [
        { property: 'Team', select: { equals: team } },
        { property: 'Status', select: { equals: 'Ready' } },
      ],
    },
    sorts: [
      { property: 'Created time', direction: 'ascending' },
    ],
  });
  return resp.results;
}

function getRelIds(page, prop) {
  const rel = page.properties?.[prop]?.relation;
  if (!Array.isArray(rel)) return [];
  return rel.map((r) => r.id);
}

function getSelect(page, prop) {
  return page.properties?.[prop]?.select?.name ?? null;
}

async function depsSatisfied(depPageIds) {
  if (!depPageIds.length) return true;
  // Minimal: all dependencies must be Status == Done.
  for (const id of depPageIds) {
    const p = await notion.pages.retrieve({ page_id: id });
    const st = getSelect(p, 'Status');
    if (st !== 'Done') return false;
  }
  return true;
}

async function claimTask(pageId, { wipToken, note }) {
  const existing = await notion.pages.retrieve({ page_id: pageId });
  const logsPlain = (existing.properties?.['Notes/Log']?.rich_text || []).map((r) => r.plain_text).join('');
  const appended = (logsPlain + `\n${note}`).slice(0, 1900);

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: 'In Progress' } },
      'Assigned At': { date: { start: nowISO() } },
      'Started At': { date: { start: nowISO() } },
      'WIP Slot Token': rt(wipToken),
      'Blocked Reason': rt(''),
      'Notes/Log': rt(appended),
    },
  });
}

async function main() {
  requireEnv(['NOTION_API_KEY', 'NOTION_TICKETS_DB_ID', 'REDIS_URL']);

  const { TEAM_CAPACITY, WIP_POLICY } = await loadCapacity();
  const dsId = await getTicketsDataSourceId(process.env.NOTION_TICKETS_DB_ID);

  const summary = { ok: true, ts: nowISO(), claimed: [], skipped: [] };

  for (const [team, cap] of Object.entries(TEAM_CAPACITY)) {
    const max = cap.max_in_progress;
    const lockKey = `lock:team:${team}:wip_claim`;

    let lock;
    try {
      lock = await redlock.acquire([lockKey], 30_000);
    } catch (e) {
      summary.skipped.push({ team, reason: 'lock_busy', error: e?.message || String(e) });
      continue;
    }

    try {
      const wip = await countWip(dsId, team, WIP_POLICY.count_statuses);
      if (wip >= max) {
        summary.skipped.push({ team, reason: 'at_capacity', wip, max });
        continue;
      }

      const ready = await listReady(dsId, team);
      let slots = max - wip;

      for (const page of ready) {
        if (slots <= 0) break;

        const deps = getRelIds(page, 'Dependency');
        const ok = await depsSatisfied(deps);
        if (!ok) continue;

        const wipToken = token();
        const note = `[WIP] Claimed by dispatcher at ${nowISO()} token=${wipToken}`;
        await claimTask(page.id, { wipToken, note });
        summary.claimed.push({ team, taskPageId: page.id, wipToken });
        slots -= 1;
      }
    } finally {
      try { await lock.release(); } catch {}
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
