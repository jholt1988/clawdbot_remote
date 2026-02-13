import path from 'node:path';
import { parseArgs, readJson } from './_lib.mjs';
import { validateErq, validateExp } from '@clawd/agent-sdk/ceeg';
import { appendAuditEvent, makeValidationEvent } from '@clawd/agent-sdk/audit';

const args = parseArgs(process.argv);
const erqPath = args.erq;
const expPath = args.exp;

if (!erqPath) {
  console.error(
    'Usage: node scripts/tea/validate-and-log.mjs --erq /path/to/erq.json [--exp /path/to/exp.json]',
  );
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
const validationErrors = [...(erqV.errors || []), ...(expV.errors || [])];

const auditEvent = makeValidationEvent({
  erq,
  exp,
  approved,
  validationErrors,
  erqPath: path.resolve(erqPath),
  expPath: expPath ? path.resolve(expPath) : null,
});

const logPath = await appendAuditEvent(auditEvent, { baseDir: process.cwd() });

process.stdout.write(JSON.stringify({ approved, errors: validationErrors, logPath }, null, 2) + '\n');
process.exit(approved ? 0 : 1);
