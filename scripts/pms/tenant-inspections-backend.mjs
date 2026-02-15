#!/usr/bin/env node
import path from 'node:path';
import { spawn } from 'node:child_process';

function run(cmd, args, { cwd } = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd, stdio: 'pipe' });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (code) => resolve({ code, out, err }));
    p.on('error', (e) => resolve({ code: 1, out, err: err + String(e) }));
  });
}

const repoRoot = process.cwd();
const pmsRoot = process.env.PMS_ROOT || path.join(repoRoot, 'pms-master');
const apiDir = path.join(pmsRoot, 'tenant_portal_backend');

const steps = [];

// Ensure repo exists
steps.push(async () => {
  const st = await run('git', ['rev-parse', '--is-inside-work-tree'], { cwd: pmsRoot });
  if (st.code !== 0) throw new Error(`pms-master not a git repo at ${pmsRoot}`);
});

// Ensure clean
steps.push(async () => {
  const st = await run('git', ['status', '--porcelain'], { cwd: pmsRoot });
  if (st.code !== 0) throw new Error(`git status failed: ${st.err}`);
  if (st.out.trim()) throw new Error('pms-master working tree not clean; commit/stash first');
});

// Pull latest
steps.push(async () => {
  const pl = await run('git', ['pull', '--ff-only'], { cwd: pmsRoot });
  if (pl.code !== 0) throw new Error(`git pull failed: ${pl.err || pl.out}`);
});

// Run backend tests (fast signal)
steps.push(async () => {
  const t = await run('npm', ['test', '--silent'], { cwd: apiDir });
  if (t.code !== 0) throw new Error(`backend tests failed:\n${(t.out + '\n' + t.err).slice(0, 4000)}`);
});

for (const s of steps) await s();

console.log(JSON.stringify({ ok: true, ts: new Date().toISOString(), job: 'tenant-inspections-backend' }, null, 2));
