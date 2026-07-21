# APTO content

The APTO site is built from this folder. Content records are deliberately independent: adding a tool, project, person, or participating organization means adding one Markdown file in the corresponding folder and rebuilding the content. No JavaScript or TypeScript count needs to be changed.

## Content folders

- `participants/` contains one organization per file, including its website, location, logo metadata, map-pin position, and cohort description.
- `people/` contains one person per file. Investigators join to an organization with `participantId`; program leadership uses `participantId: null` and supplies an `organization`.
- `projects/` contains one project per file and joins to an organization with `participantId`.
- `tools/` contains one tool per file and joins to an organization with `participantId`. `categories` accepts one or more of `Capability`, `Production`, and `Use`.
- `pages/` contains the introduction and metadata for each canonical routed page. The visible navigation combines people with the cohort page; the legacy `/people` URL is handled in route code as an alias and therefore needs no duplicate content record.
- `program.md` contains program-level copy, the NSF framework, statistics, boilerplate, and source references.
- `interface.md` contains all shared interface labels, the Light and Dark theme names, navigation, home-widget copy, tool-filter labels, project-map configuration, accessibility text, and footer copy.
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

Each participant has `mapPosition.x` and `mapPosition.y` values from 0 to 100. These percentages place its accessible project pin over the map configured at `interface.projects.map`. Adjust the values in the participant Markdown if the map artwork changes.

## Images

Image metadata uses the public URL that components will render, such as `/apto/partners/northwestern.png`. The actual source file lives at the matching path under `assets/`, such as `assets/partners/northwestern.png`. The content builder copies source images to `public/apto/`; `--check` compares every source and public copy byte-for-byte.

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
