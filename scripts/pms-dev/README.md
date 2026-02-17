# PMS Dev Runner (tracked)

This folder contains the **tracked** dev runner scripts for the PMS demo environment.

Why this exists:
- `pms-master/` is gitignored in this workspace, so we keep reusable runner logic here.

## Managed Postgres (DB already provisioned)

From repo root:
```bash
bash scripts/pms-dev/dev-managed-up.sh --root ./pms-master
```

Or from `pms-master/` (if Makefile is wired locally):
```bash
make dev
```

### Redis modes
- Default: docker compose redis
- Skip starting redis:
```bash
PMS_REDIS_MODE=skip bash scripts/pms-dev/dev-managed-up.sh --root ./pms-master
```
- Use system redis:
```bash
PMS_REDIS_MODE=system bash scripts/pms-dev/dev-managed-up.sh --root ./pms-master
```

### Required env
- `DATABASE_URL` must be set either in `pms-master/tenant_portal_backend/.env` or exported in your shell.

## Files
- `dev-managed-up.sh` — single-command orchestrator (FE/BE/Redis + migrate+seed)
- `docker-compose.redis.yml` — Redis only
- `env.example` — top-level template notes
