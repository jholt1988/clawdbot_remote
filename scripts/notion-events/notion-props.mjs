// Canonical Notion property name map for the execution layer.
// Override using env NOTION_PROP_OVERRIDES_JSON.

const defaults = {
  // Permit properties
  permitStatus: 'Status',
  permitApprovedMode: 'Approved Mode',
  permitExpiresAt: 'Expires At',
  permitExecutionRequest: 'Execution Request',
  permitLastRunAt: 'Last Run At',
  permitLastError: 'Last Error',
  permitLastOutput: 'Last Output',

  // Optional observability
  permitLockKeys: 'Lock Keys',
  permitWorkerId: 'Worker ID',
  permitRunAttempt: 'Run Attempt',

  // Request properties
  requestDryRun: 'Dry Run',
  requestTargetSystem: 'Target System',
  requestRiskLevel: 'Risk Level',
  requestProject: 'Project',
  requestTimeoutSeconds: 'Timeout Seconds',
  requestScriptPath: 'Script Path',
  requestExecutionStatus: 'Execution Status',

  // Optional (for composite target locks)
  requestTargetKind: 'Target Kind',
  requestTargetScopeId: 'Target Scope ID',
  requestCredentialProfile: 'Credential Profile',

  // Project properties
  projectState: 'Project State',
};

export function notionProps() {
  const raw = process.env.NOTION_PROP_OVERRIDES_JSON;
  if (!raw) return defaults;
  try {
    const overrides = JSON.parse(raw);
    return { ...defaults, ...overrides };
  } catch {
    return defaults;
  }
}
