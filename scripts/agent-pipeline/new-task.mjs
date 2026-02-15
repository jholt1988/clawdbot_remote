#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

function nowISO() {
  return new Date().toISOString();
}

function randId() {
  return crypto.randomBytes(6).toString('hex');
}

const argv = process.argv.slice(2);
const primaryDomain = (argv.find((a) => a.startsWith('--domain='))?.split('=')[1] || 'PMS');
const objective = argv.find((a) => !a.startsWith('--'));

if (!objective) {
  console.error('Usage: node scripts/agent-pipeline/new-task.mjs "<objective statement>" --domain=PMS');
  process.exit(2);
}

const taskId = `T-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${randId()}`;

const cts = {
  taskId,
  origin: 'User',
  submittedBy: 'Jordan',
  timestamp: nowISO(),
  primaryDomain,
  objectiveStatement: objective,
  requiredDeliverables: [
    'Approved Run Pack (JSON + Markdown)',
  ],
  optionalDeliverables: [
    'Rollback/fallback notes',
  ],
  constraints: {
    timeConstraints: '',
    scopeConstraints: 'No unscoped changes; minimal diffs; demo-critical first.',
    nonGoals: [],
  },
  qualityRequirements: {
    completeness: 'All required deliverables present and mapped to objective.',
    accuracy: 'No contradictions; matches known system constraints.',
    clarity: 'Executable without further interpretation.',
  },
  riskSensitivity: 'Medium',
  knownUnknowns: [],
  assumptions: [],
  communication: {
    intendedAudience: 'Jordan',
    toneRequirements: 'Direct, actionable, non-hype.',
    preferredFormat: 'Bullets',
  },
  traceability: {
    relatedTasks: [],
    referenceArtifacts: [],
    archivalPriority: 'High',
  },
};

const repoRoot = process.cwd();
const outDirTasks = path.join(repoRoot, 'governance/tasks');
const outDirRunPacks = path.join(repoRoot, 'governance/run-packs');

await fs.mkdir(outDirTasks, { recursive: true });
await fs.mkdir(outDirRunPacks, { recursive: true });

const ctsPath = path.join(outDirTasks, `CTS-${taskId}.json`);
await fs.writeFile(ctsPath, JSON.stringify(cts, null, 2) + '\n', 'utf8');

const rpJsonPath = path.join(outDirRunPacks, `RUNPACK-${taskId}.json`);
const rpMdPath = path.join(outDirRunPacks, `RUNPACK-${taskId}.md`);

const runPack = {
  taskId,
  createdAt: nowISO(),
  status: 'Draft',
  runs: [],
  acceptance: [],
  rollback: [],
};

await fs.writeFile(rpJsonPath, JSON.stringify(runPack, null, 2) + '\n', 'utf8');
await fs.writeFile(
  rpMdPath,
  `# Run Pack — ${taskId}\n\n## Objective\n${objective}\n\n## Planned Runs\n- (draft)\n\n## Acceptance\n- (draft)\n\n## Rollback / Fallback\n- (draft)\n`,
  'utf8',
);

console.log(JSON.stringify({ ok: true, taskId, ctsPath, rpJsonPath, rpMdPath }, null, 2));
