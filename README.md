# APTO website

The public website for the National Science Foundation’s **Assessing and
Predicting Technology Outcomes (APTO)** program. It contains two complementary
responsive presentations—the long-scroll APTO Continuum and the image-led APTO
Atlas—built from the same Markdown content and coordinated light and deep-navy
themes.

- Website: <https://filipinascimento.github.io/apto-website/>
- Existing APTO deployment: <https://apto-design-study.moondark.chatgpt.site/story>
- Main pages: Program, Projects, Tools, and Convening
- Long-scroll presentation: `/` or `/story` on GitHub Pages and `/story` or
  `/apto/story` on the existing APTO deployment
- Gallery presentation: `/atlas` on GitHub Pages and `/apto/atlas`
  on the existing APTO deployment, with matching `/projects`, `/tools`,
  and `/convening` subpages

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
- [Add or edit an annual convening](content/apto/convenings/README.md)
- [Add figures, logos, or headshots](content/apto/assets/README.md)

Content records use Markdown with strict JSON frontmatter. The content builder
validates the records, joins their relationships, presents entries
alphabetically, generates `app/apto/content.generated.json`, and copies only
referenced images to the generated `public/apto/` directory. This one content
set feeds both presentations. Never edit either generated, Git-ignored
location by hand.

## Publishing

A pull request runs all website checks. After a pull request is merged, every
push to `main` also builds and publishes GitHub Pages automatically. No manual
compilation or upload is required; GitHub Actions generates the content,
exports the site with the repository base path, checks the exported routes and
assets, and publishes the result.

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
| `app/{story,atlas}/` | Canonical routes used by GitHub Pages |
| `app/apto/{story,atlas}/` | `/apto` aliases used by the existing deployment |
| `scripts/` | Content generation and Pages verification |
| `tests/` | Content, routing, interaction, and accessibility regressions |
| `.github/workflows/` | Pull-request checks and automatic Pages publishing |
| `.openai/`, `build/`, `worker/`, `vite.config.ts` | Existing Sites deployment support |

The retired Original design, historical concepts, and disabled widget work are
preserved in the project-level archive outside this repository.

## Accessibility

The shared design uses semantic landmarks, a single page heading, native
expandable project panels, keyboard-operable filters and galleries, visible
focus, responsive reflow, reduced-motion support, forced-colors treatments,
and text alternatives. Automated checks support ongoing accessibility work but
do not replace expert review with assistive technologies.
