# Notion Sync (Single Source of Truth)

This repo uses a **rolling Notion page** pattern for the Agent System Pack.

## Why
We create a new Notion page each sync (to avoid partial edits / drift) and archive the previous one.
The **only safe way** to do this repeatedly is to keep a single, canonical pointer to the current live page.

## Files
- `AGENT-SYSTEM-PACK.md` — source of truth content
- `notion/latest_agent_system_pack_page_id.txt` — **single source of truth** for the latest Notion page id
- `scripts/notion-sync-agent-system-pack.mjs` — creates new page, appends content, archives previous, updates the pointer file

## Usage
```bash
node scripts/notion-sync-agent-system-pack.mjs \
  NOTION_PAGE_TITLE="Agent System Pack (v1) — Rolling" \
  NOTION_PARENT_PAGE_ID="<parent_page_id>"
```

Defaults are baked in for this workspace, but env vars can override:
- `AGENT_PACK_PATH`
- `LATEST_ID_PATH`
- `NOTION_PARENT_PAGE_ID`
- `NOTION_PAGE_TITLE`
- `NOTION_VERSION`
- `NOTION_API_KEY_PATH`

## Common failure
**400 Can't edit block that is archived**
- Usually means you tried to append children to a page that was already archived.
- Fix: use this script; it always writes to a fresh page and only archives the previous one.
