# Create PMS templates in Notion (Requests + Permits)

This creates **template rows** in:
- Execution Requests DB
- Execution Permits DB

It does not link permits to requests (templates should be duplicated and linked per run).

## Run
```bash
cd /home/jordanh316/clawd
node scripts/notion-governance/create-pms-templates.mjs
```

## Notes
- Templates are prefixed with `TEMPLATE —`.
- Local workflows default `Target Branch = ops`.
- GitHub permit templates are created with empty Allowed Repos list (fill in your two repos).
