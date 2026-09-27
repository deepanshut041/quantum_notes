import { watch } from 'node:fs';
import { build, root } from './build.mjs';
import { serve } from './serve.mjs';
import path from 'node:path';
await build();
const { origin, base, reload } = await serve(Number(process.env.PORT ?? 4173), { liveReload: true });
console.log(`Quantum Notes: ${origin}${base}\nWatching notes, docs, public, src, and build scripts. The browser reloads after changes. Run npm run build to refresh PDFs.`);
let timer;
let pending = Promise.resolve();
for (const folder of ['notes', 'docs', 'public', 'src']) {
  watch(path.join(root, folder), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { pending = pending.then(async () => { await build(); reload(); }).catch(error => console.error(error.message)); }, 200);
  });
}
