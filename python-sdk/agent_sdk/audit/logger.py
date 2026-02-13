from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional


def _today_utc() -> str:
    d = datetime.now(timezone.utc)
    return d.strftime("%Y-%m-%d")


def append_audit_event(event: Dict[str, Any], base_dir: Optional[str] = None) -> str:
    base = Path(base_dir) if base_dir else Path.cwd()
    log_path = base / "logs" / "tea" / f"{_today_utc()}.jsonl"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    # Ensure stable JSON encoding (UTF-8) and one-line JSONL.
    with log_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")
    return str(log_path)


def make_validation_event(
    *,
    erq: Dict[str, Any],
    exp: Optional[Dict[str, Any]],
    approved: bool,
    validation_errors: list,
    erq_path: Optional[str] = None,
    exp_path: Optional[str] = None,
) -> Dict[str, Any]:
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "kind": "tea.wrapper.validation",
        "approved": approved,
        "mode": "dry-run" if erq.get("dry_run") else "non-dry-run",
        "erq_id": erq.get("erq_id"),
        "exp_id": (exp or {}).get("exp_id") if exp else None,
        "project_id": erq.get("project_id"),
        "task_id": erq.get("task_id"),
        "requesting_agent": erq.get("requesting_agent"),
        "target_system": erq.get("target_system"),
        "target_environment": erq.get("target_environment"),
        "target_identifier": erq.get("target_identifier"),
        "network_required": erq.get("network_required"),
        "risk_level": erq.get("risk_level"),
        "validation_errors": validation_errors,
        "erq_path": erq_path,
        "exp_path": exp_path,
    }


def make_result_event(
    *,
    erq: Dict[str, Any],
    exp: Optional[Dict[str, Any]],
    result: Dict[str, Any],
    result_path: Optional[str] = None,
) -> Dict[str, Any]:
    stdout = result.get("stdout") if isinstance(result.get("stdout"), str) else None
    stderr = result.get("stderr") if isinstance(result.get("stderr"), str) else None

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "kind": "tea.wrapper.result",
        "mode": "dry-run" if erq.get("dry_run") else "non-dry-run",
        "erq_id": erq.get("erq_id"),
        "exp_id": (exp or {}).get("exp_id") if exp else None,
        "project_id": erq.get("project_id"),
        "task_id": erq.get("task_id"),
        "target_system": erq.get("target_system"),
        "target_environment": erq.get("target_environment"),
        "target_identifier": erq.get("target_identifier"),
        "status": result.get("status"),
        "execution_time_ms": result.get("execution_time_ms"),
        "artifacts_created": result.get("artifacts_created") or [],
        "side_effects_observed": result.get("side_effects_observed") or [],
        "targets_touched": result.get("targets_touched") or [],
        "stdout_preview": stdout[:2000] if stdout else None,
        "stderr_preview": stderr[:2000] if stderr else None,
        "result_path": result_path,
    }
