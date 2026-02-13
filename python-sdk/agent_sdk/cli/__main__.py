from __future__ import annotations

import sys


def main() -> int:
    # Minimal dispatcher: `python -m agent_sdk.cli <command> [args]`
    if len(sys.argv) < 2:
        print(
            "Usage: python -m agent_sdk.cli <command> [args]\n"
            "Commands:\n"
            "  tea-validate-and-log  Validate ERQ/EXP + append audit event\n"
            "  tea-log-result        Append TEA result audit event\n"
        )
        return 2

    cmd = sys.argv[1]
    argv = sys.argv[2:]

    if cmd == "tea-validate-and-log":
        from agent_sdk.cli.tea_validate_and_log import main as run

        return int(run(argv))

    if cmd == "tea-log-result":
        from agent_sdk.cli.tea_log_result import main as run

        return int(run(argv))

    print(f"Unknown command: {cmd}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
