import 'katex/dist/katex.min.css';
import './reference.css';
import './styles.css';

const base = document.body.dataset.base;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const toggle = document.querySelector('.sidebar-toggle');
function collapse(value) {
  document.querySelector('.shell').classList.toggle('sidebar-collapsed', value);
  toggle.setAttribute('aria-expanded', String(!value));
  toggle.setAttribute('aria-label', value ? 'Expand sidebar' : 'Collapse sidebar');
}
try { collapse(localStorage.getItem('quantum-sidebar-collapsed') === 'true'); } catch {}
toggle?.addEventListener('click', () => {
  const value = toggle.getAttribute('aria-expanded') === 'true';
  collapse(value);
  try { localStorage.setItem('quantum-sidebar-collapsed', String(value)); } catch {}
});

const search = document.querySelector('#note-search');
if (search) {
  const data = JSON.parse(document.querySelector('#search-data').textContent);
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    const results = data.filter(n => query.split(/\s+/).every(word => n.search.includes(word)));
    document.querySelector('#library-default').hidden = Boolean(query);
    const target = document.querySelector('#search-results');
    target.hidden = !query;
    target.innerHTML = results.length ? results.map(n => `<a class="search-result" href="${n.url}"><strong>${escape(n.title)}</strong><span>${escape(n.course)} · ${n.tags.map(escape).join(' · ')}</span></a>`).join('') : '<p class="docs-empty">No notes match this search. Try a course name or another topic.</p>';
    document.querySelector('#search-status').textContent = `${results.length} ${results.length === 1 ? 'note' : 'notes'}${query ? ' found' : ''}`;
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; search.dispatchEvent(new Event('input')); search.blur(); }
  });
}

let mermaid;
async function renderDiagrams(root = document) {
  const nodes = [...root.querySelectorAll('.mermaid:not([data-processed])')];
  if (!nodes.length) return;
  if (!mermaid) {
    mermaid = (await import('mermaid')).default;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: { primaryColor: '#e8f5f2', primaryTextColor: '#172033', primaryBorderColor: '#68a99b', lineColor: '#55716c', tertiaryColor: '#f7f8fb', fontFamily: 'Segoe UI, sans-serif' }, flowchart: { htmlLabels: false, useMaxWidth: true } });
  }
  await mermaid.run({ nodes });
}
function bindZoom(root = document) {
  for (const figure of root.querySelectorAll('.mermaid-diagram')) {
    let zoom = 1;
    figure.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
      zoom = button.dataset.zoom === 'reset' ? 1 : Math.max(.5, Math.min(3, zoom + (button.dataset.zoom === '+' ? .25 : -.25)));
      figure.querySelector('.mermaid').style.zoom = zoom;
    }));
  }
}
window.__notesReady = renderDiagrams().then(() => { bindZoom(); document.documentElement.dataset.ready = 'true'; }).catch(error => {
  document.documentElement.dataset.ready = 'error';
  console.error(error);
  document.querySelectorAll('.mermaid:not([data-processed])').forEach(node => { node.insertAdjacentHTML('beforebegin', '<p role="alert">This diagram could not render. Check its Mermaid syntax.</p>'); });
});

let catalogPromise;
function catalog() {
  return catalogPromise ??= fetch(`${base}notes.json`).then(r => { if (!r.ok) throw new Error('Could not load the note collection. Please refresh and try again.'); return r.json(); });
}
window.preparePrintCollection = async (ids) => {
  const data = await catalog();
  const selected = ids.map(id => data.notes.find(n => n.id === id));
  if (!ids.length || selected.some(n => !n)) throw new Error('Choose at least one valid note.');
  const target = document.querySelector('#print-root');
  target.innerHTML = selected.map(n => `<section class="print-note"><div class="print-brand">QUANTUM NOTES / ${escape(n.course)}</div><h1>${escape(n.title)}</h1>${n.html}</section>`).join('');
  // Prefix fragment IDs so repeated headings across notes stay unique in collections.
  target.querySelectorAll('.print-note').forEach((section, i) => {
    const ids = new Map();
    section.querySelectorAll('[id]').forEach(el => { const old = el.id; el.id = `print-${i}-${old}`; ids.set(old, el.id); });
    section.querySelectorAll('a[href^="#"]').forEach(a => { const id = ids.get(a.getAttribute('href').slice(1)); if (id) a.setAttribute('href', `#${id}`); });
  });
  target.querySelectorAll('details').forEach(d => { d.open = true; });
  await renderDiagrams(target);
  await document.fonts.ready;
  await Promise.all([...target.querySelectorAll('img')].map(img => img.decode()));
  document.body.classList.add('print-collection');
  return selected.length;
};
window.addEventListener('afterprint', () => document.body.classList.remove('print-collection'));

if (document.body.hasAttribute('data-export-page')) {
  const inputs = [...document.querySelectorAll('.export-row input')];
  const button = document.querySelector('#export-selection');
  const selectAll = document.querySelector('#select-all');
  const status = document.querySelector('#export-status');
  function update() {
    const count = inputs.filter(i => i.checked).length;
    document.querySelector('#selection-count').textContent = count ? `${count} ${count === 1 ? 'note' : 'notes'} selected` : 'No notes selected';
    button.disabled = count === 0;
    selectAll.textContent = count === inputs.length ? 'Clear selection' : 'Select all';
  }
  inputs.forEach(i => i.addEventListener('change', update));
  selectAll.addEventListener('click', () => { const checked = !inputs.every(i => i.checked); inputs.forEach(i => { i.checked = checked; }); update(); });
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Preparing equations and diagrams…';
    try {
      await window.preparePrintCollection(inputs.filter(i => i.checked).map(i => i.value));
      status.textContent = 'Ready. Choose “Save as PDF” in the print dialog.';
      window.print();
    } catch (error) { status.textContent = error.message; }
    finally { update(); }
  });
  catalog().then(data => {
    document.querySelector('.export-course-links').innerHTML = `<span class="section-label">COURSE PDFS</span>${data.courses.map(c => `<a href="${c.pdf}" download>${escape(c.title)} ↗</a>`).join('')}`;
  }).catch(error => { status.textContent = error.message; });
}

const headings = document.querySelectorAll('.reader-main h2, .reader-main h3');
if (headings.length) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  }, { rootMargin: '0px 0px -70% 0px' });
  headings.forEach(h => observer.observe(h));
}
