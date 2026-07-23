# Adding or editing organizations

Each Markdown file in this folder is one participating institution or company.
Organizations are displayed alphabetically without a ranking field.

## Complete template

```md
---
{
  "kind": "participant",
  "id": "example-organization",
  "displayName": "Example Organization",
  "organizationType": "University",
  "location": "City, State",
  "website": "https://example.edu/",
  "logo": {
    "kind": "wordmark",
    "variants": {
      "light": {
        "src": "/apto/partners/example-organization.svg",
        "width": 600,
        "height": 180
      },
      "dark": {
        "src": "/apto/partners/example-organization-dark.svg",
        "width": 600,
        "height": 180
      }
    },
    "sourceUrl": "https://example.edu/brand/",
    "sourceLabel": "Example Organization brand resource",
    "status": "approval-required",
    "approved": false
  },
  "accent": "#005699",
  "mapPosition": { "x": 50, "y": 50 }
}
---

# Example Organization
```

## Rules

- `organizationType` is `University` or `Company`.
- `website` and `logo.sourceUrl` must use HTTPS.
- `accent` is a six-digit hexadecimal color.
- `logo.kind` is `symbol` or `wordmark`.
- `logo.variants.light` contains artwork approved for a light surface and
  `logo.variants.dark` contains transparent, reversed, or otherwise approved
  artwork for a dark surface. The same transparent full-color asset may be
  referenced by both variants when it remains legible in both themes.
- Each variant’s `width` and `height` must be the image’s true intrinsic
  dimensions.
- `status` and `approved` record review state; they do not themselves grant
  permission to use a mark.
- The lowercase kebab-case `id` must match the filename.
- The H1 must exactly match `displayName`. Organization records do not use H2
  sections; the related project provides the research summary shown on the
  website.

## Map position

`mapPosition.x` and `mapPosition.y` are percentages from 0 to 100 on the
configured 959 × 593 Albers-projection U.S. map. They are not longitude and
latitude. Recalculate the percentages when replacing the map rather than
visually moving neighboring cities apart. Nearby locations are grouped into an
accessible cluster automatically.

## Adding a new organization

An organization is not valid by itself. Add, in the same change:

- at least one project in `../projects/`;
- at least one tool in `../tools/`;
- at least one person in `../people/`; and
- exactly one person with `role: "Principal Investigator"`.

See [Images and figures](../assets/README.md) for logo preparation and brand
approval guidance.
