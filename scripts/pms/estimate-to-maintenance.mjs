#!/usr/bin/env node
import fs from 'node:fs/promises';
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
  });
}

function replaceOnce(haystack, needle, replacement, label) {
  const idx = haystack.indexOf(needle);
  if (idx === -1) throw new Error(`replaceOnce failed (${label}): needle not found`);
  const idx2 = haystack.indexOf(needle, idx + 1);
  if (idx2 !== -1) throw new Error(`replaceOnce failed (${label}): needle not unique`);
  return haystack.replace(needle, replacement);
}

const repoRoot = process.cwd();
const pmsRoot = process.env.PMS_ROOT || path.join(repoRoot, 'pms-master');

const backendFile = path.join(pmsRoot, 'tenant_portal_backend/src/inspection/estimate.controller.ts');
const frontendFile = path.join(pmsRoot, 'tenant_portal_app/src/InspectionDetailPage.tsx');

let summary = { ok: false, changed: [], ts: new Date().toISOString() };

// 0) ensure git clean
const st = await run('git', ['status', '--porcelain'], { cwd: pmsRoot });
if (st.code !== 0) throw new Error(`git status failed: ${st.err}`);
if (st.out.trim()) throw new Error('pms-master working tree not clean; commit/stash first');

// 1) backend: add guards + PM-only convert endpoint
{
  let src = await fs.readFile(backendFile, 'utf8');

  if (!src.includes("@UseGuards(AuthGuard('jwt'), RolesGuard)")) {
    src = replaceOnce(
      src,
      "import {\n  Controller,\n  Get,\n  Post,\n  Patch,\n  Body,\n  Param,\n  Query,\n  UseGuards,\n  Request,\n  ParseUUIDPipe,\n  HttpStatus,\n  HttpCode,\n} from '@nestjs/common';\n",
      "import {\n  Controller,\n  Get,\n  Post,\n  Patch,\n  Body,\n  Param,\n  Query,\n  UseGuards,\n  Request,\n  ParseUUIDPipe,\n  HttpStatus,\n  HttpCode,\n} from '@nestjs/common';\nimport { AuthGuard } from '@nestjs/passport';\nimport { RolesGuard } from '../auth/roles.guard';\nimport { Roles } from '../auth/roles.decorator';\nimport { Role } from '@prisma/client';\n",
      'backend-imports',
    );

    src = replaceOnce(
      src,
      "@Controller('api/estimates')\nexport class EstimateController {",
      "@Controller('api/estimates')\n@UseGuards(AuthGuard('jwt'), RolesGuard)\nexport class EstimateController {",
      'backend-controller-guards',
    );

    // Gate conversion to PM only
    src = src.replace(
      "@Post(':id/convert-to-maintenance')\n  @HttpCode(HttpStatus.CREATED)\n  async convertToMaintenanceRequests(\n",
      "@Post(':id/convert-to-maintenance')\n  @Roles(Role.PROPERTY_MANAGER)\n  @HttpCode(HttpStatus.CREATED)\n  async convertToMaintenanceRequests(\n",
    );

    await fs.writeFile(backendFile, src, 'utf8');
    summary.changed.push('backend:estimate.controller guards + PM-only convert');
  }
}

