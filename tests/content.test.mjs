import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, validateMetadata, normalizeBase, readNotes } from '../scripts/content.mjs';
import { fileURLToPath } from 'node:url';

test('base paths support project Pages and custom domains', () => {
  assert.equal(normalizeBase('/quantum_notes/'), '/quantum_notes/');
  assert.equal(normalizeBase('/'), '/');
  for (const invalid of ['https://example.com/', '/../', '/repo', '//', '/a/../b/']) assert.throws(() => normalizeBase(invalid));
});
test('missing and invalid note metadata fail before publishing', () => {
  const data = { title: 'A', course: 'B', description: 'C', updated: '2026-09-26' };
  validateMetadata(data, 'note.md');
  assert.throws(() => validateMetadata({ ...data, course: '' }, 'note.md'), /course/);
  assert.throws(() => validateMetadata({ ...data, updated: '2026-02-30' }, 'note.md'), /updated/);
  assert.throws(() => validateMetadata({ ...data, tags: 'tag' }, 'note.md'), /tags/);
});
test('math, callouts, and diagram source survive together', () => {
  const { html } = renderMarkdown('## State\n\n$\\ket{0}$\n\n:::tip Remember\nNormalize.\n:::\n\n```mermaid\nflowchart LR\n A --> B\n```');
  assert.match(html, /katex/);
  assert.match(html, /callout tip/);
  assert.match(html, /class="mermaid"/);
  assert.match(html, /A --&gt; B/);
  assert.throws(() => renderMarkdown('$\\notarealcommand{x}$'));
});
test('raw HTML cannot run scripts or event handlers, but details render', () => {
  const { html } = renderMarkdown('<details><summary>Answer</summary><p>42</p></details>\n\n<script>alert(1)</script>\n\n<img src="https://example.com/a.png" onerror="alert(1)">');
  assert.match(html, /<details>/);
  assert.match(html, /<summary>Answer/);
  assert.doesNotMatch(html, /<script|onerror/);
  assert.match(renderMarkdown('An <mark>important</mark> idea.').html, /<mark>important<\/mark>/);
});
test('cross-course links include Pages prefix and preserve fragments', () => {
  const { html } = renderMarkdown('[Other](../b/02-note.md#measurement)', { base: '/quantum_notes/', relativePath: 'a/01-note.md', notePaths: new Set(['b/02-note.md']) });
  assert.match(html, /href="\/quantum_notes\/notes\/b\/02-note\/#measurement"/);
  assert.throws(() => renderMarkdown('[Missing](missing.md)'), /broken note link/);
});
test('duplicate headings have unique IDs for the table of contents', () => {
  const { headings } = renderMarkdown('## Example\n\nA\n\n## Example\n\nB');
  assert.equal(new Set(headings.map(h => h.slug)).size, 2);
});
test('all repository notes and links validate', async () => {
  const { notes, courses } = await readNotes(fileURLToPath(new URL('../notes', import.meta.url)), '/quantum_notes/');
  assert.ok(notes.length > 0);
  assert.ok(courses.length > 0);
  assert.ok(notes.every(n => n.html && n.title && n.url.startsWith('/quantum_notes/')));
});
