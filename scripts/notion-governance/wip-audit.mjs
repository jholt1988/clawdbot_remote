#!/usr/bin/env node
/**
 * WIP Audit + Auto-Reset
 *
 * Ensures Tickets with Status == "In Progress" are truly in progress.
 *
 * Rules (MVP):
 * - If Started At is empty OR WIP Slot Token is empty => auto-reset to Accepted
 * - Append audit note to Notes/Log
 *
 * Scope:
 * - If --plan-page-id is provided: only tickets whose Project relation contains that page.
 * - Otherwise: audits all tickets (not recommended).
 *
 * Usage:
 *   node scripts/notion-governance/wip-audit.mjs --plan-page-id <planPageId>
 *   node scripts/notion-governance/wip-audit.mjs --plan-page-id <planPageId> --dry-run
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

function getDate(page, prop) {
  return page?.properties?.[prop]?.date?.start ?? null;
}

function getTextPlain(page, prop) {
  const rtArr = page?.properties?.[prop]?.rich_text;
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

  const ticketsDbId = process.env.NOTION_TICKETS_DB_ID;
  const dsId = await getTicketsDataSourceId(ticketsDbId);
  const auditToken = crypto.randomBytes(6).toString('hex');

  const filterAnd = [
    { property: 'Status', select: { equals: 'In Progress' } },
  ];

  if (planPageId) {
    filterAnd.unshift({ property: 'Project', relation: { contains: planPageId } });
  }

  const filter = { and: filterAnd };

  const candidates = [];
  for await (const page of queryAll(dsId, { filter })) {
    candidates.push(page);
  }

  const report = {
    ok: true,
    ts: nowISO(),
    dryRun,
    planPageId: planPageId || null,
    auditToken,
    scanned: candidates.length,
    reset: [],
    kept: [],
  };

  for (const page of candidates) {
    const startedAt = getDate(page, 'Started At');
    const tokenText = getTextPlain(page, 'WIP Slot Token');

    const missing = [];
    if (!startedAt) missing.push('Started At');
    if (!tokenText.trim()) missing.push('WIP Slot Token');

    if (missing.length === 0) {
      report.kept.push({ id: page.id, name: page.properties?.Name?.title?.[0]?.plain_text ?? '' });
      continue;
    }

    report.reset.push({
      id: page.id,
      name: page.properties?.Name?.title?.[0]?.plain_text ?? '',
      missing,
    });

    if (dryRun) continue;

    const full = await notion.pages.retrieve({ page_id: page.id });
    const notes = getTextPlain(full, 'Notes/Log');
    const line = `[WIP-AUDIT] ${nowISO()} token=${auditToken} auto-reset In Progress -> Accepted (missing: ${missing.join(', ')})`;
    const merged = (notes + (notes ? '\n' : '') + line).slice(0, 1900);

    await notion.pages.update({
      page_id: page.id,
      properties: {
        Status: { select: { name: 'Accepted' } },
        'Blocked Reason': rt(''),
        'Notes/Log': rt(merged),
      },
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
