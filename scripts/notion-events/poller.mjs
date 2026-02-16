import 'dotenv/config';
import { Client } from '@notionhq/client';
import { executionQueue, governanceQueue } from './infra/queue.mjs';
import { notionProps } from './notion-props.mjs';
import { getSelectName, getCheckbox } from './notion-helpers.mjs';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  // Runtime query may use dataSources endpoints depending on @notionhq/client.
  // Do not force an old Notion API version here.
});
const P = notionProps();

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing }, null, 2));
    process.exit(1);
  }
}

requireEnv(['NOTION_API_KEY', 'NOTION_EXECUTION_PERMITS_DB_ID']);

const PAGE_SIZE = Number(process.env.NOTION_PAGE_SIZE || 50);

import { queryAll } from '../notion-shared/query-all.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

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

const STATE_DIR = path.join(process.cwd(), 'scripts/notion-events/state');
const TICKETS_STATE_PATH = path.join(STATE_DIR, 'tickets-poller.json');

async function readTicketsState() {
  try {
    const raw = await fs.readFile(TICKETS_STATE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { lastEditedISO: null };
  }
}

async function writeTicketsState(state) {
  await fs.mkdir(STATE_DIR, { recursive: true });
  await fs.writeFile(TICKETS_STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

async function tick() {
  let enqueued = 0;
  let skipped = 0;
  let ticketEvents = 0;

  // Filter: Status == Approved AND Queue Requested == true AND Queued/Processed != true
  const filter = {
    and: [
      { property: P.permitStatus, select: { equals: 'Approved' } },
      { property: P.permitQueueRequested, checkbox: { equals: true } },
      { property: P.permitQueuedProcessed, checkbox: { does_not_equal: true } },
    ],
  };

  for await (const permit of queryAll(notion, process.env.NOTION_EXECUTION_PERMITS_DB_ID, { filter, page_size: PAGE_SIZE })) {
    const status = getSelectName(permit.properties[P.permitStatus]);
    const queueRequested = getCheckbox(permit.properties[P.permitQueueRequested]);
    const already = getCheckbox(permit.properties[P.permitQueuedProcessed]);

    if (status !== 'Approved' || !queueRequested || already) {
      skipped++;
      continue;
    }

    await executionQueue.add(
      'execute-permit',
      { permitId: permit.id },
      {
        jobId: permit.id,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    await withRetry(() =>
      notion.pages.update({
        page_id: permit.id,
        properties: {
          [P.permitQueuedProcessed]: { checkbox: true },
          [P.permitQueueRequested]: { checkbox: false },
        },
      }),
    );

    enqueued++;
    await sleep(120);
  }

  // Ticket governance routing via poller (no external webhook)
  if (process.env.NOTION_TICKETS_DB_ID) {
    const st = await readTicketsState();
    const since = st.lastEditedISO || new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Notion database query timestamp filter
    const ticketFilter = {
      timestamp: 'last_edited_time',
      last_edited_time: { on_or_after: since },
    };

    // Limit per tick to avoid rate limits; we only need to enqueue signals.
    let seen = 0;
    const maxPerTick = Number(process.env.TICKETS_MAX_PER_TICK || 25);

    for await (const t of queryAll(notion, process.env.NOTION_TICKETS_DB_ID, { filter: ticketFilter, page_size: 25 })) {
      if (seen >= maxPerTick) break;
      const lastEdited = t.last_edited_time || new Date().toISOString();

      await governanceQueue.add(
        'ticket-updated',
        { ticketId: t.id },
        {
          jobId: `poll_${t.id}_${String(lastEdited).replace(/[:]/g, '_')}`.slice(0, 180),
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
      ticketEvents++;
      seen++;
      await sleep(80);
    }

    await writeTicketsState({ lastEditedISO: new Date().toISOString() });
  }

  if (enqueued || skipped || ticketEvents) {
    console.log(JSON.stringify({ ok: true, enqueued, skipped, ticketEvents, ts: new Date().toISOString() }, null, 2));
  }
}

const interval = Number(process.env.POLL_INTERVAL_MS || 2000);
for (;;) {
  await tick();
  await new Promise((r) => setTimeout(r, interval));
}
