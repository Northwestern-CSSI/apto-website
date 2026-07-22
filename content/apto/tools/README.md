# Adding or editing tools

Each Markdown file in this folder is one tool. The website discovers new files
automatically; no source-code list or counter needs to be updated.

## Add a tool

1. Copy an existing tool file and rename it with lowercase kebab-case.
2. Set `id` to the same kebab-case value.
3. Set `participantId` to an ID from `../participants/`.
4. Add the tool figure under `../assets/`, preferably in `../assets/tools/`.
5. Complete the description and use case.
6. Run `npm run verify` from the repository root.

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
- The layout uses `object-fit: contain`, so the complete figure remains visible.

See [Images and figures](../assets/README.md) for paths, accessibility, rights,
and optimization guidance.
