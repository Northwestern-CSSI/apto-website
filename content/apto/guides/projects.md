# Adding or editing projects

Each Markdown file in a team's `projects/` folder is one APTO project. The
content build keeps project entries in a stable order, while the public
presentations reorder them with their participating organizations on every page load.

## Complete template

```md
---
{
  "kind": "project",
  "id": "example-organization",
  "participantId": "example-organization",
  "awardId": "2400000",
  "shortName": "Concise public project name",
  "officialTitle": "APTO: Official NSF award title",
  "awardedYear": 2024,
  "statusLabel": "Ongoing",
  "awardUrl": "https://www.nsf.gov/awardsearch/showAward?AWD_ID=2400000"
}
---

# APTO: Official NSF award title

## Summary

Summarize the research question, approach, and expected contribution in plain
language. Keep the summary factual and grounded in the award information.
```

## Rules

- `participantId` must match the team folder and its `organization.md` ID.
- The lowercase kebab-case `id` must match the filename.
- `awardId` must contain exactly seven digits.
- `officialTitle` must begin with `APTO:` and exactly match the H1.
- `awardUrl` must use HTTPS and contain the award ID.
- `awardedYear` is a four-digit year; the visible date is generated as
  “Awarded in 2024 – Ongoing.”
- The body requires one nonempty, plain-text `## Summary` section.
- The site pulls investigator names from the same team's `people/` folder.

Always verify award details against the NSF record before publishing.
