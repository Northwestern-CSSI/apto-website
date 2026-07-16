export type Tool = {
  name: string;
  eyebrow: string;
  description: string;
  status: string;
  tone: string;
};

export const tools: Tool[] = [
  {
    name: "Map of Science",
    eyebrow: "Explore",
    description:
      "Move through fields, research clusters, teams, institutions, and emerging connections.",
    status: "Interactive map",
    tone: "cyan",
  },
  {
    name: "Technology Forecaster",
    eyebrow: "Forecast",
    description:
      "Compare capability trajectories, model assumptions, and uncertainty across technology domains.",
    status: "Model preview",
    tone: "violet",
  },
  {
    name: "Funding the Frontier",
    eyebrow: "Trace",
    description:
      "Follow public research investment into papers, patents, technologies, and downstream public use.",
    status: "Data story",
    tone: "coral",
  },
  {
    name: "SciSciNet",
    eyebrow: "Open data",
    description:
      "An open data lake linking scientific publications to funding and millions of downstream connections.",
    status: "Open resource",
    tone: "mint",
  },
  {
    name: "Trajectory Lab",
    eyebrow: "Compare",
    description:
      "Inspect frontiers and subtrajectories across solar cells, quantum, AI, computing, and more.",
    status: "Explorer concept",
    tone: "gold",
  },
  {
    name: "SciSciGPT",
    eyebrow: "Analyze",
    description:
      "A multi-agent research system for retrieval, analysis, statistical workflows, and synthesis.",
    status: "Research system",
    tone: "blue",
  },
];

export const technologies = [
  "Perovskite solar cells",
  "Superconducting qubits",
  "Artificial intelligence",
  "Advanced manufacturing",
  "Synthetic biology",
  "Structural biology",
  "Superconducting materials",
  "Graphics processors",
  "Large language models",
  "Computational biomedicine",
];

export type TechnologyTrend = {
  name: string;
  shortName: string;
  domain: string;
  direction: "Accelerating" | "Rising" | "Steady" | "Variable";
  momentum: number;
  maturity: number;
  confidence: number;
  horizon: string;
  signal: string;
  spark: number[];
  color: string;
};

/** Shared fictional portfolio used only to compare the design directions. */
export const technologyTrends: TechnologyTrend[] = [
  { name: "Artificial intelligence", shortName: "AI systems", domain: "Computation", direction: "Accelerating", momentum: 92, maturity: 78, confidence: 84, horizon: "Now—3 yrs", signal: "Capability gains remain broad, with uneven translation across domains.", spark: [28, 34, 41, 48, 59, 71, 83, 92], color: "#6f5cff" },
  { name: "Superconducting qubits", shortName: "Quantum", domain: "Quantum systems", direction: "Rising", momentum: 73, maturity: 46, confidence: 68, horizon: "3—7 yrs", signal: "Multiple technical pathways are advancing while uncertainty stays material.", spark: [24, 30, 29, 38, 45, 53, 64, 73], color: "#27c5ff" },
  { name: "Perovskite solar cells", shortName: "Clean energy", domain: "Energy", direction: "Rising", momentum: 81, maturity: 64, confidence: 76, horizon: "2—5 yrs", signal: "Performance signals are strong; durability and manufacturing shape the outlook.", spark: [31, 39, 47, 55, 61, 69, 75, 81], color: "#d8ff3e" },
  { name: "Advanced manufacturing", shortName: "Manufacturing", domain: "Production", direction: "Steady", momentum: 66, maturity: 72, confidence: 79, horizon: "Now—5 yrs", signal: "Progress is distributed across processes, materials, and deployment contexts.", spark: [42, 46, 49, 52, 56, 59, 63, 66], color: "#ff8a4c" },
  { name: "Synthetic biology", shortName: "SynBio", domain: "Biotechnology", direction: "Accelerating", momentum: 87, maturity: 58, confidence: 71, horizon: "3—8 yrs", signal: "Tooling and design cycles are improving faster than adoption pathways converge.", spark: [25, 31, 36, 43, 52, 63, 76, 87], color: "#4be0ac" },
  { name: "Structural biology", shortName: "Structural bio", domain: "Life science", direction: "Rising", momentum: 77, maturity: 70, confidence: 82, horizon: "Now—4 yrs", signal: "Measurement and computation are creating a denser capability landscape.", spark: [38, 43, 48, 56, 61, 68, 73, 77], color: "#f072c8" },
  { name: "Superconducting materials", shortName: "New materials", domain: "Materials", direction: "Variable", momentum: 59, maturity: 41, confidence: 57, horizon: "5—10 yrs", signal: "Promising signals remain fragmented across material families and conditions.", spark: [35, 41, 38, 46, 44, 52, 55, 59], color: "#ffd05a" },
  { name: "Graphics processors", shortName: "Accelerators", domain: "Computing hardware", direction: "Accelerating", momentum: 89, maturity: 83, confidence: 86, horizon: "Now—3 yrs", signal: "Scaling and specialization continue to reshape adjacent technology trajectories.", spark: [44, 49, 57, 63, 70, 78, 84, 89], color: "#ff5d64" },
];

