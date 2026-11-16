# Northwestern University · APTO content

Edits here feed both APTO Atlas and APTO Continuum. Use `northwestern` as the
`participantId` in this team's project, person, and tool records.

| To change | Edit |
| --- | --- |
| Organization name, website, location, accent color, or logo references | [organization.md](organization.md) |
| The team's three statements in APTO’s impact | [impact.md](impact.md), in the JSON `entries` array |
| Award details or research summary | [Measuring and predicting technology outcomes](projects/northwestern-technology-outcomes.md) |
| Investigators, headshots, or profile links | [people/](people/) |
| Tool summaries, links, gallery images, or supporting pieces | [tools/](tools/) |
| Source photos, figures, icons, and logos | [assets/](assets/) |

## Tool records

- [Agentic Framework For Technology Outcomes Tool](tools/agentic-framework-for-technology-outcome-mining.md)
- [Aggregating Research Pipeline At Scale Tool](tools/aggregating-research-pipeline-at-scale.md)
- [Emerging Technology Detection Tool](tools/emerging-technology-detection.md)
- [Multi-Objective Technology Outcomes Tool](tools/multiobjective-technology-outcomes.md)
- [Predicting Technological Evolution Tool](tools/predicting-technological-evolution.md)

Edit `summaryParagraphs` for the two paragraphs shown on the tool card.
Edit `figure`, `galleryImages`, and `resources` to update the media and
supporting pieces. The [tool guide](../../guides/tools.md) has a full template.

## Images

Add logos under `assets/partners/`, headshots under `assets/people/`, and
tool gallery images under `assets/tools/photography/`. For a new file in
`assets/tools/photography/`, use `/apto/tools/photography/filename.ext`
in Markdown. Start new image filenames with `northwestern-` to keep their
public paths unique. Add meaningful alt text when updating an image.

The [tool photography](assets/tools/photography/) also supplies the
homepage’s What We Are Building panels and some social previews. Search
for a photo’s public path before replacing it so you see every place it
appears. [Candidate figures](assets/tools/resources/) are stored separately.

## Check your edits

Copy an existing record as a template and keep its JSON frontmatter between
the `---` lines. If you add a person, project, or tool, use an ID matching
the new filename. Use the [people](../../guides/people.md),
[project](../../guides/projects.md), [organization](../../guides/organizations.md),
and [image](../../assets/README.md) guides for field details.

From the repository root, run `npm run verify`. Use `npm run dev` to preview
changes in both views.
