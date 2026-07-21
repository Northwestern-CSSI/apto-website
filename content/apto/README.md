# APTO content

The three NSF-aligned APTO design concepts use this Markdown as their editable content source. Each content file has two parts:

1. JSON frontmatter between the opening `---` lines for structured fields such as IDs, dates, people, links, and figure settings.
2. Readable Markdown below the frontmatter. The builder takes program and tool copy from `## Description` and project copy from `## Summary`; each file’s `#` heading must match its corresponding title field.

The content inventory is intentionally fixed at one program, five project/participant files, and ten concept-tool files. Each participant must join to one NSF award and exactly two tools.

The builder applies neutral alphabetical presentation automatically: participants by display name, projects by official title after the shared `APTO:` prefix, tools by tool name (including the tools embedded in participant records), and sources by visible label. Filenames and frontmatter do not contain ranking or sequence fields. Program outcomes and technology areas keep their source-defined order from the NSF solicitation.

After editing, build the generated site data:

```sh
node scripts/build-apto-content.mjs
```

To validate content and confirm that the committed JSON is current without rewriting it:

```sh
node scripts/build-apto-content.mjs --check
```

The script uses only Node.js built-ins. It validates required fields, counts, IDs, award joins, the `APTO:` project-title prefix, investigator records, URLs, dates, the exact NSF boilerplate, and concept-only tool labels. Do not edit `app/nsf-apto-content.generated.json` by hand.
