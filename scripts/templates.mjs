import { escape as e } from './content.mjs';

const paths = {
  atom: '<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(55 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-55 12 12)"/><circle cx="12" cy="12" r="1"/>',
  book: '<path d="M12 7v14M3 3h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5v17h-5a4 4 0 0 0-4 1 4 4 0 0 0-4-1H3z"/>',
  folder: '<path d="M3 7V4h6l2 3h10v13H3z"/>',
  file: '<path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h8"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  search: '<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m7-13-3 4 3 4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
};
export const icon = name => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.file}</svg>`;
const date = value => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
export const tags = note => note.tags.map(t => `<span class="tag">${e(t)}</span>`).join('');

export function shell({ config, sections, active = 'notes', sectionId, topicId, title, body, exportPage = false }) {
  const b = config.base;
  const tools = [['notes', '', 'All notes'], ['courses', 'courses/', 'Courses'], ['export', 'export/', 'Export'], ['guide', 'guide/', 'Writing guide']];
  const topicLinks = section => `<ul class="sidebar-topics">${section.topics.map(topic => `<li><a href="${b}sections/${section.id}/${topic.id}/" ${sectionId === section.id && topicId === topic.id ? 'aria-current="page"' : ''}>${e(topic.title)}<small>${topic.notes.length}</small></a></li>`).join('')}</ul>`;
  const stages = sections.filter(section => section.id !== 'research').map((section, index) => `
    <details class="sidebar-section" ${sectionId === section.id || (!sectionId && index === 0) ? 'open' : ''}>
      <summary class="sidebar-stage"><span class="course-dot stage-${index}"></span><a href="${b}sections/${section.id}/" ${sectionId === section.id && !topicId ? 'aria-current="page"' : ''}>${e(section.title)}</a><small>${section.notes.length}</small><span class="tree-chevron">${icon('chevron')}</span></summary>
      ${topicLinks(section)}
    </details>`).join('');
  const research = sections.find(section => section.id === 'research');
  const researchTree = research ? `<details class="sidebar-group sidebar-research" ${sectionId === research.id ? 'open' : ''}>
    <summary class="sidebar-group-label"><a href="${b}sections/${research.id}/" ${sectionId === research.id && !topicId ? 'aria-current="page"' : ''}>RESEARCH</a><span class="tree-chevron">${icon('chevron')}</span></summary>
    ${topicLinks(research)}
  </details>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title)} · ${e(config.title)}</title><meta name="description" content="${e(config.description)}"><meta name="theme-color" content="#0f766e"><link rel="icon" href="${b}favicon.svg"><link rel="stylesheet" href="${b}assets/app.css"><script type="module" src="${b}assets/app.js"></script></head>
  <body data-base="${b}" ${exportPage ? 'data-export-page' : ''}><a class="skip-link" href="#main">Skip to content</a><div class="shell">
    <aside class="sidebar" aria-label="Learning path"><div class="sidebar-header"><a class="brand" href="${b}">${icon('atom')}<span class="brand-label">Quantum Notes</span></a><button class="sidebar-toggle" aria-label="Collapse sidebar" aria-expanded="true" aria-controls="primary-navigation">${icon('panel')}</button></div>
      <nav class="sidebar-tree" id="primary-navigation" aria-label="Sections and topics"><details class="sidebar-group sidebar-learning" open><summary class="sidebar-group-label">SECTIONS &amp; TOPICS<span class="tree-chevron">${icon('chevron')}</span></summary>${stages}</details>${researchTree}</nav>
    </aside>
    <main class="content" id="main" tabindex="-1"><nav class="workspace-tools" aria-label="Workspace">${tools.map(([id, route, label]) => `<a href="${b}${route}" ${active === id ? 'aria-current="page"' : ''}>${label}</a>`).join('')}${config.repository ? `<a href="https://github.com/${e(config.repository)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ''}</nav>${body}<footer class="page-footer">Quantum Notes <span>Understand. Connect. Revisit.</span></footer></main>
  </div><div id="print-root"></div></body></html>`;
}

export function header({ eyebrow = 'Your quantum learning library', title, subtitle, actions = '', glyph = 'book' }) {
  return `<header class="docs-page-header"><span class="docs-heading-icon">${icon(glyph)}</span><div><span class="docs-eyebrow">${e(eyebrow)}</span><h1>${e(title)}</h1>${subtitle ? `<p>${e(subtitle)}</p>` : ''}</div>${actions}</header>`;
}
export const breadcrumbs = items => `<nav class="docs-breadcrumb" aria-label="Breadcrumb">${items.map(([title, url], i) => `${i ? icon('chevron') : ''}${url ? `<a href="${url}">${e(title)}</a>` : `<span aria-current="page">${e(title)}</span>`}`).join('')}</nav>`;

