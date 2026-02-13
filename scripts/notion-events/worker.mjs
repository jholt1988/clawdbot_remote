import 'dotenv/config';
import { Worker } from 'bullmq';
import { Client } from '@notionhq/client';
import { execFile } from 'node:child_process';
import path from 'node:path';
import crypto from 'node:crypto';
import { connection } from './infra/queue.mjs';
import { buildRedlock } from './infra/lock.mjs';
import { notionProps } from './notion-props.mjs';
import { getText, getSelectName, getCheckbox, getRelationId } from './notion-helpers.mjs';

const P = notionProps();
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const redlock = buildRedlock(connection);

const WORKER_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 5);
const LOCK_TTL_MS = Number(process.env.LOCK_TTL_MS || 900000);

function nowISO() {
  return new Date().toISOString();
}

async function updatePermit(permitId, updates) {
  await notion.pages.update({ page_id: permitId, properties: updates });
}

async function updateRequest(requestId, updates) {
  await notion.pages.update({ page_id: requestId, properties: updates });
}

async function validatePermitAndRequest(permitId) {
  const permit = await notion.pages.retrieve({ page_id: permitId });

  const permitStatus = getSelectName(permit.properties[P.permitStatus]);
  const approvedMode = getSelectName(permit.properties[P.permitApprovedMode]);
  const expiresAt = permit.properties[P.permitExpiresAt]?.date?.start || null;

  if (permitStatus !== 'Approved') {
    return { ok: false, reason: `permit_status_${permitStatus}` };
  }
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: 'permit_expired' };
  }

  const requestId = getRelationId(permit.properties[P.permitExecutionRequest]);
  if (!requestId) return { ok: false, reason: 'permit_missing_request_relation' };

  const reqPage = await notion.pages.retrieve({ page_id: requestId });

  const dryRun = getCheckbox(reqPage.properties[P.requestDryRun]);
  const targetSystem = getSelectName(reqPage.properties[P.requestTargetSystem]);
  const risk = getSelectName(reqPage.properties[P.requestRiskLevel]);

  // Mode match hard check
  if (dryRun && approvedMode !== 'dry-run') return { ok: false, reason: 'mode_mismatch' };
  if (!dryRun && approvedMode !== 'non-dry-run') return { ok: false, reason: 'mode_mismatch' };

  const projectId = getRelationId(reqPage.properties[P.requestProject]);
  if (!projectId) return { ok: false, reason: 'request_missing_project' };

  // EEP v1.0 gate (high-risk external non-dry-run => Project State must be Red)
  if (!dryRun && targetSystem !== 'local' && risk === 'High') {
    const project = await notion.pages.retrieve({ page_id: projectId });
    const projectState = getSelectName(project.properties[P.projectState]);
    if (projectState !== 'Red') return { ok: false, reason: 'project_not_red' };
  }

  return { ok: true, permit, request: reqPage, requestId, projectId };
}

function sha1(s) {
  return crypto.createHash('sha1').update(String(s || '')).digest('hex').slice(0, 12);
}

function getTargetKeyFromRequest(requestProps) {
  const kind = getSelectName(requestProps[P.requestTargetKind]) || 'other';
  const scopeId = getText(requestProps[P.requestTargetScopeId]) || '';
  const cred = getSelectName(requestProps[P.requestCredentialProfile]) || 'default';

  const normalizedScope = scopeId ? scopeId : 'unspecified';
  const scopePart = normalizedScope.length > 64 ? sha1(normalizedScope) : normalizedScope;

  return `${kind}:${scopePart}:${cred}`;
}

function runNodeScript(scriptPath, timeoutMs) {
  return new Promise((resolve) => {
    const abs = path.isAbsolute(scriptPath)
      ? scriptPath
      : path.join(process.cwd(), scriptPath);

    execFile('node', [abs], { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          stdout: String(stdout || ''),
          stderr: String(stderr || ''),
          error: String(error.message || error),
        });
      } else {
        resolve({ ok: true, stdout: String(stdout || ''), stderr: String(stderr || '') });
      }
    });
  });
}

