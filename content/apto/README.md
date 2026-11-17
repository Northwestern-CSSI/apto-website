# Editing APTO content

This folder is the source of truth for the APTO website. Most updates require
editing only Markdown and images here—no React, TypeScript, or CSS changes.
APTO Continuum and APTO Atlas read the same generated content, so one edit
updates both presentations.

## Quick workflow

1. Open your [team folder](teams/README.md) and follow its editing guide.
2. Give new files a lowercase kebab-case name, such as
   `technology-trajectory-forecaster.md`.
3. Put your team's figures, logos, and headshots under that team's `assets/`.
   Use an `/apto/…` path based on the file's path inside `assets/`.
4. From the repository root, run `npm run verify`.
5. Open a pull request. Merging to `main` publishes GitHub Pages automatically.

## Where do I edit this?

| Website content | Source |
| --- | --- |
| Homepage title and introduction | `pages/home.md` |
| Program description, section introductions, landing gallery, NSF language, sources | [program.md](program.md) |
| Projects-page introduction | `pages/projects.md` |
| Team project descriptions and awards | `teams/<team-id>/projects/*.md` |
| Tools-page introduction | `pages/tools.md` |
| Team tools and supporting pieces | `teams/<team-id>/tools/*.md` |
| Tools presented together as one card | `teams/<team-id>/tool-collections/*.md` |
| Convening-page introduction | `pages/convening.md` |
| Annual convening text and photography | `convenings/*.md` |
| Team name, website, logo references, and location | `teams/<team-id>/organization.md` |
| Team impact statements | `teams/<team-id>/impact.md` |
| Project investigators | `teams/<team-id>/people/*.md` |
| NSF program contacts | [program-team/](program-team/) |
| Navigation, buttons, filters, and footer | `interface.md` |
| Team-specific figures, logos, and headshots | `teams/<team-id>/assets/` |
| Shared photography, icons, NSF mark, and convening photos | [assets/](assets/) |

Detailed guides:

- [Team folders](teams/README.md)
- [Tools](guides/tools.md)
- [Projects](guides/projects.md)
- [People](guides/people.md)
- [Organizations](guides/organizations.md)
- [Page text](pages/README.md)
- [Annual convenings](convenings/README.md)
- [Images and figures](assets/README.md)

## Markdown record rules

Every record starts with strict JSON between `---` lines, followed by readable
Markdown. This is JSON, not YAML:

- Use double quotes.
- Do not add comments or trailing commas.
- Do not add unknown fields; missing or extra fields fail validation.
- Use a unique lowercase kebab-case `id` matching the filename for projects,
  people, and tools. In `organization.md`, `id` matches the team folder.
- Include exactly one `#` heading. Match the record's name or title where its
  guide specifies it.
- Use only the `##` sections listed in the folder-specific guide.
- Treat prose under `##` headings as plain text. Inline Markdown, lists, and
  multiple paragraphs are not rendered; the builder normalizes the section to
  one paragraph. Structured lists belong in the JSON fields documented by the
  folder-specific guide.

Records are joined through IDs. For a team investigator, project, or tool,
`participantId` must match the enclosing team folder and its
`organization.md` ID. NSF program contacts use `participantId: null`.

## Presentation order

Northwestern University and the University of Chicago are the two featured
institutions and are presented as the leading group. On each page load, their
order is randomized by section and alternates in repeated paired layouts.
Apperture.AI, Insilicom, and Macrocosm form a second group whose order is
shuffled independently in each section. The content builder retains a stable
canonical order, and people and tools keep their configured order within each
institution. Do not add number prefixes or manual sequence fields.

## Images

A reference such as:

```json
"src": "/apto/tools/photography/example-figure.webp"
```

maps to this source file:

```text
content/apto/teams/<team-id>/assets/tools/photography/example-figure.webp
```

The path after `/apto/` is relative to an `assets/` folder. The build combines
team and shared assets under `public/apto/` and rejects duplicate public paths.
Put an image used by several teams in the shared `assets/` folder and reuse
its path. See the [image and figure guide](assets/README.md).

## Generate and check content

Run the complete suite:

```bash
npm run verify
```

For a quick content-only iteration:

```bash
npm run content:build
npm run content:check
```

To refresh provisional lorem-ipsum copy with deterministic, non-repeating
passages across impact statements, tool summaries, and tool pieces, run:

```bash
npm run content:placeholders
```

The command updates only placeholder records and keeps each tool's readable
Markdown description synchronized with its card summaries. Run `npm run verify`
afterward.

The generated file is `app/apto/content.generated.json`. Delivery copies of
images are generated under `public/apto/`. Both locations are ignored by Git;
never edit or commit them directly.

The builder validates required fields, IDs, relationships, URLs, local images,
presentation order, tool categories, the approved NSF
boilerplate, and the presence of exactly one principal investigator for every
organization. It records logo source and approval metadata but cannot confirm
legal permission, brand approval, or whether remote links remain live.

## Special files

- `interface.md` owns shared labels and navigation. The visible top navigation
  must remain Program, Projects, Tools, Convening. Its `story` block contains the
  labels used only by the alternate long-scroll presentation.
- `program.md` owns program-level copy, the homepage image selections, and
  the exact NSF disclaimer. Each team's impact statements live in its
  `impact.md`.
- Retired designs and experiments are preserved in the project-level archive,
  outside this public website repository.
