# APTO content

The APTO site is built from this folder. Content records are deliberately independent: adding a tool, project, person, or participating organization means adding one Markdown file in the corresponding folder and rebuilding the content. No JavaScript or TypeScript count needs to be changed.

## Content folders

- `participants/` contains one organization per file, including its website, location, logo metadata, map-pin position, and cohort description.
- `people/` contains one person per file. Investigators join to an organization with `participantId`; program leadership uses `participantId: null` and supplies an `organization`.
- `projects/` contains one project per file and joins to an organization with `participantId`.
- `tools/` contains one tool per file and joins to an organization with `participantId`. `categories` accepts one or more of `Capability`, `Production`, and `Use`; `figure.src` selects its catalog image from `assets/` using the matching `/apto/…` public path.
- `future/` preserves approved-but-disabled interface modules and their editable configuration. These records are not included in the public build until explicitly wired into the content generator.
- `pages/` contains the introduction and metadata for each canonical routed page. The home page includes the program overview; `/about` remains as a compatibility route. The visible navigation combines people with the cohort page, while the legacy `/people` URL is handled in route code as an alias and therefore needs no duplicate content record.
- `program.md` contains program-level copy, the NSF framework, statistics, boilerplate, and source references.
- `interface.md` contains all shared interface labels, the Light and Dark theme names, navigation, tool-filter labels, project-map configuration, accessibility text, and footer copy.
- `assets/` is the source of truth for images used by the APTO site, including participant marks, the NSF logo, and supporting artwork. Do not edit the copies in `public/apto/` directly.

Each Markdown file begins with JSON frontmatter between `---` lines. The readable Markdown sections hold longer prose:

- participants and program: `## Description`
- projects: `## Summary`
- tools: `## Description` and `## Use case`
- routed pages: `## Introduction`

Every file has exactly one `#` heading that matches its display title or person name.

## Project dates and status

Projects use an `awardedYear` and `statusLabel` instead of precise start/end dates or funding snapshots. The visible format is controlled in `interface.md` with `projects.awardedPrefix` and `projects.dateStatusSeparator`, producing language such as “Awarded in 2024 – Ongoing.”

## Map positions

Each participant has `mapPosition.x` and `mapPosition.y` values from 0 to 100. These are percentages of the configured map’s native `959 × 593` Albers-projection canvas, not unprojected longitude and latitude. The map automatically groups locations that are too close for honest separate pins—such as Chicago and Evanston—into a keyboard-operable project cluster. Recalculate the percentages if the map artwork changes rather than visually displacing nearby cities.

## Images

Image metadata uses the public URL that components will render, such as `/apto/partners/northwestern.png` or `/apto/science-map-widget.avif`. The actual source file lives at the matching path under `assets/`, such as `assets/partners/northwestern.png` or `assets/science-map-widget.avif`. The content builder verifies participant logos and every tool `figure.src`, copies source images to `public/apto/`, and makes `--check` compare every source and public copy byte-for-byte.

## Build and validate

Generate joined JSON and public image copies:

```sh
node scripts/build-apto-content.mjs
```

Verify that generated JSON and images are current without rewriting them:

```sh
node scripts/build-apto-content.mjs --check
```

The builder validates IDs, joins, alphabetical presentation, URLs, award numbers, the approved NSF boilerplate, logo provenance, local image sources, map coordinates, tool categories, and required Markdown sections. It requires at least one participant, person, project, and tool, and at least one project, investigator, and tool for every participating organization. It does not impose a fixed overall count or a fixed number of tools per organization.

Generated presentation order is neutral: organizations by display name, people by name, projects by official title after the shared `APTO:` prefix, tools by name, and sources by label. Do not add numeric ranking or sequence fields.

Do not edit `app/nsf-apto-content.generated.json` or the copies in `public/apto/` by hand.

The dormant homepage tool widget is preserved in `future/home-tool-widget.md`, with its reusable React implementation in `app/apto/_future/home-tool-widget.tsx`. No live route imports that module.
