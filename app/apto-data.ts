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
];