// 2) frontend: add PM-only Convert-to-Maintenance button w/ confirm in EstimatePanel
{
  let src = await fs.readFile(frontendFile, 'utf8');

  // Ensure EstimatePanel signature supports token + canManage
  if (!src.includes('canManage?: boolean')) {
    src = replaceOnce(
      src,
      "function EstimatePanel({ estimate, embedded = false }: { estimate: any; embedded?: boolean }) {",
      "function EstimatePanel({ estimate, embedded = false, token, canManage = false }: { estimate: any; embedded?: boolean; token?: string; canManage?: boolean }) {",
      'frontend-estimatepanel-signature',
    );

    // Add convert UI state + handlers after handleCopySummary
    const anchor = "  const handleCopySummary = async () => {\n    const text = buildCopySummary();\n    try {\n      await navigator.clipboard.writeText(text);\n    } catch {\n      // fallback\n      window.prompt('Copy estimate summary:', text);\n    }\n  };\n";

    const insert = `${anchor}

  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const handleConvertToMaintenance = async () => {
    if (!token) {
      setConvertError('Missing auth token');
      return;
    }
    setConvertLoading(true);
    setConvertError(null);
    try {
      await apiFetch('/estimates/' + String((e).id) + '/convert-to-maintenance', {
        token: token ?? undefined,
        method: 'POST',
      });
    } catch (err) {
      setConvertError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setConvertLoading(false);
    }
  };
`;

    src = replaceOnce(src, anchor, insert, 'frontend-insert-convert-handlers');

    // Add ConfirmDialog + error card inside non-embedded return CardBody
    const cardBodyNeedle = '<CardBody className="flex flex-col gap-4">{body}</CardBody>';
    const cardBodyReplacement = `<CardBody className="flex flex-col gap-4">
        {canManage && (
          <>
            <ConfirmDialog
              isOpen={showConvertDialog}
              onOpenChange={() => setShowConvertDialog(false)}
              title="Convert estimate to maintenance requests?"
              message="This will create maintenance requests from the estimate line items. Existing requests won’t be deleted."
              confirmLabel="Convert"
              confirmColor="warning"
              isLoading={convertLoading}
              onConfirm={() => {
                setShowConvertDialog(false);
                handleConvertToMaintenance();
              }}
            />
            {convertError && (
              <Card className="border border-rose-200">
                <CardBody>
                  <p className="text-sm text-rose-700">{convertError}</p>
                </CardBody>
              </Card>
            )}
          </>
        )}
        {body}
      </CardBody>`;

    src = replaceOnce(src, cardBodyNeedle, cardBodyReplacement, 'frontend-estimatepanel-cardbody');

    // Add Convert button in header next to Copy Summary.
    src = src.replace(
      '<Button size="sm" variant="flat" onClick={handleCopySummary}>\n            Copy Summary\n          </Button>',
      `<div className="flex items-center gap-2">
            <Button size="sm" variant="flat" onClick={handleCopySummary}>
              Copy Summary
            </Button>
            {canManage && (
              <Button
                size="sm"
                variant="flat"
                color="warning"
                onClick={() => setShowConvertDialog(true)}
                isLoading={convertLoading}
              >
                Convert → Maintenance
              </Button>
            )}
          </div>`,
    );

    // Pass token + canManage from InspectionDetailPage where EstimatePanel is used.
    src = src.replace(
      '{estimateResult && (\n        <EstimatePanel estimate={estimateResult} />\n      )}',
      '{estimateResult && (\n        <EstimatePanel estimate={estimateResult} token={token ?? undefined} canManage={isPropertyManager} />\n      )}',
    );

    src = src.replace(
      '<EstimatePanel estimate={e} embedded />',
      '<EstimatePanel estimate={e} embedded token={token ?? undefined} canManage={isPropertyManager} />',
    );

    await fs.writeFile(frontendFile, src, 'utf8');
    summary.changed.push('frontend:estimate convert-to-maintenance button + confirm');
  }
}

// 3) run CI fast
{
  const res = await run('node', ['scripts/pms/ci-fast.mjs'], { cwd: repoRoot });
  if (res.code !== 0) {
    console.log(JSON.stringify({ ok: false, step: 'ci-fast', out: res.out.slice(0, 2000), err: res.err.slice(0, 2000) }, null, 2));
    process.exit(1);
  }
}

// 4) commit changes in pms-master
{
  await run('git', ['add', '.'], { cwd: pmsRoot });
  const msg = 'Estimate: convert to maintenance (PM-only UI + endpoint guard)';
  const c = await run('git', ['commit', '-m', msg], { cwd: pmsRoot });
  if (c.code !== 0) throw new Error(`git commit failed: ${c.err || c.out}`);
}

summary.ok = true;
console.log(JSON.stringify(summary, null, 2));
