# Editing page titles and introductions

These five records control page metadata, page titles, and introductory
paragraphs. The legacy `eyebrow` field remains in the schema for compatibility
but is not displayed:

| File | Visible use |
| --- | --- |
| `home.md` | Program homepage hero |
| `about.md` | Program-overview title and introduction |
| `projects.md` | Projects-page introduction |
| `tools.md` | Tools-page introduction |
| `convening.md` | Annual-convening introduction |

The builder requires exactly these five filenames. Do not add another page
record without also implementing a route.

## Record shape

```md
---
{
  "kind": "page",
  "slug": "/tools",
  "metadataTitle": "Tools",
  "eyebrow": "Research tools",
  "title": "Explore Our Tools"
}
---

# Explore Our Tools

## Introduction

Write a concise introduction that helps visitors understand what is on the
page and what they can do there.
```

The H1 must exactly match `title`, and each record must contain an
`## Introduction` section. The home record can also include an
`## Atlas Introduction` section for the Atlas homepage hero.

On the homepage, the hero uses `home.md`, while the program overview uses the
title from `about.md` and the longer description from `../program.md`.

The visible top-navigation labels and their required order come from
`../interface.md`. Shared button, filter, footer, and accessibility labels
also live there.
