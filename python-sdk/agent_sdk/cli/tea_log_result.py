from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, Optional

from agent_sdk.audit.logger import append_audit_event, make_result_event


def _read_json(p: str) -> Dict[str, Any]:
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Append TEA result audit event (JSONL).")
    parser.add_argument("--erq", required=True, help="Path to ERQ JSON")
    parser.add_argument("--result", required=True, help="Path to TEA output JSON")
    parser.add_argument("--exp", required=False, help="Path to EXP JSON (optional)")
    parser.add_argument(
        "--base-dir",
        required=False,
        default=None,
        help="Repo root (or any path inside it); determines logs/tea output location",
    )
    args = parser.parse_args(argv)

    erq_path = str(Path(args.erq).resolve())
    exp_path = str(Path(args.exp).resolve()) if args.exp else None
    result_path = str(Path(args.result).resolve())

    erq = _read_json(erq_path)
    exp = _read_json(exp_path) if exp_path else None
    result = _read_json(result_path)

    event = make_result_event(erq=erq, exp=exp, result=result, result_path=result_path)
    log_path = append_audit_event(event, base_dir=args.base_dir)

    print(json.dumps({"logged": True, "logPath": log_path}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
