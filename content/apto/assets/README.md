# Images, figures, logos, and headshots

This folder is the source of truth for every image published by the APTO site.
The content builder copies only supported images that are referenced by live
content. An unreferenced image fails validation so unused files do not
accumulate in the repository or deployment.

Never edit generated copies under `public/apto/`.

## Paths

The public path mirrors the location beneath this folder:

| Source file | Markdown reference |
| --- | --- |
| `assets/tools/example.webp` | `/apto/tools/example.webp` |
| `assets/tools/atlas/example.jpg` | `/apto/tools/atlas/example.jpg` |
| `assets/headshots/jane-doe.webp` | `/apto/headshots/jane-doe.webp` |
| `assets/partners/example.svg` | `/apto/partners/example.svg` |

Use lowercase kebab-case filenames. Supported extensions are `.avif`, `.jpeg`,
`.jpg`, `.png`, `.svg`, and `.webp`. Animated GIF is intentionally unsupported.

## Tool figures

- Prefer 1600 × 1000 pixels with a 16:10 composition; 1280 × 800 is a practical
  minimum for detailed charts.
- Prefer AVIF or WebP for visualizations and screenshots.
- PNG is appropriate for transparency or fine text that must remain lossless.
- Keep labels, legends, and important marks away from the edges.
- Write a short visible caption in `figure.label` and meaningful alternative
  text in `figure.alt`.
- Do not communicate an essential result only through color or only inside the
  image.

The current generic science-map, model, prediction, and network images are live
figures reused across the initial set of tools. Replace them with approved,
tool-specific figures as project teams provide them.

## Atlas tool gallery

The APTO Atlas presentation uses image-led tool cards. Their source artwork
lives in `tools/atlas/` and is referenced from each tool record through a
required `galleryImages` array containing one to three `{ "src", "alt" }`
entries.

- Prefer a landscape composition around 1536 × 1024 pixels with the focal area
  near the center. Atlas intentionally crops these images to fill responsive
  cards.
- A tool can begin with one gallery image. Add a second or third distinct view
  only when it improves the hover and expanded transition rather than repeating
  the same visual.
- Keep important information out of the crop edges and out of embedded text.
- Treat the current generated Atlas artwork as provisional. When a project team
  supplies an approved figure, place it in this folder, update the tool
  Markdown reference and alt text, and remove the replaced file so it does not
  fail the unused-asset check.
- Optimize files before commit and verify their rights, factual accuracy, and
  appearance in both themes.

See [Adding or editing tools](../tools/README.md) for the complete frontmatter
template and replacement steps.

## Headshots

- Use a consistent square crop around 800 × 800 pixels.
- Prefer WebP, AVIF, or JPEG.
- Center the face with comfortable margin so the circular crop remains useful.
- Confirm permission to publish the image.
- Use alt text in the form “Portrait of Name.”
- Set `headshotUrl` to the matching `/apto/headshots/…` path. Use `null` when no
  approved image is available; the site will show initials.

External headshot URLs are not accepted. This keeps website images versioned
with their content and prevents third-party image changes from silently
altering the site.

## Organization marks

- Use official artwork from the organization’s website or brand resources.
- Prefer SVG for logos when an approved vector is available; otherwise use a
  transparent PNG or WebP.
- Preserve official proportions, clear space, colors, and minimum sizes.
- Record the exact intrinsic dimensions in the participant record.
- Record the source URL, source label, intended light/dark surface, mark type,
  approval status, and approval boolean in `participants/*.md`.
- Verify the mark in both website themes. Some marks use organization-specific
  CSS normalization, but they should not be distorted or recolored casually.

The five participant marks remain the property of their respective
organizations. Inclusion in this repository does not transfer ownership or
grant reuse rights. Confirm approved artwork and usage before final launch.

## NSF mark

`nsf-logo.png` is the U.S. National Science Foundation mark. Follow the NSF
Brand Standards and Usage guidance. The required NSF acknowledgement and
disclaimer are maintained in `../program.md`.

## Map and social image

- `us-map.svg` is the project-page base map. Its CC0 Wikimedia source metadata
  is recorded in `../interface.md`. The map image is decorative because the
  adjacent keyboard-operable legend provides the same locations in text.
- `og-apto.png` is the social preview image. Keep social replacements at
  1200 × 630 pixels and ensure important text remains legible in small link
  previews.
- `og-apto-continuum.png` is the dedicated preview for the long-scroll APTO
  Continuum presentation. Its abstract imagery intentionally contains no
  embedded text, marks, or data claims.
- The Atlas social preview is referenced by `atlas.socialImageSrc` in
  `../interface.md`. Keep it at 1200 × 630 pixels and free of embedded claims or
  organization marks unless their use has been approved.

## Before publishing an image

- Confirm ownership, license, consent, and brand approval.
- Remove confidential data and unnecessary metadata.
- Verify labels and alt text.
- Check both light and dark themes.
- Run `npm run verify` from the repository root.

The builder checks file presence, format, reference integrity, and metadata
shape. It cannot determine copyright, consent, factual accuracy, or brand
approval.
