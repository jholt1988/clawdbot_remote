# clawd-agent-sdk (Python)

Python SDK for TEA/CEEG validation + audit logging.

## Install (editable)
From repo root:
```bash
python -m pip install -e python-sdk
```

## Use

Schema-driven validation loads the canonical JSON Schemas from `governance/`.

```python
from agent_sdk.ceeg import validate_erq, validate_exp

# pass base_dir if you're not running from inside the repo
res = validate_erq(erq, base_dir="/home/jordanh316/clawd")
```

Audit logging:
```python
from agent_sdk.audit.logger import append_audit_event
```

CLI parity with Node scripts (no pip needed):
```bash
PYTHONPATH=python-sdk python3 -m agent_sdk.cli tea-validate-and-log --erq /path/to/erq.json --base-dir /home/jordanh316/clawd
PYTHONPATH=python-sdk python3 -m agent_sdk.cli tea-log-result --erq /path/to/erq.json --result /path/to/tea-output.json --base-dir /home/jordanh316/clawd
```

Exit codes (deterministic):
- `0` approved / success
- `1` rejected (validation failed)
- `2` usage error (bad args / missing command)
