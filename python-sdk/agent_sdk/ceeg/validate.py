from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


def _err(code: str, message: str, details: Optional[dict] = None) -> dict:
    return {"code": code, "message": message, "details": details}


def _is_non_empty_string(v: Any) -> bool:
    return isinstance(v, str) and v.strip() != ""


def _as_list(v: Any) -> List[Any]:
    return v if isinstance(v, list) else []


def validate_erq(erq: Dict[str, Any]) -> dict:
    errors: List[dict] = []

    required = [
        "erq_id",
        "project_id",
        "task_id",
        "requesting_team",
        "requesting_agent",
        "intent_summary",
        "execution_type",
        "script_body",
        "expected_outputs",
        "risk_level",
        "side_effects_declared",
        "timeout_seconds",
        "dry_run",
        "observability",
        "target_system",
        "target_environment",
        "target_identifier",
        "network_required",
    ]

    for k in required:
        if erq.get(k) is None:
            errors.append(_err("ERQ_MISSING_FIELD", f"Missing ERQ field: {k}"))

    if not _is_non_empty_string(erq.get("erq_id")):
        errors.append(_err("ERQ_INVALID", "erq_id must be a non-empty string"))
    if not _is_non_empty_string(erq.get("project_id")):
        errors.append(_err("ERQ_INVALID", "project_id must be a non-empty string"))
    if not _is_non_empty_string(erq.get("task_id")):
        errors.append(_err("ERQ_INVALID", "task_id must be a non-empty string"))

    if not isinstance(erq.get("dry_run"), bool):
        errors.append(_err("ERQ_INVALID", "dry_run must be boolean"))
    if not isinstance(erq.get("network_required"), bool):
        errors.append(_err("ERQ_INVALID", "network_required must be boolean"))

    risk = erq.get("risk_level")
    if risk not in ("low", "medium", "high"):
        errors.append(_err("ERQ_INVALID", "risk_level must be one of low|medium|high", {"risk_level": risk}))

    side_effects = _as_list(erq.get("side_effects_declared"))
    if len(side_effects) == 0:
        errors.append(_err("ERQ_INVALID", "side_effects_declared must be a non-empty array"))

    needs_rollback = (risk != "low") or any(s != "none" for s in side_effects)
    if needs_rollback and not _is_non_empty_string(erq.get("rollback_plan")):
        errors.append(
            _err(
                "ERQ_MISSING_ROLLBACK",
                "rollback_plan required for risk_level != low OR side_effects_declared != none",
            )
        )

    if erq.get("target_system") and erq.get("target_system") != "local":
        if not _is_non_empty_string(erq.get("credential_profile")):
            errors.append(_err("ERQ_MISSING_FIELD", "credential_profile required when target_system != local"))
        if not _is_non_empty_string(erq.get("rollback_plan")):
            errors.append(_err("ERQ_MISSING_ROLLBACK", "rollback_plan required when target_system != local"))

    return {"ok": len(errors) == 0, "errors": errors}


def validate_exp(exp: Dict[str, Any], erq: Dict[str, Any]) -> dict:
    errors: List[dict] = []

    if not exp:
        errors.append(_err("EXP_MISSING", "Missing EXP for non-dry-run"))
        return {"ok": False, "errors": errors}

    for k in ["exp_id", "erq_id", "approved_by", "approved_at", "expires_at", "approved_mode", "approved_scope"]:
        if exp.get(k) is None:
            errors.append(_err("EXP_MISSING_FIELD", f"Missing EXP field: {k}"))

    if erq and exp.get("erq_id") != erq.get("erq_id"):
        errors.append(
            _err(
                "EXP_MISMATCH",
                "EXP erq_id must match ERQ erq_id",
                {"exp_erq_id": exp.get("erq_id"), "erq_id": erq.get("erq_id")},
            )
        )

    if exp.get("approved_mode") != "non-dry-run":
        errors.append(_err("EXP_INVALID", 'approved_mode must be "non-dry-run"'))

    scope = exp.get("approved_scope") or {}
    for k in [
        "target_system",
        "target_environment",
        "allowed_resources",
        "allowed_actions",
        "credential_profile",
        "allowed_side_effects",
        "max_runtime_seconds",
        "max_changes",
    ]:
        if scope.get(k) is None:
            errors.append(_err("EXP_SCOPE_MISSING", f"Missing EXP approved_scope field: {k}"))

    # best-effort scope matching
    if scope.get("target_system") and erq.get("target_system") and scope.get("target_system") != erq.get("target_system"):
        errors.append(_err("SCOPE_MISMATCH", "target_system mismatch", {"erq": erq.get("target_system"), "exp": scope.get("target_system")}))
    if scope.get("target_environment") and erq.get("target_environment") and scope.get("target_environment") != erq.get("target_environment"):
        errors.append(_err("SCOPE_MISMATCH", "target_environment mismatch", {"erq": erq.get("target_environment"), "exp": scope.get("target_environment")}))
    if scope.get("credential_profile") and erq.get("credential_profile") and scope.get("credential_profile") != erq.get("credential_profile"):
        errors.append(_err("SCOPE_MISMATCH", "credential_profile mismatch", {"erq": erq.get("credential_profile"), "exp": scope.get("credential_profile")}))

    allowed_side = set([str(x) for x in _as_list(scope.get("allowed_side_effects"))])
    requested = [str(x) for x in _as_list(erq.get("side_effects_declared"))]
    disallowed = [s for s in requested if s not in allowed_side]
    if disallowed:
        errors.append(_err("SCOPE_MISMATCH", "ERQ side_effects_declared exceeds allowed_side_effects", {"disallowed": disallowed}))

    return {"ok": len(errors) == 0, "errors": errors}
