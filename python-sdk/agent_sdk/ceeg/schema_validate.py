from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from jsonschema import Draft7Validator


def _err(code: str, message: str, details: Optional[dict] = None) -> dict:
    return {"code": code, "message": message, "details": details}


def _find_repo_root(start: Optional[Path] = None) -> Optional[Path]:
    """Best-effort: walk up until we find a governance/ folder."""
    cur = (start or Path.cwd()).resolve()
    for _ in range(12):
        if (cur / "governance").is_dir():
            return cur
        if cur.parent == cur:
            break
        cur = cur.parent
    return None


def _load_schema(schema_path: Path) -> Dict[str, Any]:
    with schema_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _schema_path(kind: str, version: str, base_dir: Optional[str] = None) -> Path:
    repo_root = _find_repo_root(Path(base_dir).resolve() if base_dir else None)
    if not repo_root:
        raise FileNotFoundError(
            "Could not locate repo root (no governance/ folder found). "
            "Pass base_dir=<repo root> explicitly."
        )
    if kind == "erq":
        name = f"tea-erq-schema-{version}.json"
    elif kind == "exp":
        name = f"tea-exp-schema-{version}.json"
    else:
        raise ValueError(f"Unknown schema kind: {kind}")
    return repo_root / "governance" / name


def validate_with_schema(
    payload: Dict[str, Any],
    *,
    schema_path: Path,
    code_prefix: str,
) -> dict:
    schema = _load_schema(schema_path)
    # Use Draft7Validator for broad compatibility (jsonschema 3.x/4.x).
    # The TEA schemas currently use keywords supported by Draft 7 (e.g., if/then, contains).
    v = Draft7Validator(schema)

    errors: List[dict] = []
    for e in sorted(v.iter_errors(payload), key=lambda x: list(x.path)):
        errors.append(
            _err(
                f"{code_prefix}_SCHEMA_VIOLATION",
                e.message,
                {
                    "path": "/" + "/".join([str(p) for p in e.path]),
                    "schema_path": "/" + "/".join([str(p) for p in e.schema_path]),
                },
            )
        )

    return {"ok": len(errors) == 0, "errors": errors, "schema": schema.get("$id")}


def validate_erq_schema(erq: Dict[str, Any], *, version: str = "v1.2", base_dir: Optional[str] = None) -> dict:
    path = _schema_path("erq", version, base_dir=base_dir)
    return validate_with_schema(erq, schema_path=path, code_prefix="ERQ")


def validate_exp_schema(exp: Dict[str, Any], *, version: str = "v1.2", base_dir: Optional[str] = None) -> dict:
    path = _schema_path("exp", version, base_dir=base_dir)
    return validate_with_schema(exp, schema_path=path, code_prefix="EXP")
