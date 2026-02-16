/**
 * Deterministic task router (Team + suggested agent).
 *
 * Source-of-truth routing intent: governance/pms/PMS_MVP_AGENT_INPUT_2026-02-15.json (routing_rules).
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_RULES_PATH = 'governance/pms/PMS_MVP_AGENT_INPUT_2026-02-15.json';

export const TEAM_TO_AGENT = {
  PMS_DEV: 'pms-dev-orchestrator',
  BUILD: 'pms-build-orchestrator',
  BUSINESS: 'pms-business-orchestrator',
  MARKETING: 'pms-marketing-orchestrator',
  QA: 'quality-reviewer',
  LIBRARY: 'meta-archivist',
  R_AND_D: 'pms-dev-orchestrator',
  PANEL: 'main',
};

function normalize(s) {
  return String(s || '').toLowerCase();
}

function tokenizeRule(ruleIf) {
  return String(ruleIf || '')
    .split('|')
    .map((t) => t.trim())
    .filter(Boolean)
    .map(normalize);
}

export async function loadRoutingRules({ rulesPath = DEFAULT_RULES_PATH } = {}) {
  const repoRoot = process.cwd();
  const p = path.join(repoRoot, rulesPath);
  const raw = await fs.readFile(p, 'utf8');
  const json = JSON.parse(raw);
  const rr = json.routing_rules;
  if (!rr?.deterministic_router) throw new Error(`routing_rules.deterministic_router missing in ${rulesPath}`);
  const compiled = rr.deterministic_router.map((r) => ({
    team: r.team,
    tokens: tokenizeRule(r.if),
    raw: r,
  }));
  return { source: rulesPath, compiled, raw: rr };
}

/**
 * @param {object} input
 * @param {string} input.objective
 * @param {string} [input.primaryDomain]
 * @param {string[]} [input.tags]
 * @param {string} [input.overrideTeam]
 */
export function routeTask({ objective, primaryDomain = 'PMS', tags = [], overrideTeam = null }, rules) {
  if (overrideTeam) {
    const agentId = TEAM_TO_AGENT[overrideTeam] || 'main';
    return { team: overrideTeam, agentId, reason: 'overrideTeam' };
  }

  const haystack = [objective, ...(tags || [])].map(normalize).join(' | ');

  for (const r of rules.compiled) {
    if (!r.tokens.length) continue;
    for (const tok of r.tokens) {
      // token match: word-ish substring
      if (haystack.includes(tok)) {
        const agentId = TEAM_TO_AGENT[r.team] || 'main';
        return { team: r.team, agentId, reason: `matched:${tok}` };
      }
    }
  }

  // Default team by domain
  const team = primaryDomain === 'PMS' ? 'PMS_DEV' : 'PMS_DEV';
  return { team, agentId: TEAM_TO_AGENT[team] || 'main', reason: 'default' };
}
