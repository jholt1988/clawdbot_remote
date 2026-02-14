import 'dotenv/config';
import { Client } from '@notionhq/client';
import { executionQueue } from './infra/queue.mjs';
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

async function tick() {
  let enqueued = 0;
  let skipped = 0;

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

    await notion.pages.update({
      page_id: permit.id,
      properties: {
        [P.permitQueuedProcessed]: { checkbox: true },
        [P.permitQueueRequested]: { checkbox: false },
      },
    });

    enqueued++;
  }

  if (enqueued || skipped) {
    console.log(JSON.stringify({ ok: true, enqueued, skipped, ts: new Date().toISOString() }, null, 2));
  }
}

const interval = Number(process.env.POLL_INTERVAL_MS || 2000);
for (;;) {
  await tick();
  await new Promise((r) => setTimeout(r, interval));
}