export function noteRow(note, { course = false } = {}) {
  return `<a class="docs-row docs-file-row" href="${note.url}"><span class="docs-row-icon file">${icon('file')}</span><span class="docs-row-copy"><strong>${e(note.title)}</strong><span>${e(course ? `${note.sectionTitle} · ${note.topicTitle}${note.course ? ` · ${note.course}` : ''}` : note.description)}</span></span><span class="row-tags">${tags(note)}</span><span class="docs-row-date">${note.minutes} min read</span>${icon('chevron')}</a>`;
}
export function folderRow(course, base) {
  return `<a class="docs-row" href="${base}courses/${course.id}/"><span class="docs-row-icon folder">${icon('folder')}</span><span class="docs-row-copy"><strong>${e(course.title)}</strong><span>Notes from this course across the learning path</span></span><span class="docs-row-count">${course.notes.length} ${course.notes.length === 1 ? 'note' : 'notes'}</span>${icon('chevron')}</a>`;
}

const count = notes => `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;
export function sectionRow(section, base) {
  return `<a class="docs-row stage-row" href="${base}sections/${section.id}/"><span class="docs-row-icon folder">${icon('folder')}</span><span class="docs-row-copy"><strong>${e(section.title)}</strong><span>${e(section.description)}</span></span><span class="docs-row-count">${section.topics.length} topics · ${count(section.notes)}</span>${icon('chevron')}</a>`;
}
export function topicRow(topic, base) {
  return `<a class="docs-row" href="${base}sections/${topic.sectionId}/${topic.id}/"><span class="docs-row-icon folder">${icon('folder')}</span><span class="docs-row-copy"><strong>${e(topic.title)}</strong><span>${e(topic.description)}</span></span><span class="docs-row-count">${count(topic.notes)}</span>${icon('chevron')}</a>`;
}

export function library({ notes, sections, base, course, section, topic }) {
  const chosen = topic?.notes ?? section?.notes ?? course?.notes ?? notes;
  const crumb = [['Notes', course || section ? base : null], ...(section ? [[section.title, topic ? `${base}sections/${section.id}/` : null]] : []), ...(topic ? [[topic.title, null]] : []), ...(course ? [[course.title, null]] : [])];
  const title = topic?.title ?? section?.title ?? course?.title ?? 'Quantum notes';
  const subtitle = topic?.description ?? section?.description ?? (course ? 'Notes from this course, organized across topics.' : 'Four stages, clear topics, and courses that connect them.');
  const folder = topic ? `notes/${section.id}/${topic.id}/` : section ? `notes/${section.id}/` : course ? `courses/${course.id}/` : 'notes/';
  const directory = topic ? '' : `<section class="docs-directory-section"><h2>${section ? 'Topics' : course ? 'Learning stages' : 'Learning path'} <span>${section ? section.topics.length : sections.length}</span></h2><div class="docs-rows">${(section ? section.topics.map(t => topicRow(t, base)) : sections.map(s => sectionRow(s, base))).join('')}</div></section>`;
  const noteRows = chosen.length ? chosen.map(n => noteRow(n, { course: !topic })).join('') : `<div class="empty-topic"><strong>No notes here yet.</strong><span>${topic ? 'This topic' : section ? 'This stage' : 'This course'} is ready for the next Markdown note.</span><a href="${base}guide/">How to add one ${icon('arrow')}</a></div>`;
  return `<div class="docs-page">${breadcrumbs(crumb)}${header({ title, subtitle, actions: `<a class="docs-export-link" href="${base}export/">${icon('download')} Export notes</a>` })}<div class="library-tools"><label class="search-field">${icon('search')}<input id="note-search" type="search" placeholder="Search notes, equations, or topics…" aria-label="Search notes"><kbd>/</kbd></label><span class="library-count" id="search-status" aria-live="polite">${count(chosen)}</span></div><div id="search-results" class="docs-browser" hidden></div><div id="library-default"><div class="docs-browser"><div class="docs-browser-toolbar"><div><span>Notebook directory</span><strong>${e(folder)}</strong></div><div class="docs-browser-summary">Markdown · Equations · Diagrams</div></div>${directory}<section class="docs-directory-section"><h2>${topic ? 'Topic notes' : section ? 'Notes in this stage' : course ? 'Course notes' : 'All notes'} <span>${chosen.length}</span></h2><div class="docs-rows">${noteRows}</div></section></div><aside class="author-hint">${icon('code')}<div><strong>Your notes, in Markdown.</strong><span>Add a note under a section and topic. Link it to a course when relevant.</span></div><a href="${base}guide/">Writing guide ${icon('arrow')}</a></aside></div><script type="application/json" id="search-data">${JSON.stringify(chosen.map(({ title, course, sectionTitle, topicTitle, url, search, tags }) => ({ title, course: course ?? '', sectionTitle, topicTitle, url, search, tags }))).replace(/</g, '\\u003c')}</script></div>`;
}

export function documentBody(note) {
  return `<article class="markdown" data-note="${e(note.id)}"><dl class="document-metadata"><div><dt>Stage</dt><dd>${e(note.sectionTitle)}</dd></div><div><dt>Topic</dt><dd>${e(note.topicTitle)}</dd></div><div><dt>Course</dt><dd>${note.course ? `<a href="${e(note.courseUrl)}">${e(note.course)}</a>` : 'Independent study'}</dd></div><div><dt>Note status</dt><dd>${e(note.status ?? 'In progress')}</dd></div></dl>${note.html}${note.sources?.length ? `<section class="sources"><h2 id="references">References</h2><ul>${note.sources.map(s => `<li><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a></li>`).join('')}</ul></section>` : ''}</article>`;
}
export function notePage(note, topic, base) {
  const at = topic.notes.findIndex(n => n.id === note.id);
  return `<div class="docs-document-page">${breadcrumbs([['Notes', base], [note.sectionTitle, `${base}sections/${note.sectionId}/`], [note.topicTitle, `${base}sections/${note.sectionId}/${note.topicId}/`], [note.title, null]])}${header({ eyebrow: note.sectionTitle + ' / ' + note.topicTitle, title: note.title, subtitle: `${note.minutes} min read · Updated ${date(note.updated)}`, actions: `<div class="document-actions"><a class="docs-export-link primary" href="${note.pdf}" download>${icon('download')} Download PDF</a><a class="source-link" href="${note.markdown}" download>${icon('code')} Markdown</a></div>` })}<div class="reader-layout"><div class="reader-main">${documentBody(note)}<nav class="note-pager" aria-label="Adjacent notes">${[topic.notes[at - 1], topic.notes[at + 1]].map((n, i) => n ? `<a class="${i ? 'next' : ''}" href="${n.url}"><small>${i ? 'Next note →' : '← Previous note'}</small><strong>${e(n.title)}</strong></a>` : '<span></span>').join('')}</nav></div><aside class="toc" aria-label="On this page"><div class="section-label">ON THIS PAGE</div>${note.headings.map(h => `<a class="level-${h.level}" href="#${e(h.slug)}">${e(h.title)}</a>`).join('')}${note.sources?.length ? '<a href="#references">References</a>' : ''}<div class="toc-meta"><span class="section-label">SOURCE FILE</span><code>${e(note.file)}</code></div></aside></div></div>`;
}

export function exportPage(notes, base) {
  return `<div class="docs-page">${breadcrumbs([['Notes', base], ['Export', null]])}${header({ title: 'Take your notes with you', eyebrow: 'Export workbench', subtitle: 'Download a note, a learning stage, a course, or the whole notebook as a PDF.', glyph: 'download' })}<div class="export-layout"><section class="export-panel"><div class="export-panel-heading"><div><span class="section-label">01 · SELECT</span><h2>Choose your notes</h2></div><button class="text-button" id="select-all" type="button">Select all</button></div><div class="export-list">${notes.map(n => `<label class="export-row"><input type="checkbox" value="${e(n.id)}">${icon('file')}<span><strong>${e(n.title)}</strong><small>${e(n.sectionTitle)} · ${e(n.topicTitle)}${n.course ? ` · ${e(n.course)}` : ''}</small></span><a href="${n.pdf}" download aria-label="Download ${e(n.title)} as PDF">${icon('download')}</a></label>`).join('')}</div></section><section class="export-panel export-settings"><div class="export-panel-heading"><div><span class="section-label">02 · EXPORT</span><h2>Your reading collection</h2></div></div><div class="export-settings-body"><p id="selection-count" aria-live="polite">No notes selected</p><button class="button" id="export-selection" disabled>${icon('download')} Export selected to PDF</button><p class="meta">Opens the print dialog. Choose “Save as PDF” to save your selected notes together.</p><hr><a class="button secondary" href="${base}pdf/quantum-notes.pdf" download>${icon('download')} Download all notes</a><p class="meta">Ready-to-download PDF, with selectable text, equations, and diagrams.</p><div class="export-course-links"></div><p class="meta" id="export-status" role="status"></p></div></section></div></div>`;
}
