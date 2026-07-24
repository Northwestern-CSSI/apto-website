import { aptoTools } from "../content";

export type StoryResource = {
  label: string;
  href: string;
};

export type StoryPiece = {
  title: string;
  summary: string;
  role: string;
  resource?: StoryResource;
};

export type ToolStory = (typeof aptoTools)[number] & {
  number: string;
  storyLine: string;
  synthesis: string;
  phaseLabels: [string, string, string];
  pieces: StoryPiece[];
};

const requestedOrder = [
  "aggregating-research-pipeline-at-scale",
  "agentic-framework-for-technology-outcome-mining",
  "multiobjective-technology-outcomes",
  "predicting-technological-evolution",
  "emerging-technology-detection",
] as const;

const storyContent: Record<
  (typeof requestedOrder)[number],
  Pick<ToolStory, "storyLine" | "synthesis" | "phaseLabels" | "pieces">
> = {
  "aggregating-research-pipeline-at-scale": {
    storyLine:
      "Build the shared evidence foundation, connect research to downstream outcomes, then make the pipeline usable for discovery and decisions.",
    synthesis:
      "Together, these systems turn fragmented institutional and public records into one traceable research-to-outcome pipeline.",
    phaseLabels: ["Gather evidence", "Make it usable", "Turn it into decisions"],
    pieces: [
      {
        title: "SciSciNet v2",
        role: "Open data foundation",
        summary:
          "A linked research data lake spanning publications, funding, patents, citations, authors, and institutions.",
        resource: {
          label: "Explore the dataset",
          href: "https://northwestern-cssi.github.io/sciscinet/",
        },
      },
      {
        title: "TechBridge",
        role: "Institutional bridge",
        summary:
          "Governed university records connect research activity to disclosures, licensing, startups, and market outcomes.",
        resource: {
          label: "View the NSF award",
          href: "https://www.nsf.gov/awardsearch/showAward?AWD_ID=2404035",
        },
      },
      {
        title: "Manufacturing knowledge dataset",
        role: "Domain evidence",
        summary:
          "Full-text literature and technical signals across five manufacturing domains add domain-level outcome detail.",
      },
      {
        title: "SciSciGPT",
        role: "Agent interface",
        summary:
          "A natural-language research collaborator lowers the barrier to querying, analyzing, and visualizing complex science data.",
        resource: {
          label: "Open SciSciGPT",
          href: "https://sciscigpt.com/",
        },
      },
      {
        title: "Funding the Frontier",
        role: "Impact lens",
        summary:
          "A visual analysis system links research grants to scholarly, patent, policy, clinical, and public outcomes.",
        resource: {
          label: "Open the platform",
          href: "https://fundingthefrontier.com/",
        },
      },
      {
        title: "InnovationInsights",
        role: "Decision layer",
        summary:
          "People-finder and idea-finder views surface promising research and unrealized translation potential.",
        resource: {
          label: "Visit InnovationInsights",
          href: "https://www.innovationinsights.org/",
        },
      },
    ],
  },
  "agentic-framework-for-technology-outcome-mining": {
    storyLine:
      "Coordinate specialist agents to find sources, extract technical evidence, check uncertain claims, and produce expert-reviewable outcome records.",
    synthesis:
      "The framework combines reusable agent roles with domain validation, so every structured outcome remains connected to its source and review path.",
    phaseLabels: ["Orchestrate", "Run research missions", "Verify"],
    pieces: [
      {
        title: "SciSciGPT agent team",
        role: "Coordinate",
        summary:
          "A research manager orchestrates literature, database, analytics, and evaluation specialists.",
        resource: {
          label: "Read the system paper",
          href: "https://doi.org/10.1038/s43588-025-00906-6",
        },
      },
      {
        title: "Scientific replication",
        role: "Reproduce",
        summary:
          "A multimodal workflow interprets published figures, reconstructs analytical steps, and makes the replication path inspectable.",
      },
      {
        title: "Manufacturing manuscript mining",
        role: "Extract",
        summary:
          "Language models search full text and structure technical concepts, relationships, and outcome signals across manufacturing domains.",
      },
      {
        title: "Perovskite trajectory pipeline",
        role: "Validate",
        summary:
          "Technical components and competing solar-cell efficiency pathways provide a real domain test.",
        resource: {
          label: "Explore source data",
          href: "https://www.perovskitedatabase.com/",
        },
      },
      {
        title: "Quantum outcome pipeline",
        role: "Extend",
        summary:
          "Superconducting-qubit evidence connects coherence time, gate fidelity, researchers, and funding sources.",
      },
      {
        title: "Expert review + controls",
        role: "Verify",
        summary:
          "Domain screening, hallucination checks, and human validation turn extracted claims into auditable trajectory data.",
      },
    ],
  },
  "multiobjective-technology-outcomes": {
    storyLine:
      "Measure several outcomes together so improvement, tradeoffs, lags, and complementarities stay visible instead of collapsing into one score.",
    synthesis:
      "The tool treats technology progress as a portfolio of coupled objectives—technical, productive, and practical—rather than a single curve.",
    phaseLabels: ["Define outcomes", "Compare contexts", "Model tradeoffs"],
    pieces: [
      {
        title: "Capability",
        role: "What becomes possible",
        summary:
          "Track performance characteristics such as speed, efficiency, fidelity, stability, and technical quality.",
      },
      {
        title: "Production",
        role: "What gets made",
        summary:
          "Connect technical progress to patents, commercialization, manufacturing volume, and market formation.",
      },
      {
        title: "Use",
        role: "What gets adopted",
        summary:
          "Observe diffusion through downloads, implementations, policy, clinical practice, and other real-world channels.",
      },
      {
        title: "CPU + GPU evolution",
        role: "Comparative study",
        summary:
          "Use processor datasets to examine how several interdependent performance measures advance together.",
      },
      {
        title: "Cross-domain capability studies",
        role: "Generalize",
        summary:
          "Compare trajectories in superconductors, structural biology, Formula 1, perovskites, and other domains.",
      },
      {
        title: "Coupled outcome models",
        role: "Reveal tradeoffs",
        summary:
          "Interpretable models expose where objectives reinforce one another, diverge, or improve on different clocks.",
      },
    ],
  },
  "predicting-technological-evolution": {
    storyLine:
      "Move from observed trajectories to mechanism-aware forecasts that compare alternative pathways and make uncertainty explicit.",
    synthesis:
      "A layered forecasting stack connects early activity, performance change, adoption, and market outcomes without treating evolution as one trend line.",
    phaseLabels: ["Read trajectories", "Forecast change", "Apply foresight"],
    pieces: [
      {
        title: "Domain time series",
        role: "Observe",
        summary:
          "Assemble long-run capability and use trajectories across research, software, materials, and applied systems.",
      },
      {
        title: "Frontier decomposition",
        role: "Explain",
        summary:
          "Separate aggregate improvement curves into competing sub-trajectories, discontinuities, and technological trees.",
      },
      {
        title: "Performance prediction",
        role: "Forecast",
        summary:
          "Predict quantitative technology capabilities from paper and patent evidence with temporal holdouts.",
        resource: {
          label: "See the method lineage",
          href: "https://doi.org/10.1016/j.techfore.2020.120100",
        },
      },
      {
        title: "Lead–lag forecasting",
        role: "Anticipate",
        summary:
          "Use early attention or activity signals to forecast later citations, adoption, or other lagging outcomes.",
        resource: {
          label: "Explore the benchmarks",
          href: "https://lead-lag-forecasting.github.io/",
        },
      },
      {
        title: "Adoption models",
        role: "Compare",
        summary:
          "Benchmark mechanistic diffusion models against statistical baselines across domains and time horizons.",
      },
      {
        title: "Funding the Frontier",
        role: "Apply",
        summary:
          "Translate linked funding and outcome evidence into future-facing portfolio and impact questions.",
        resource: {
          label: "Read the working paper",
          href: "https://arxiv.org/abs/2509.16323",
        },
      },
    ],
  },
  "emerging-technology-detection": {
    storyLine:
      "Find weak but persistent technical signals early, test whether they grow, and keep the evidence trail visible for deeper assessment.",
    synthesis:
      "The detector combines fine-grained concept discovery with temporal validation, distinguishing sustained emergence from isolated activity.",
    phaseLabels: ["Reveal signals", "Trace the landscape", "Validate and prioritize"],
    pieces: [
      {
        title: "Sparse autoencoder concepts",
        role: "Decompose",
        summary:
          "Use sparse autoencoders to break a scientific corpus into fine-grained, interpretable concept signals.",
      },
      {
        title: "Weak-signal surfacing",
        role: "Detect",
        summary:
          "Identify small but coherent concept clusters before they become obvious in aggregate topic counts.",
      },
      {
        title: "Semantic emergence traces",
        role: "Follow",
        summary:
          "Track when technical terms and concept pairings first appear, combine, and persist over time.",
        resource: {
          label: "See the extraction method",
          href: "https://doi.org/10.5281/zenodo.4461265",
        },
      },
      {
        title: "Problem–solution landscape",
        role: "Orient",
        summary:
          "Map early evidence, technical problems, candidate solutions, and the gaps between active clusters.",
      },
      {
        title: "Growth validation",
        role: "Test",
        summary:
          "Evaluate early signals against later publication volume, citations, and recognized technology reports.",
      },
      {
        title: "Decision signal",
        role: "Prioritize",
        summary:
          "Turn validated emergence evidence into a shortlist for policy, funding, and deeper technical review.",
      },
    ],
  },
};

export const northwesternToolStories: ToolStory[] = requestedOrder.map(
  (id, index) => {
    const tool = aptoTools.find((candidate) => candidate.id === id);
    if (!tool) throw new Error(`Missing Northwestern tool content: ${id}`);
    return {
      ...tool,
      ...storyContent[id],
      number: String(index + 1).padStart(2, "0"),
    };
  },
);
