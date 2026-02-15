import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing }, null, 2));
    process.exit(1);
  }
}

requireEnv([
  'NOTION_API_KEY',
  'NOTION_EXECUTION_REQUESTS_DB_ID',
  'NOTION_EXECUTION_PERMITS_DB_ID',
]);

const REQUESTS_DB = process.env.NOTION_EXECUTION_REQUESTS_DB_ID;
const PERMITS_DB = process.env.NOTION_EXECUTION_PERMITS_DB_ID;

const requestsDb = await notion.databases.retrieve({ database_id: REQUESTS_DB });
const permitsDb = await notion.databases.retrieve({ database_id: PERMITS_DB });

const reqHas = (name) => !!requestsDb.properties?.[name];
const permitHas = (name) => !!permitsDb.properties?.[name];

function rt(text) {
  return { rich_text: [{ type: 'text', text: { content: text } }] };
}

function title(text) {
  return { title: [{ type: 'text', text: { content: text } }] };
}

function select(name) {
  return { select: { name } };
}

function checkbox(value) {
  return { checkbox: !!value };
}

function number(value) {
  return { number: value };
}

function multiSelect(names) {
  return { multi_select: names.map((n) => ({ name: n })) };
}

async function createRequestTemplate(t) {
  const props = {};
  // Title property is always "Name" in Notion DBs, but we set it as the title field.
  props['Name'] = title(t.name);

  if (reqHas('Intent Summary')) props['Intent Summary'] = rt(t.intent);
  if (reqHas('Execution Type')) props['Execution Type'] = select(t.executionType ?? 'node');
  if (reqHas('Script Path')) props['Script Path'] = rt(t.scriptPath);
  if (reqHas('Dry Run')) props['Dry Run'] = checkbox(t.dryRun);
  if (reqHas('Timeout Seconds')) props['Timeout Seconds'] = number(t.timeoutSeconds);
  if (reqHas('Target System')) props['Target System'] = select(t.targetSystem);
  if (reqHas('Target Kind')) props['Target Kind'] = select(t.targetKind ?? t.targetSystem);
  if (reqHas('Target Scope ID')) props['Target Scope ID'] = rt(t.targetScopeId);
  if (reqHas('Target Branch')) props['Target Branch'] = rt(t.targetBranch ?? 'ops');
  if (reqHas('Risk Level')) props['Risk Level'] = select(t.riskLevel ?? 'Low');
  if (reqHas('Side Effects Declared')) props['Side Effects Declared'] = multiSelect(t.sideEffects ?? ['none']);
  if (reqHas('Rollback Plan')) props['Rollback Plan'] = rt(t.rollbackPlan ?? 'N/A');
  if (reqHas('Status')) props['Status'] = select(t.status ?? 'Draft');

  const page = await notion.pages.create({
    parent: { database_id: REQUESTS_DB },
    properties: props,
  });

  return page.id;
}

async function createPermitTemplate(t) {
  const props = {};
  props['Name'] = title(t.name);

  if (permitHas('Status')) props['Status'] = select(t.status ?? 'Draft');
  if (permitHas('Approved Mode')) props['Approved Mode'] = select(t.approvedMode ?? 'dry-run');

  // Queueing fields default off for templates.
  if (permitHas('Queue Requested')) props['Queue Requested'] = checkbox(false);
  if (permitHas('Queued/Processed')) props['Queued/Processed'] = checkbox(false);

  // GitHub enforcement fields (optional)
  if (t.github) {
    if (permitHas('Allowed Repos')) props['Allowed Repos'] = multiSelect(t.github.allowedRepos ?? []);
    if (permitHas('Allowed Branches')) props['Allowed Branches'] = multiSelect(t.github.allowedBranches ?? []);
    if (permitHas('Blocked Branches')) props['Blocked Branches'] = multiSelect(t.github.blockedBranches ?? []);
    if (permitHas('Allowed Actions')) props['Allowed Actions'] = multiSelect(t.github.allowedActions ?? []);
  }

  const page = await notion.pages.create({
    parent: { database_id: PERMITS_DB },
    properties: props,
  });

  return page.id;
}

