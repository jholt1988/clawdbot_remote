#!/usr/bin/env node
/**
 * Create an Execution Request + Execution Permit in Notion, auto-approve + queue.
 *
 * Usage:
 *   node scripts/notion-governance/exec-run.mjs tenant-inspections-backend --branch ops --dry-run=false
 */

import 'dotenv/config';
import { notion, ENV, requireEnv } from './_notion.mjs';
import { notionProps } from '../notion-events/notion-props.mjs';

const P = notionProps();

requireEnv([
  'NOTION_API_KEY',
  'NOTION_EXECUTION_REQUESTS_DB_ID',
  'NOTION_EXECUTION_PERMITS_DB_ID',
]);

const argv = process.argv.slice(2);
const jobKey = argv[0];
if (!jobKey || jobKey.startsWith('-')) {
  console.error('Missing jobKey. Example: tenant-inspections-backend');
  process.exit(2);
}

function getFlag(name, def = null) {
  const idx = argv.indexOf(name);
  if (idx === -1) return def;
  const val = argv[idx + 1];
  if (!val || val.startsWith('-')) return true;
  return val;
}

function parseBool(v, def) {
  if (v === null || v === undefined) return def;
  if (typeof v === 'boolean') return v;
  const s = String(v).toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(s)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(s)) return false;
  return def;
}

const branch = String(getFlag('--branch', 'ops'));
const dryRun = parseBool(getFlag('--dry-run', 'false'), false);
const targetSystem = String(getFlag('--target-system', 'local'));
const targetScopeId = String(getFlag('--target-scope-id', 'pms-master'));
const timeoutSeconds = Number(getFlag('--timeout', '1800'));

const JOBS = {
  'tenant-inspections-backend': {
    title: 'PMS Backend: Tenant inspection scoping + tenant complete (lock)',
    scriptPath: 'scripts/pms/tenant-inspections-backend.mjs',
    timeoutSeconds,
  },
  'tenant-inspections-frontend': {
    title: 'PMS Frontend: Tenant inspection pages (list + detail + complete)',
    scriptPath: 'scripts/pms/tenant-inspections-frontend.mjs',
    timeoutSeconds,
  },
};

const job = JOBS[jobKey];
if (!job) {
  console.error(`Unknown jobKey: ${jobKey}. Allowed: ${Object.keys(JOBS).join(', ')}`);
  process.exit(2);
}

async function getTitlePropName(databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const props = db.properties || {};
  for (const [name, def] of Object.entries(props)) {
    if (def.type === 'title') return name;
  }
  return 'Name';
}

function richText(str) {
  return { rich_text: [{ text: { content: String(str).slice(0, 1900) } }] };
}

function select(name) {
  return { select: { name } };
}

function checkbox(v) {
  return { checkbox: !!v };
}

function number(v) {
  return { number: Number(v) };
}

function relation(id) {
  return { relation: [{ id }] };
}

const reqTitleProp = await getTitlePropName(ENV.EXEC_DB);
const permitTitleProp = await getTitlePropName(ENV.PERMITS_DB);

// 1) Create Execution Request
const req = await notion.pages.create({
  parent: { database_id: ENV.EXEC_DB },
  properties: {
    [reqTitleProp]: { title: [{ text: { content: job.title } }] },

    [P.requestExecutionStatus]: select('Submitted'),
    [P.requestDryRun]: checkbox(dryRun),
    [P.requestTargetSystem]: select(targetSystem),
    [P.requestTargetScopeId]: richText(targetScopeId),
    [P.requestTargetBranch]: richText(branch),
    [P.requestTimeoutSeconds]: number(job.timeoutSeconds),
    [P.requestScriptPath]: richText(job.scriptPath),
  },
});

// 2) Create Permit (Approved + Queue Requested)
const permit = await notion.pages.create({
  parent: { database_id: ENV.PERMITS_DB },
  properties: {
    [permitTitleProp]: { title: [{ text: { content: `Permit — ${job.title}`.slice(0, 140) } }] },

    [P.permitExecutionRequest]: relation(req.id),
    [P.permitStatus]: select('Approved'),
    [P.permitQueueRequested]: checkbox(true),
  },
});

// 3) Link back: Request → Execution Permit (if the property exists in DB)
try {
  await notion.pages.update({
    page_id: req.id,
    properties: {
      'Execution Permit': relation(permit.id),
    },
  });
} catch {
  // If the Request DB doesn't have a reverse relation called "Execution Permit", ignore.
}

const out = {
  ok: true,
  jobKey,
  requestId: req.id,
  permitId: permit.id,
  requestUrl: req.url,
  permitUrl: permit.url,
};

console.log(JSON.stringify(out, null, 2));
