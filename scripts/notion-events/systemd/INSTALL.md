# Install systemd services (VM)

Repo: `/home/jordanh316/clawd`

## 1) Create `.env`
Create `/home/jordanh316/clawd/.env` with at least:

```env
NOTION_API_KEY=
NOTION_EXECUTION_REQUESTS_DB_ID=
NOTION_EXECUTION_PERMITS_DB_ID=
NOTION_PROJECTS_DB_ID=

REDIS_URL=redis://127.0.0.1:6379
WORKER_CONCURRENCY=5
LOCK_TTL_MS=900000
POLL_INTERVAL_MS=2000

# If you ever enable the webhook server.mjs again:
WEBHOOK_SECRET=
PORT=3000
```

Then lock permissions:
```bash
chmod 600 /home/jordanh316/clawd/.env
```

## 2) Copy unit files
```bash
sudo cp scripts/notion-events/systemd/clawd-notion-events-poller.service /etc/systemd/system/
sudo cp scripts/notion-events/systemd/clawd-notion-events-worker.service /etc/systemd/system/
```

## 3) Reload + enable
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now clawd-notion-events-poller
sudo systemctl enable --now clawd-notion-events-worker
```

## 4) Check logs
```bash
sudo systemctl status clawd-notion-events-poller --no-pager
sudo systemctl status clawd-notion-events-worker --no-pager

journalctl -u clawd-notion-events-poller -f
journalctl -u clawd-notion-events-worker -f
```

## 5) Schema verify (recommended before enabling)
```bash
cd /home/jordanh316/clawd
/usr/bin/node scripts/notion-events/notion-schema-verify.mjs
```