const requestTemplates = [
  {
    name: 'TEMPLATE — PMS Dev: Convert Estimate → Maintenance (impl)',
    intent: 'Implements PM workflow: convert an estimate to maintenance requests (UI + API wiring).',
    executionType: 'node',
    scriptPath: 'scripts/pms/estimate-to-maintenance.mjs',
    dryRun: false,
    timeoutSeconds: 1200,
    targetSystem: 'local',
    targetScopeId: 'pms-master',
    targetBranch: 'ops',
    riskLevel: 'Low',
    sideEffects: ['writes_files'],
    rollbackPlan: 'Revert commit; do not delete data.',
    status: 'Draft',
  },
  {
    name: 'TEMPLATE — PMS Build: Estimate Export PDF (impl)',
    intent: 'Adds Export PDF button for estimate output (stub acceptable for demo).',
    executionType: 'node',
    scriptPath: 'scripts/pms/estimate-export-pdf.mjs',
    dryRun: false,
    timeoutSeconds: 1200,
    targetSystem: 'local',
    targetScopeId: 'pms-master',
    targetBranch: 'ops',
    riskLevel: 'Low',
    sideEffects: ['writes_files'],
    rollbackPlan: 'Revert commit.',
    status: 'Draft',
  },
  {
    name: 'TEMPLATE — Personal: PMS Daily Block — CI FAST',
    intent: 'Runs PMS CI FAST to keep iteration tight (type-check + build/test).',
    executionType: 'node',
    scriptPath: 'scripts/pms/ci-fast.mjs',
    dryRun: true,
    timeoutSeconds: 600,
    targetSystem: 'local',
    targetScopeId: 'pms-master',
    targetBranch: 'ops',
    riskLevel: 'Low',
    sideEffects: ['none'],
    rollbackPlan: 'N/A',
    status: 'Draft',
  },
  {
    name: 'TEMPLATE — Library: PMS Demo Talk Track (write/update)',
    intent: 'Writes/updates 2–3 min demo talk track (inspection → estimate → next steps).',
    executionType: 'node',
    scriptPath: 'scripts/pms/demo-talk-track.mjs',
    dryRun: false,
    timeoutSeconds: 600,
    targetSystem: 'local',
    targetScopeId: 'clawd/docs',
    targetBranch: 'ops',
    riskLevel: 'Low',
    sideEffects: ['writes_files'],
    rollbackPlan: 'Revert file changes.',
    status: 'Draft',
  },
  {
    name: 'TEMPLATE — R&D: Confidence calibration (rules)',
    intent: 'Implements deterministic confidence level + reason rules to make estimate output credible.',
    executionType: 'node',
    scriptPath: 'scripts/pms/confidence-calibration.mjs',
    dryRun: false,
    timeoutSeconds: 1200,
    targetSystem: 'local',
    targetScopeId: 'pms-master',
    targetBranch: 'ops',
    riskLevel: 'Low',
    sideEffects: ['writes_files'],
    rollbackPlan: 'Revert commit.',
    status: 'Draft',
  },
  {
    name: 'TEMPLATE — Panel: Strict-mode smoke run — CI FAST',
    intent: 'End-to-end template smoke run: CI FAST via permit queue.',
    executionType: 'node',
    scriptPath: 'scripts/pms/ci-fast.mjs',
    dryRun: true,
    timeoutSeconds: 600,
    targetSystem: 'local',
    targetScopeId: 'pms-master',
    targetBranch: 'ops',
    riskLevel: 'Low',
    sideEffects: ['none'],
    rollbackPlan: 'N/A',
    status: 'Draft',
  },
];

const permitTemplates = [
  {
    name: 'TEMPLATE — Permit: Local Dry-Run',
    status: 'Draft',
    approvedMode: 'dry-run',
  },
  {
    name: 'TEMPLATE — Permit: Local Non-Dry-Run',
    status: 'Draft',
    approvedMode: 'non-dry-run',
  },
  {
    name: 'TEMPLATE — Permit: GitHub Dry-Run (scope validate)',
    status: 'Draft',
    approvedMode: 'dry-run',
    github: {
      allowedRepos: [],
      allowedBranches: ['feature/*'],
      blockedBranches: ['main', 'production'],
      allowedActions: ['read'],
    },
  },
  {
    name: 'TEMPLATE — Permit: GitHub Push (feature/*)',
    status: 'Draft',
    approvedMode: 'non-dry-run',
    github: {
      allowedRepos: [],
      allowedBranches: ['feature/*'],
      blockedBranches: ['main', 'production'],
      allowedActions: ['push'],
    },
  },
];

const created = { requests: [], permits: [] };

for (const t of requestTemplates) {
  created.requests.push({ name: t.name, id: await createRequestTemplate(t) });
}

for (const t of permitTemplates) {
  created.permits.push({ name: t.name, id: await createPermitTemplate(t) });
}

console.log(JSON.stringify({ ok: true, created }, null, 2));
