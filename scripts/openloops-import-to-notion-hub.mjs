#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const WORKDIR = '/home/jordanh316/.openclaw/workspace';
const MAP_DOC = path.join(WORKDIR, 'OpenLoops/00_Workspace/OpenLoops-Workspace.md');

function env(name) {
  return process.env[name] || '';
}

function extractPageId(url) {
  const clean = (url || '').trim();
  const m = clean.match(/([a-f0-9]{32})$/i);
  return m ? m[1] : null;
}

function titleBlock(text) {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: text.slice(0, 2000) } }] },
  };
}

function paraBlock(text) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: text.slice(0, 2000) } }] },
  };
}

function bulletBlock(text) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: text.slice(0, 2000) } }] },
  };
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function mdToBlocks(md) {
  const lines = md.split('\n');
  const blocks = [];

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ').trimEnd();
    if (!line.trim()) continue;

    if (line.startsWith('### ')) {
      blocks.push(titleBlock(line.slice(4)));
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(titleBlock(line.slice(3)));
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(titleBlock(line.slice(2)));
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      blocks.push(bulletBlock(line.replace(/^[-*]\s+/, '')));
      continue;
    }

    // Split long paragraphs for Notion rich text limits
    const txt = line.replace(/\*\*/g, '').replace(/`/g, '');
    if (txt.length <= 1900) {
      blocks.push(paraBlock(txt));
    } else {
      let i = 0;
      while (i < txt.length) {
        blocks.push(paraBlock(txt.slice(i, i + 1900)));
        i += 1900;
      }
    }
  }

  return blocks;
}

async function notion(pathname, method = 'GET', body) {
  const key = env('NOTION_API_KEY') || env('NOTION_KEY');
  if (!key) throw new Error('Missing NOTION_API_KEY/NOTION_KEY');
  const res = await fetch(`https://api.notion.com/v1${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} :: ${JSON.stringify(json)}`);
  return json;
}

async function appendBlocks(pageId, blocks) {
  const groups = chunk(blocks, 90);
  for (const g of groups) {
    await notion(`/blocks/${pageId}/children`, 'PATCH', { children: g });
  }
}

async function main() {
  const mapText = await fs.readFile(MAP_DOC, 'utf8');
  const lines = mapText.split('\n');
  const linkMap = {};
  for (const line of lines) {
    const m = line.match(/-\s+([^:]+):\s+(https:\/\/www\.notion\.so\/\S+)/i);
    if (m) linkMap[m[1].trim()] = m[2].trim();
  }

  const deliverables = [
    { name: 'AI Assistant', file: 'OpenLoops/01_Strategy/AI_Assistant/Unified_AI_Assistant_Plan_CANONICAL.md', notionLabel: 'AI Assistant' },
    { name: 'Property Suite', file: 'OpenLoops/01_Strategy/Property_Suite/PMS_MASTER_INDEX.md', notionLabel: 'Property Suite' },
    { name: 'Repertoire', file: 'OpenLoops/02_Repertoire/repertoire-index.md', notionLabel: 'Repertoire' },
    { name: 'Finance', file: 'OpenLoops/03_Finance/FINANCIAL_PACKET_CANONICAL.md', notionLabel: 'Finance' },
    { name: 'Legal Ops', file: 'OpenLoops/04_Legal_Operations/LEASE_OPS_CHECKLIST.md', notionLabel: 'Legal Ops' },
    { name: 'Production Company', file: 'pms-plans/production-company-launch-brief-v1.md', notionLabel: 'Brand Business' },
    { name: 'Automation Stack', file: 'automations/INDEX.md', notionLabel: 'Automation' },
  ];

  const report = [];

  for (const d of deliverables) {
    const targetUrl = linkMap[d.notionLabel];
    const pageId = extractPageId(targetUrl);
    const filePath = path.join(WORKDIR, d.file);

    try {
      await fs.access(filePath);
      if (!pageId) throw new Error(`Missing Notion page link/id for label: ${d.notionLabel}`);

      const md = await fs.readFile(filePath, 'utf8');
      const contentBlocks = mdToBlocks(md).slice(0, 380);
      const stamp = new Date().toISOString();
      const header = [
        titleBlock(`Deliverable Import: ${d.name}`),
        paraBlock(`Source: ${d.file}`),
        paraBlock(`Imported at: ${stamp}`),
      ];

      await appendBlocks(pageId, [...header, ...contentBlocks]);
      report.push({ name: d.name, status: 'IMPORTED', file: d.file, pageId, blocks: contentBlocks.length + header.length });
    } catch (err) {
      report.push({ name: d.name, status: 'FAILED', file: d.file, error: String(err.message || err) });
    }
  }

  const outPath = path.join(WORKDIR, 'briefings/openloops-notion-import-report-2026-03-01.json');
  await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: true, outPath, report }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
