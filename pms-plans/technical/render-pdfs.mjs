import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const here = path.resolve(process.cwd());
const inputs = [
  { in: 'business-plan.html', out: 'business-plan.pdf' },
  { in: 'product-launch-plan.html', out: 'product-launch-plan.pdf' }
];

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  for (const job of inputs) {
    const inPath = path.join(here, job.in);
    const outPath = path.join(here, job.out);
    await fs.access(inPath);

    const page = await browser.newPage();
    await page.goto(`file://${inPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.65in', right: '0.65in', bottom: '0.65in', left: '0.65in' }
    });

    await page.close();
    console.log(`Wrote ${job.out}`);
  }
} finally {
  await browser.close();
}
