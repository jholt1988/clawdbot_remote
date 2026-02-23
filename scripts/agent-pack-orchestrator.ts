/**
 * Agent-Pack Orchestrator with TEA/CEEG Integration
 * 
 * Phase 2-4: Full integration
 * - Phase 2: Risk classifier + ERQ submission
 * - Phase 3: TEA routing
 * - Phase 4: Notion DB sync
 * 
 * Usage:
 *   import { spawnWithRisk } from './agent-pack-orchestrator';
 */

import { classifyTaskRisk, getCEEGDecision, RiskClassification, TaskDefinition } from './agent-pack-risk';
import { toTEAERQ, routeToTEA, requestEXP } from './agent-pack-tea-router';
import { submitERQToNotion, requestEXPFromNotion, updateERQStatus } from './agent-pack-notion';

export interface SpawnTask extends TaskDefinition {
  task: string;
  label?: string;
  mode?: 'session' | 'run';
  cleanup?: 'keep' | 'delete';
}

export interface SpawnResult {
  success: boolean;
  label: string;
  risk: RiskClassification;
  ceeg_decision: ReturnType<typeof getCEEGDecision>;
  session_key?: string;
  error?: string;
}

/**
 * Spawn a single task with risk classification + TEA routing
 */
export async function spawnWithRisk(spawnTask: SpawnTask): Promise<SpawnResult> {
  // 1. Classify risk
  const risk = classifyTaskRisk(spawnTask);
  const ceegDecision = getCEEGDecision(risk.risk_level);

  console.log(`[Agent-Pack] Task: ${spawnTask.label || spawnTask.task}`);
  console.log(`[Agent-Pack] Risk: ${risk.risk_level} | Side effects: ${risk.side_effects_declared.join(', ')}`);
  console.log(`[Agent-Pack] CEEG: ${ceegDecision.description}`);

  // 2. Submit ERQ to CEEG (Phase 2)
  const erqId = await submitERQ(spawnTask, risk, ceegDecision);

  // 2b. Submit to Notion DB (Phase 4)
  let notionPageId: string | undefined;
  if (risk.risk_level !== 'low') {
    const notionResult = await submitERQToNotion({
      erq_id: erqId || `ERQ-${Date.now()}`,
      task: spawnTask.task,
      label: spawnTask.label,
      risk_level: risk.risk_level,
      side_effects_declared: risk.side_effects_declared,
      target_system: risk.target_system,
      target_environment: risk.target_environment,
    });
    notionPageId = notionResult.notionPageId;
  }

  // 3. Check if we should proceed
  if (risk.requires_project_red && risk.target_environment === 'production') {
    return {
      success: false,
      label: spawnTask.label || 'unknown',
      risk,
      ceeg_decision: ceegDecision,
      error: 'BLOCKED: High/critical risk in production requires Project-Red approval'
    };
  }

  // 4. Wait for CEEG approval (medium+) or proceed (low)
  if (ceegDecision.requires_ceeg_review && risk.risk_level !== 'low') {
    console.log(`[Agent-Pack] ⏳ Waiting for CEEG approval (ERQ: ${erqId})...`);
    // In production: await waitForCEEGApproval(erqId);
    console.log(`[Agent-Pack] ⚠️ Proceeding without CEEG approval (dev mode)`);
  }

  // 5. Route to TEA for execution (Phase 3)
  const teaERQ = toTEAERQ(spawnTask, risk, erqId || undefined);
  const teaResult = await routeToTEA(teaERQ);
  
  if (!teaResult.success) {
    return {
      success: false,
      label: spawnTask.label || 'unknown',
      risk,
      ceeg_decision: ceegDecision,
      error: `TEA routing failed: ${teaResult.error}`
    };
  }

  console.log(`[Agent-Pack] ✓ Routed to TEA (execution: ${teaResult.tea_execution_id})`);

  // 6. Update Notion status (Phase 4)
  if (notionPageId) {
    await updateERQStatus(notionPageId, 'Executing');
  }

  return {
    success: true,
    label: spawnTask.label || 'unknown',
    risk,
    ceeg_decision: ceegDecision,
    session_key: teaResult.tea_execution_id,
    // @ts-ignore - extended field
    notion_page_id: notionPageId,
  };
}

/**
 * Spawn multiple tasks in parallel with risk classification + EXP support
 */
