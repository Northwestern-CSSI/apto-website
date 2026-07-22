# Adding or editing projects

Each Markdown file in this folder is one APTO project. Project entries are
presented alphabetically by their concise visible `shortName`.

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

- `participantId` must match an organization in `../participants/`.
- The lowercase kebab-case `id` must match the filename.
- `awardId` must contain exactly seven digits.
- `officialTitle` must begin with `APTO:` and exactly match the H1.
- `awardUrl` must use HTTPS and contain the award ID.
- `awardedYear` is a four-digit year; the visible date is generated as
  “Awarded in 2024 – Ongoing.”
- The body requires one nonempty, plain-text `## Summary` section.
- Investigator names are joined automatically from `../people/`; do not list
  them again in the project file.

Always verify award details against the NSF record before publishing.
