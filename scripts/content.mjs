import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import container from 'markdown-it-container';
import { katex } from '@mdit/plugin-katex';
import sanitizeHtml from 'sanitize-html';

export const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const slug = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function normalizeBase(value) {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(value)) throw new Error('SITE_BASE must be / or a path such as /quantum_notes/.');
  return value;
}
export function validateMetadata(data, filename) {
  for (const field of ['title', 'course', 'description', 'updated']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`${filename}: frontmatter needs a non-empty ${field}.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updated) || Number.isNaN(Date.parse(data.updated)) || new Date(data.updated).toISOString().slice(0, 10) !== data.updated) throw new Error(`${filename}: updated must be a quoted YYYY-MM-DD date.`);
  if (data.tags && (!Array.isArray(data.tags) || data.tags.some(t => typeof t !== 'string'))) throw new Error(`${filename}: tags must be a list of strings.`);
  if (data.order !== undefined && !Number.isFinite(data.order)) throw new Error(`${filename}: order must be a number.`);
  for (const source of data.sources ?? []) {
    if (typeof source.title !== 'string' || !source.title || !/^https?:\/\//.test(source.url ?? '')) throw new Error(`${filename}: each source needs a title and an https URL.`);
  }
}

// Sanitize author HTML tokens before rendering, so generated KaTeX/MathML remains intact.
const htmlTags = [...sanitizeHtml.defaults.allowedTags, 'details', 'summary', 'aside', 'figure', 'figcaption', 'img', 'input'];
function safeHTML(html) {
  return sanitizeHtml(html, {
    allowedTags: htmlTags,
    allowedAttributes: { '*': ['class', 'id', 'title', 'role', 'aria-label'], a: ['href', 'title'], img: ['src', 'alt', 'width', 'height'], details: ['open'], input: ['type', 'checked', 'disabled'], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
    transformTags: { input: () => ({ tagName: 'input', attribs: { type: 'checkbox', disabled: '' } }) },
  });
}

export function renderMarkdown(source, { base = '/', relativePath = '', notePaths = new Set(), assetPaths = new Set() } = {}) {
  const headings = [];
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
    .use(anchor, { level: [2, 3], slugify: slug, callback: (token, info) => headings.push({ level: Number(token.tag.slice(1)), ...info }) })
    .use(katex, { delimiters: 'all', throwOnError: true, strict: 'error', trust: false, macros: { '\\ket': '\\left|#1\\right\\rangle', '\\bra': '\\left\\langle#1\\right|', '\\braket': '\\left\\langle#1\\right\\rangle' } });
  for (const type of ['note', 'tip', 'warning', 'definition', 'example']) {
    md.use(container, type, { render: (tokens, i) => tokens[i].nesting === 1 ? `<aside class="callout ${type}"><div class="callout-title">${escape(tokens[i].info.trim().slice(type.length).trim() || type)}</div>\n` : '</aside>\n' });
  }
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, i, options, env, renderer) => tokens[i].info.trim() === 'mermaid'
    ? `<figure class="mermaid-diagram"><div class="diagram-tools"><span>Diagram</span><button type="button" data-zoom="-" aria-label="Zoom out">−</button><button type="button" data-zoom="+" aria-label="Zoom in">+</button><button type="button" data-zoom="reset">Reset</button></div><div class="diagram-viewport" tabindex="0" role="region" aria-label="Zoomable diagram"><pre class="mermaid">${escape(tokens[i].content)}</pre></div></figure>\n`
    : fence(tokens, i, options, env, renderer);
  md.renderer.rules.html_block = (tokens, i) => safeHTML(tokens[i].content);
  md.renderer.rules.html_inline = (tokens, i) => {
    const raw = tokens[i].content;
    const closing = raw.match(/^<\/([a-z][a-z0-9]*)\s*>$/i);
    if (closing) return htmlTags.includes(closing[1].toLowerCase()) ? raw : '';
    const opening = raw.match(/^<([a-z][a-z0-9]*)\b[^>]*>$/i);
    const clean = safeHTML(raw);
    // Sanitizers close isolated opening tags; Markdown emits closing tags separately.
    return opening ? clean.replace(new RegExp(`</${opening[1]}>$`, 'i'), '') : clean;
  };
  md.renderer.rules.table_open = () => '<div class="markdown-table" tabindex="0" role="region" aria-label="Data table"><table>';
  md.renderer.rules.table_close = () => '</table></div>';
  function localLink(href) {
    if (!href || /^(?:[a-z]+:|\/\/|#)/i.test(href)) return href;
    const [file, hash] = href.split('#');
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(relativePath), decodeURIComponent(file)));
    if (file.endsWith('.md')) {
      if (!notePaths.has(target)) throw new Error(`${relativePath}: broken note link ${href}`);
      return `${base}notes/${target.replace(/\.md$/, '')}/${hash ? '#' + hash : ''}`;
    }
    if (assetPaths.has(target)) return `${base}media/${target}${hash ? '#' + hash : ''}`;
    if (file.startsWith('/')) return `${base}${file.replace(/^\/+/, '')}${hash ? '#' + hash : ''}`;
    throw new Error(`${relativePath}: missing local asset ${href}`);
  }
  md.core.ruler.after('inline', 'local-links', state => {
    for (const token of state.tokens) {
      for (const child of token.children ?? []) {
        if (child.type === 'link_open') child.attrSet('href', localLink(child.attrGet('href')));
        if (child.type === 'image') child.attrSet('src', localLink(child.attrGet('src')));
      }
    }
  });
  const html = md.render(source.replace(/^#\s+[^\n]+\n/, ''));
  if (html.includes('katex-error')) throw new Error(`${relativePath}: invalid equation.`);
  return { html, headings };
}

export async function readNotes(root, base) {
  const files = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) files.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
  await walk(root);
  const notePaths = new Set(files.filter(f => f.endsWith('.md')));
  const assetPaths = new Set(files.filter(f => !f.endsWith('.md')));
  const notes = [];
  for (const file of notePaths) {
    if (!/^[a-z0-9_-]+(?:\/[a-z0-9_-]+)+\.md$/.test(file)) throw new Error(`Use lowercase course/note.md paths: ${file}`);
    const raw = await fs.readFile(path.join(root, file), 'utf8');
    const { data, content } = matter(raw);
    validateMetadata(data, file);
    const courseId = file.split('/')[0];
    const id = file.replace(/\.md$/, '');
    const rendered = renderMarkdown(content.trimStart(), { base, relativePath: file, notePaths, assetPaths });
    notes.push({ ...data, ...rendered, raw, id, file, courseId, tags: data.tags ?? [], order: data.order ?? 100, minutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 180)), url: `${base}notes/${id}/`, pdf: `${base}pdf/${id}.pdf`, markdown: `${base}source/${file}`, search: `${data.title} ${data.course} ${data.tags ?? ''} ${content}`.toLowerCase() });
  }
  if (!notes.length) throw new Error('Add at least one Markdown note under notes/<course>/.');
  const courses = [...new Set(notes.map(n => n.courseId))].map(id => {
    const members = notes.filter(n => n.courseId === id).sort((a, b) => a.order - b.order || a.file.localeCompare(b.file));
    if (new Set(members.map(n => n.course)).size !== 1) throw new Error(`${id}: all notes in a course folder must use the same course name.`);
    return { id, title: members[0].course, notes: members };
  });
  return { notes, courses, assets: [...assetPaths] };
}
