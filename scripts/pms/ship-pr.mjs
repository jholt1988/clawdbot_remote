#!/usr/bin/env node
/**
 * Ship a change from the PMS repo via PR + GitHub auto-merge.
 *
 * Usage (from anywhere):
 *   node scripts/pms/ship-pr.mjs --repoDir ./pms-master --title "..." --body "..." --branch "ticket/T-..." --base main --merge squash
 *
 * Notes:
 * - Assumes `gh` is authenticated.
 * - Does NOT run tests. Run them before calling, or add a wrapper.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  return process.argv[i + 1] ?? def;
}

function flag(name) {
  return process.argv.includes(name);
}

function sh(cwd, cmd, args, { stdio = 'pipe' } = {}) {
  return execFileSync(cmd, args, { cwd, stdio, encoding: 'utf8' });
}

const repoDir = path.resolve(arg('--repoDir', './pms-master'));
const branch = arg('--branch');
const base = arg('--base', 'main');
const title = arg('--title');
const body = arg('--body', '');
const mergeMethod = arg('--merge', 'squash'); // squash|merge|rebase
const draft = flag('--draft');

if (!branch || !title) {
  console.error('Missing required args: --branch and --title');
  process.exit(2);
}

// Ensure clean-ish state
const status = sh(repoDir, 'git', ['status', '--porcelain']).trim();
if (!status) {
  console.error('No changes to ship (git status clean).');
  process.exit(2);
}

// Create/switch branch
sh(repoDir, 'git', ['checkout', '-B', branch], { stdio: 'inherit' });

// Commit all changes (simple MVP)
const msg = title.slice(0, 72);
sh(repoDir, 'git', ['add', '-A'], { stdio: 'inherit' });
sh(repoDir, 'git', ['commit', '-m', msg], { stdio: 'inherit' });

// Push
sh(repoDir, 'git', ['push', '-u', 'origin', branch], { stdio: 'inherit' });

// Create PR
const prArgs = ['pr', 'create', '--base', base, '--head', branch, '--title', title, '--body', body || ''];
if (draft) prArgs.push('--draft');
const prUrl = sh(repoDir, 'gh', prArgs).trim();

// Enable auto-merge
const mergeArgs = ['pr', 'merge', prUrl, '--auto', `--${mergeMethod}`];
sh(repoDir, 'gh', mergeArgs, { stdio: 'inherit' });

console.log(JSON.stringify({ ok: true, prUrl, branch, base, mergeMethod }, null, 2));