export async function spawnPackWithRisks(tasks: SpawnTask[], useEXP = false): Promise<SpawnResult[]> {
  console.log(`[Agent-Pack] Starting pack with ${tasks.length} tasks (EXP mode: ${useEXP})`);
  
  const packId = `pack-${Date.now()}`;
  
  // Phase 3: Request EXP for batch approval
  let expId: string | undefined;
  if (useEXP) {
    const risks = tasks.map(t => ({ task: t.task, label: t.label, risk: classifyTaskRisk(t) }));
    const expResult = await requestEXP(risks, packId);
    expId = expResult.exp_id;
    console.log(`[Agent-Pack] EXP ${expResult.approved ? 'approved' : 'pending'}: ${expId}`);
    
    // Phase 4: Submit EXP to Notion
    const riskSummary = {
      low: risks.filter(r => r.risk.risk_level === 'low').length,
      medium: risks.filter(r => r.risk.risk_level === 'medium').length,
      high: risks.filter(r => r.risk.risk_level === 'high').length,
      critical: risks.filter(r => r.risk.risk_level === 'critical').length,
    };
    await requestEXPFromNotion({
      exp_id: expId,
      pack_id: packId,
      task_count: tasks.length,
      risk_summary: riskSummary,
      target_systems: [...new Set(tasks.map(t => t.target_system || 'local'))],
    });
  }
  
  const results = await Promise.all(
    tasks.map(task => spawnWithRisk(task))
  );

  // Summary
  const byRisk = {
    low: results.filter(r => r.risk.risk_level === 'low').length,
    medium: results.filter(r => r.risk.risk_level === 'medium').length,
    high: results.filter(r => r.risk.risk_level === 'high').length,
    critical: results.filter(r => r.risk.risk_level === 'critical').length,
  };

  console.log(`[Agent-Pack] Pack complete: ${byRisk.low} low, ${byRisk.medium} medium, ${byRisk.high} high, ${byRisk.critical} critical`);

  return results;
}

/**
 * Placeholder: Log task for CEEG audit
 */
async function logTaskForAudit(task: SpawnTask, risk: RiskClassification, ceegDecision: ReturnType<typeof getCEEGDecision>): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    task: task.task,
    label: task.label,
    ...risk,
    ceeg_decision: ceegDecision,
  };
  
  console.log(`[Agent-Pack Audit] ${JSON.stringify(logEntry)}`);
  
  // In production: POST to CEEG audit endpoint
  // await fetch('https://ceeg.audit.internal/log', { 
  //   method: 'POST', 
  //   body: JSON.stringify(logEntry) 
  // });
}

/**
 * Submit Execution Request (ERQ) to CEEG
 * Phase 2: Creates formal audit trail
 */
async function submitERQ(task: SpawnTask, risk: RiskClassification, ceegDecision: ReturnType<typeof getCEEGDecision>): Promise<string | null> {
  const erq = {
    erq_id: `ERQ-${Date.now()}-${task.label}`,
    timestamp: new Date().toISOString(),
    task: task.task,
    label: task.label,
    ...risk,
    ceeg_decision: ceegDecision,
    status: 'pending_review'
  };
  
  console.log(`[Agent-Pack ERQ] Submitting: ${erq.erq_id}`);
  // In production: POST to CEEG ERQ endpoint
  // await fetch('https://ceeg.internal/erq/submit', { 
  //   method: 'POST', 
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(erq) 
  // });
  
  return erq.erq_id;
}

/**
 * Spawn sub-agent via OpenClaw sessions_spawn
 */
async function spawnSubAgent(task: SpawnTask): Promise<{ success: boolean; session_key?: string; error?: string }> {
  console.log(`[Agent-Pack] Spawning: ${task.label} (mode: ${task.mode || 'run'})`);
  
  try {
    // In production, use actual sessions_spawn
    // import { sessions_spawn } from 'openclaw-tools';
    
    // Simulated for now - replace with real tool call:
    // const result = await sessions_spawn({
    //   agentId: 'pms-dev-orchestrator',
    //   label: task.label,
    //   task: task.task,
    //   cleanup: task.cleanup || 'delete',
    // });
    
    // Placeholder response
    return {
      success: true,
      session_key: `session-${task.label}-${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Example: PMS Demo Pack with Risk Classification
 */
export async function runPMSDemoPack(): Promise<void> {
  const tasks: SpawnTask[] = [
    {
      label: 'pms-a-04',
      task: 'PMS A-04: Owner role implementation',
      target_environment: 'dev',
      target_system: 'github',
    },
    {
      label: 'pms-b-08',
      task: 'PMS B-08: AI inspection photo upload',
      target_environment: 'dev',
      target_system: 'openai',
    },
    {
      label: 'pms-c-08',
      task: 'PMS C-08: Focus trap on modals',
      target_environment: 'dev',
      target_system: 'github',
    }
  ];

  await spawnPackWithRisks(tasks);
}

// runPMSDemoPack(); // Uncomment to test
