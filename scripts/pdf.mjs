import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/build.json'), 'utf8'));
const { server, origin, base } = await serve(0);
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const output = path.join(root, 'dist/pdf');
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  async function ready() {
    await page.waitForFunction(() => ['true', 'error'].includes(document.documentElement.dataset.ready));
    if (await page.getAttribute('html', 'data-ready') !== 'true') throw new Error('A Mermaid diagram failed to render.');
    await page.evaluate(async () => { await document.fonts.ready; document.querySelectorAll('details').forEach(d => { d.open = true; }); await Promise.all([...document.images].map(i => i.decode())); });
    if (errors.length) throw new Error(errors.join('\n'));
  }
  async function save(name) {
    const target = path.join(output, name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await page.evaluate(({ local, published }) => {
      document.querySelectorAll('a[href]').forEach(a => {
        const url = new URL(a.href, location.href);
        if (url.origin === local && !a.getAttribute('href').startsWith('#')) a.href = published + url.pathname + url.search + url.hash;
      });
    }, { local: origin, published: manifest.origin });
    await page.pdf({ path: target, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="width:100%;font-size:8px;color:#8b949e;margin:0 14mm;display:flex;justify-content:space-between"><span>Quantum Notes</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>' });
    console.log(`PDF: ${name}`);
  }
  for (const note of manifest.notes) {
    await page.goto(origin + note.url, { waitUntil: 'networkidle' });
    await ready();
    await save(`${note.id}.pdf`);
  }
  for (const course of [...manifest.courses, { id: null, notes: manifest.notes.map(n => n.id) }]) {
    await page.goto(`${origin}${base}print/`, { waitUntil: 'networkidle' });
    await ready();
    await page.evaluate(ids => window.preparePrintCollection(ids), course.notes);
    if (errors.length) throw new Error(errors.join('\n'));
    await save(course.id ? `courses/${course.id}.pdf` : 'quantum-notes.pdf');
  }
  // Replace the fixed PDF cache so removed notes cannot leave stale downloads behind.
  await fs.rm(path.join(root, '.cache/pdf'), { recursive: true, force: true });
  await fs.cp(output, path.join(root, '.cache/pdf'), { recursive: true });
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
