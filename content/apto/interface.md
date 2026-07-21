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
  "study": {
    "siteTitle": "APTO Website Direction Study",
    "siteDescription": "Fifty-six modern website directions for the Assessing and Predicting Technology Outcomes program.",
    "socialImageAlt": "APTO — See where technology is going.",
    "galleryLabel": "Design gallery",
    "barLabel": "APTO design directions",
    "themeChooserLabel": "Choose a visual direction",
    "formatChooserLabel": "Choose a homepage format",
    "formatLabel": "Homepage",
    "standardLabel": "Standard",
    "widgetLabel": "Widget",
    "selectedFormatLabel": "selected format"
  },
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
    "cohortTitle": "Five teams working toward a shared evidence base",
    "cohortLinkLabel": "Meet the full cohort",
    "logoDisclosure": "Participant marks are shown for identification; final artwork and use remain subject to confirmation.",
    "networkCoreLabel": "shared evidence",
    "networkVisualAlt": "Abstract illustration of research organizations connected through a shared evidence network",
    "networkVisualCaption": "Independent research teams connected by a shared question about technology outcomes.",
    "ledgerVisualEyebrow": "APTO evidence folio",
    "ledgerVisualTitle": "Three lenses on technology outcomes",
    "pathways": [
      { "section": "about", "title": "Program", "description": "The shared outcome framework, research scope, and program approach." },
      { "section": "cohort", "title": "Cohort", "description": "Participating organizations, legal awardees, projects, and official links." },
      { "section": "people", "title": "People", "description": "Principal investigators and co-principal investigators across the program." },
      { "section": "projects", "title": "Projects", "description": "The active APTO awards and the questions each team is pursuing." },
      { "section": "tools", "title": "Tools", "description": "Illustrative interfaces for future datasets, models, and exploration tools." }
    ]
  },
  "widget": {
    "eyebrow": "Illustrative APTO tools",
    "title": "Explore an evidence tool",
    "allToolsLabel": "Browse tools",
    "disclaimer": "Illustrative interface · demo values are not APTO findings.",
    "exploreLabel": "Browse all tools",
    "previewAriaLabel": "Interactive APTO tool widget preview",
    "chooserAriaLabel": "Choose a tool preview",
    "momentumScaleLabel": "Illustrative momentum index · 0–100",
    "momentumListAriaLabel": "Illustrative emerging technology momentum index, from zero to one hundred, listed alphabetically",
    "mapCaptionPrefix": "Illustrative map of science showing connected",
    "mapCaptionSuffix": "research clusters",
    "compositeAriaPrefix": "Illustrative composite translation index of",
    "compositeAriaJoiner": "out of",
    "demoIndexLabel": "Demo index",
    "trajectoryScaleLabel": "Illustrative trend shapes · not forecasts",
    "trajectoryAriaSuffix": "illustrative rising technology trajectory",
    "items": [
      {
        "id": "emerging",
        "icon": "trend-up",
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
    "officialAwardRecordLabel": "Official award record",
    "nsfAwardRecordLabel": "NSF award record",
    "awardApiRecordLabel": "Award API record",
    "participantWebsiteLabel": "Participant website"
  },
  "accessibility": {
    "skipLinkLabel": "Skip to main content",
    "primaryNavigationLabel": "Primary navigation",
    "footerNavigationLabel": "Footer navigation",
    "homePathwaysLabel": "Explore APTO",
    "projectInvestigatorsLabel": "Project investigators",
    "outcomeTypesLabel": "Outcome types",
    "linesOfEffortLabel": "Lines of effort"
  },
  "projects": {
    "ledgerTitle": "The project evidence ledger",
    "awardLabel": "NSF award",
    "personAwardLabel": "Award",
    "legalAwardeeLabel": "Legal awardee",
    "agreementLabel": "Agreement",
    "obligatedAmountLabel": "Current obligated amount",
    "estimatedTotalLabel": "NSF estimated total",
    "dataAsOfLabel": "NSF data as of"
  },
  "tools": {
    "registerTitle": "A proposed tool register",
    "allOrganizationsLabel": "All organizations",
    "filterAriaLabel": "Filter tool concepts by participant",
    "showingAllLabel": "Showing all concept tools · alphabetical by name",
    "showingParticipantPrefix": "Showing concept tools for",
    "conceptByLabel": "A concept by",
    "demoVideoLabel": "Demo video",
    "toolLinkLabel": "Tool link",
    "watchWithCaptionsLabel": "Watch with captions",
    "captionsForthcomingLabel": "Forthcoming — captions and transcript planned",
    "linkForthcomingLabel": "Forthcoming",
    "openToolLabel": "Open tool"
  },
  "people": {
    "programTeamTitle": "Program leadership",
    "projectProfileLabel": "Project profile",
    "portraitForthcomingLabel": "Portrait forthcoming",
    "viewProfileLabel": "View profile"
  },
  "cohort": {
    "prominentTitle": "The organizations behind the APTO cohort",
    "markStatusSuffix": "mark — mockup use pending participant approval"
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

This file contains editable navigation, homepage, widget-preview, disclosure, and footer language shared by the six NSF-aligned website directions. Widget values are illustrative interface data and are not APTO findings.
