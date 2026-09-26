import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.md': 'text/markdown; charset=utf-8', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
export async function serve(port = 4173) {
  const { base } = JSON.parse(await fs.readFile(path.join(root, 'build.json'), 'utf8'));
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/' && base !== '/') { res.writeHead(302, { Location: base }); return res.end(); }
      if (url.pathname === base.slice(0, -1) && base !== '/') { res.writeHead(302, { Location: base }); return res.end(); }
      if (!url.pathname.startsWith(base)) throw new Error('Not found');
      const suffix = decodeURIComponent(url.pathname.slice(base.length));
      let target = path.resolve(root, suffix);
      if (target !== root.slice(0, -1) && !target.startsWith(root)) throw new Error('Not found');
      if ((await fs.stat(target)).isDirectory()) {
        if (!url.pathname.endsWith('/')) { res.writeHead(302, { Location: url.pathname + '/' + url.search }); return res.end(); }
        target = path.join(target, 'index.html');
      }
      const data = await fs.readFile(target);
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(await fs.readFile(path.join(root, '404.html')).catch(() => 'Not found'));
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, origin: `http://127.0.0.1:${server.address().port}`, base };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { origin, base } = await serve(Number(process.env.PORT ?? 4173));
  console.log(`Quantum Notes: ${origin}${base}`);
}
