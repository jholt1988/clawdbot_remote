#!/usr/bin/env node
/**
 * WIP Reset (safe bulk)
 *
 * Resets tasks under a specific Plan/Project relation back to "Accepted" (Ready),
 * clearing WIP fields so the dispatcher can start fresh.
 *
 * Default behavior:
 * - Only affects Tickets with Status == "In Progress".
 * - Only affects tasks related to the given Project (Plan page id).
 * - Appends an audit line to Notes/Log.
 *
 * Usage:
 *   node scripts/notion-governance/wip-reset.mjs --plan-page-id <pageId>
 *   node scripts/notion-governance/wip-reset.mjs --plan-page-id <pageId> --dry-run
 */

import 'dotenv/config';
import crypto from 'node:crypto';
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

function rt(text) {
  return { rich_text: [{ text: { content: String(text).slice(0, 1900) } }] };
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function getTicketsDataSourceId(ticketsDbId) {
  const db = await notion.databases.retrieve({ database_id: ticketsDbId });
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error('Tickets data_source_id missing');
  return dsId;
}

function getSelectName(page, prop) {
  return page?.properties?.[prop]?.select?.name ?? null;
}

function getNotesPlain(page) {
  const rtArr = page?.properties?.['Notes/Log']?.rich_text;
  if (!Array.isArray(rtArr)) return '';
  return rtArr.map((r) => r.plain_text).join('');
}

async function* queryAll(dsId, query) {
  let cursor = undefined;
  while (true) {
    const resp = await notion.dataSources.query({
      data_source_id: dsId,
      page_size: 100,
      start_cursor: cursor,
      ...query,
    });
    for (const r of resp.results || []) yield r;
    if (!resp.has_more) break;
    cursor = resp.next_cursor;
  }
}

async function main() {
  requireEnv(['NOTION_API_KEY', 'NOTION_TICKETS_DB_ID']);

  const dryRun = argFlag('--dry-run');
  const planPageId = argValue('--plan-page-id');
  if (!planPageId) {
    console.error('Missing --plan-page-id');
    process.exit(2);
  }

  const ticketsDbId = process.env.NOTION_TICKETS_DB_ID;
  const dsId = await getTicketsDataSourceId(ticketsDbId);
  const auditToken = crypto.randomBytes(6).toString('hex');

  const filter = {
    and: [
      { property: 'Project', relation: { contains: planPageId } },
      { property: 'Status', select: { equals: 'In Progress' } },
    ],
  };

  const targets = [];
  for await (const page of queryAll(dsId, { filter })) {
    targets.push({ id: page.id, name: page.properties?.Name?.title?.[0]?.plain_text ?? '' });
  }

  const summary = { ok: true, dryRun, planPageId, auditToken, found: targets.length, updated: 0, pages: targets };

  if (dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  for (const t of targets) {
    const page = await notion.pages.retrieve({ page_id: t.id });
    const prev = getSelectName(page, 'Status');
    const notes = getNotesPlain(page);
    const line = `[WIP-RESET] ${nowISO()} token=${auditToken} status:${prev} -> Accepted`;
    const merged = (notes + (notes ? '\n' : '') + line).slice(0, 1900);

    await notion.pages.update({
      page_id: t.id,
      properties: {
        Status: { select: { name: 'Accepted' } },
        'Assigned At': { date: null },
        'Started At': { date: null },
        'Blocked Reason': rt(''),
        'WIP Slot Token': rt(''),
        'Notes/Log': rt(merged),
      },
    });

    summary.updated += 1;
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
