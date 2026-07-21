# APTO content

The three NSF-aligned APTO directions and their matched widget variants use this Markdown as their editable content source. Each content file has two parts:

1. JSON frontmatter between the opening `---` lines for structured fields such as IDs, dates, people, links, and figure settings.
2. Readable Markdown below the frontmatter. The builder takes program and tool copy from `## Description`, project copy from `## Summary`, and routed-page copy from `## Introduction`; each file’s `#` heading must match its corresponding title field.

The content inventory is intentionally fixed at one program, six routed-page files, five project/participant files, and ten concept-tool files. Each participant must join to one NSF award and exactly two tools. Routed pages live in `pages/`; their generated records contain only `slug`, `navLabel`, `metadataTitle`, `eyebrow`, `title`, and normalized `introduction` fields. Shared interface, accessibility, and social-metadata labels live in `interface.md`. Source and provenance records remain part of the generated data for validation, but are not exposed as a public routed page.

The builder applies neutral alphabetical presentation automatically: pages by navigation label, people by name, participants by display name, projects by official title after the shared `APTO:` prefix, tools by tool name (including the tools embedded in participant records), and sources by visible label. Filenames and frontmatter do not contain ranking or sequence fields. Program outcomes and technology areas keep their source-defined order from the NSF solicitation.

Each participant record includes logo mockup metadata: a local asset path, intrinsic dimensions, intended surface, asset kind, official source reference, and approval state. Every current logo is marked `approval-required/mockup` with `approved: false`; those fields must be updated only after the relevant organization approves production use. The builder validates the metadata shape and confirms that every referenced local asset exists without duplicating editable logo values in JavaScript.

After editing, build the generated site data:

```sh
node scripts/build-apto-content.mjs
```

To validate content and confirm that the committed JSON is current without rewriting it:

```sh
node scripts/build-apto-content.mjs --check
```

The script uses only Node.js built-ins. It validates required fields, counts, routed-page slugs, IDs, award joins, participant-logo provenance, the `APTO:` project-title prefix, investigator records, URLs, dates, the exact NSF boilerplate, and concept-only tool state. Do not edit `app/nsf-apto-content.generated.json` by hand.
