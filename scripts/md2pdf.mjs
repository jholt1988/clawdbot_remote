import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { marked } from 'marked';

const inPath = process.argv[2];
if (!inPath) {
  console.error('Usage: node scripts/md2pdf.mjs <input.md> [output.pdf]');
  process.exit(2);
}
const outPath = process.argv[3] || inPath.replace(/\.md$/i, '.pdf');

const md = await readFile(inPath, 'utf8');
const htmlBody = marked.parse(md, { mangle: false, headerIds: true });

const css = `
  :root { --fg:#111; --muted:#555; --codebg:#f6f8fa; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: var(--fg); line-height: 1.35; }
  h1 { font-size: 26px; margin: 0 0 12px; }
  h2 { font-size: 18px; margin: 18px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  h3 { font-size: 15px; margin: 14px 0 6px; }
  p { margin: 8px 0; }
  ul { margin: 8px 0 8px 18px; }
  li { margin: 4px 0; }
  blockquote { margin: 10px 0; padding: 8px 12px; border-left: 4px solid #e5e7eb; color: var(--muted); background: #fafafa; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background: var(--codebg); padding: 0 4px; border-radius: 4px; }
  pre code { display:block; padding: 10px; overflow-x:auto; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  a { color: #0b62d6; text-decoration: none; }
  a:hover { text-decoration: underline; }
`;

const fullHtml = `<!doctype html><html><head><meta charset="utf-8" /><title>${path.basename(outPath)}</title><style>${css}</style></head><body>${htmlBody}</body></html>`;

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setContent(fullHtml, { waitUntil: 'networkidle' });
await page.pdf({
  path: outPath,
  format: 'Letter',
  margin: { top: '0.6in', bottom: '0.6in', left: '0.6in', right: '0.6in' },
  printBackground: true,
});
await browser.close();

console.log(`Wrote ${outPath}`);
