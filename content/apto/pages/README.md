# Editing page titles and introductions

These six records control page metadata, page titles, and introductory
paragraphs. The legacy `eyebrow` field remains in the schema for compatibility
but is not displayed:

| File | Visible use |
| --- | --- |
| `home.md` | Program homepage hero |
| `about.md` | Program-overview title on the homepage; full introduction on the `/apto/about` compatibility route |
| `projects.md` | Projects-page introduction |
| `tools.md` | Tools-page introduction |
| `cohort.md` | Cohort-page introduction |
| `convening.md` | Annual-convening introduction |

The builder requires exactly these six filenames. Do not add another page
record without also implementing a route.

## Record shape

```md
---
{
  "kind": "page",
  "slug": "/tools",
  "metadataTitle": "Tools",
  "eyebrow": "Research tools",
  "title": "Tools for exploring technology outcomes"
}
---

# Tools for exploring technology outcomes

## Introduction

Write a concise introduction that helps visitors understand what is on the
page and what they can do there.
```

The H1 must exactly match `title`, and each record must contain exactly one
`## Introduction` section.

On the homepage, the compact hero uses `home.md`, while the program overview
uses the title from `about.md` and the longer description from
`../program.md`. The `about.md` introduction is shown only on the compatibility
`/apto/about` route.

The visible top-navigation labels and their required order come from
`../interface.md`. Shared button, filter, footer, and accessibility labels
also live there.
