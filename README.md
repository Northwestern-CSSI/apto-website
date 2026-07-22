# APTO website

The public website for the National Science Foundation’s **Assessing and
Predicting Technology Outcomes (APTO)** program. It contains one responsive
design with coordinated light and deep-navy themes.

- Website: <https://filipinascimento.github.io/apto-website/>
- Existing APTO deployment: <https://apto-design-study.moondark.chatgpt.site/apto>
- Main pages: Program, Projects, Tools, and Cohort

## Edit website content

Start with the **[APTO content guide](content/apto/README.md)**. Website text,
organizations, people, projects, tools, logos, headshots, and figures all live
under `content/apto/`.

Common tasks:

- [Add or edit a tool](content/apto/tools/README.md)
- [Add or edit a project](content/apto/projects/README.md)
- [Add or edit a person](content/apto/people/README.md)
- [Add or edit an organization](content/apto/participants/README.md)
- [Edit page titles and introductions](content/apto/pages/README.md)
- [Add figures, logos, or headshots](content/apto/assets/README.md)

Content records use Markdown with strict JSON frontmatter. The content builder
validates the records, joins their relationships, presents entries
alphabetically, generates `app/apto/content.generated.json`, and copies only
referenced images to the generated `public/apto/` directory. Never edit either
generated, Git-ignored location by hand.

## Publishing

A pull request runs all website checks. Every push to `main` also builds and
publishes GitHub Pages automatically; no local compilation or manual upload is
required.

The moondark APTO deployment is a separate hosting target and is not changed by
the GitHub Pages workflow.

## Local development

Requirements: Node.js `>=22.13.0` and npm.

```bash
npm ci
npm run dev
```

After changing content or code, run the complete validation suite:

```bash
npm run verify
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

## Repository structure

| Path | Purpose |
| --- | --- |
| `content/apto/` | Editable website content and source images |
| `app/apto/` | Shared APTO components, theme, styles, and generated content |
| `app/{projects,tools,cohort}/` | Root routes used by GitHub Pages |
| `app/apto/{projects,tools,cohort}/` | `/apto` routes used by the existing deployment |
| `scripts/` | Content generation and Pages verification |
| `tests/` | Content, routing, interaction, and accessibility regressions |
| `.github/workflows/` | Pull-request checks and automatic Pages publishing |
| `.openai/`, `build/`, `worker/`, `vite.config.ts` | Existing Sites deployment support |

The `/apto/about` and `/apto/people` routes are small compatibility aliases for
previously shared links. The disabled homepage widget remains isolated under
`app/apto/_future/` and `content/apto/future/` for possible future use; no live
page imports it.

## Accessibility

The shared design uses semantic landmarks, a single page heading, native
expandable project panels, keyboard-operable filters and map controls, visible
focus, responsive reflow, reduced-motion support, forced-colors treatments,
and text alternatives. Automated checks support ongoing accessibility work but
do not replace expert review with assistive technologies.