export const institutions = [
  "Northwestern University",
  "Columbia University",
  "University of Washington",
  "Vanderbilt University",
  "Washington University in St. Louis",
  "University of California, Los Angeles",
  "University of Michigan",
  "University of Chicago",
];

export const seniorTeam = [
  "Dashun Wang",
  "Benjamin Jones",
  "Alicia Loffler",
  "Yian Yin",
  "Jian Cao",
  "Mark Hersam",
  "Julius Lucks",
  "Danielle Tullman-Ercek",
  "Jennifer Dunn",
  "Yifan Qian",
  "Alexander Furnas",
];

export const stats = [
  { value: "20", label: "partner universities", note: "across 16 states" },
  { value: "86K", label: "invention disclosures", note: "longitudinal records" },
  { value: "27K", label: "licensing agreements", note: "research-to-market signals" },
  { value: "~3K", label: "academic spin-offs", note: "venture outcomes" },
];

export const datasets = [
  {
    name: "Perovskite solar cells",
    metric: "Power conversion efficiency",
    coverage: "~110K records · 18K+ articles",
    span: "2009—2025",
  },
  {
    name: "Superconducting qubits",
    metric: "Coherence times T₁ and T₂",
    coverage: "~57K records · 5,448 articles",
    span: "1981—2025",
  },
  {
    name: "AI benchmarks",
    metric: "Task-normalized performance",
    coverage: "385 tasks · 10,439 submissions",
    span: "Multiple eras",
  },
  {
    name: "Superconducting materials",
    metric: "Critical temperature",
    coverage: "38,576 records · 33 families",
    span: "Historical",
  },
  {
    name: "Structural biology",
    metric: "R-free model quality",
    coverage: "143,343 structures",
    span: "Protein Data Bank",
  },
  {
    name: "Data science competitions",
    metric: "Challenge-specific accuracy",
    coverage: "5.7M+ Kaggle submissions",
    span: "2010—present",
  },
];

export const publications = [
  {
    title: "SciSciGPT: advancing human–AI collaboration in the science of science",
    type: "Nature Computational Science",
    year: "2025",
    detail: "A multi-agent research collaborator for literature, data, analytics, and scientific workflows.",
  },
  {
    title: "Funding the Frontier: Visualizing the Broad Impact of Science and Science Funding",
    type: "Preprint and platform",
    year: "2025",
    detail: "A visual analytics system connecting research funding to papers, patents, policy, trials, and public use.",
  },
  {
    title: "Scientific Production in the Era of Large Language Models",
    type: "Science",
    year: "2025",
    detail: "Evidence on how large language models are reshaping the direction and production of science.",
  },
];

export const thrusts = [
  ["01", "Build TechBridge", "Aggregate diverse R&D data across a national institutional network."],
  ["02", "Link the journey", "Connect upstream research and investment to transition labels and outcomes."],
  ["03", "Measure outcomes", "Create domain-specific measures of capability, production, and use."],
  ["04", "Predict trajectories", "Develop and benchmark mechanistic, empirical, and transformer models."],
  ["05", "Accelerate progress", "Turn predictions into decision tools and causal tests."],
];

