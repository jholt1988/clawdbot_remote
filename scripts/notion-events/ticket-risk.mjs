import 'dotenv/config';
import { Client } from '@notionhq/client';

// Ticket Risk Flag enforcement
// - Risk Flag is automation-only (snap-back)
// - Risk Flag = High when ANY open deps/blockers exist (Status != Done)
// - Append BLOCKED_DEP_IN_GRAPH once when any open related is Blocked
// - Never propagate Status

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function nowISO() {
  return new Date().toISOString();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, { tries = 6, baseDelayMs = 500 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const code = e?.code || e?.body?.code;
      if (code === 'rate_limited') {
        const delay = baseDelayMs * Math.pow(2, i);
        await sleep(delay);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

function getSelectName(prop) {
  return prop?.select?.name ?? null;
}

function getRelIds(page, propName) {
  const rel = page?.properties?.[propName]?.relation;
  if (!Array.isArray(rel)) return [];
  return rel.map((r) => r.id);
}

function getRichTextPlain(prop) {
  const arr = prop?.rich_text;
  if (!Array.isArray(arr)) return '';
  return arr.map((r) => r.plain_text).join('');
}

function makeRichText(text) {
  return { rich_text: [{ text: { content: String(text).slice(0, 1900) } }] };
}

function logsPropName(page) {
  // Support either schema name.
  if (page?.properties?.Logs?.type === 'rich_text') return 'Logs';
  if (page?.properties?.['Notes/Log']?.type === 'rich_text') return 'Notes/Log';
  // fall back to Logs
  return 'Logs';
}

async function getTicketsDataSourceId(ticketsDbId) {
  const db = await withRetry(() => notion.databases.retrieve({ database_id: ticketsDbId }));
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error('Tickets data_source_id missing');
  return dsId;
}

async function queryParentsByChild(dsId, childId) {
  const parents = new Map();
  // Dependency contains child
  for (const relProp of ['Dependency', 'Blocking']) {
    const resp = await withRetry(() =>
      notion.dataSources.query({
        data_source_id: dsId,
        page_size: 100,
        filter: { property: relProp, relation: { contains: childId } },
      }),
    );
    for (const r of resp.results || []) parents.set(r.id, r);
  }
  return Array.from(parents.values());
}

async function loadRelatedStatuses(relatedIds) {
  const results = [];
  for (const id of relatedIds) {
    const p = await withRetry(() => notion.pages.retrieve({ page_id: id }));
    const status = getSelectName(p.properties?.Status);
    results.push({ id, status });
    // small pacing to reduce 429s
    await sleep(120);
  }
  return results;
}

export async function recomputeTicketRisk({ ticketId }) {
  if (!process.env.NOTION_TICKETS_DB_ID) throw new Error('Missing env NOTION_TICKETS_DB_ID');

  const ticket = await withRetry(() => notion.pages.retrieve({ page_id: ticketId }));

  const depIds = getRelIds(ticket, 'Dependency');
  const blkIds = getRelIds(ticket, 'Blocking');
  const relatedIds = Array.from(new Set([...depIds, ...blkIds]));

  // Open related = status != Done
  const relatedStatuses = await loadRelatedStatuses(relatedIds);
  const open = relatedStatuses.filter((r) => r.status && r.status !== 'Done');
  const blockedInGraph = open.filter((r) => r.status === 'Blocked');

  const openCount = open.length;
  const shouldHigh = openCount > 0;

  const riskProp = 'Risk Flag';
  const desiredRisk = shouldHigh ? 'High' : 'Low';

  const logsName = logsPropName(ticket);
  const logsPlain = getRichTextPlain(ticket.properties?.[logsName]);
  const needsBlockedTag = blockedInGraph.length > 0 && !logsPlain.includes('BLOCKED_DEP_IN_GRAPH');

  const updates = { properties: {} };

  // Always snap to desired risk (automation-only)
  updates.properties[riskProp] = { select: { name: desiredRisk } };

  if (needsBlockedTag) {
    const appended = (logsPlain + (logsPlain ? '\n' : '') + 'BLOCKED_DEP_IN_GRAPH').slice(0, 1900);
    updates.properties[logsName] = makeRichText(appended).rich_text ? makeRichText(appended) : makeRichText(appended);
  }

  // If no updates needed, still return status
  const currentRisk = getSelectName(ticket.properties?.[riskProp]);
  const willChangeRisk = currentRisk !== desiredRisk;

  if (willChangeRisk || needsBlockedTag) {
    await withRetry(() => notion.pages.update({ page_id: ticketId, properties: updates.properties }));
  }

  return {
    ok: true,
    ticketId,
    desiredRisk,
    currentRisk,
    openRelatedCount: openCount,
    blockedInGraphCount: blockedInGraph.length,
    taggedBlockedDep: needsBlockedTag,
    ts: nowISO(),
  };
}

export async function recomputeParentsForChild({ childTicketId }) {
  const dsId = await getTicketsDataSourceId(process.env.NOTION_TICKETS_DB_ID);
  const parents = await queryParentsByChild(dsId, childTicketId);
  const out = { ok: true, childTicketId, parents: [], ts: nowISO() };

  for (const p of parents) {
    const r = await recomputeTicketRisk({ ticketId: p.id });
    out.parents.push(r);
    await sleep(150);
  }

  return out;
}
