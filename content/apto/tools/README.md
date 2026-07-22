# Adding or editing tools

Each Markdown file in this folder is one tool. The website discovers new files
automatically; no source-code list or counter needs to be updated.

## Add a tool

1. Copy an existing tool file and rename it with lowercase kebab-case.
2. Set `id` to the same kebab-case value.
3. Set `participantId` to an ID from `../participants/`.
4. Add the tool figure under `../assets/`, preferably in `../assets/tools/`.
5. Add one to three image-led Atlas visuals under
   `../assets/tools/atlas/` and reference them in `galleryImages`.
6. Complete the description and use case.
7. Run `npm run verify` from the repository root.

## Complete template

```md
---
{
  "kind": "tool",
  "id": "example-technology-explorer",
  "participantId": "northwestern",
  "name": "Example Technology Explorer",
  "categories": ["Capability", "Use"],
  "figure": {
    "kind": "knowledge-map",
    "src": "/apto/tools/example-technology-explorer.webp",
    "label": "Technology landscape",
    "alt": "Map of related research areas with an emerging cluster highlighted"
  },
  "galleryImages": [
    {
      "src": "/apto/tools/atlas/example-technology-explorer.jpg",
      "alt": "Layered research landscape connecting established fields with an emerging cluster"
    },
    {
      "src": "/apto/tools/atlas/example-technology-explorer-detail.jpg",
      "alt": "Detailed view of the highlighted cluster and its strongest neighboring connections"
    }
  ],
  "statusLabel": "Research preview",
  "demoVideoUrl": null,
  "toolUrl": null
}
---

# Example Technology Explorer

## Description

Explain what the tool lets a visitor inspect, compare, or understand. Use one
short paragraph and avoid promising conclusions the research cannot support.

## Use case

Explain a realistic question or task for which the tool would be useful.
```

The H1 must exactly match `name`. The body must contain exactly
`## Description` and `## Use case`.

## Field reference

| Field | Rule |
| --- | --- |
| `id` | Unique lowercase kebab-case identifier |
| `participantId` | Must match an organization ID |
| `categories` | One or more unique values: `Capability`, `Production`, `Use` |
| `figure.kind` | Selects a semantic figure class; see allowed values below |
| `figure.src` | `/apto/…` path matching an image under `content/apto/assets/` |
| `figure.label` | Short visible caption |
| `figure.alt` | Meaningful description of the visual information |
| `galleryImages` | One to three `{ "src", "alt" }` entries for the Atlas tool card |
| `galleryImages[].src` | `/apto/tools/atlas/…` path matching an image under `content/apto/assets/tools/atlas/` |
| `galleryImages[].alt` | Meaningful alternative text for that image; entries must not repeat one another |
| `statusLabel` | Short public status such as `Research preview` |
| `demoVideoUrl` | Full HTTPS URL or `null` |
| `toolUrl` | Full HTTPS URL or `null` |

Allowed `figure.kind` values:

```text
agent-network
causal-graph
evidence-stream
global-map
knowledge-map
problem-landscape
scenario-curves
signal-matrix
technology-timeline
translation-funnel
```

## Tool figures

- Prefer a 16:10 image around 1600 × 1000 pixels; 1280 × 800 is a practical
  minimum for detailed charts.
- Prefer AVIF or WebP for screenshots and visualizations. PNG is appropriate
  when transparency or lossless text rendering is important.
- Keep labels and important marks away from the edges.
- Use `figure.label` as a concise caption.
- Use `figure.alt` to explain what the image communicates, not merely repeat
  the caption. Do not place essential information only inside the image.
- Store original-design previews in `content/apto/assets/tools/previews/` and
  reference them as `/apto/tools/previews/filename.ext`.
- The original design fills a fixed 16:10 media frame with `object-fit: cover`.
  Keep the focal area near the center and expect a small amount of responsive
  cropping on every side.

## Atlas gallery images

`galleryImages` supplies the large, edge-to-edge imagery used by the APTO Atlas
tool cards. Every tool must have between one and three entries. The Atlas card
also uses the standard `figure` as a supporting visual layer, so one gallery
image is sufficient; two or three distinct gallery images make the hover and
expanded transitions richer.

- Store these files in `content/apto/assets/tools/atlas/` and reference them as
  `/apto/tools/atlas/filename.ext`.
- Prefer a landscape image around 1536 × 1024 pixels. Atlas crops with
  `object-fit: cover`, so keep the focal subject near the center and leave safe
  space around important details.
- Avoid embedded interface labels, unsupported data claims, and essential text.
  The card supplies its title and description as accessible HTML.
- Give every image specific alt text that explains its subject or information.
  Do not describe a purely decorative style, and do not copy the tool name.
- To replace provisional artwork, add the approved file, update the matching
  `src` and `alt` in the tool Markdown, remove the now-unused file, and run
  `npm run verify`.
- Large JPEG, PNG, or WebP files should be optimized before commit. Confirm
  publication rights and review the crop in both light and dark themes.

See [Images and figures](../assets/README.md) for paths, accessibility, rights,
and optimization guidance.
