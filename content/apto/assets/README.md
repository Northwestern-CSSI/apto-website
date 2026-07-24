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
| `assets/convenings/2026/example.jpg` | `/apto/convenings/2026/example.jpg` |

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

The provisional original-design previews live in `tools/previews/`. Each tool
has its own crop-safe image and the website fills a fixed 16:10 frame with it.
Replace these generated previews with approved, tool-specific figures as
project teams provide them, keeping the filename and focal area suitable for
responsive `object-fit: cover` cropping.

## Atlas tool gallery

The APTO Atlas presentation uses image-led tool cards. Their source artwork
lives in `tools/atlas/` and is referenced from each tool record through a
required `galleryImages` array containing exactly three `{ "src", "alt" }`
entries.

- Prefer a landscape composition around 1536 × 1024 pixels with the focal area
  near the center. Atlas intentionally crops these images to fill responsive
  cards.
- Supply three distinct gallery views. The card adds the tool's standard
  `figure` as a fourth frame and cycles through all four with slow, independently
  timed pans, focal shifts, zooms, and overlapping dissolves.
- Keep every tool media path globally unique. Reusing a figure on another tool
  is rejected during the content build.
- Keep important information out of the crop edges and out of embedded text.
- Treat the current generated Atlas artwork as provisional. When a project team
  supplies an approved figure, place it in this folder, update the tool
  Markdown reference and alt text, and remove the replaced file so it does not
  fail the unused-asset check.
- Optimize files before commit and verify their rights, factual accuracy, and
  appearance in both themes.

See [Adding or editing tools](../tools/README.md) for the complete frontmatter
template and replacement steps.

## Atlas landing gallery

The five equal-weight landing visuals are selected in `../program.md` through
`landingGallery`. Use project-idea imagery without organization names, logos,
or embedded labels so the landing composition does not imply preference among
participants. All five images are cropped responsively and receive a slow,
continuous pan; keep important details away from every edge.

## Annual convening photography

Store each year’s five photographs under `convenings/<year>/` and reference
them from the matching record in `../convenings/`. Use wide, crop-safe images
without embedded text. The shared gallery applies an animated pan and dissolve
and exposes keyboard-operable image indicators; reduced-motion users receive a
static presentation.

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
- Store paired light- and dark-surface variants in this folder when the
  organization provides them. Prefer transparent or reversed artwork for the
  dark variant so a white rectangle is never required behind the mark.
- Record both variants and their exact intrinsic dimensions in the participant
  record. A transparent full-color mark may be reused for both themes when its
  contrast is sufficient.
- Record the source URL, source label, mark type, approval status, and approval
  boolean in `participants/*.md`.
- Verify the mark in both website themes and in all three presentations. The
  shared renderer switches assets by theme; do not add organization-specific
  filters or casual recoloring in presentation CSS.

The five participant marks remain the property of their respective
organizations. Inclusion in this repository does not transfer ownership or
grant reuse rights. Confirm approved artwork and usage before final launch.

## NSF mark

`nsf-logo.png` is the U.S. National Science Foundation mark. Follow the NSF
Brand Standards and Usage guidance. The required NSF acknowledgement and
disclaimer are maintained in `../program.md`.

## Social images

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
