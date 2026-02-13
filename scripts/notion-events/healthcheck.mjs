import 'dotenv/config';

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing }, null, 2));
    process.exit(1);
  }
}

requireEnv([
  'NOTION_API_KEY',
  'WEBHOOK_SECRET',
  'REDIS_URL',
  'NOTION_EXECUTION_REQUESTS_DB_ID',
  'NOTION_EXECUTION_PERMITS_DB_ID',
  'NOTION_PROJECTS_DB_ID',
]);

console.log(JSON.stringify({ ok: true }, null, 2));
