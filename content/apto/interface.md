---
{
  "kind": "interface",
  "directions": [
    { "id": "nsfhome", "label": "Light", "note": "Curved NSF light theme" },
    { "id": "nsfnetwork", "label": "Dark", "note": "Deep navy NSF theme" }
  ],
  "study": {
    "siteTitle": "APTO",
    "siteDescription": "Research, people, projects, and tools from the Assessing and Predicting Technology Outcomes program.",
    "socialImageSrc": "/apto/og-apto.png",
    "socialImageAlt": "APTO — evidence for better technology decisions.",
    "galleryLabel": "APTO home",
    "barLabel": "APTO",
    "themeChooserLabel": "Choose color theme",
    "formatChooserLabel": "Choose homepage format",
    "formatLabel": "Homepage",
    "standardLabel": "Standard",
    "widgetLabel": "Tool widget",
    "selectedFormatLabel": "selected"
  },
  "primaryNavigation": [
    { "label": "Program", "section": "about" },
    { "label": "Projects", "section": "projects" },
    { "label": "Tools", "section": "tools" },
    { "label": "Cohort & People", "section": "cohort" }
  ],
  "home": {
    "primaryActionLabel": "Explore the projects",
    "secondaryActionLabel": "How the program works",
    "outcomeVisualNote": "Connecting evidence about what technologies can do, how they are produced, and how they are used.",
    "cohortEyebrow": "Participating organizations",
    "cohortTitle": "Five teams working toward a shared evidence base",
    "cohortLinkLabel": "Meet the cohort and people",
    "logoDisclosure": "Organization marks identify participating institutions and companies.",
    "networkCoreLabel": "shared evidence",
    "networkVisualAlt": "Research organizations connected through a shared evidence network",
    "networkVisualCaption": "Independent research teams connected by a shared question about technology outcomes.",
    "ledgerVisualEyebrow": "APTO research portfolio",
    "ledgerVisualTitle": "Evidence for better technology decisions",
    "pathways": [
      { "section": "about", "title": "Program", "description": "The shared outcome framework, research scope, and program approach." },
      { "section": "cohort", "title": "Cohort & People", "description": "Participating organizations, program leadership, and the investigators leading each project." },
      { "section": "projects", "title": "Projects", "description": "The active APTO awards and the questions each team is pursuing." },
      { "section": "tools", "title": "Tools", "description": "Exploration, forecasting, evidence, and scenario interfaces emerging from APTO research." }
    ]
  },
  "widget": {
    "eyebrow": "APTO tools",
    "title": "Explore technology evidence",
    "allToolsLabel": "Browse all tools",
    "disclaimer": "Demonstration values illustrate how each exploration view can work.",
    "exploreLabel": "Browse all tools",
    "previewAriaLabel": "Interactive APTO tool preview",
    "chooserAriaLabel": "Choose a tool preview",
    "momentumScaleLabel": "Momentum index · 0–100",
    "momentumListAriaLabel": "Emerging technology momentum index, from zero to one hundred, listed alphabetically",
    "mapCaptionPrefix": "Map of science showing connected",
    "mapCaptionSuffix": "research clusters",
    "compositeAriaPrefix": "Composite translation index of",
    "compositeAriaJoiner": "out of",
    "demoIndexLabel": "Exploration index",
    "trajectoryScaleLabel": "Comparative trend shapes",
    "trajectoryAriaSuffix": "rising technology trajectory",
    "items": [
      {
        "id": "emerging",
        "icon": "trend-up",
        "tabLabel": "Emerging",
        "kicker": "Emerging areas",
        "title": "Signals across candidate frontiers",
        "summary": "Compare momentum signals across several technology areas.",
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
        "icon": "network-map",
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
        "icon": "shield-check",
        "tabLabel": "Patent",
        "kicker": "Patent & licensing",
        "title": "Translation signals in one view",
        "summary": "Review patentability and licensability indicators without making a legal determination.",
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
        "icon": "trajectory",
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
  "common": {
    "organizationWebsiteLabel": "Organization website",
    "participantWebsiteLabel": "Visit organization website"
  },
  "accessibility": {
    "skipLinkLabel": "Skip to main content",
    "primaryNavigationLabel": "Primary navigation",
    "footerNavigationLabel": "Footer navigation",
    "homePathwaysLabel": "Explore APTO",
    "projectInvestigatorsLabel": "Project investigators",
    "projectMapLabel": "Map of participating organizations",
    "toolFiltersLabel": "Filter tools"
  },
  "projects": {
    "ledgerTitle": "APTO projects",
    "awardLabel": "NSF award",
    "awardedPrefix": "Awarded in",
    "dateStatusSeparator": "–",
    "expandLabel": "View project details",
    "collapseLabel": "Hide project details",
    "map": {
      "eyebrow": "Project locations",
      "title": "Where the cohort works",
      "description": "APTO teams span universities and companies across the United States.",
      "caption": "Select a location to move to that organization’s project.",
      "imageUrl": "/apto/us-map.svg",
      "imageAlt": "",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Blank_US_Map_%28states_only%29.svg",
      "sourceLabel": "CC0 map base from Wikimedia Commons"
    }
  },
  "tools": {
    "registerTitle": "Explore APTO tools",
    "allOrganizationsLabel": "All organizations",
    "allCategoriesLabel": "All outcome areas",
    "organizationFilterLabel": "Institution",
    "organizationFilterAriaLabel": "Filter tools by institution",
    "categoryFilterLabel": "Outcome area",
    "categoryFilterAriaLabel": "Filter tools by outcome area",
    "showingPrefix": "Showing",
    "toolSingular": "tool",
    "toolPlural": "tools",
    "useCaseLabel": "Useful for",
    "categoriesLabel": "Outcome areas",
    "emptyTitle": "No matching tools",
    "emptyDescription": "Try another institution or outcome area.",
    "watchDemoLabel": "Watch demonstration",
    "openToolLabel": "Open tool",
    "statusLabel": "Status"
  },
  "people": {
    "programTeamEyebrow": "Program team",
    "programTeamTitle": "Program leadership",
    "projectProfileLabel": "Project profile",
    "portraitForthcomingLabel": "Portrait forthcoming",
    "viewProfileLabel": "View profile"
  },
  "cohort": {
    "prominentTitle": "The organizations and people behind APTO",
    "markStatusSuffix": "organization mark",
    "peopleTitle": "Project team",
    "projectLabel": "Research project"
  },
  "disclosures": {
    "cohort": "Organization marks are shown for identification and remain subject to each organization’s brand guidance."
  },
  "footer": {
    "supportTitle": "Supported by the U.S. National Science Foundation",
    "supportDescription": "APTO is a portfolio of NSF-supported research projects.",
    "disclaimerTitle": "NSF acknowledgement and disclaimer",
    "backToTopLabel": "Back to top",
    "homeLinkLabel": "Home",
    "programLinkLabel": "Program",
    "nsfWebsiteUrl": "https://www.nsf.gov/",
    "nsfLogoSrc": "/apto/nsf-logo.png",
    "nsfWebsiteAriaLabel": "Visit the U.S. National Science Foundation website",
    "nsfLogoAlt": "U.S. National Science Foundation logo"
  }
}
---

# APTO website interface content

## Editorial guidance

This file contains the editable labels, navigation, tool-widget copy, project-map configuration, accessibility text, and footer language shared by the light and dark APTO themes.
