#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';

function run(cmd, args, { cwd } = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd, stdio: 'pipe' });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (code) => resolve({ code, out, err }));
  });
}

function header(s) {
  return `\n===== ${s} =====\n`;
}

const repoRoot = process.cwd();
const pmsRoot = process.env.PMS_ROOT || path.join(repoRoot, 'pms-master');
const appDir = path.join(pmsRoot, 'tenant_portal_app');
const apiDir = path.join(pmsRoot, 'tenant_portal_backend');

const steps = [
  { name: 'app: npm ci', cwd: appDir, cmd: 'npm', args: ['ci'] },
  { name: 'app: type-check', cwd: appDir, cmd: 'npm', args: ['run', '-s', 'type-check'] },
  { name: 'app: test', cwd: appDir, cmd: 'npm', args: ['test', '--silent'], allowFail: true },
  { name: 'app: build', cwd: appDir, cmd: 'npm', args: ['run', '-s', 'build'], allowFail: true },

  { name: 'api: npm ci', cwd: apiDir, cmd: 'npm', args: ['ci'] },
  { name: 'api: test', cwd: apiDir, cmd: 'npm', args: ['test', '--silent'], allowFail: true },
  { name: 'api: build', cwd: apiDir, cmd: 'npm', args: ['run', '-s', 'build'], allowFail: true },
];

let ok = true;
let stdout = '';
let stderr = '';

stdout += `PMS CI runner\nPMS_ROOT=${pmsRoot}\n`;

for (const step of steps) {
  stdout += header(step.name);
  const res = await run(step.cmd, step.args, { cwd: step.cwd });
  stdout += res.out;
  stderr += res.err;

  if (res.code !== 0) {
    const msg = `${step.name} exited with code ${res.code}`;
    if (step.allowFail) {
      stdout += `\n[WARN] ${msg} (allowed to fail)\n`;
    } else {
      stdout += `\n[FAIL] ${msg}\n`;
      ok = false;
      break;
    }
  }
}

const summary = {
  ok,
  ts: new Date().toISOString(),
};

// Print a compact JSON first for Notion “Last Output”
console.log(JSON.stringify(summary, null, 2));

// Then print logs (may be truncated by permit output capture)
console.log('\n--- STDOUT ---\n' + stdout.slice(0, 20000));
if (stderr.trim()) console.error('\n--- STDERR ---\n' + stderr.slice(0, 20000));

process.exit(ok ? 0 : 1);
