# Macrocosm · APTO content

Edits here feed both APTO Atlas and APTO Continuum. Use `macrocosm` as the
`participantId` in this team's project, person, and tool records.

| To change | Edit |
| --- | --- |
| Organization name, website, location, accent color, or logo references | [organization.md](organization.md) |
| The team's two statements in APTO’s impact | [impact.md](impact.md), in the JSON `entries` array |
| Award details or research summary | [Firm-level energy-system model](projects/macrocosm-energy-sector.md) |
| Investigators, headshots, or profile links | [people/](people/) |
| Tool summaries, links, gallery images, or supporting pieces | [tools/](tools/) |
| Source photos, figures, icons, and logos | [assets/](assets/) |

## Tool records

- [Tool A](tools/macrocosm-energy-digital-twin.md)
- [Tool B](tools/macrocosm-policy-investment-lab.md)

Edit `summaryParagraphs` for the two paragraphs shown on the tool card.
Edit `figure`, `galleryImages`, and `resources` to update the media and
supporting pieces. The [tool guide](../../guides/tools.md) has a full template.

## Images

Add logos under `assets/partners/`, headshots under `assets/people/`, and
tool gallery images under `assets/tools/photography/`. For a new file in
`assets/tools/photography/`, use `/apto/tools/photography/filename.ext`
in Markdown. Start new image filenames with `macrocosm-` to keep their
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
