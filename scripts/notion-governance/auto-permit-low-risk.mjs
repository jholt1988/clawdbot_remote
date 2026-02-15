import 'dotenv/config';
import { Client } from '@notionhq/client';
import { queryAll } from '../notion-shared/query-all.mjs';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing }, null, 2));
    process.exit(1);
  }
}

requireEnv(['NOTION_API_KEY', 'NOTION_EXECUTION_REQUESTS_DB_ID', 'NOTION_EXECUTION_PERMITS_DB_ID']);

const REQUESTS_DB = process.env.NOTION_EXECUTION_REQUESTS_DB_ID;
const PERMITS_DB = process.env.NOTION_EXECUTION_PERMITS_DB_ID;

// Fetch permits DB schema once so we can safely write only properties that exist.
const permitsDb = await notion.databases.retrieve({ database_id: PERMITS_DB });
const permitPropExists = (name) => !!permitsDb.properties?.[name];

const PAGE_SIZE = Number(process.env.NOTION_PAGE_SIZE || 50);

// Safety defaults: only auto-permit for these target systems.
const AUTO_PERMIT_TARGET_SYSTEMS = (process.env.AUTO_PERMIT_TARGET_SYSTEMS || 'local,notion')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const AUTO_QUEUE = String(process.env.AUTO_PERMIT_AUTO_QUEUE || 'false').toLowerCase() === 'true';

function getSelectName(prop) {
  return prop?.select?.name ?? null;
}

function getCheckbox(prop) {
  return !!prop?.checkbox;
}

function getRelation(prop) {
  return Array.isArray(prop?.relation) ? prop.relation : [];
}

function nowIso() {
  return new Date().toISOString();
}

function addMinutesIso(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

let created = 0;
let skipped = 0;

// Candidate filter (best-effort):
// - Risk Level == Low
// - Dry Run == false
// - Permit Active == false (if present)
// - Status == Submitted (if present)
const filter = {
  and: [
    { property: 'Risk Level', select: { equals: 'Low' } },
    { property: 'Dry Run', checkbox: { equals: false } },
  ],
};

for await (const req of queryAll(notion, REQUESTS_DB, { filter, page_size: PAGE_SIZE })) {
  const props = req.properties || {};

  const risk = getSelectName(props['Risk Level']);
  const dryRun = getCheckbox(props['Dry Run']);
  const targetSystem = getSelectName(props['Target System']);

  if (risk !== 'Low' || dryRun) {
    skipped++;
    continue;
  }

  if (!AUTO_PERMIT_TARGET_SYSTEMS.includes(String(targetSystem || ''))) {
    skipped++;
    continue;
  }

  // If a rollup/formula exists, use it as a hard no.
  const permitActive = props['Permit Active']?.formula?.boolean ?? props['Permit Active']?.rollup?.number > 0;
  if (permitActive) {
    skipped++;
    continue;
  }

  // If Status exists, require Submitted to prevent auto-permitting drafts.
  const status = getSelectName(props['Status']);
  if (status && status !== 'Submitted') {
    skipped++;
    continue;
  }

  // If there is already a Permit relation, don't create another.
  const existingPermits = getRelation(props['Permit']);
  if (existingPermits.length > 0) {
    skipped++;
    continue;
  }

  // Create a permit scoped to this request.
  const properties = {
    // relation
    'Execution Request': { relation: [{ id: req.id }] },

    // state
    Status: { select: { name: 'Approved' } },
    'Approved Mode': { select: { name: 'non-dry-run' } },

    // queue controls (optional)
    ...(AUTO_QUEUE
      ? {
          'Queue Requested': { checkbox: true },
          'Queue Requested At': { date: { start: nowIso() } },
          'Queued/Processed': { checkbox: false },
        }
      : {}),
  };

  // verification metadata (optional – only set if properties exist)
  if (permitPropExists('Risk Level Confirmed')) {
    properties['Risk Level Confirmed'] = { select: { name: 'Low' } };
  }
  if (permitPropExists('Rollback Verified')) {
    properties['Rollback Verified'] = { checkbox: true };
  }
  if (permitPropExists('Approved At')) {
    properties['Approved At'] = { date: { start: nowIso() } };
  }
  if (permitPropExists('Expires At')) {
    properties['Expires At'] = { date: { start: addMinutesIso(30) } };
  }

  await notion.pages.create({
    parent: { database_id: PERMITS_DB },
    properties,
  });

  created++;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      created,
      skipped,
      auto_queue: AUTO_QUEUE,
      allowed_target_systems: AUTO_PERMIT_TARGET_SYSTEMS,
    },
    null,
    2,
  ),
);
