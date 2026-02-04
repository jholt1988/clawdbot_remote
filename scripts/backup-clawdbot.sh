#!/usr/bin/env bash
set -euo pipefail

# Backup Clawdbot workspace + state.
# - Workspace: /home/jordanh316/clawd (git commit + push if remote exists)
# - State: ~/.clawdbot (tar.gz)
# - Optional: upload archive to Google Drive (requires gog auth + DRIVE_FOLDER_ID)

WORKDIR="/home/jordanh316/clawd"
STATE_DIR="$HOME/.clawdbot"
BACKUP_DIR="$WORKDIR/backups"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
ARCHIVE="$BACKUP_DIR/clawdbot-state-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

log() { printf "[%s] %s\n" "$(date -u +%FT%TZ)" "$*"; }

log "Starting backup"

# 1) Commit workspace changes (if any)
cd "$WORKDIR"
if ! git diff --quiet || ! git diff --cached --quiet; then
  log "Workspace has changes; committing"
  git add -A
  git commit -m "backup: snapshot $STAMP" || true
else
  log "Workspace clean; no commit needed"
fi

# 2) Push if remote exists
if git remote get-url origin >/dev/null 2>&1; then
  log "Pushing workspace to origin"
  git push origin HEAD || log "WARN: git push failed"
else
  log "WARN: no git remote 'origin' configured; skipping push"
fi

# 3) Archive ~/.clawdbot
if [ -d "$STATE_DIR" ]; then
  log "Archiving $STATE_DIR -> $ARCHIVE"
  tar -czf "$ARCHIVE" -C "$HOME" ".clawdbot"
else
  log "WARN: $STATE_DIR not found; skipping"
fi

# 4) Optional: upload to Google Drive
# Requires:
# - gog auth configured for Drive
# - DRIVE_FOLDER_ID set (recommended)
if command -v gog >/dev/null 2>&1; then
  if [ -f "$ARCHIVE" ]; then
    if [ -n "${DRIVE_FOLDER_ID:-}" ]; then
      log "Uploading archive to Google Drive folder $DRIVE_FOLDER_ID"
      gog drive upload "$ARCHIVE" --parent "$DRIVE_FOLDER_ID" || log "WARN: Drive upload failed"
    else
      log "WARN: DRIVE_FOLDER_ID not set; skipping Drive upload"
    fi
  fi
else
  log "WARN: gog not installed/authenticated; skipping Drive upload"
fi

log "Backup complete"
