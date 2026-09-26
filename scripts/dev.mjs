import { watch } from 'node:fs';
import { build, root } from './build.mjs';
import { serve } from './serve.mjs';
import path from 'node:path';
await build();
const { origin, base } = await serve(Number(process.env.PORT ?? 4173));
console.log(`Quantum Notes: ${origin}${base}\nWatching notes, docs, public, and src. Refresh after changes. Run npm run build to refresh PDFs.`);
let timer;
let pending = Promise.resolve();
for (const folder of ['notes', 'docs', 'public', 'src']) {
  watch(path.join(root, folder), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { pending = pending.then(build).catch(error => console.error(error.message)); }, 200);
  });
}
