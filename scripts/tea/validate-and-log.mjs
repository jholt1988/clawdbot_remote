import path from 'node:path';
import { appendJsonl, nowIso, parseArgs, readJson, todayUtc } from './_lib.mjs';
import { validateErq, validateExp } from './validate.mjs';

const args = parseArgs(process.argv);
const erqPath = args.erq;
const expPath = args.exp;

if (!erqPath) {
  console.error('Usage: node scripts/tea/validate-and-log.mjs --erq /path/to/erq.json [--exp /path/to/exp.json]');
  process.exit(2);
}

const erq = await readJson(erqPath);
const exp = expPath ? await readJson(expPath) : null;

const erqV = validateErq(erq);
let expV = { ok: true, errors: [] };

const requiresExp = erq?.dry_run === false;
if (requiresExp) {
  expV = validateExp(exp, erq);
}

const approved = erqV.ok && expV.ok;

const auditEvent = {
  timestamp: nowIso(),
  kind: 'tea.wrapper.validation',
  approved,
  mode: erq?.dry_run ? 'dry-run' : 'non-dry-run',
  erq_id: erq?.erq_id ?? null,
  exp_id: exp?.exp_id ?? null,
  project_id: erq?.project_id ?? null,
  task_id: erq?.task_id ?? null,
  requesting_agent: erq?.requesting_agent ?? null,
  target_system: erq?.target_system ?? null,
  target_environment: erq?.target_environment ?? null,
  target_identifier: erq?.target_identifier ?? null,
  network_required: erq?.network_required ?? null,
  risk_level: erq?.risk_level ?? null,
  validation_errors: [...(erqV.errors || []), ...(expV.errors || [])],
  erq_path: path.resolve(erqPath),
  exp_path: expPath ? path.resolve(expPath) : null,
};

const logPath = path.resolve('logs', 'tea', `${todayUtc()}.jsonl`);
await appendJsonl(logPath, auditEvent);

process.stdout.write(JSON.stringify({ approved, errors: auditEvent.validation_errors, logPath }, null, 2) + '\n');
process.exit(approved ? 0 : 1);
