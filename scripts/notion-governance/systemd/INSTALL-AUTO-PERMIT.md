# Install auto-permit-low-risk (systemd timer)

Repo: `/home/jordanh316/clawd`

## 1) Ensure env is set
In `/home/jordanh316/clawd/.env`:

```env
NOTION_API_KEY=
NOTION_EXECUTION_REQUESTS_DB_ID=
NOTION_EXECUTION_PERMITS_DB_ID=

# Safety defaults
AUTO_PERMIT_TARGET_SYSTEMS=local,notion
AUTO_PERMIT_AUTO_QUEUE=false
```

## 2) Install units
```bash
cd /home/jordanh316/clawd
sudo cp scripts/notion-governance/systemd/clawd-auto-permit-low-risk.service /etc/systemd/system/
sudo cp scripts/notion-governance/systemd/clawd-auto-permit-low-risk.timer /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now clawd-auto-permit-low-risk.timer
```

## 3) Verify
```bash
systemctl list-timers | grep clawd-auto-permit-low-risk
journalctl -u clawd-auto-permit-low-risk -n 80 --no-pager
```
