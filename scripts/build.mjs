import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as bundle } from 'esbuild';
import config from '../site.config.mjs';
import { normalizeBase, readNotes, renderMarkdown, escape as e } from './content.mjs';
import { shell, library, header, breadcrumbs, folderRow, notePage, documentBody, exportPage } from './templates.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const out = path.join(root, 'dist');
export async function build() {
  config.base = normalizeBase(config.base);
  const { notes, courses, assets } = await readNotes(path.join(root, 'notes'), config.base);
  // Only the fixed, generated dist directory is cleaned; no author files live here.
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });
  const write = async (file, text) => { const target = path.join(out, file); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, text); };
  await fs.cp(path.join(root, 'public'), out, { recursive: true });
  await bundle({ entryPoints: [path.join(root, 'src/app.js')], outdir: path.join(out, 'assets'), bundle: true, splitting: true, format: 'esm', minify: true, loader: { '.woff': 'file', '.woff2': 'file', '.ttf': 'file' }, assetNames: '[name]-[hash]', chunkNames: 'chunks/[name]-[hash]', logLevel: 'warning' });
  const wrap = (title, body, active = 'notes', extra = {}) => shell({ config, courses, title, body, active, ...extra });
  await write('index.html', wrap('All notes', library({ notes, courses, base: config.base })));
  await write('courses/index.html', wrap('Courses', `<div class="docs-page">${breadcrumbs([['Notes', config.base], ['Courses', null]])}${header({ title: 'Course notebooks', subtitle: 'Different perspectives. One place to connect them.', glyph: 'folder' })}<div class="docs-browser">${courses.map(c => folderRow(c, config.base)).join('')}</div></div>`, 'courses'));
  for (const course of courses) {
    await write(`courses/${course.id}/index.html`, wrap(course.title, library({ notes, courses, base: config.base, course }), 'courses'));
    for (const note of course.notes) {
      await write(`notes/${note.id}/index.html`, wrap(note.title, notePage(note, course, config.base)));
      await write(`source/${note.file}`, note.raw);
    }
  }
  for (const asset of assets) {
    if (!/\.(?:png|jpg|jpeg|gif|webp|svg|pdf)$/i.test(asset)) throw new Error(`Unsupported note asset: ${asset}`);
    const target = path.join(out, 'media', asset);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(path.join(root, 'notes', asset), target);
  }
  await write('export/index.html', wrap('Export notes', exportPage(notes, config.base), 'export', { exportPage: true }));
  const guide = renderMarkdown(await fs.readFile(path.join(root, 'docs/writing-guide.md'), 'utf8'), { base: config.base });
  await write('guide/index.html', wrap('Writing guide', `<div class="docs-document-page">${header({ title: 'Writing a quantum note', eyebrow: 'The author’s guide', subtitle: 'Write once in Markdown. Read on the web. Keep a PDF.', glyph: 'code' })}<article class="markdown">${guide.html}</article></div>`, 'guide'));
  await write('404.html', wrap('Page not found', `${header({ title: 'This note is not here', subtitle: 'It may have moved. Browse the notebook to find it.' })}<a class="button" href="${config.base}">Browse all notes</a>`));
  const entries = notes.map(n => ({ id: n.id, title: n.title, course: n.course, url: n.url, pdf: n.pdf, html: documentBody(n) }));
  await write('notes.json', JSON.stringify({ notes: entries, courses: courses.map(c => ({ id: c.id, title: c.title, pdf: `${config.base}pdf/courses/${c.id}.pdf` })) }));
  await write('build.json', JSON.stringify({ base: config.base, origin: config.origin, notes: notes.map(n => ({ id: n.id, url: n.url })), courses: courses.map(c => ({ id: c.id, notes: c.notes.map(n => n.id) })) }));
  await write('.nojekyll', '');
  await write('print/index.html', wrap('Print collection', '<div id="print-preview" class="docs-document-page"></div>', 'export'));
  // Keep previously generated PDFs available while editing; regenerate with npm run build.
  try { await fs.cp(path.join(root, '.cache/pdf'), path.join(out, 'pdf'), { recursive: true }); } catch (err) { if (err.code !== 'ENOENT') throw err; }
  console.log(`Built ${notes.length} notes in ${courses.length} courses at ${config.base}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
