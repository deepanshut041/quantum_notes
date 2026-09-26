# Writing a quantum note

## Create a note

Keep notes inside `notes/<section>/<topic>/<note-name>.md`. The website has four stages: **Foundations**, **Basic Algorithms**, **Advanced Algorithms**, and **Research**. Each stage has topics listed in `sections.mjs`. All stages and topics appear on the site, even before they have notes. Choose the topic by the main idea of the note; link a course separately if it supplied or inspired the material. Paths use lowercase letters, numbers, hyphens, or underscores.

```bash
npm run new:note -- --section foundations --topic states-and-measurement --title "Entanglement" --course ibm-quantum
```

Omit `--course` for an independent study note. Use `--course-title "My course name"` to introduce a new course. A course can appear in many stages and topics. To introduce a new topic, add its ID, title, and description to `sections.mjs`, then make a note in the matching folder. You can instead copy `templates/note.md` into a topic folder and edit it.

## Required metadata

Every note begins with YAML frontmatter. Quote dates so they remain strings. Course metadata is optional and does not determine the note's topic.

```yaml
---
title: "Entanglement"
course: "IBM · Basics of quantum information"
course_id: ibm-quantum
description: "Correlations in composite quantum systems."
updated: "2026-09-26"
order: 3
tags: [entanglement, composite systems]
status: In progress
sources:
  - title: "Name of lecture or course"
    url: https://example.com/course
---
```

The title, description, and updated date are required. Use `course` and `course_id` together for an existing course; repeat the same name and ID wherever its notes appear. `order` controls sequence within a topic. The source links appear under References. For research notes, link the actual paper in `sources` and separate the paper's claims from your own observations.

## Equations

Use dollar signs for inline math and double dollar signs for display equations. LaTeX bracket delimiters are also supported. Common bra-ket commands are included.

```latex
Inline: $\ket{\psi}=\alpha\ket{0}+\beta\ket{1}$

$$
|\alpha|^2+|\beta|^2=1
$$
```

$$
\ket{\psi}=\alpha\ket{0}+\beta\ket{1},
\qquad |\alpha|^2+|\beta|^2=1.
$$

## Mermaid diagrams

Use a fenced code block with the language `mermaid`.

````markdown
```mermaid
flowchart LR
    A[Prepare] --> B[Evolve]
    B --> C[Measure]
```
````

```mermaid
flowchart LR
    A[Prepare] --> B[Evolve]
    B --> C[Measure]
```

Diagrams have zoom controls in the reader and are rendered into the downloadable PDFs.

## Callouts

Supported types are `note`, `tip`, `warning`, `definition`, and `example`. An optional title follows the type.

```markdown
:::definition Unitary operator
A matrix $U$ is unitary when $U^\dagger U=I$.
:::
```

:::definition Unitary operator
A matrix $U$ is unitary when $U^\dagger U=I$.
:::

## HTML elements

Use semantic HTML for expandable explanations and concept cards. Scripts, event handlers, iframes, and arbitrary styles are removed. Use the built-in classes for consistent presentation.

```html
<details>
<summary>Why does normalization matter?</summary>
<p>The probabilities of all possible outcomes must sum to one.</p>
</details>

<div class="concept-grid">
  <div class="concept-card"><h3>Concept</h3><p>Explanation.</p></div>
  <div class="concept-card"><h3>Connection</h3><p>Related idea.</p></div>
</div>
```

Use ordinary Markdown paragraphs outside HTML blocks for equations and other Markdown formatting. All expandable explanations are opened in generated PDFs.

## Links, images, and code

Link notes with relative `.md` paths: for example, `[Gates](../gates-and-circuits/02-gates-and-interference.md)` from a note in `foundations/states-and-measurement/`. The builder validates and rewrites these to website URLs, including the GitHub Pages prefix.

Place images in a topic's `assets` folder and reference them with Markdown, such as `![Circuit](assets/circuit.png)`. Supported asset formats are PNG, JPEG, GIF, WebP, SVG, and PDF. Use Markdown links for local assets so paths are rewritten automatically; use absolute HTTPS URLs inside raw HTML.

Use fenced code blocks, ordinary Markdown tables, numbered lists, and blockquotes as needed.

## Download and publish

Each note has a **Download PDF** button and a **Markdown** download. The Export page also provides PDFs for populated stages, courses, and the complete notebook, or lets you select notes and save them through the print dialog.

```bash
npm run build
npm run preview
```

The build creates the static website and PDFs in `dist`. Push to `main` to rebuild and publish through the included GitHub Pages workflow. Preview-only builds do not refresh PDFs; use the full build before sharing.

## A useful note structure

1. The idea in one sentence.
2. Definitions and intuition.
3. A derivation with assumptions stated.
4. A worked example.
5. Connections to other notes.
6. A question to test understanding.
7. Open questions and source references.

The starter notes illustrate this structure. They are original short examples, not complete course notes or reproductions of lecture material.
