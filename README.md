# APTO website

The public website for the National Science Foundation’s Assessing and
Predicting Technology Outcomes (APTO) program. The repository contains one
responsive design with coordinated NSF-informed light and deep-navy themes.

The primary pages are Program, Projects, Tools, and Cohort. They are published
at the repository root on GitHub Pages and under `/apto` on the existing Sites
deployment. The `/apto/about` and `/apto/people` routes remain only as backward-
compatible aliases.

## Publishing

Every push to `main` runs the website checks and builds a static GitHub Pages
artifact. After GitHub Pages is enabled once in **Settings → Pages → Source →
GitHub Actions**, publishing is automatic at:

`https://filipinascimento.github.io/apto-website/`

No local compilation is required for publishing. Because this repository is
private, the GitHub account or organization must support Pages for private
repositories; alternatively, the repository can be made public. The deployed
Pages website itself is public.

The existing Sites deployment remains available at:

[apto-design-study.moondark.chatgpt.site/apto](https://apto-design-study.moondark.chatgpt.site/apto)

## Local development

Requirements: Node.js `>=22.13.0` and npm.

```bash
npm ci
npm run dev
```

Run the production checks with:

```bash
npm run content:build
npm run lint
npm run typecheck
npm test
```

To reproduce the GitHub Pages export locally:

```bash
GITHUB_PAGES=true \
NEXT_PUBLIC_BASE_PATH=/apto-website \
NEXT_PUBLIC_APTO_ROUTE_BASE='' \
NEXT_PUBLIC_SITE_URL=https://filipinascimento.github.io/apto-website \
npm run build:pages

NEXT_PUBLIC_BASE_PATH=/apto-website npm run check:pages
```

## Markdown and image workflow

`content/apto/` is the source of truth:

- `participants/*.md` — one participating organization per file
- `people/*.md` — one program or project-team member per file
- `projects/*.md` — one project per file
- `tools/*.md` — one tool per file, including its figure path and alt text
- `pages/*.md` — page titles, metadata, and introductions
- `program.md` — program description, objectives, framework, and acknowledgement
- `interface.md` — navigation, labels, filters, map, and footer
- `assets/` — all public images, organization marks, NSF mark, map, and social image

To add a tool, add one Markdown file to `content/apto/tools/` and place its
image in `content/apto/assets/`. Then run:

```bash
npm run content:build
npm run content:check
```

The builder validates and alphabetizes records, joins relationships, generates
`app/nsf-apto-content.generated.json`, and copies images to `public/apto/`.
Generated JSON and public image copies should not be edited directly. See
`content/apto/README.md` for the record schema.

The disabled future homepage widget remains isolated in `app/apto/_future/`
and `content/apto/future/`; it is not rendered by any public route.

## Accessibility

The shared site uses semantic landmarks, one page heading, native expandable
project panels, keyboard-operable filters, visible focus, 44-pixel control
targets, responsive reflow, reduced-motion support, forced-colors treatments,
text alternatives, and redundant text navigation for the project map.
Automated regressions live in `tests/rendered-html.test.mjs`.
