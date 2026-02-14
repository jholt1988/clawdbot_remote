import 'dotenv/config';
import { Client } from '@notionhq/client';
import { notionProps } from './notion-props.mjs';

// Migrates Notion schema in-place to ensure required select options exist.
// Current migration: add Permit Status option "Expired".

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: process.env.NOTION_SCHEMA_VERSION || '2022-06-28',
});

const P = notionProps();

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

function hasOption(property, name) {
  const opts = property?.select?.options || [];
  return opts.some((o) => o.name === name);
}

async function ensureSelectOption({ database_id, propName, optionName, color = 'gray' }) {
  const db = await notion.databases.retrieve({ database_id });
  const prop = db.properties?.[propName];
  if (!prop) throw new Error(`Property not found: ${propName}`);
  if (prop.type !== 'select') throw new Error(`Property is not select: ${propName} (${prop.type})`);

  if (hasOption(prop, optionName)) {
    return { changed: false, propName, optionName };
  }

  // Append new option while preserving existing options.
  const options = [...(prop.select.options || []), { name: optionName, color }];

  await notion.databases.update({
    database_id,
    properties: {
      [propName]: {
        select: {
          options,
        },
      },
    },
  });

  return { changed: true, propName, optionName };
}

async function main() {
  requireEnv(['NOTION_API_KEY', 'NOTION_EXECUTION_PERMITS_DB_ID']);

  const results = [];
  // Permit Status: add Expired
  results.push(
    await ensureSelectOption({
      database_id: process.env.NOTION_EXECUTION_PERMITS_DB_ID,
      propName: P.permitStatus,
      optionName: 'Expired',
      color: 'brown',
    }),
  );

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
