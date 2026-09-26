# Working on Quantum Notes

- Keep all notes as Markdown under `notes/<section>/<topic>/<note>.md`. The learning path is defined in `sections.mjs`; courses are optional connections across topics. Use `templates/note.md` and `docs/writing-guide.md`.
- Do not invent lecture attendance, completed courses, or personal observations. Label examples as starter notes and cite course sources.
- Match the existing Workbench interface. Keep builds static and compatible with GitHub Pages project subpaths.
- Keep source notes, generated HTML, and PDF exports consistent. Regenerate PDFs with `npm run build` after content or renderer changes.
- Run `npm test`, `npm run build`, and `npm run test:browser` after meaningful changes to rendering, routing, or exports.
- Review representative website and PDF pages visually after layout changes.
- Never commit `dist`, caches, browser artifacts, credentials, or dependencies. Commit the lockfile.
- The Pages workflow deploys `main`; pull requests only build and validate.
