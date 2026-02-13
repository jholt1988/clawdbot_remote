import { asArray, isNonEmptyString } from './_lib.mjs';

function err(code, message, details) {
  return { code, message, details };
}

export function validateErq(erq) {
  const errors = [];

  // v1.1 required core
  const required = [
    'erq_id',
    'project_id',
    'task_id',
    'requesting_team',
    'requesting_agent',
    'intent_summary',
    'execution_type',
    'script_body',
    'expected_outputs',
    'risk_level',
    'side_effects_declared',
    'timeout_seconds',
    'dry_run',
    'observability',
  ];
  for (const k of required) {
    if (erq?.[k] === undefined || erq?.[k] === null) {
      errors.push(err('ERQ_MISSING_FIELD', `Missing ERQ field: ${k}`));
    }
  }

  if (!isNonEmptyString(erq?.erq_id)) errors.push(err('ERQ_INVALID', 'erq_id must be a non-empty string'));
  if (!isNonEmptyString(erq?.project_id)) errors.push(err('ERQ_INVALID', 'project_id must be a non-empty string'));
  if (!isNonEmptyString(erq?.task_id)) errors.push(err('ERQ_INVALID', 'task_id must be a non-empty string'));

  if (typeof erq?.dry_run !== 'boolean') errors.push(err('ERQ_INVALID', 'dry_run must be boolean'));

  const risk = erq?.risk_level;
  if (!['low', 'medium', 'high'].includes(risk)) {
    errors.push(err('ERQ_INVALID', 'risk_level must be one of low|medium|high', { risk_level: risk }));
  }

  const sideEffects = asArray(erq?.side_effects_declared);
  if (sideEffects.length === 0) errors.push(err('ERQ_INVALID', 'side_effects_declared must be a non-empty array'));

  const needsRollback = risk !== 'low' || sideEffects.some((s) => s !== 'none');
  if (needsRollback && !isNonEmptyString(erq?.rollback_plan)) {
    errors.push(err('ERQ_MISSING_ROLLBACK', 'rollback_plan required for risk_level != low OR side_effects_declared != none'));
  }

  // External-ready fields (v1.2)
  if (!isNonEmptyString(erq?.target_system)) {
    errors.push(err('ERQ_MISSING_FIELD', 'Missing ERQ field: target_system'));
  }
  if (!isNonEmptyString(erq?.target_environment)) {
    errors.push(err('ERQ_MISSING_FIELD', 'Missing ERQ field: target_environment'));
  }
  if (!isNonEmptyString(erq?.target_identifier)) {
    errors.push(err('ERQ_MISSING_FIELD', 'Missing ERQ field: target_identifier'));
  }
  if (typeof erq?.network_required !== 'boolean') {
    errors.push(err('ERQ_INVALID', 'network_required must be boolean'));
  }

  if (erq?.target_system && erq.target_system !== 'local') {
    if (!isNonEmptyString(erq?.credential_profile)) {
      errors.push(err('ERQ_MISSING_FIELD', 'credential_profile required when target_system != local'));
    }
    if (!isNonEmptyString(erq?.rollback_plan)) {
      errors.push(err('ERQ_MISSING_ROLLBACK', 'rollback_plan required when target_system != local'));
    }
  }

  return { ok: errors.length === 0, errors };
}

export function validateExp(exp, erq) {
  const errors = [];

  if (!exp) {
    errors.push(err('EXP_MISSING', 'Missing EXP for non-dry-run'));
    return { ok: false, errors };
  }

  for (const k of ['exp_id', 'erq_id', 'approved_by', 'approved_at', 'expires_at', 'approved_mode', 'approved_scope']) {
    if (exp?.[k] === undefined || exp?.[k] === null) errors.push(err('EXP_MISSING_FIELD', `Missing EXP field: ${k}`));
  }

  if (erq && exp?.erq_id !== erq?.erq_id) {
    errors.push(err('EXP_MISMATCH', 'EXP erq_id must match ERQ erq_id', { exp_erq_id: exp?.erq_id, erq_id: erq?.erq_id }));
  }

  if (exp?.approved_mode !== 'non-dry-run') {
    errors.push(err('EXP_INVALID', 'approved_mode must be "non-dry-run"'));
  }

  // expiry check (best-effort)
  try {
    const expTime = new Date(exp?.expires_at).getTime();
    if (Number.isNaN(expTime)) throw new Error('invalid expires_at');
    if (Date.now() >= expTime) errors.push(err('EXP_EXPIRED', 'EXP is expired', { expires_at: exp?.expires_at }));
  } catch {
    errors.push(err('EXP_INVALID', 'expires_at must be ISO-8601 parseable'));
  }

  const scope = exp?.approved_scope || {};
  for (const k of ['target_system', 'target_environment', 'allowed_resources', 'allowed_actions', 'credential_profile', 'allowed_side_effects', 'max_runtime_seconds', 'max_changes']) {
    if (scope?.[k] === undefined || scope?.[k] === null) errors.push(err('EXP_SCOPE_MISSING', `Missing EXP approved_scope field: ${k}`));
  }

  // Scope matching
  if (erq) {
    if (scope.target_system && erq.target_system && scope.target_system !== erq.target_system) {
      errors.push(err('SCOPE_MISMATCH', 'target_system mismatch', { erq: erq.target_system, exp: scope.target_system }));
    }
    if (scope.target_environment && erq.target_environment && scope.target_environment !== erq.target_environment) {
      errors.push(err('SCOPE_MISMATCH', 'target_environment mismatch', { erq: erq.target_environment, exp: scope.target_environment }));
    }
    if (scope.credential_profile && erq.credential_profile && scope.credential_profile !== erq.credential_profile) {
      errors.push(err('SCOPE_MISMATCH', 'credential_profile mismatch', { erq: erq.credential_profile, exp: scope.credential_profile }));
    }

    // ERQ identifier must be whitelisted by allowed_resources (simple contains match)
    const allowedResources = asArray(scope.allowed_resources);
    if (isNonEmptyString(erq.target_identifier) && allowedResources.length > 0) {
      const ok = allowedResources.some((r) => String(r).includes(erq.target_identifier) || String(erq.target_identifier).includes(String(r)));
      if (!ok) {
        errors.push(
          err('SCOPE_MISMATCH', 'target_identifier not within allowed_resources (best-effort match)', {
            target_identifier: erq.target_identifier,
            allowed_resources: allowedResources,
          }),
        );
      }
    }

    // Side effects subset
    const allowedSideEffects = new Set(asArray(scope.allowed_side_effects).map(String));
    const requested = asArray(erq.side_effects_declared).map(String);
    const disallowed = requested.filter((s) => !allowedSideEffects.has(s));
    if (disallowed.length > 0) {
      errors.push(err('SCOPE_MISMATCH', 'ERQ side_effects_declared exceeds allowed_side_effects', { disallowed }));
    }

    // Timeout ceiling
    if (typeof scope.max_runtime_seconds === 'number' && typeof erq.timeout_seconds === 'number') {
      if (erq.timeout_seconds > scope.max_runtime_seconds) {
        errors.push(err('SCOPE_MISMATCH', 'timeout_seconds exceeds max_runtime_seconds', { timeout_seconds: erq.timeout_seconds, max_runtime_seconds: scope.max_runtime_seconds }));
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
