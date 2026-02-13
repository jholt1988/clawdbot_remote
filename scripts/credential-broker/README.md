# Credential Broker (framework)

This is a **deny-by-default** placeholder for a real credential broker.

Production requirement:
- external non-dry-run should obtain short-lived, scope-bound credentials via broker
- TEA/CEEG should never receive long-lived credentials in ERQ

This repo currently provides only the interface shape and a stub.

Next implementations (choose one):
- Vault
- GCP Workload Identity
- GitHub App installation tokens
- AWS STS
