import 'dotenv/config';
import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: process.env.NOTION_VERSION || '2022-06-28',
});

export const ENV = {
  PROJECTS_DB: process.env.NOTION_PROJECTS_DB_ID,
  TICKETS_DB: process.env.NOTION_TICKETS_DB_ID,
  EXEC_DB: process.env.NOTION_EXECUTION_REQUESTS_DB_ID,
  PERMITS_DB: process.env.NOTION_EXECUTION_PERMITS_DB_ID,
  PAGE_SIZE: Number(process.env.NOTION_PAGE_SIZE || 50),
};

export function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

export async function* queryAll(database_id, query = {}) {
  let cursor = undefined;
  for (;;) {
    const res = await notion.databases.query({
      database_id,
      page_size: ENV.PAGE_SIZE,
      start_cursor: cursor,
      ...query,
    });
    for (const r of res.results) yield r;
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
}

export function getSelectName(props, name) {
  return props?.[name]?.select?.name ?? null;
}

export function getMultiSelectNames(props, name) {
  return (props?.[name]?.multi_select || []).map((s) => s.name);
}

export function getCheckbox(props, name) {
  return !!props?.[name]?.checkbox;
}

export function firstRelationId(props, name) {
  const rel = props?.[name]?.relation;
  if (!Array.isArray(rel) || rel.length === 0) return null;
  return rel[0].id;
}
