import path from 'node:path';
import { appendJsonl, nowIso, parseArgs, readJson, todayUtc } from './_lib.mjs';

const args = parseArgs(process.argv);
const erqPath = args.erq;
const expPath = args.exp;
const resultPath = args.result;

if (!erqPath || !resultPath) {
  console.error('Usage: node scripts/tea/log-result.mjs --erq /path/to/erq.json [--exp /path/to/exp.json] --result /path/to/tea-output.json');
  process.exit(2);
}

const erq = await readJson(erqPath);
const exp = expPath ? await readJson(expPath) : null;
const result = await readJson(resultPath);

const auditEvent = {
  timestamp: nowIso(),
  kind: 'tea.wrapper.result',
  mode: erq?.dry_run ? 'dry-run' : 'non-dry-run',
  erq_id: erq?.erq_id ?? null,
  exp_id: exp?.exp_id ?? null,
  project_id: erq?.project_id ?? null,
  task_id: erq?.task_id ?? null,
  target_system: erq?.target_system ?? null,
  target_environment: erq?.target_environment ?? null,
  target_identifier: erq?.target_identifier ?? null,
  status: result?.status ?? null,
  execution_time_ms: result?.execution_time_ms ?? null,
  artifacts_created: result?.artifacts_created ?? [],
  side_effects_observed: result?.side_effects_observed ?? [],
  targets_touched: result?.targets_touched ?? [],
  stdout_preview: typeof result?.stdout === 'string' ? result.stdout.slice(0, 2000) : null,
  stderr_preview: typeof result?.stderr === 'string' ? result.stderr.slice(0, 2000) : null,
  result_path: path.resolve(resultPath),
};

const logPath = path.resolve('logs', 'tea', `${todayUtc()}.jsonl`);
await appendJsonl(logPath, auditEvent);

process.stdout.write(JSON.stringify({ logged: true, logPath }, null, 2) + '\n');
