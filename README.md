# Quantum Notes

A Markdown-first learning workbench for quantum topics from different courses. The interface follows the Docs Workbench in `cyberlegends-inc/ai.cyberlegends.com`: a collapsible sidebar, course/folder browser, wide document reader, and export screen. This repo runs as a static site on GitHub Pages.

- Ordinary Markdown with YAML metadata; no database or backend.
- LaTeX equations with KaTeX, including bra-ket notation.
- Mermaid diagrams with zoom controls.
- Styled callouts, HTML concept cards, and expandable explanations.
- Full-text search, linked notes, course navigation, and a table of contents.
- Direct PDF downloads for every note, each course, and the whole notebook.
- Selected-note export using the browser's **Save as PDF** dialog.
- Download the original Markdown from any note.

## Run locally

Requires Node.js 22 or newer (CI uses Node 24).

```bash
npm ci
npx playwright install chromium
npm run build
npm run preview
```

Open http://127.0.0.1:4173/quantum_notes/.

For writing, use `npm run dev`; it rebuilds on changes to notes, docs, public assets, and styles. Refresh the browser after a rebuild. Restart it if you change scripts or configuration. Run the full build to refresh PDFs. Chromium is a build-time dependency only; readers need no plugins or extra software.

## Add a note

```bash
npm run new:note -- --course ibm-quantum --title "Entanglement"
```

For a new course:

```bash
npm run new:note -- --course quantum-algorithms --course-title "Quantum Algorithms" --title "Grover search"
```

Or copy `templates/note.md` to `notes/<course-folder>/<note-name>.md`. New files automatically appear in the course browser, search, and PDF exports. Required metadata: `title`, `course`, `description`, and a quoted `updated` date. Follow [the writing guide](docs/writing-guide.md) for equations, Mermaid, HTML, links, images, and the suggested structure.

```text
notes/                  # Source of truth: one Markdown file per note
  ibm-quantum/
  math-foundations/
  mit-8-04/
templates/note.md        # Reusable note format
docs/writing-guide.md   # Authoring instructions, also rendered on the site
src/                    # Reader behavior and Workbench styling
scripts/                # Static build, PDF generation, preview, and note creation
public/                 # Favicon and shared static assets
tests/                  # Content and browser checks
dist/                   # Generated site and PDFs; ignored by Git
```

The five included notes are original starter examples, with links to relevant MIT and IBM courses. They are not complete lecture notes or official course materials. Replace or expand them as you study.

## Publish on GitHub Pages

1. Push this repository to `main` on GitHub.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Run **Publish Quantum Notes** from Actions, or push another commit.

The workflow validates the content, builds HTML and PDFs, runs browser checks, and deploys the generated `dist` directory. It derives the URL prefix from the repository name, so links and assets work under `/quantum_notes/`. Pull requests build and test without deploying.

For a custom domain, set the repository Actions variable `SITE_BASE` to `/`, set `SITE_ORIGIN` to your HTTPS origin (without a trailing slash), and configure the domain in Pages. For a local root-path build, set the `SITE_BASE` environment variable to `/`. The workflow supplies `SITE_REPOSITORY` automatically for the sidebar link. `SITE_ORIGIN` also ensures exported PDF links point to the published site.

GitHub's [custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) explains the deployment actions and permissions.

## Validation

```bash
npm test
npm run build
npm run test:browser
```

The build rejects missing metadata, invalid equations, inconsistent course names, and broken local Markdown links. PDF generation fails if a diagram, font asset, or image cannot load. Browser checks cover note rendering, search, mobile layout, downloads, and export selection.

## Implementation notes

Markdown is compiled at build time with `markdown-it`. HTML authored inside notes is sanitized before rendering, keeping generated KaTeX markup intact. JavaScript loads Mermaid only on pages containing diagrams. All renderer assets and fonts are bundled locally. PDFs use Chromium's print engine with selectable text, expanded explanations, page numbers, and rendered diagrams.

GitHub Pages is a reader and publishing surface. Edit Markdown locally or with GitHub's file editor; pushing changes republishes the site. There is no online account system, server-side editor, or copy of the original Workbench's agent/session service.
