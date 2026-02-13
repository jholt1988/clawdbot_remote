# clawd-agent-sdk (Python)

Python SDK for TEA/CEEG validation + audit logging.

## Install (editable)
From repo root:
```bash
python -m pip install -e python-sdk
```

## Use
```python
from agent_sdk.ceeg.validate import validate_erq, validate_exp
from agent_sdk.audit.logger import append_audit_event
```
