# Adding or editing people

Each Markdown file in this folder is one program manager, principal
investigator, or co-principal investigator. People are displayed alphabetically
within their group.

## Investigator template

```md
---
{
  "kind": "person",
  "id": "jane-doe",
  "participantId": "northwestern",
  "name": "Jane Doe",
  "initials": "JD",
  "role": "Co-Principal Investigator",
  "organization": null,
  "headshotUrl": "/apto/headshots/jane-doe.webp",
  "headshotAlt": "Portrait of Jane Doe",
  "profileUrl": "https://example.edu/jane-doe"
}
---

# Jane Doe
```

Use `null` for `headshotUrl` or `profileUrl` when the item is unavailable. A
missing headshot is replaced by the person’s initials.

## Program manager template

```md
---
{
  "kind": "person",
  "id": "program-manager-name",
  "participantId": null,
  "name": "Program Manager Name",
  "initials": "PM",
  "role": "Program Manager",
  "organization": "U.S. National Science Foundation",
  "headshotUrl": null,
  "headshotAlt": "Portrait of Program Manager Name",
  "profileUrl": null
}
---

# Program Manager Name
```

## Rules

- Allowed roles are `Program Manager`, `Principal Investigator`, and
  `Co-Principal Investigator`.
- Program managers use `participantId: null` and provide `organization`.
- Investigators use an existing `participantId` and `organization: null`.
- Every participating organization must have exactly one principal
  investigator. It may have any number of co-principal investigators.
- The H1 must exactly match `name`. Person records do not use H2 sections.
- `profileUrl` must be an HTTPS URL or `null`.
- Headshots must live under `content/apto/assets/` and use the matching
  `/apto/…` path; external headshot URLs are intentionally rejected.

For a headshot, use a consistent square crop around 800 × 800 pixels, keep the
face centered with comfortable margin, confirm permission to publish it, and
use alt text in the form “Portrait of Name.” See
[Images and figures](../assets/README.md).
