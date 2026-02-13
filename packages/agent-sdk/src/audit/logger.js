import fs from 'node:fs/promises';
import path from 'node:path';

function todayUtc() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function appendAuditEvent(event, { baseDir = process.cwd() } = {}) {
  const logPath = path.resolve(baseDir, 'logs', 'tea', `${todayUtc()}.jsonl`);
  await ensureDir(path.dirname(logPath));
  await fs.appendFile(logPath, JSON.stringify(event) + '\n', 'utf8');
  return logPath;
}

export function makeValidationEvent({ erq, exp, approved, validationErrors, erqPath, expPath }) {
  return {
    timestamp: new Date().toISOString(),
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
    validation_errors: validationErrors ?? [],
    erq_path: erqPath ?? null,
    exp_path: expPath ?? null,
  };
}

export function makeResultEvent({ erq, exp, result, resultPath }) {
  return {
    timestamp: new Date().toISOString(),
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
    result_path: resultPath ?? null,
  };
}
