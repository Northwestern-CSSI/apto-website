# APTO website

The first public website for the National Science Foundation’s Assessing and
Predicting Technology Outcomes (APTO) program. It combines a curved,
NSF-aligned light interface with a coordinated deep-navy theme.

The public pages are:

- `/apto` — program home
- `/apto/about` — program framework
- `/apto/projects` — expandable project records and awardee map
- `/apto/tools` — tools filtered by organization and outcome area
- `/apto/cohort` — participating organizations, program leadership, and teams

The legacy `/apto/people` route displays the combined cohort page. Previously
published `concept` links remain compatible: light/editorial variants resolve
to the merged light site, and network variants resolve to the dark site.

## Requirements

- Node.js `>=22.13.0`
- npm

## Local development

```bash
npm ci
npm run dev
```

Run all production checks:

```bash
npm test
npm run typecheck
npm run lint
```

## Markdown and image workflow

`content/apto/` is the source of truth for the public site:

- `participants/*.md` — one participating organization per file
- `people/*.md` — one program or project-team member per file
- `projects/*.md` — one project per file
- `tools/*.md` — one tool per file
- `pages/*.md` — page titles, metadata, and introductions
- `program.md` — program copy, framework, statistics, and NSF acknowledgement
- `interface.md` — navigation, labels, filters, map, and footer
- `assets/` — every APTO image, participant mark, NSF mark, map, and social card

Adding a tool or project does not require changing a hard-coded inventory.
Create a Markdown record, add any image under `content/apto/assets/`, and run:

```bash
npm run content:build
npm run content:check
```

The builder validates and alphabetizes records, joins relationships, derives
program statistics, generates `app/nsf-apto-content.generated.json`, and copies
content assets to `public/apto/`. Never edit generated JSON or public asset
copies directly. See `content/apto/README.md` for the complete record schema.

## Accessibility

The APTO pages use semantic landmarks, one page heading, native expandable
project panels, keyboard-operable filters, visible focus,
44-pixel control targets, responsive reflow, reduced-motion support,
forced-colors treatments, text alternatives, and redundant text navigation for
the project map. Automated regression checks live in
`tests/rendered-html.test.mjs`; new content and future embedded tools should be
reviewed again as they are added.

## Project structure

- `app/` — React routes, components, metadata, and styles
- `content/apto/` — editable Markdown and image sources
- `content/apto/future/` — disabled feature configurations retained for later use
- `public/apto/` — generated public image copies
- `scripts/build-apto-content.mjs` — content generator and validator
- `tests/rendered-html.test.mjs` — rendered HTML and accessibility regressions
- `.openai/hosting.json` — Sites deployment metadata

Hosted site: [apto-design-study.moondark.chatgpt.site](https://apto-design-study.moondark.chatgpt.site/)
