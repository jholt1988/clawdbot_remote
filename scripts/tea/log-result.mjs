import path from 'node:path';
import { parseArgs, readJson } from './_lib.mjs';
import { appendAuditEvent, makeResultEvent } from '@clawd/agent-sdk/audit';

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

const auditEvent = makeResultEvent({
  erq,
  exp,
  result,
  resultPath: path.resolve(resultPath),
});

const logPath = await appendAuditEvent(auditEvent, { baseDir: process.cwd() });

process.stdout.write(JSON.stringify({ logged: true, logPath }, null, 2) + '\n');
