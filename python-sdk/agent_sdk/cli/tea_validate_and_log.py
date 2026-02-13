from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, Optional

from agent_sdk.audit.logger import append_audit_event, make_validation_event
from agent_sdk.ceeg import validate_erq, validate_exp


def _read_json(p: str) -> Dict[str, Any]:
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Validate TEA ERQ/EXP (schema-driven) and append audit event (JSONL)."
    )
    parser.add_argument("--erq", required=True, help="Path to ERQ JSON")
    parser.add_argument("--exp", required=False, help="Path to EXP JSON (required if ERQ.dry_run=false)")
    parser.add_argument(
        "--base-dir",
        required=False,
        default=None,
        help="Repo root (or any path inside it); used to locate governance/ schemas and logs/tea",
    )
    args = parser.parse_args(argv)

    erq_path = str(Path(args.erq).resolve())
    exp_path = str(Path(args.exp).resolve()) if args.exp else None

    erq = _read_json(erq_path)
    exp = _read_json(exp_path) if exp_path else None

    erq_res = validate_erq(erq, base_dir=args.base_dir)

    requires_exp = erq.get("dry_run") is False
    exp_res = {"ok": True, "errors": []}
    if requires_exp:
        exp_res = validate_exp(exp or {}, erq, base_dir=args.base_dir)

    approved = bool(erq_res.get("ok")) and bool(exp_res.get("ok"))
    validation_errors = [*(erq_res.get("errors") or []), *(exp_res.get("errors") or [])]

    event = make_validation_event(
        erq=erq,
        exp=exp,
        approved=approved,
        validation_errors=validation_errors,
        erq_path=erq_path,
        exp_path=exp_path,
    )

    log_path = append_audit_event(event, base_dir=args.base_dir)

    print(json.dumps({"approved": approved, "errors": validation_errors, "logPath": log_path}, indent=2))
    return 0 if approved else 1


if __name__ == "__main__":
    raise SystemExit(main())
