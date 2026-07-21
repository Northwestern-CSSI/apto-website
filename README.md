# APTO website design system

Production-oriented website directions for the National Science Foundation’s
Assessing and Predicting Technology Outcomes (APTO) program.

The site combines verified program and award information with clearly marked
mockups for future APTO tools. The design-study gallery retains 56 concepts;
the six current NSF-aligned candidates are three complete visual directions
with a matched widget-home variant for each:

- `nsfhome` — light, clear, institutional program home
- `nsfhomewidgets` — light program home with an interactive tool widget
- `nsfledger` — editorial evidence-led direction with expandable records
- `nsfledgerwidgets` — editorial direction with a compact tool plate
- `nsfnetwork` — dark, organization-first cohort direction
- `nsfnetworkwidgets` — dark direction with a signal-console widget

The public routes are `/apto`, `/apto/about`, `/apto/cohort`, `/apto/people`,
`/apto/projects`, and `/apto/tools`. Select a direction with the `concept`
query parameter, for example `/apto?concept=nsfnetworkwidgets`.

## Requirements

- Node.js `>=22.13.0`
- npm

## Local development

```bash
npm ci
npm run dev
```

Build and test the complete site:

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

## Markdown content workflow

All editable APTO program, interface, project, participant, people, and tool
content lives in `content/apto/`:

- `program.md` — program description, program management, outcome framework,
  statistics, sources, and required NSF acknowledgement
- `interface.md` — shared navigation, homepage, design-direction, widget,
  accessibility, social-metadata, disclosure, and footer copy, including
  illustrative widget data
- `pages/*.md` — browser-metadata titles, display titles, and introductions for
  the six routed pages
- `projects/*.md` — the five APTO award and participant records, including
  investigators, organization links, and provisional logo metadata
- `tools/*.md` — two clearly labeled tool concepts per participating
  organization

Files use JSON frontmatter for structured fields and normal Markdown headings
for narrative content. The generator uses Node.js built-ins and validates
alphabetical neutrality, record counts, joins, URLs, required disclaimers, and
mockup labels.

```bash
npm run content:build
npm run content:check
```

Development and production builds regenerate
`app/nsf-apto-content.generated.json` automatically. Edit the Markdown source,
never the generated JSON.

## Accessibility

The APTO routes include semantic landmarks, a skip link, one page heading,
keyboard-operable filters and widget tabs, visible focus, 44px minimum control
targets, reduced-motion support, forced-colors treatments, non-color chart
labels, responsive reflow, and text alternatives for meaningful imagery.

Automated checks live in `tests/rendered-html.test.mjs`. Accessibility remains
an ongoing production responsibility: final content, third-party tools,
approved participant logos, videos, and future data visualizations should be
reviewed again before launch.

## Data, brands, and assets

Award and program facts are source-grounded; widget scores and visualizations
are expressly illustrative and must not be presented as APTO findings. NSF and
participant marks are third-party identifiers, are not covered by any code
license, and require compliance with the relevant owner’s guidance. See
`ASSETS.md` for the asset-review register.

## Project structure

- `app/` — React routes, components, and styles
- `content/apto/` — editable Markdown source of truth
- `public/apto/` — APTO, NSF, participant, and visualization assets
- `scripts/build-apto-content.mjs` — zero-dependency content generator
- `tests/rendered-html.test.mjs` — rendered HTML, content, responsive, and
  accessibility regression tests
- `.openai/hosting.json` — Sites deployment metadata

The current hosted study is
[apto-design-study.moondark.chatgpt.site](https://apto-design-study.moondark.chatgpt.site/).
Build and test before asking Codex Sites to deploy the contents of `dist/`;
deployment metadata is already recorded in `.openai/hosting.json`.

## Useful commands

- `npm run dev` — start local development
- `npm run build` — build the deployable site
- `npm run content:build` — validate Markdown and regenerate content
- `npm run content:check` — fail when generated content is stale
- `npm run typecheck` — run the strict TypeScript check
- `node --test tests/rendered-html.test.mjs` — run regression checks
