import 'dotenv/config';
import crypto from 'node:crypto';
import { Client } from '@notionhq/client';
import { connection } from './infra/queue.mjs';

// Lifetime logging for a Ticket.
//
// Goal: append explicit log lines across the lifetime of a task without spamming.
// Approach:
// - Compute a fingerprint of key state (status/team/risk + dep counts)
// - Store last fingerprint in Redis
// - Only append a new log line when the fingerprint changes
//
// Properties assumed on Tickets DB:
// - Status (select)
// - Team (select) [optional]
// - Risk Flag (select)
// - Dependency (relation)
// - Blocking (relation)
// - Logs (rich_text) or Notes/Log (rich_text)

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
        await sleep(baseDelayMs * Math.pow(2, i));
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
  if (page?.properties?.Logs?.type === 'rich_text') return 'Logs';
  if (page?.properties?.['Notes/Log']?.type === 'rich_text') return 'Notes/Log';
  return 'Logs';
}

function sha1(s) {
  return crypto.createHash('sha1').update(String(s)).digest('hex');
}

async function getRelatedCounts(relatedIds) {
  let open = 0;
  let blocked = 0;
  for (const id of relatedIds) {
    const p = await withRetry(() => notion.pages.retrieve({ page_id: id }));
    const st = getSelectName(p.properties?.Status);
    if (st && st !== 'Done') {
      open++;
      if (st === 'Blocked') blocked++;
    }
    await sleep(80);
  }
  return { open, blocked };
}

export async function appendLifecycleLogIfChanged({ ticketId, reason = 'ticket_updated' }) {
  if (!process.env.NOTION_API_KEY) throw new Error('Missing NOTION_API_KEY');
  if (!process.env.REDIS_URL) throw new Error('Missing REDIS_URL');

  const page = await withRetry(() => notion.pages.retrieve({ page_id: ticketId }));

  const status = getSelectName(page.properties?.Status) || 'Unknown';
  const team = getSelectName(page.properties?.Team) || '';
  const risk = getSelectName(page.properties?.['Risk Flag']) || '';

  const depIds = getRelIds(page, 'Dependency');
  const blkIds = getRelIds(page, 'Blocking');
  const relatedIds = Array.from(new Set([...depIds, ...blkIds]));

  // Related counts are the expensive part; but this is the whole point of lifetime clarity.
  const { open: openRelatedCount, blocked: blockedInGraphCount } = await getRelatedCounts(relatedIds);

  const fingerprint = sha1(JSON.stringify({ status, team, risk, openRelatedCount, blockedInGraphCount }));
  const key = `ticket:lifecycle:fingerprint:${ticketId}`;
  const prev = await connection.get(key);

  if (prev === fingerprint) {
    return { ok: true, ticketId, appended: false, reason: 'no_change', status, team, risk, openRelatedCount, blockedInGraphCount };
  }

  const logsName = logsPropName(page);
  const logsPlain = getRichTextPlain(page.properties?.[logsName]);

  const line = `[LIFECYCLE] ${nowISO()} reason=${reason} status=${status}${team ? ` team=${team}` : ''}${risk ? ` risk=${risk}` : ''} open_related=${openRelatedCount} blocked_in_graph=${blockedInGraphCount}`;
  const nextLogs = (logsPlain + (logsPlain ? '\n' : '') + line).slice(0, 1900);

  await withRetry(() => notion.pages.update({
    page_id: ticketId,
    properties: {
      [logsName]: makeRichText(nextLogs),
    },
  }));

  // Persist new fingerprint.
  await connection.set(key, fingerprint);

  return { ok: true, ticketId, appended: true, status, team, risk, openRelatedCount, blockedInGraphCount };
}