export const concepts = [
  { id: "civic", number: "01", name: "Civic Observatory", mood: "Public-service clarity", color: "#21558d" },
  { id: "mission", number: "02", name: "Mission Control", mood: "Technical confidence", color: "#b8ff38" },
  { id: "map", number: "03", name: "Living Science Map", mood: "Exploration first", color: "#ff6f42" },
  { id: "atlas", number: "04", name: "Blue Atlas", mood: "Spatial and cinematic", color: "#00e05d" },
  { id: "forecast", number: "05", name: "Spectral Forecast", mood: "Models and scenarios", color: "#b39cff" },
  { id: "archive", number: "06", name: "Living Archive", mood: "Connected knowledge", color: "#e8492a" },
  { id: "beautiful", number: "07", name: "Beautiful Technology", mood: "Science as wonder", color: "#ffc84a" },
  { id: "editorial", number: "08", name: "Editorial Lab", mood: "Results as stories", color: "#d6253d" },
  { id: "commons", number: "09", name: "Open Science Commons", mood: "Network and access", color: "#1e8e68" },
  { id: "story", number: "10", name: "Signal Story", mood: "Approachable impact", color: "#5a4df4" },
  { id: "timefold", number: "11", name: "Timefold", mood: "Scrub through progress", color: "#ff5b4d" },
  { id: "lens", number: "12", name: "Signal Lens", mood: "Reveal hidden layers", color: "#c7ff2f" },
  { id: "builder", number: "13", name: "Constellation Builder", mood: "Construct the pathway", color: "#16d9ff" },
  { id: "weather", number: "14", name: "Forecast Weather", mood: "Feel the uncertainty", color: "#87b7ff" },
  { id: "whatif", number: "15", name: "The What-if Machine", mood: "Run policy scenarios", color: "#ffcf32" },
  { id: "xray", number: "16", name: "Evidence X-Ray", mood: "Expose the provenance", color: "#00d8ff" },
  { id: "terrain", number: "17", name: "Frontier Terrain", mood: "Navigate capability peaks", color: "#a7ff63" },
  { id: "symphony", number: "18", name: "Signal Symphony", mood: "Hear the pattern", color: "#ff4fd8" },
  { id: "passport", number: "19", name: "Research Passport", mood: "A personal field trip", color: "#3558d8" },
  { id: "loom", number: "20", name: "Data Loom", mood: "Weave the evidence", color: "#f4b83f" },
  { id: "gravity", number: "21", name: "Gravity Field", mood: "Bend the system", color: "#79ffc2" },
  { id: "deepzoom", number: "22", name: "Deep Zoom", mood: "Dive into evidence", color: "#ff5c42" },
  { id: "prism", number: "23", name: "Prism Engine", mood: "Refract the outcomes", color: "#9a7cff" },
  { id: "orbit", number: "24", name: "Orbital Index", mood: "Navigate in space", color: "#ff7a32" },
  { id: "circuit", number: "25", name: "Scroll Circuit", mood: "Power the pathway", color: "#baff45" },
  { id: "magnet", number: "26", name: "Magnetic Mosaic", mood: "Attract connections", color: "#2847d8" },
  { id: "vortex", number: "27", name: "Data Vortex", mood: "Fly through signals", color: "#ff6a35" },
  { id: "morph", number: "28", name: "Morphic Frontier", mood: "Reshape development", color: "#ff4f2f" },
  { id: "infinite", number: "29", name: "Infinite Observatory", mood: "Enter the institution", color: "#4f73ff" },
  { id: "liquid", number: "30", name: "Liquid Evidence", mood: "Stir the evidence", color: "#9eff38" },
  { id: "pulseboard", number: "31", name: "APTO Trendroom", mood: "See movement at a glance", color: "#caff43" },
  { id: "signalgrid", number: "32", name: "Signal Bento", mood: "A calm portfolio overview", color: "#ef5b3f" },
  { id: "horizon", number: "33", name: "Portfolio Radar", mood: "Compare future horizons", color: "#6b67ff" },
  { id: "leaderboard", number: "34", name: "Horizon Exchange", mood: "Read the market of ideas", color: "#ffbd3e" },
  { id: "weatherboard", number: "35", name: "Technology Weatherboard", mood: "Feel the changing outlook", color: "#75b9ff" },
  { id: "constellation", number: "36", name: "Constellation Ledger", mood: "Connect the portfolio", color: "#44e5c0" },
  { id: "newsroom", number: "37", name: "The APTO Brief", mood: "Trends as a front page", color: "#d92d3f" },
  { id: "matrix", number: "38", name: "Portfolio Pulse", mood: "Compare every signal", color: "#ff6a55" },
  { id: "exchange", number: "39", name: "Trajectory Exchange", mood: "Pin and compare pathways", color: "#3670ff" },
  { id: "watchtower", number: "40", name: "The Outlook Wall", mood: "The whole portfolio first", color: "#ff642f" },
  { id: "widgetdock", number: "41", name: "Widget Harbor", mood: "Dock tools beside the welcome", color: "#ff654b" },
  { id: "widgetcanvas", number: "42", name: "Widget Canvas", mood: "Compose your own observatory", color: "#7063ff" },
  { id: "widgetrail", number: "43", name: "Signal Cockpit", mood: "Switch instruments instantly", color: "#caff45" },
  { id: "widgetos", number: "44", name: "Observatory OS", mood: "Run APTO as a system", color: "#35d6aa" },
  { id: "widgetbrief", number: "45", name: "Technology Field Guide", mood: "Notebook tabs for every tool", color: "#e44f38" },
  { id: "widgetglass", number: "46", name: "Translation Lens", mood: "Focus on market pathways", color: "#a88cff" },
  { id: "widgetnotebook", number: "47", name: "Forecast Studio", mood: "Model the frontier", color: "#ffbd52" },
  { id: "widgetspatial", number: "48", name: "Opportunity Orbit", mood: "Arrange tools in space", color: "#44e9dc" },
  { id: "widgetcivic", number: "49", name: "Open Evidence Commons", mood: "Public tools within reach", color: "#2468d8" },
  { id: "widgethome", number: "50", name: "My APTO Workbench", mood: "A personal widget homepage", color: "#ff5f38" },
];
