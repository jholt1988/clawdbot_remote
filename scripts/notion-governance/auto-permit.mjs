import {
  ENV,
  requireEnv,
  queryAll,
  notion,
  getSelectName,
  getCheckbox,
} from './_notion.mjs';

requireEnv([
  'NOTION_API_KEY',
  'NOTION_EXECUTION_REQUESTS_DB_ID',
  'NOTION_EXECUTION_PERMITS_DB_ID',
]);

// Auto-create permits for low-risk non-dry-run requests (as per your spec).
// You will likely want to add “only when Status == Submitted” once your DB is live.

let created = 0;
for await (const req of queryAll(ENV.EXEC_DB)) {
  const props = req.properties;
  const risk = getSelectName(props, 'Risk Level');
  const dryRun = getCheckbox(props, 'Dry Run');

  if (dryRun) continue;
  if (risk !== 'Low') continue;

  await notion.pages.create({
    parent: { database_id: ENV.PERMITS_DB },
    properties: {
      ERQ: { relation: [{ id: req.id }] },
      'Approved Mode': { select: { name: 'non-dry-run' } },
      'Risk Level Confirmed': { select: { name: 'Low' } },
      'Rollback Verified': { checkbox: true },
    },
  });
  created++;
}

console.log(JSON.stringify({ ok: true, created }, null, 2));
