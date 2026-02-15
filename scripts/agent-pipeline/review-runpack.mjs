#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const taskId = argv[0];
const verdict = (argv.find((a) => a.startsWith('--verdict='))?.split('=')[1] || '').toUpperCase();
const reasons = argv.find((a) => a.startsWith('--reasons='))?.split('=')[1] || '';

if (!taskId || !verdict || !['APPROVE', 'REJECT', 'FLAG'].includes(verdict)) {
  console.error('Usage: node scripts/agent-pipeline/review-runpack.mjs <taskId> --verdict=APPROVE|REJECT|FLAG --reasons="..."');
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
  `# QA Review — ${taskId}\n\nVerdict: **${verdict}**\n\nReasons:\n- ${reasons || '(none provided)'}\n\nNotes:\n- This file is the recorded QRS outcome for the run pack.\n`,
  'utf8',
);

console.log(JSON.stringify({ ok: true, taskId, verdict, runPackStatus: rp.status, reviewPath: mdPath }, null, 2));
