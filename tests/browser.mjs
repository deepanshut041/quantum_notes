import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { serve } from '../scripts/serve.mjs';

const { server, origin, base } = await serve(0);
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await fs.mkdir('test-results', { recursive: true });
  await page.goto(origin + base);
  const data = await (await fetch(origin + base + 'notes.json')).json();
  const first = data.notes[0];
  await page.getByRole('searchbox').fill(first.title);
  assert.ok(await page.locator('#search-results a').count() >= 1);
  assert.ok((await page.locator('#search-results').innerText()).includes(first.title));
  await page.getByRole('searchbox').fill('unfindable-zxq-947');
  assert.match(await page.locator('#search-results').innerText(), /No notes match/);
  await page.getByRole('searchbox').fill('');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  assert.equal(await page.locator('.sidebar-toggle').getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await page.waitForFunction(() => document.querySelector('.sidebar').getBoundingClientRect().width >= 257);
  await page.screenshot({ path: 'test-results/library-desktop.png', fullPage: true });
  await page.goto(origin + base + 'sections/');
  for (const stage of ['Foundations', 'Basic Algorithms', 'Advanced Algorithms', 'Research']) assert.ok(await page.getByRole('link', { name: new RegExp(stage) }).count() > 0);
  await page.screenshot({ path: 'test-results/learning-path.png', fullPage: true });
  await page.goto(origin + base + 'sections/basic-algorithms/');
  assert.ok(await page.getByRole('link', { name: /Oracle algorithms/ }).count() > 0);
  await page.goto(origin + base + 'sections/basic-algorithms/oracle-algorithms/');
  assert.match(await page.locator('.empty-topic').innerText(), /No notes here yet/);
  await page.screenshot({ path: 'test-results/empty-topic.png', fullPage: true });
  await page.goto(origin + base + 'courses/ibm-quantum/');
  assert.ok(await page.getByRole('link', { name: /Qubits and quantum states/ }).count() > 0);
  assert.ok(await page.getByRole('link', { name: /Quantum gates and interference/ }).count() > 0);
  await page.goto(origin + base + 'notes/ibm-quantum/01-qubits-and-states/');
  await page.waitForURL(origin + base + 'notes/foundations/states-and-measurement/01-qubits-and-states/');
  for (const note of data.notes) {
    await page.goto(origin + note.url);
    await page.waitForFunction(() => document.documentElement.dataset.ready);
    assert.equal(await page.locator('html').getAttribute('data-ready'), 'true');
    assert.ok(await page.locator('.katex').count() > 0, `Missing math in ${note.title}`);
    assert.equal(await page.locator('.katex-error').count(), 0);
    const download = await fetch(origin + note.pdf);
    assert.equal(download.status, 200);
    assert.equal(Buffer.from(await download.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    const md = await fetch(origin + base + 'source/' + note.id + '.md');
    assert.equal(md.status, 200);
    for (const link of await page.locator('.markdown a[href^="' + base + '"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))) assert.equal((await fetch(origin + link)).status, 200, link);
  }
  await page.goto(origin + first.url);
  await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  await page.screenshot({ path: 'test-results/note-desktop.png', fullPage: true });
  if (await page.locator('.mermaid svg').count()) {
    await page.getByRole('button', { name: 'Zoom in', exact: true }).first().click();
    assert.equal(await page.locator('.mermaid').first().evaluate(el => el.style.zoom), '1.25');
    await page.getByRole('button', { name: 'Reset', exact: true }).first().click();
  }
  await page.goto(origin + base + 'export/');
  await page.getByRole('button', { name: 'Select all', exact: true }).click();
  assert.equal(await page.locator('.export-row input:checked').count(), data.notes.length);
  await page.evaluate(() => { window.print = () => { window.__printCalled = true; }; });
  await page.getByRole('button', { name: 'Export selected to PDF' }).click();
  await page.waitForFunction(() => window.__printCalled === true);
  assert.equal(await page.locator('#print-root .print-note').count(), data.notes.length);
  assert.equal(await page.locator('#print-root .katex-error').count(), 0);
  assert.equal(await page.locator('#print-root .mermaid:not([data-processed])').count(), 0);
  for (const url of [base + 'pdf/quantum-notes.pdf', ...data.courses.map(c => c.pdf), ...data.sections.map(s => s.pdf)]) assert.equal((await fetch(origin + url)).status, 200);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of [base, base + 'sections/', base + 'sections/research/', base + 'sections/research/papers/', first.url, base + 'export/', base + 'guide/']) {
    await page.goto(origin + url);
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Mobile overflow at ${url}`);
  }
  await page.goto(origin + first.url);
  await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  await page.screenshot({ path: 'test-results/note-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log(`Browser checks passed: ${data.notes.length} notes, equations, diagrams, search, PDF/Markdown downloads, collection export, and 390px mobile layouts.`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
