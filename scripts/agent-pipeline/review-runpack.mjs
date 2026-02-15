#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';

const argv = process.argv.slice(2);
const taskId = argv[0];
const verdict = (argv.find((a) => a.startsWith('--verdict='))?.split('=')[1] || '').toUpperCase();
const reasons = argv.find((a) => a.startsWith('--reasons='))?.split('=')[1] || '';
const scoresRaw = argv.find((a) => a.startsWith('--scores='))?.slice('--scores='.length) || '';

function parseScores(raw) {
  // format: completeness=4,accuracy=4,clarity=3
  const out = { completeness: null, accuracy: null, clarity: null };
  if (!raw) return out;
  for (const part of String(raw).split(',')) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (!k) continue;
    const n = Number(v);
    if (!Number.isFinite(n)) continue;
    if (k === 'completeness') out.completeness = n;
    if (k === 'accuracy') out.accuracy = n;
    if (k === 'clarity') out.clarity = n;
  }
  return out;
}

const scores = parseScores(scoresRaw);

if (!taskId || !verdict || !['APPROVE', 'REJECT', 'FLAG'].includes(verdict)) {
  console.error('Usage: node scripts/agent-pipeline/review-runpack.mjs <taskId> --verdict=APPROVE|REJECT|FLAG --scores="completeness=4,accuracy=4,clarity=3" --reasons="..."');
  process.exit(2);
}

const repoRoot = process.cwd();
const reviewDir = path.join(repoRoot, 'governance/reviews');
const runPackJson = path.join(repoRoot, 'governance/run-packs', `RUNPACK-${taskId}.json`);

await fs.mkdir(reviewDir, { recursive: true });

const rpRaw = await fs.readFile(runPackJson, 'utf8');
const rp = JSON.parse(rpRaw);

rp.status = verdict === 'APPROVE' ? 'Approved' : verdict === 'REJECT' ? 'Rejected' : 'Flagged';
rp.reviewedAt = new Date().toISOString();

await fs.writeFile(runPackJson, JSON.stringify(rp, null, 2) + '\n', 'utf8');

const mdPath = path.join(reviewDir, `QA-${taskId}.md`);
await fs.writeFile(
  mdPath,
  `# QA Review — ${taskId}\n\nVerdict: **${verdict}**\n\nScores:\n- Completeness: ${scores.completeness ?? '(n/a)'} / 5\n- Accuracy: ${scores.accuracy ?? '(n/a)'} / 5\n- Clarity: ${scores.clarity ?? '(n/a)'} / 5\n\nReasons:\n- ${reasons || '(none provided)'}\n\nNotes:\n- This file is the recorded QRS outcome for the run pack.\n`,
  'utf8',
);

// Best-effort: append verdict + scores into Notion Ticket Logs
let notionTicket = null;
try {
  const { notion } = await import('../../scripts/notion-governance/_notion.mjs');

  const ticketsDbId = process.env.NOTION_TICKETS_DB_ID;
  if (!ticketsDbId) throw new Error('Missing NOTION_TICKETS_DB_ID');

  // Find the ticket via Logs contains Task ID.
  const db = await notion.databases.retrieve({ database_id: ticketsDbId });
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error('Tickets data_source_id missing');

  const q = await notion.dataSources.query({
    data_source_id: dsId,
    page_size: 5,
    filter: {
      property: 'Logs',
      rich_text: { contains: `CTS Task ID: ${taskId}` },
    },
  });

  const pageId = q.results?.[0]?.id;
  if (pageId) {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const existing = page.properties?.Logs?.rich_text || [];

    const lines = [
      '',
      `QA Verdict: ${verdict}`,
      `QA Scores: completeness=${scores.completeness ?? 'n/a'}, accuracy=${scores.accuracy ?? 'n/a'}, clarity=${scores.clarity ?? 'n/a'}`,
      `QA Reasons: ${reasons || '(none)'}`,
      `QA Reviewed At: ${new Date().toISOString()}`,
    ].join('\n');

    const merged = (existing.map((r) => r.plain_text).join('') + lines).slice(0, 1900);

    const statusName = verdict === 'APPROVE' ? 'Accepted' : verdict === 'REJECT' ? 'Blocked' : 'Proposed';

    await notion.pages.update({
      page_id: pageId,
      properties: {
        Logs: {
          rich_text: [{ text: { content: merged } }],
        },
        Status: { select: { name: statusName } },
      },
    });

    notionTicket = { id: pageId, url: page.url, statusName };
  }
} catch {
  // ignore
}

console.log(
  JSON.stringify(
    { ok: true, taskId, verdict, scores, runPackStatus: rp.status, reviewPath: mdPath, notionTicket },
    null,
    2,
  ),
);

