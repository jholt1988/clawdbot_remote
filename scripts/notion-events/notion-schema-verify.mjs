import 'dotenv/config';
import { Client } from '@notionhq/client';
import { notionProps } from './notion-props.mjs';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: process.env.NOTION_VERSION || '2022-06-28',
});
const P = notionProps();

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

function assertProp(db, propName, expectedType) {
  const prop = db.properties?.[propName];
  if (!prop) return { ok: false, error: `missing_property:${propName}` };
  if (expectedType && prop.type !== expectedType) {
    return { ok: false, error: `wrong_type:${propName}:${prop.type}!=${expectedType}` };
  }
  return { ok: true };
}

async function main() {
  requireEnv([
    'NOTION_API_KEY',
    'NOTION_EXECUTION_REQUESTS_DB_ID',
    'NOTION_EXECUTION_PERMITS_DB_ID',
    'NOTION_PROJECTS_DB_ID',
  ]);

  const reqDb = await notion.databases.retrieve({ database_id: process.env.NOTION_EXECUTION_REQUESTS_DB_ID });
  const permitDb = await notion.databases.retrieve({ database_id: process.env.NOTION_EXECUTION_PERMITS_DB_ID });
  const projDb = await notion.databases.retrieve({ database_id: process.env.NOTION_PROJECTS_DB_ID });
 
  console.log(reqDb)
  console.log(permitDb)
  console.log(projDb) 
 
  const checks = [];

  // Requests
  checks.push(assertProp(reqDb, P.requestDryRun, 'checkbox'));
  checks.push(assertProp(reqDb, P.requestTargetSystem, 'select'));
  checks.push(assertProp(reqDb, P.requestRiskLevel, 'select'));
  checks.push(assertProp(reqDb, P.requestProject, 'relation'));
  checks.push(assertProp(reqDb, P.requestTimeoutSeconds, 'number'));
  checks.push(assertProp(reqDb, P.requestExecutionStatus, 'select'));

  // Script Path can be rich_text or title in some setups; we just require existence.
  checks.push(assertProp(reqDb, P.requestScriptPath, null));

  // Permits
  checks.push(assertProp(permitDb, P.permitStatus, 'select'));
  checks.push(assertProp(permitDb, P.permitApprovedMode, 'select'));
  checks.push(assertProp(permitDb, P.permitExecutionRequest, 'relation'));
  checks.push(assertProp(permitDb, P.permitLastRunAt, 'date'));

  // Button-driven queueing fields
  checks.push(assertProp(permitDb, P.permitQueueRequested, 'checkbox'));
  checks.push(assertProp(permitDb, P.permitQueueRequestedAt, 'date'));
  checks.push(assertProp(permitDb, P.permitQueuedProcessed, 'checkbox'));

  // Project
  checks.push(assertProp(projDb, P.projectState, 'select'));

  const failures = checks.filter((c) => !c.ok);
  if (failures.length) {
    console.error(JSON.stringify({ ok: false, failures }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({ ok: true }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
