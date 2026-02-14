# Install dead-letter dashboard (systemd timer)

1) (Optional) set `NOTION_DEAD_LETTER_DASHBOARD_PAGE_ID` in `/home/jordanh316/clawd/.env`.
   - Create a Notion page named "Dead Letter Dashboard" and share it with the integration.

2) Copy units:
```bash
sudo cp scripts/notion-events/systemd/clawd-dead-letter-dashboard.service /etc/systemd/system/
sudo cp scripts/notion-events/systemd/clawd-dead-letter-dashboard.timer /etc/systemd/system/
```

3) Enable timer:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now clawd-dead-letter-dashboard.timer
```

4) Inspect:
```bash
systemctl list-timers | grep clawd-dead-letter-dashboard
journalctl -u clawd-dead-letter-dashboard -n 80 --no-pager
```