const worker = new Worker(
  'execution-queue',
  async (job) => {
    const { permitId } = job.data;

    // Re-validate at execution time.
    const v = await validatePermitAndRequest(permitId);
    if (!v.ok) {
      await updatePermit(permitId, {
        [P.permitStatus]: { select: { name: 'Failed' } },
        [P.permitLastError]: { rich_text: [{ text: { content: v.reason } }] },
        [P.permitLastRunAt]: { date: { start: nowISO() } },
      });
      return { blocked: true, reason: v.reason };
    }

    const { request, requestId, projectId } = v;

    const targetKey = getTargetKeyFromRequest(request.properties);
    const lockKeys = [`lock:project:${projectId}`, `lock:target:${targetKey}`].sort();

    const lock = await redlock.acquire(lockKeys, LOCK_TTL_MS);

    try {
      await updatePermit(permitId, {
        [P.permitStatus]: { select: { name: 'Running' } },
        [P.permitLastRunAt]: { date: { start: nowISO() } },
        [P.permitLastError]: { rich_text: [] },

        ...(P.permitLockKeys
          ? { [P.permitLockKeys]: { rich_text: [{ text: { content: lockKeys.join(' | ') } }] } }
          : {}),
        ...(P.permitWorkerId
          ? {
              [P.permitWorkerId]: {
                rich_text: [{ text: { content: process.env.WORKER_ID || process.env.HOSTNAME || 'worker-1' } }],
              },
            }
          : {}),
        ...(P.permitRunAttempt
          ? { [P.permitRunAttempt]: { number: (job.attemptsMade || 0) + 1 } }
          : {}),
      });

      await updateRequest(requestId, {
        [P.requestExecutionStatus]: { select: { name: 'Running' } },

        ...(P.requestLockKeys
          ? { [P.requestLockKeys]: { rich_text: [{ text: { content: lockKeys.join(' | ') } }] } }
          : {}),
        ...(P.requestWorkerId
          ? {
              [P.requestWorkerId]: {
                rich_text: [{ text: { content: process.env.WORKER_ID || process.env.HOSTNAME || 'worker-1' } }],
              },
            }
          : {}),
        ...(P.requestRunAttempt
          ? { [P.requestRunAttempt]: { number: (job.attemptsMade || 0) + 1 } }
          : {}),
      });

      const scriptPath = getText(request.properties[P.requestScriptPath]);
      const timeoutSeconds = request.properties[P.requestTimeoutSeconds]?.number || 60;

      const result = await runNodeScript(scriptPath, timeoutSeconds * 1000);

      if (result.ok) {
        await updateRequest(requestId, {
          [P.requestExecutionStatus]: { select: { name: 'Executed' } },
        });
        await updatePermit(permitId, {
          [P.permitStatus]: { select: { name: 'Executed' } },
          [P.permitLastOutput]: {
            rich_text: [{ text: { content: (result.stdout || '').slice(0, 1800) } }],
          },
        });
        return { ok: true };
      }

      await updateRequest(requestId, {
        [P.requestExecutionStatus]: { select: { name: 'Failed' } },
      });
      await updatePermit(permitId, {
        [P.permitStatus]: { select: { name: 'Failed' } },
        [P.permitLastError]: {
          rich_text: [{ text: { content: (result.error || result.stderr || '').slice(0, 1800) } }],
        },
      });
      throw new Error(result.error || 'script_failed');
    } finally {
      await lock.release().catch(() => {});
    }
  },
  { connection, concurrency: WORKER_CONCURRENCY },
);

worker.on('failed', (job, err) => {
  console.error('Job failed:', job?.id, err?.message);
});

console.log(`Worker running. Concurrency=${WORKER_CONCURRENCY}`);
