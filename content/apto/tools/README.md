# Adding or editing tools

Each Markdown file in this folder is one public-facing research tool. The
Northwestern collection uses broad capability names, while other participating
teams may use provisional research-tool mockups until their final tools are
available. The website discovers new files automatically; no source-code list
or counter needs to be updated.

## Add a tool

1. Copy an existing tool file and rename it with lowercase kebab-case.
2. Set `id` to the same kebab-case value.
3. Set `participantId` to an ID from `../participants/`.
4. Add four supplied or approved conceptual images under
   `../assets/tools/photography/`: one `figure` plus three `galleryImages`.
5. Add one or more supporting pieces under `resources`. A coming-soon piece
   must use `"status": "coming-soon"` and `"url": null`.
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
  "displayOrder": 1,
  "categories": ["Capability", "Use"],
  "figure": {
    "kind": "knowledge-map",
    "src": "/apto/tools/photography/example-technology-explorer-01.jpg",
    "label": "Technology landscape",
    "alt": "Map of related research areas with an emerging cluster highlighted"
  },
  "galleryImages": [
    {
      "src": "/apto/tools/photography/example-technology-explorer-02.jpg",
      "alt": "Layered research landscape connecting established fields with an emerging cluster"
    },
    {
      "src": "/apto/tools/photography/example-technology-explorer-03.jpg",
      "alt": "Detailed view of the highlighted cluster and its strongest neighboring connections"
    },
    {
      "src": "/apto/tools/photography/example-technology-explorer-04.jpg",
      "alt": "Alternative scenario showing how the highlighted cluster may develop over time"
    }
  ],
  "resources": [
    {
      "name": "Example dataset",
      "description": "A supporting dataset being prepared for release.",
      "status": "coming-soon",
      "url": null,
      "image": {
        "src": "/apto/tools/resources/example-dataset.png",
        "alt": "Preview of the example dataset structure"
      }
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
| `displayOrder` | Optional positive integer that orders one organization’s tools; tools without it remain alphabetical |
| `categories` | One or more unique values: `Capability`, `Production`, `Use` |
| `figure.kind` | Selects a semantic figure class; see allowed values below |
| `figure.src` | `/apto/…` path matching an image under `content/apto/assets/` |
| `figure.label` | Short visible caption |
| `figure.alt` | Meaningful description of the visual information |
| `galleryImages` | Exactly three `{ "src", "alt" }` entries; the standard tool figure provides the fourth cycling frame |
| `galleryImages[].src` | `/apto/tools/photography/…` path matching an image under `content/apto/assets/tools/photography/` |
| `galleryImages[].alt` | Meaningful alternative text for that image; entries must not repeat one another |
| `resources` | One or more small supporting outputs displayed beneath the tool description |
| `resources[].status` | `available` or `coming-soon`; coming-soon entries must not have a URL |
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
- Both public designs fill their media frames with `object-fit: cover`. Keep the
  focal area near the center and expect responsive cropping on every side.

## Tool gallery images

`galleryImages` supplies the large, edge-to-edge imagery used by both APTO Atlas
and APTO Continuum tool cards. Every tool must have exactly three entries. The
standard `figure` supplies the fourth frame, and both designs cycle smoothly
through all four images with independent Ken Burns timing.

- Store these files in `content/apto/assets/tools/photography/` and reference
  them as `/apto/tools/photography/filename.ext`.
- Prefer a landscape image around 1536 × 1024 pixels. Atlas crops with
  `object-fit: cover`, so keep the focal subject near the center and leave safe
  space around important details.
- Avoid embedded interface labels, unsupported data claims, and essential text.
  The card supplies its title and description as accessible HTML.
- Give every image specific alt text that explains its subject or information.
- Give every supporting piece within a tool a distinct image. A piece may use
  the tool's approved photography when a dedicated screenshot is not yet
  available, but sibling pieces must not repeat the same image.
  Do not describe a purely decorative style, and do not copy the tool name.
- Within one tool, keep all four frames distinct. Imagery may be shared across
  provisional tools when an approved team-specific set is not yet available.
- To replace provisional artwork, add the approved file, update the matching
  `src` and `alt` in the tool Markdown, remove the now-unused file, and run
  `npm run verify`.
- Large JPEG, PNG, or WebP files should be optimized before commit. Confirm
  publication rights and review the crop in both light and dark themes.

See [Images and figures](../assets/README.md) for paths, accessibility, rights,
and optimization guidance.
