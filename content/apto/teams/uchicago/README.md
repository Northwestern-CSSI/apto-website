# University of Chicago · APTO content

Edits here feed both APTO Atlas and APTO Continuum. Use `uchicago` as the
`participantId` in this team's project, person, and tool records.

| To change | Edit |
| --- | --- |
| Organization name, website, location, accent color, or logo references | [organization.md](organization.md) |
| The team's three statements in APTO’s impact | [impact.md](impact.md), in the JSON `entries` array |
| Award details or research summary | [Global observatory and virtual laboratory](projects/uchicago-global-observatory.md) |
| Investigators, headshots, or profile links | [people/](people/) |
| Tool summaries, links, gallery images, or supporting pieces | [tools/](tools/) |
| Which tools share the AI Tools card, and that card's name, summary, and images | [tool-collections/uchicago-ai-tools.md](tool-collections/uchicago-ai-tools.md) |
| Source photos, figures, icons, and logos | [assets/](assets/) |

## Tool records

- [AI Infrastructure](tools/uchicago-ai-infrastructure.md)
- [AI Skills](tools/uchicago-global-innovation-signals.md)
- [Data](tools/uchicago-global-observatory.md)
- [AI Benchmarks](tools/uchicago-innovation-ecosystem-dynamics.md)
- [The Parable Tool](tools/uchicago-virtual-policy-lab.md)
- [Dashboards](tools/uchicago-workforce-flows.md)

The site groups AI Skills, AI Benchmarks, and AI Infrastructure into one
**AI Tools** card. Edit the individual record to change that supporting area,
and edit [the collection record](tool-collections/uchicago-ai-tools.md) to
change the card itself or the tools it contains.

Edit `summaryParagraphs` for the two paragraphs shown on the tool card.
Edit `figure`, `galleryImages`, and `resources` to update the media and
supporting pieces. The [tool guide](../../guides/tools.md) has a full template.

## Images

Add logos under `assets/partners/`, headshots under `assets/people/`, and
tool gallery images under `assets/tools/photography/`. For a new file in
`assets/tools/photography/`, use `/apto/tools/photography/filename.ext`
in Markdown. Start new image filenames with `uchicago-` to keep their
public paths unique. Add meaningful alt text when updating an image.

The current tool galleries use [shared placeholder photos](../../assets/tools/placeholders/).
To replace one for this team, add a new photo to this team’s assets and
update the corresponding tool record.

## Check your edits

Copy an existing record as a template and keep its JSON frontmatter between
the `---` lines. If you add a person, project, or tool, use an ID matching
the new filename. Use the [people](../../guides/people.md),
[project](../../guides/projects.md), [organization](../../guides/organizations.md),
and [image](../../assets/README.md) guides for field details.

From the repository root, run `npm run verify`. Use `npm run dev` to preview
changes in both views.
