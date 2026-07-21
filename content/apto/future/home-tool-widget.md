---
{
  "kind": "future-widget",
  "id": "home-tool-widget",
  "enabled": false,
  "component": "app/apto/_future/home-tool-widget.tsx",
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
      "kicker": "Patent and licensing",
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
}
---

# Dormant APTO homepage tool widget

## Re-enabling

This configuration and its component are intentionally excluded from the public APTO routes. To re-enable the widget, add this record to the Markdown content builder, pass the generated configuration to `FutureAptoHomeToolWidget`, and render it from the homepage hero behind an explicit feature flag. Keep `enabled` set to `false` until the program approves the return of a homepage widget.
