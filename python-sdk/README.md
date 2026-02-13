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
