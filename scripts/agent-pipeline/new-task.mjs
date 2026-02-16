#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import 'dotenv/config';

import { loadRoutingRules, routeTask } from './router.mjs';

function nowISO() {
  return new Date().toISOString();
}

function randId() {
  return crypto.randomBytes(6).toString('hex');
}

function firstNonFlag(args) {
  return args.find((a) => !a.startsWith('--'));
}

const argv = process.argv.slice(2);
const primaryDomain = (argv.find((a) => a.startsWith('--domain='))?.split('=')[1] || 'PMS');
const overrideTeam = (argv.find((a) => a.startsWith('--team='))?.split('=')[1] || null);
const objective = firstNonFlag(argv);

if (!objective) {
  console.error('Usage: node scripts/agent-pipeline/new-task.mjs "<objective statement>" --domain=PMS [--team=PMS_DEV|BUILD|BUSINESS|MARKETING|QA|LIBRARY|R_AND_D|PANEL]');
  process.exit(2);
}

const taskId = `T-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randId()}`;

const routingRules = await loadRoutingRules();
const routed = routeTask({ objective, primaryDomain, overrideTeam }, routingRules);

const cts = {
  taskId,
  origin: 'User',
  submittedBy: 'Jordan',
  timestamp: nowISO(),
  primaryDomain,
  objectiveStatement: objective,
  requiredDeliverables: ['Approved Run Pack (JSON + Markdown)'],
  optionalDeliverables: ['Rollback/fallback notes'],
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
  routing: {
    team: routed.team,
    suggestedAgentId: routed.agentId,
    reason: routed.reason,
    rulesSource: routingRules.source,
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

// Optional: create a Ticket in Notion (Projects/Tickets existing system)
let notionTicket = null;
try {
  const { notion } = await import('../../scripts/notion-governance/_notion.mjs');

  const ticketsDbId = process.env.NOTION_TICKETS_DB_ID;
  const projectsDbId = process.env.NOTION_PROJECTS_DB_ID;
  if (!ticketsDbId || !projectsDbId) throw new Error('Missing Notion DB env');

  // Resolve projects data_source_id
  const projDb = await notion.databases.retrieve({ database_id: projectsDbId });
  const projDsId = projDb.data_sources?.[0]?.id;

  // Find PMS project page (prefer env override)
  let pmsProjectPageId = process.env.NOTION_PMS_PROJECT_PAGE_ID || null;
  if (!pmsProjectPageId && projDsId) {
    const q = await notion.dataSources.query({
      data_source_id: projDsId,
      page_size: 25,
      filter: {
        property: 'Name',
        title: { contains: 'Property Management Suite' },
      },
    });
    pmsProjectPageId = q.results?.[0]?.id ?? null;
  }

  // Create ticket
  notionTicket = await notion.pages.create({
    parent: { database_id: ticketsDbId },
    properties: {
      Name: { title: [{ text: { content: objective.slice(0, 180) } }] },
      Status: { select: { name: 'Proposed' } },
      Team: { select: { name: routed.team } },
      Domain: { select: { name: primaryDomain === 'PMS' ? 'PMS-Dev' : primaryDomain } },
      'Risk Flag': { select: { name: 'Medium' } },
      'Created By': { select: { name: 'Human' } },
      'Notes/Log': {
        rich_text: [
          { text: { content: `CTS Task ID: ${taskId}` } },
          { text: { content: `\nRouted Team: ${routed.team} (agent: ${routed.agentId}, reason: ${routed.reason})` } },
          { text: { content: `\nRepo CTS: governance/tasks/CTS-${taskId}.json` } },
          { text: { content: `\nRepo RunPack: governance/run-packs/RUNPACK-${taskId}.md` } },
        ],
      },
      ...(pmsProjectPageId
        ? { Project: { relation: [{ id: pmsProjectPageId }] } }
        : {}),
    },
  });
} catch {
  // Notion ticket creation is best-effort; repo artifacts are authoritative.
}

console.log(
  JSON.stringify(
    {
      ok: true,
      taskId,
      ctsPath,
      rpJsonPath,
      rpMdPath,
      notionTicket: notionTicket ? { id: notionTicket.id, url: notionTicket.url } : null,
    },
    null,
    2,
  ),
);
