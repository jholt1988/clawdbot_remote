import {
  ENV,
  requireEnv,
  queryAll,
  notion,
  getSelectName,
  getMultiSelectNames,
  getCheckbox,
} from './_notion.mjs';

requireEnv(['NOTION_API_KEY', 'NOTION_EXECUTION_REQUESTS_DB_ID']);

// Mirrors EEP v1.0 deterministic risk computation (Notion property names must match your DB).
function computeRisk(props) {
  const targetEnv = getSelectName(props, 'Target Environment');
  const sideEffects = getMultiSelectNames(props, 'Side Effects Declared');
  const credential = getSelectName(props, 'Credential Profile');
  const dryRun = getCheckbox(props, 'Dry Run');

  if (dryRun) return 'Low';

  const highTriggers = [
    targetEnv === 'prod',
    sideEffects.includes('infra_mutation'),
    sideEffects.includes('security_policy_change'),
    sideEffects.includes('firewall_change'),
    sideEffects.includes('iam_change'),
    sideEffects.includes('db_schema_migration'),
    sideEffects.includes('payment_or_billing_change'),
    sideEffects.includes('delete_or_purge'),
    sideEffects.includes('mass_write'),
    credential === 'admin',
  ];

  if (highTriggers.some(Boolean)) return 'High';

  // Medium if it’s any non-none side effects or any external mutation class.
  const hasSideEffects = sideEffects.length > 0 && !sideEffects.includes('none');
  if (hasSideEffects) return 'Medium';

  return 'Low';
}

let updated = 0;
for await (const page of queryAll(ENV.EXEC_DB)) {
  const props = page.properties;
  const risk = computeRisk(props);

  const current = getSelectName(props, 'Risk Level');
  if (current === risk) continue;

  await notion.pages.update({
    page_id: page.id,
    properties: {
      'Risk Level': { select: { name: risk } },
    },
  });
  updated++;
}

console.log(JSON.stringify({ ok: true, updated }, null, 2));
