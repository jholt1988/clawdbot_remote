#!/usr/bin/env node
/**
 * notion-sync-agent-system-pack.mjs
 *
 * Deterministic Notion sync for AGENT-SYSTEM-PACK.md with a single source-of-truth
 * for the "latest" Notion page ID. Prevents attempts to edit/append to archived pages.
 *
 * Behavior:
 * - Reads previous page id from notion/latest_agent_system_pack_page_id.txt
 * - Creates a new child page under the configured parent page
 * - Appends the content (converted into simple Notion blocks)
 * - Archives the previous page id (if present)
 * - Writes the new page id back to the file
 */

import fs from 'fs';
import os from 'os';
import https from 'https';

const AGENT_PACK_PATH = process.env.AGENT_PACK_PATH || '/home/jordanh316/clawd/AGENT-SYSTEM-PACK.md';
const LATEST_ID_PATH = process.env.LATEST_ID_PATH || '/home/jordanh316/clawd/notion/latest_agent_system_pack_page_id.txt';
const NOTION_PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID || '30300994e5b8806a9354f015d5f1f335';
const NOTION_VERSION = process.env.NOTION_VERSION || '2025-09-03';
const NOTION_API_KEY_PATH = process.env.NOTION_API_KEY_PATH || (os.homedir() + '/.config/notion/api_key');

const title = process.env.NOTION_PAGE_TITLE || 'Agent System Pack (rolling)';

function readTrim(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim() : '';
}

const token = readTrim(NOTION_API_KEY_PATH);
if (!token) {
  console.error(`Missing Notion API token at ${NOTION_API_KEY_PATH}`);
  process.exit(1);
}

const content = fs.readFileSync(AGENT_PACK_PATH, 'utf8');
const previousPageId = readTrim(LATEST_ID_PATH);

function request(method, urlPath, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : undefined;
    const req = https.request({
      hostname: 'api.notion.com',
      path: urlPath,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (d) => (chunks += d));
      res.on('end', () => {
        const ok = res.statusCode >= 200 && res.statusCode < 300;
        if (!ok) return reject(new Error(`HTTP ${res.statusCode}: ${chunks}`));
        resolve(chunks ? JSON.parse(chunks) : {});
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function mdToBlocks(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];

  let inCode = false;
  let codeLang = '';
  let codeLines = [];

  function flushCode() {
    if (!inCode) return;
    blocks.push({
      object: 'block',
      type: 'code',
      code: {
        language: codeLang || 'plain text',
        rich_text: [{ type: 'text', text: { content: codeLines.join('\n') } }],
      },
    });
    inCode = false;
    codeLang = '';
    codeLines = [];
  }

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '    ');

    const fence = line.match(/^```\s*([^\s]*)\s*$/);
    if (fence) {
      if (!inCode) {
        inCode = true;
        codeLang = fence[1] || '';
      } else {
        flushCode();
      }
      continue;
    }

    if (inCode) {
      codeLines.push(raw);
      continue;
    }

    if (!line.trim()) continue;

    if (line.startsWith('# ')) {
      blocks.push({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2).trim() } }] } });
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3).trim() } }] } });
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: line.slice(4).trim() } }] } });
      continue;
    }
    if (line.startsWith('---')) {
      blocks.push({ object: 'block', type: 'divider', divider: {} });
      continue;
    }

    // Simple list support
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: bullet[1] } }] },
      });
      continue;
    }

    blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: raw } }] } });
  }

  flushCode();
  return blocks;
}

async function main() {
  const page = await request('POST', '/v1/pages', {
    parent: { page_id: NOTION_PARENT_PAGE_ID },
    properties: {
      title: { title: [{ text: { content: title } }] },
    },
  });

  const newPageId = page.id;

  const summaryBlocks = [
    { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Summary' } }] } },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content:
                'Rolling canonical Agent System Pack. This page is regenerated on each sync; previous page is archived. The latest live page id is stored in the repository file notion/latest_agent_system_pack_page_id.txt.',
            },
          },
        ],
      },
    },
    { object: 'block', type: 'divider', divider: {} },
  ];

  const contentBlocks = mdToBlocks(content);
  const allBlocks = summaryBlocks.concat(contentBlocks);

  for (let i = 0; i < allBlocks.length; i += 50) {
    await request('PATCH', `/v1/blocks/${newPageId}/children`, { children: allBlocks.slice(i, i + 50) });
  }

  if (previousPageId && previousPageId !== newPageId) {
    // Archive previous page
    await request('PATCH', `/v1/pages/${previousPageId}`, { archived: true });
  }

  fs.mkdirSync(new URL('.', `file://${LATEST_ID_PATH}`).pathname, { recursive: true });
  fs.writeFileSync(LATEST_ID_PATH, newPageId + '\n');

  console.log('NOTION_PAGE_ID=' + newPageId);
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
