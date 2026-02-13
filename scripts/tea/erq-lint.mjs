// Lightweight ERQ linter to prevent obvious secrets from being embedded in ERQ.
// This is not a substitute for a credential broker.

import fs from 'node:fs/promises';

const erqPath = process.argv[2];
if (!erqPath) {
  console.error('Usage: node scripts/tea/erq-lint.mjs /path/to/erq.json');
  process.exit(2);
}

const raw = await fs.readFile(erqPath, 'utf8');
const erq = JSON.parse(raw);

const forbiddenKeys = ['api_key', 'apikey', 'token', 'secret', 'password', 'notion_api_key', 'github_token'];

function walk(obj, path = []) {
  const hits = [];
  if (!obj || typeof obj !== 'object') return hits;
  for (const [k, v] of Object.entries(obj)) {
    const p = [...path, k];
    const lower = k.toLowerCase();
    if (forbiddenKeys.some((fk) => lower.includes(fk))) {
      hits.push({ path: p.join('.'), key: k });
    }
    if (typeof v === 'object') hits.push(...walk(v, p));
  }
  return hits;
}

const hits = walk(erq);
if (hits.length) {
  console.error(JSON.stringify({ ok: false, reason: 'forbidden_secret_fields_present', hits }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
