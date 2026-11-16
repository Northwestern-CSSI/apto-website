# Adding or editing organizations

Each participating institution or company has an `organization.md` in its
[team folder](../teams/README.md).
The content build keeps a stable canonical order without a ranking field. In
the public presentations, the two featured universities form the first group
and the three supporting organizations form the second; each group is
shuffled independently by section on every page load.

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
  "accent": "#005699"
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
- The lowercase kebab-case `id` must match the team folder name.
- The H1 must exactly match `displayName`. Organization records do not use H2
  sections; the related project provides the research summary shown on the
  website.

## Adding a new organization

Copy the layout of an existing team into `teams/<team-id>/`. Include
`organization.md`, a README, and `impact.md` with the team's impact statements.
Add at least one project, one tool, and one investigator to their respective
subfolders. One investigator must have the role `Principal Investigator`.

Store logo variants in the team's `assets/partners/` and use
`/apto/partners/filename.ext` in the record. See the
[image guide](../assets/README.md) for logo preparation and brand approval.
