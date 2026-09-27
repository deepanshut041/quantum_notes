import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/build.json'), 'utf8'));
const { server, origin } = await serve(0);
const browser = await chromium.launch();
const page = await browser.newPage();
const failures = [];
const visualSamples = new Set([
  'basic-algorithms/quantum-protocols/01-quantum-teleportation',
  'basic-algorithms/fourier-transform/01-qft-circuit-and-periods',
  'advanced-algorithms/factoring/01-shor-order-finding',
  'advanced-algorithms/simulation/02-from-physical-model-to-qubit-hamiltonian',
]);
try {
  await fs.mkdir(path.join(root, 'test-results'), { recursive: true });
  for (const note of manifest.notes) {
    if (!note.id.startsWith('basic-algorithms/') && !note.id.startsWith('advanced-algorithms/')) continue;
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + note.url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => ['true', 'error'].includes(document.documentElement.dataset.ready));
    const result = await page.evaluate(() => ({
      ready: document.documentElement.dataset.ready,
      diagrams: document.querySelectorAll('.mermaid').length,
      rendered: document.querySelectorAll('.mermaid[data-processed]').length,
      warning: document.querySelector('[role="alert"]')?.textContent ?? '',
    }));
    if (result.ready !== 'true' || errors.length) failures.push({ note: note.id, ...result, errors });
    else {
      console.log(`OK ${note.id}: ${result.rendered}/${result.diagrams} diagrams`);
      if (visualSamples.has(note.id)) {
        await page.screenshot({ path: path.join(root, 'test-results', `part2-${note.id.split('/').at(-1)}.png`), fullPage: true });
      }
    }
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
  }
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
