---
{
  "kind": "interface",
  "directions": [
    { "id": "nsfhome", "label": "Program home", "note": "Light core" },
    { "id": "nsfhomewidgets", "label": "Program + widget", "note": "Light tools" },
    { "id": "nsfledger", "label": "Evidence ledger", "note": "Editorial core" },
    { "id": "nsfledgerwidgets", "label": "Ledger + widget", "note": "Editorial tools" },
    { "id": "nsfnetwork", "label": "Cohort network", "note": "Dark core" },
    { "id": "nsfnetworkwidgets", "label": "Network + widget", "note": "Dark tools" }
  ],
  "primaryNavigation": [
    { "label": "Program", "section": "about" },
    { "label": "Projects", "section": "projects" },
    { "label": "Tools", "section": "tools" },
    { "label": "People", "section": "people" },
    { "label": "Cohort", "section": "cohort" }
  ],
  "home": {
    "primaryActionLabel": "Explore the projects",
    "secondaryActionLabel": "How the program works",
    "outcomeVisualNote": "Connecting evidence about what technologies can do, how they are produced, and how they are used.",
    "cohortEyebrow": "Participating organizations",
    "cohortTitle": "Five distinct teams, presented with equal visual weight",
    "cohortLinkLabel": "Meet the full cohort",
    "logoDisclosure": "Organization marks are website-sourced mockup assets. Final artwork and permission should be confirmed with every participant before production release.",
    "pathways": [
      { "section": "about", "title": "Program", "description": "The shared outcome framework, research scope, and open-access commitments." },
      { "section": "cohort", "title": "Cohort", "description": "Participating organizations, legal awardees, projects, and official links." },
      { "section": "people", "title": "People", "description": "Principal investigators and co-principal investigators across the program." },
      { "section": "projects", "title": "Projects", "description": "The active APTO awards and the questions each team is pursuing." },
      { "section": "tools", "title": "Tools", "description": "Illustrative interfaces for future datasets, models, and exploration tools." }
    ]
  },
  "widget": {
    "eyebrow": "Interactive preview",
    "title": "Choose a tool widget",
    "allToolsLabel": "All tools",
    "disclaimer": "Illustrative interface · demo values are not APTO findings.",
    "exploreLabel": "Explore tool concepts",
    "items": [
      {
        "id": "emerging",
        "icon": "↗",
        "tabLabel": "Emerging",
        "kicker": "Emerging areas",
        "title": "Signals across candidate frontiers",
        "summary": "Compare illustrative momentum signals across several technology areas.",
        "preview": {
          "kind": "signals",
          "rows": [
            { "label": "AI-designed proteins", "category": "Biology", "value": 74 },
            { "label": "Perovskite tandems", "category": "Energy", "value": 86 },
            { "label": "Quantum computing", "category": "Computing", "value": 79 },
            { "label": "Solid-state batteries", "category": "Energy", "value": 67 }
          ]
        }
      },
      {
        "id": "map",
        "icon": "◎",
        "tabLabel": "Map",
        "kicker": "Map of science",
        "title": "Where knowledge is forming",
        "summary": "Explore a UMAP-like landscape of connected research areas and emerging clusters.",
        "preview": {
          "kind": "map",
          "clusters": ["AI", "Biology", "Energy", "Materials", "Quantum"],
          "focusLabel": "Emerging cluster",
          "focusTitle": "Perovskite interfaces"
        }
      },
      {
        "id": "patent",
        "icon": "◇",
        "tabLabel": "Patent",
        "kicker": "Patent & licensing",
        "title": "Translation signals in one view",
        "summary": "Preview possible patentability and licensability indicators without making a legal determination.",
        "preview": {
          "kind": "translation",
          "composite": 72,
          "maximum": 100,
          "rows": [
            { "label": "Licensing fit", "value": 72 },
            { "label": "Market adjacency", "value": 64 },
            { "label": "Patent signal", "value": 81 },
            { "label": "Translation readiness", "value": 69 }
          ]
        }
      },
      {
        "id": "trajectories",
        "icon": "⌁",
        "tabLabel": "Trends",
        "kicker": "Technology trajectories",
        "title": "Many curves, one comparative view",
        "summary": "Inspect small-multiple timelines for technologies developing across different domains.",
        "preview": {
          "kind": "trajectories",
          "rows": [
            { "label": "Advanced manufacturing", "category": "Physical", "tone": "gold" },
            { "label": "Perovskite photovoltaics", "category": "Energy", "tone": "blue" },
            { "label": "Quantum computing", "category": "Computing", "tone": "purple" }
          ],
          "observedLabel": "Observed",
          "forecastLabel": "Forecast"
        }
      }
    ]
  },
  "disclosures": {
    "cohort": "Marks shown here come from participant websites or official university brand resources. Their use is provisional and requires participant confirmation before a production launch.",
    "toolsLabel": "Mock content",
    "toolsNote": "Nothing in this section should be interpreted as a released tool, validated model, or APTO finding."
  },
  "footer": {
    "supportTitle": "Supported by the U.S. National Science Foundation",
    "supportDescription": "APTO is a portfolio of NSF-supported research projects.",
    "disclaimerTitle": "NSF acknowledgement and disclaimer",
    "backToTopLabel": "Back to top",
    "homeLinkLabel": "Home",
    "programLinkLabel": "Program"
  }
}
---

# APTO website interface content

## Editorial guidance

This file contains editable navigation, homepage, widget-preview, disclosure, and footer language shared by the six NSF-aligned website directions. Widget values are illustrative interface data and are not APTO findings.
