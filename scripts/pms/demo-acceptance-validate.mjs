#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const runbookArg = args.find((arg) => !arg.startsWith('--'));
const runbookPath = runbookArg
  ? path.resolve(process.cwd(), runbookArg)
  : path.join(repoRoot, 'pms-plans', 'demo-runbook.md');

const jsonOutput = args.includes('--json');

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
}

const runbook = readFileSafe(runbookPath);
if (!runbook) {
  console.error(`[demo-acceptance-validate] Runbook not found: ${runbookPath}`);
  process.exit(2);
}

function extractChecklist(md) {
  const start = md.indexOf('## Acceptance Checklist');
  if (start === -1) return [];
  const nextHeading = md.indexOf('\n## ', start + 1);
  const section = md.slice(start, nextHeading === -1 ? md.length : nextHeading);
  const rows = section.split('\n').filter((line) => /^\|/.test(line));
  const items = [];
  for (const row of rows) {
    if (/^\|\s*-+\s*\|/.test(row)) continue;
    const match = row.match(/^\|\s*(\d+)\s*\|\s*([^|]+)\|/);
    if (!match) continue;
    items.push({
      id: Number(match[1]),
      criteria: match[2].trim(),
    });
  }
  return items;
}

const checklist = extractChecklist(runbook);

function stripSection(md, heading) {
  const start = md.indexOf(heading);
  if (start === -1) return md;
  const nextHeading = md.indexOf('\n## ', start + 1);
  const before = md.slice(0, start);
  const after = nextHeading === -1 ? '' : md.slice(nextHeading);
  return `${before}\n${after}`;
}

const evidenceText = stripSection(runbook, '## Acceptance Checklist');

function hasAll(patterns) {
  return patterns.every((pattern) => pattern.test(evidenceText));
}

function fileExists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

const checks = {
  1: { type: 'regex', patterns: [/Add Property/i, /Unit 204/i] },
  2: { type: 'regex', patterns: [/Application form/i, /Terms of Service/i, /Privacy Policy/i] },
  3: { type: 'regex', patterns: [/approves.*application/i, /Auto-generates lease/i] },
  4: { type: 'regex', patterns: [/views lease/i, /lease document/i] },
  5: { type: 'regex', patterns: [/Stripe/i, /Add Card/i] },
  6: { type: 'regex', patterns: [/Pay Rent/i, /Payment Successful/i] },
  7: { type: 'regex', patterns: [/Revenue widget/i, /Transaction list/i] },
  8: { type: 'regex', patterns: [/Submit Request/i, /Photos/i] },
  9: { type: 'regex', patterns: [/triage/i, /Assign to vendor/i] },
 10: { type: 'regex', patterns: [/Message thread opens/i] },
 11: { type: 'regex', patterns: [/inspection/i, /mobile viewport/i] },
 12: { type: 'regex', patterns: [/Move-In Inspection/i, /Work Plan/i, /Cost Estimate/i] },
 13: { type: 'regex', patterns: [/Routine Inspection/i, /Work Plan/i, /Cost Estimate/i] },
 14: { type: 'regex', patterns: [/Move-Out Inspection/i, /Work Plan/i, /Cost Estimate/i] },
 15: { type: 'regex', patterns: [/Owner dashboard/i, /property overview/i] },
 16: { type: 'regex', patterns: [/maintenance history/i, /Maintenance YTD/i] },
 17: { type: 'regex', patterns: [/comment/i] },
 18: { type: 'regex', patterns: [/responsive on mobile/i, /mobile viewport/i] },
 19: { type: 'files', files: ['scripts/pms-dev/demo-reset.sh', 'scripts/pms-dev/dev-managed-up.sh'] },
};

const results = checklist.map((item) => {
  const check = checks[item.id];
  if (!check) {
    return { ...item, status: 'MANUAL', details: 'No automated checks defined' };
  }
  if (check.type === 'regex') {
    const pass = hasAll(check.patterns);
    return {
      ...item,
      status: pass ? 'AUTO_PASS' : 'AUTO_FAIL',
      details: pass ? 'Matched runbook evidence' : 'Missing runbook evidence',
    };
  }
  if (check.type === 'files') {
    const missing = check.files.filter((file) => !fileExists(file));
    const pass = missing.length === 0;
    return {
      ...item,
      status: pass ? 'AUTO_PASS' : 'AUTO_FAIL',
      details: pass ? 'Required scripts present' : `Missing: ${missing.join(', ')}`,
    };
  }
  return { ...item, status: 'MANUAL', details: 'Unsupported check type' };
});

const summary = results.reduce(
  (acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  },
  {}
);

if (jsonOutput) {
  console.log(JSON.stringify({ runbook: runbookPath, summary, results }, null, 2));
  process.exit(0);
}

console.log(`# Demo Acceptance Checklist Validation`);
console.log(`Runbook: ${runbookPath}`);
console.log('');
console.log(`Summary: AUTO_PASS=${summary.AUTO_PASS || 0} AUTO_FAIL=${summary.AUTO_FAIL || 0} MANUAL=${summary.MANUAL || 0}`);
console.log('');
console.log(`| # | Criteria | Status | Details |`);
console.log(`|---|----------|--------|---------|`);
for (const item of results) {
  console.log(`| ${item.id} | ${item.criteria} | ${item.status} | ${item.details} |`);
}
