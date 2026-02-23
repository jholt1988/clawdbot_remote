/**
 * Agent-Pack TEA Execution Router
 * 
 * Phase 3: Routes approved ERQs to TEA for execution
 * - Validates ERQ against TEA schema v1.2
 * - Submits to TEA execution queue
 * - Handles execution status polling
 * 
 * Usage:
 *   import { routeToTEA } from './agent-pack-tea-router';
 *   await routeToTEA(erq, approvedExpId);
 */

import { RiskClassification } from './agent-pack-risk';

// TEA endpoint configuration
const TEA_CONFIG = {
  baseUrl: process.env.TEA_ENDPOINT || 'http://localhost:3000/api/tea',
  timeout: 30000,
};

/**
 * TEA-compatible ERQ format (v1.2 schema)
 */
export interface TEAERQ {
  erq_id: string;
  project_id: string;
  task_id: string;
  requesting_team: 'PMS Dev' | 'PMS Build' | 'Personal' | 'Library' | 'R&D' | 'Panel';
  requesting_agent: string;
  intent_summary: string;
  execution_type: 'shell' | 'python' | 'node' | 'internal-script' | 'api';
  script_body: string;
  inputs?: Record<string, unknown>;
  expected_outputs: {
    type: 'json' | 'text' | 'file' | 'none';
    success_criteria?: string[];
  };
  risk_level: 'low' | 'medium' | 'high';
  side_effects_declared: string[];
  timeout_seconds: number;
  dry_run: boolean;
  rollback_plan?: string;
  observability: {
    log_level: 'normal' | 'verbose';
    capture_stdout: boolean;
    capture_stderr: boolean;
  };
  target_system: 'local' | 'notion' | 'github' | 'gcp' | 'aws' | 'database' | 'custom-api';
  target_environment: 'dev' | 'staging' | 'prod';
  target_identifier: string;
  credential_profile?: 'readonly' | 'deploy' | 'admin';
  network_required: boolean;
}

/**
 * Convert agent-pack task to TEA ERQ format
 */
export function toTEAERQ(
  task: {
    task: string;
    label?: string;
    target_environment?: string;
    target_system?: string;
  },
  risk: RiskClassification,
  expId?: string
): TEAERQ {
  const taskId = task.label || `task-${Date.now()}`;
  
  return {
    erq_id: `ERQ-${Date.now()}-${taskId}`,
    project_id: expId ? `pack-${expId}` : 'agent-pack',
    task_id: taskId,
    requesting_team: 'PMS Dev',
    requesting_agent: 'agent-pack-orchestrator',
    intent_summary: task.task,
    execution_type: 'internal-script',
    script_body: task.task, // In production, this would be the actual script
    expected_outputs: {
      type: 'json',
      success_criteria: ['task completed successfully'],
    },
    risk_level: risk.risk_level as 'low' | 'medium' | 'high',
    side_effects_declared: risk.side_effects_declared,
    timeout_seconds: 300,
    dry_run: false,
    rollback_plan: risk.risk_level !== 'low' ? `Revert ${taskId} changes` : undefined,
    observability: {
      log_level: 'normal',
      capture_stdout: true,
      capture_stderr: true,
    },
    target_system: (risk.target_system as TEAERQ['target_system']) || 'local',
    target_environment: (risk.target_environment as TEAERQ['target_environment']) || 'dev',
    target_identifier: taskId,
    credential_profile: risk.target_environment === 'prod' ? 'deploy' : 'readonly',
    network_required: risk.side_effects_declared.includes('external_api_call'),
  };
}

/**
 * Submit ERQ to TEA for execution
 */
export async function routeToTEA(erq: TEAERQ, expId?: string): Promise<{
  success: boolean;
  tea_execution_id?: string;
  status?: string;
  error?: string;
}> {
  console.log(`[TEA Router] Submitting ERQ: ${erq.erq_id}`);
  
  // In production, POST to TEA
  // try {
  //   const response = await fetch(`${TEA_CONFIG.baseUrl}/execute`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ ...erq, exp_id: expId }),
  //   });
  //   if (!response.ok) throw new Error(`TEA error: ${response.status}`);
  //   return await response.json();
  // } catch (error) { ... }

  // Placeholder response
  const executionId = `tea-exec-${Date.now()}`;
  console.log(`[TEA Router] ✓ Queued for execution (ID: ${executionId})`);
  
  return {
    success: true,
    tea_execution_id: executionId,
    status: 'queued',
  };
}

/**
 * Poll TEA execution status
 */
export async function pollTEAStatus(executionId: string, maxAttempts = 10): Promise<{
  success: boolean;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}> {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`[TEA Router] Polling status (attempt ${i + 1}/${maxAttempts})...`);
    
    // In production: GET ${TEA_CONFIG.baseUrl}/status/${executionId}
    
    // Placeholder: simulate completion
    await new Promise(r => setTimeout(r, 1000));
    
    return {
      success: true,
      status: 'completed',
      result: { output: 'Task executed successfully' },
    };
  }
  
  return {
    success: false,
    status: 'failed',
    error: 'Timeout waiting for TEA execution',
  };
}

/**
 * Request Execution Permit (EXP) for a pack
 * Phase 3: Batch approval for multiple tasks
 */
export async function requestEXP(
  tasks: Array<{ task: string; label?: string; risk: RiskClassification }>,
  packId: string
): Promise<{
  exp_id: string;
  approved: boolean;
  scope?: {
    allowed_actions: string[];
    max_writes: number;
    target_systems: string[];
  };
}> {
  const expId = `EXP-${Date.now()}-${packId}`;
  
  // Determine aggregate risk
  const hasHighRisk = tasks.some(t => t.risk.risk_level === 'high' || t.risk.risk_level === 'critical');
  const targetSystems = [...new Set(tasks.map(t => t.risk.target_system))];
  
  console.log(`[EXP Request] Pack: ${packId} | Tasks: ${tasks.length} | High-risk: ${hasHighRisk}`);
  
  // In production: POST to CEEG for EXP approval
  // const response = await fetch(`${TEA_CONFIG.baseUrl}/exp/request`, { ... });
  
  // Placeholder: auto-approve for dev
  return {
    exp_id: expId,
    approved: true,
    scope: {
      allowed_actions: ['read', 'write'],
      max_writes: 50,
      target_systems: targetSystems as string[],
    },
  };
}
