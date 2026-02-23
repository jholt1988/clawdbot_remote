/**
 * Agent-Pack Risk Classifier
 * 
 * Phase 1 of Agent-Pack + TEA/CEEG Integration
 * Adds risk classification to every task before execution.
 * 
 * Usage:
 *   import { classifyTaskRisk } from './agent-pack-risk';
 *   const risk = classifyTaskRisk({ task: "PMS-A-04", label: "owner-role" });
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type SideEffect = 
  | 'repo_push'
  | 'repo_delete'
  | 'db_read'
  | 'db_write'
  | 'db_schema_mutation'
  | 'infra_mutation'
  | 'external_api_call'
  | 'delete_or_purge'
  | 'file_write'
  | 'file_delete';

export interface TaskDefinition {
  task: string;
  label?: string;
  target_system?: string;
  target_environment?: 'dev' | 'staging' | 'production';
}

export interface RiskClassification {
  risk_level: RiskLevel;
  side_effects_declared: SideEffect[];
  requires_project_red: boolean;
  target_system: string;
  target_environment: string;
}

/**
 * Detect side effects from task definition
 */
function detectSideEffects(task: TaskDefinition): SideEffect[] {
  const sideEffects: SideEffect[] = [];
  const taskLower = task.task.toLowerCase();
  const labelLower = task.label?.toLowerCase() || '';

  // DB operations
  if (taskLower.includes('seed') || taskLower.includes('reset') || taskLower.includes('migration')) {
    sideEffects.push('db_write', 'db_schema_mutation');
  }
  if (taskLower.includes('delete') || taskLower.includes('remove')) {
    sideEffects.push('delete_or_purge', 'db_write');
  }

  // Repo operations
  if (taskLower.includes('commit') || taskLower.includes('push') || taskLower.includes('merge')) {
    sideEffects.push('repo_push');
  }

  // External APIs
  if (taskLower.includes('ai') || taskLower.includes('openai') || taskLower.includes('api')) {
    sideEffects.push('external_api_call');
  }

  // Infrastructure
  if (taskLower.includes('infra') || taskLower.includes('docker') || taskLower.includes('deploy')) {
    sideEffects.push('infra_mutation');
  }

  // File operations
  if (taskLower.includes('create') || taskLower.includes('add') || taskLower.includes('update')) {
    sideEffects.push('file_write');
  }

  return sideEffects.length > 0 ? sideEffects : ['repo_push']; // Default to repo_push for most tasks
}

/**
 * Classify task risk based on side effects and target environment
 */
export function classifyTaskRisk(task: TaskDefinition): RiskClassification {
  const sideEffects = detectSideEffects(task);
  const targetEnv = task.target_environment || 'dev';
  const targetSystem = task.target_system || 'local';

  let risk: RiskLevel = 'low';

  // Determine base risk from side effects
  if (sideEffects.includes('delete_or_purge') || 
      sideEffects.includes('infra_mutation') ||
      sideEffects.includes('db_schema_mutation')) {
    risk = 'critical';
  } else if (sideEffects.includes('external_api_call')) {
    risk = 'high';
  } else if (sideEffects.includes('repo_push') || 
             sideEffects.includes('db_write') ||
             sideEffects.includes('file_write')) {
    risk = 'medium';
  }

  // Elevate risk for production
  if (targetEnv === 'production') {
    if (risk === 'low') risk = 'medium';
    else if (risk === 'medium') risk = 'high';
    else if (risk === 'high') risk = 'critical';
  }

  const requiresProjectRed = risk === 'critical' || risk === 'high';

  return {
    risk_level: risk,
    side_effects_declared: sideEffects,
    requires_project_red: requiresProjectRed,
    target_system: targetSystem,
    target_environment: targetEnv,
  };
}

/**
 * Get CEEG decision based on risk level
 */
export function getCEEGDecision(risk: RiskLevel): {
  requires_ceeg_review: boolean;
  auto_approve: boolean;
  project_red_required: boolean;
  description: string;
} {
  switch (risk) {
    case 'low':
      return {
        requires_ceeg_review: false,
        auto_approve: true,
        project_red_required: false,
        description: 'Auto-approved. Low risk - standard execution.'
      };
    case 'medium':
      return {
        requires_ceeg_review: true,
        auto_approve: false,
        project_red_required: false,
        description: 'CEEG review required. Medium risk - manual approval.'
      };
    case 'high':
      return {
        requires_ceeg_review: true,
        auto_approve: false,
        project_red_required: true,
        description: 'CEEG review + Project-Red required. High risk.'
      };
    case 'critical':
      return {
        requires_ceeg_review: true,
        auto_approve: false,
        project_red_required: true,
        description: 'CEEG review + Project-Red + Human sign-off. Critical risk.'
      };
  }
}

/**
 * Example usage
 */
// const risk = classifyTaskRisk({ 
//   task: "PMS-A-04: Owner role implementation", 
//   label: "owner-role",
//   target_environment: "dev" 
// });
// console.log(risk);
// { 
//   risk_level: 'medium',
//   side_effects_declared: ['repo_push'],
//   requires_project_red: false,
//   target_system: 'local',
//   target_environment: 'dev'
// }
