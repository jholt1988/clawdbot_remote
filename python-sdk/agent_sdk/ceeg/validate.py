from __future__ import annotations

from typing import Any, Dict, List, Optional

from .schema_validate import validate_erq_schema, validate_exp_schema


def _err(code: str, message: str, details: Optional[dict] = None) -> dict:
    return {"code": code, "message": message, "details": details}


def validate_erq(erq: Dict[str, Any], *, schema_version: str = "v1.2", base_dir: Optional[str] = None) -> dict:
    """Schema-driven ERQ validation.

    - Validates against governance/tea-erq-schema-<schema_version>.json
    - base_dir should be the repo root (or any path inside it). If omitted, we try to auto-detect.
    """
    return validate_erq_schema(erq, version=schema_version, base_dir=base_dir)


def validate_exp(
    exp: Dict[str, Any],
    erq: Dict[str, Any],
    *,
    schema_version: str = "v1.2",
    base_dir: Optional[str] = None,
) -> dict:
    """Schema-driven EXP validation + ERQ binding checks."""

    errors: List[dict] = []

    schema_res = validate_exp_schema(exp, version=schema_version, base_dir=base_dir)
    errors.extend(schema_res.get("errors", []))

    # Deterministic binding checks (not expressible in the EXP schema alone)
    if exp.get("erq_id") != erq.get("erq_id"):
        errors.append(
            _err(
                "EXP_MISMATCH",
                "EXP erq_id must match ERQ erq_id",
                {"exp_erq_id": exp.get("erq_id"), "erq_id": erq.get("erq_id")},
            )
        )

    approved_ok = schema_res.get("ok", False) and len(errors) == 0
    return {"ok": approved_ok, "errors": errors, "schema": schema_res.get("schema")}
