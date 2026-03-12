import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { chromium } from 'playwright';

const rootDir = path.resolve(process.cwd(), 'Branding');
const outDir = path.join(rootDir, 'pdf');

const docs = [
  {
    input: 'BRAND_STYLE_GUIDE.md',
    output: 'BRAND_STYLE_GUIDE.pdf',
    title: 'Brand Style Guide (PMS)',
    theme: 'classic',
  },
  {
    input: 'ALTERNATE_BRAND_STYLE_GUIDE.md',
    output: 'ALTERNATE_BRAND_STYLE_GUIDE.pdf',
    title: 'Alternate Brand Style Guide (PMS)',
    theme: 'modern-ledger',
  },
  {
    input: 'BRAND_QUICK_REFERENCE.md',
    output: 'BRAND_QUICK_REFERENCE.pdf',
    title: 'Brand Quick Reference (PMS)',
    theme: 'classic',
  },
  {
    input: 'ALTERNATE_BRAND_QUICK_REFERENCE.md',
    output: 'ALTERNATE_BRAND_QUICK_REFERENCE.pdf',
    title: 'Alternate Brand Quick Reference (PMS)',
    theme: 'modern-ledger',
  },
];

const baseCss = `
  @page { margin: 0.65in 0.72in 0.75in 0.72in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    line-height: 1.55;
    font-size: 12pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc {
    max-width: 8.1in;
    margin: 0 auto;
  }
  .hero {
    border-radius: 14px;
    padding: 22px 24px 16px;
    margin: 6px 0 22px;
    page-break-inside: avoid;
  }
  .kicker {
    text-transform: uppercase;
    letter-spacing: .08em;
    font-size: 9pt;
    opacity: .8;
    margin-bottom: 6px;
    font-weight: 700;
  }
  h1,h2,h3,h4 { margin: 1.1em 0 .4em; line-height: 1.25; page-break-after: avoid; }
  h1 { font-size: 24pt; margin: 0; }
  h2 { font-size: 16pt; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
  h3 { font-size: 13pt; }
  p, li { orphans: 3; widows: 3; }
  p { margin: 0.45em 0 0.7em; }
  ul, ol { margin: 0.45em 0 0.8em 1.15em; }
  li { margin: 0.22em 0; }
  blockquote {
    margin: 0.8em 0;
    padding: 10px 14px;
    border-left: 4px solid var(--accent);
    background: var(--quote-bg);
    border-radius: 0 8px 8px 0;
  }
  code {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 90%;
    background: var(--code-bg);
    padding: .12em .35em;
    border-radius: 4px;
  }
  pre {
    background: var(--code-bg);
    padding: 11px 12px;
    border-radius: 8px;
    overflow: auto;
    border: 1px solid var(--line);
  }
  pre code { background: transparent; padding: 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.8em 0 1.1em;
    font-size: 11pt;
  }
  th, td {
    border: 1px solid var(--line);
    text-align: left;
    padding: 8px 9px;
    vertical-align: top;
  }
  th { background: var(--thead); font-weight: 700; }
  a { color: var(--link); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--link), transparent 70%); }
  hr { border: 0; border-top: 1px solid var(--line); margin: 1.1em 0; }
  img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    border: 1px solid var(--line);
    display: block;
    margin: 0.5em 0 0.9em;
  }
`;

const themeCss = {
  classic: `
    :root {
      --bg: #F9FAFB;
      --text: #111827;
      --muted: #374151;
      --line: #D1D5DB;
      --accent: #2F80FF;
      --accent-2: #13C2C2;
      --hero-bg: linear-gradient(135deg, #0B1220 0%, #16315c 68%, #2F80FF 100%);
      --hero-text: #F8FBFF;
      --quote-bg: #EFF6FF;
      --code-bg: #F3F4F6;
      --thead: #EEF2F7;
      --link: #1D4ED8;
    }
    body { background: var(--bg); color: var(--text); }
    .hero { background: var(--hero-bg); color: var(--hero-text); box-shadow: 0 8px 30px rgba(11,18,32,.16); }
    .hero p { color: #e7eefc; margin: 6px 0 0; }
    h2 { color: #0B1220; }
    h3 { color: #16315c; }
    strong { color: #0B1220; }
  `,
  'modern-ledger': `
    :root {
      --bg: #F8F9FB;
      --text: #101828;
      --muted: #344054;
      --line: #D0D5DD;
      --accent: #1D4ED8;
      --accent-2: #FFC107;
      --hero-bg: linear-gradient(145deg, #0A2540 0%, #123B63 72%, #1D4ED8 100%);
      --hero-text: #FFFFFF;
      --quote-bg: #F2F4F7;
      --code-bg: #F4F6FA;
      --thead: #EEF2F6;
      --link: #1D4ED8;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: Manrope, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    }
    .hero {
      background: var(--hero-bg);
      color: var(--hero-text);
      box-shadow: 0 7px 24px rgba(10,37,64,.18);
      border: 1px solid rgba(255,255,255,.12);
    }
    .hero p { color: #E6EEF8; margin: 6px 0 0; }
    h2 { color: #0A2540; }
    h3 { color: #123B63; }
    strong { color: #0A2540; }
    blockquote { border-left-color: #FFC107; }
  `,
};

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
});

function toFileUrl(p) {
  return `file://${p.replace(/ /g, '%20')}`;
}

function patchRelativePaths(html) {
  return html.replace(/(src|href)="(?!https?:|mailto:|#)([^"]+)"/g, (_m, attr, rel) => {
    const abs = path.resolve(rootDir, rel);
    return `${attr}="${toFileUrl(abs)}"`;
  });
}

async function renderOne(browser, doc) {
  const mdPath = path.join(rootDir, doc.input);
  const pdfPath = path.join(outDir, doc.output);
  const markdown = await fs.readFile(mdPath, 'utf8');
  const htmlContent = patchRelativePaths(marked.parse(markdown));

  const page = await browser.newPage();
  const html = `<!doctype html>
  <html><head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${doc.title}</title>
    <style>${baseCss}\n${themeCss[doc.theme]}</style>
  </head>
  <body>
    <main class="doc">
      <section class="hero">
        <div class="kicker">Property Management Suite</div>
        <h1>${doc.title}</h1>
        <p>${doc.theme === 'modern-ledger' ? 'Alternate direction: premium, calm, operations-first design language.' : 'Core direction: modern, trustworthy, practical operating system identity.'}</p>
      </section>
      <article>${htmlContent}</article>
    </main>
  </body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', right: '0.45in', bottom: '0.55in', left: '0.45in' },
    displayHeaderFooter: false,
    preferCSSPageSize: false,
  });
  await page.close();
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const doc of docs) {
      await renderOne(browser, doc);
      console.log(`Generated: Branding/pdf/${doc.output}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
