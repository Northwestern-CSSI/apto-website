# Editing APTO content

This folder is the source of truth for the APTO website. Most updates require
editing only Markdown and images here—no React, TypeScript, or CSS changes.
The compact directory and long-scroll APTO Continuum read the same generated
content, so one edit updates both presentations.

## Quick workflow

1. Edit an existing Markdown record or copy a similar record into the correct
   folder.
2. Give new files a lowercase kebab-case name, such as
   `technology-trajectory-forecaster.md`.
3. Put new figures, logos, and headshots under `assets/` and reference them with
   an `/apto/…` path.
4. From the repository root, run `npm run verify`.
5. Open a pull request. Merging to `main` publishes GitHub Pages automatically.

## Where do I edit this?

| Website content | Source |
| --- | --- |
| Homepage title and introduction | `pages/home.md` |
| Program description, objectives, framework, NSF language, sources | `program.md` |
| Projects-page introduction | `pages/projects.md` |
| Individual projects | `projects/*.md` |
| Tools-page introduction | `pages/tools.md` |
| Individual tools and their figures | `tools/*.md` |
| Cohort-page introduction | `pages/cohort.md` |
| Organizations, logos, locations, map pins | `participants/*.md` |
| Program manager and investigators | `people/*.md` |
| Navigation, buttons, filters, map labels, footer | `interface.md` |
| Figures, logos, headshots, map, NSF mark, social image | `assets/` |

Detailed guides:

- [Tools](tools/README.md)
- [Projects](projects/README.md)
- [People](people/README.md)
- [Organizations](participants/README.md)
- [Page text](pages/README.md)
- [Images and figures](assets/README.md)

## Markdown record rules

Every record starts with strict JSON between `---` lines, followed by readable
Markdown. This is JSON, not YAML:

- Use double quotes.
- Do not add comments or trailing commas.
- Do not add unknown fields; missing or extra fields fail validation.
- Use a unique lowercase kebab-case `id` and matching filename.
- Include exactly one `#` heading matching the visible record name or title.
- Use only the `##` sections listed in the folder-specific guide.
- Treat prose under `##` headings as plain text. Inline Markdown, lists, and
  multiple paragraphs are not rendered; the builder normalizes the section to
  one paragraph. Structured lists belong in the JSON fields documented by the
  folder-specific guide.

Records are joined through IDs. A `participantId` in a person, project, or tool
must match an organization’s `id` in `participants/`.

## Neutral ordering

Organizations, people, projects, tools, and sources are generated
alphabetically. Do not add numbers, rank fields, or manual sequence prefixes.
Alphabetical presentation avoids implying preference among APTO participants.

## Images

A reference such as:

```json
"src": "/apto/tools/example-figure.webp"
```

maps to this source file:

```text
content/apto/assets/tools/example-figure.webp
```

The builder copies only supported, referenced images into `public/apto/`.
Unreferenced images fail validation so the repository does not accumulate
unused files. See the [image and figure guide](assets/README.md).

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

The generated file is `app/apto/content.generated.json`. Delivery copies of
images are generated under `public/apto/`. Both locations are ignored by Git;
never edit or commit them directly.

The builder validates required fields, IDs, relationships, URLs, local images,
alphabetical presentation, map coordinates, tool categories, the approved NSF
boilerplate, and the presence of exactly one principal investigator for every
organization. It records logo source and approval metadata but cannot confirm
legal permission, brand approval, or whether remote links remain live.

## Special files

- `interface.md` owns shared labels and navigation. The visible top navigation
  must remain Program, Projects, Tools, Cohort. Its `story` block contains the
  labels used only by the alternate long-scroll presentation.
- `program.md` owns substantive program language and the exact NSF disclaimer.
- `future/` preserves approved-but-disabled interface work. Its homepage widget
  is not included in the public site and should remain disabled until approved.
