# Branding PDF Generation

This folder contains PDF exports generated from the Markdown brand guides in `Branding/`.

## Tooling
- **Node.js** script: `Branding/pdf/generate-brand-pdfs.mjs`
- **Markdown parser:** `marked`
- **PDF renderer:** `playwright` (Chromium `page.pdf()`)

The script applies two visual themes:
- **Classic PMS theme** for `BRAND_STYLE_GUIDE.md` and `BRAND_QUICK_REFERENCE.md`
- **Modern Ledger alternate theme** for `ALTERNATE_BRAND_STYLE_GUIDE.md` and `ALTERNATE_BRAND_QUICK_REFERENCE.md`

## Regenerate
From repo root:

```bash
npm install
npx playwright install chromium
node Branding/pdf/generate-brand-pdfs.mjs
```

## Outputs
- `BRAND_STYLE_GUIDE.pdf`
- `ALTERNATE_BRAND_STYLE_GUIDE.pdf`
- `BRAND_QUICK_REFERENCE.pdf`
- `ALTERNATE_BRAND_QUICK_REFERENCE.pdf`
