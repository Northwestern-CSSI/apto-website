export type AptoParticipantId =
  | "northwestern"
  | "uchicago"
  | "macrocosm"
  | "insilicom"
  | "aperture";

export type AptoParticipantKind = "University" | "Company";

export type AptoPersonRole =
  | "Principal Investigator"
  | "Co-Principal Investigator";

export type AptoPerson = {
  name: string;
  initials: string;
  role: AptoPersonRole;
  /** Intentionally null while the website uses an accessible headshot mockup. */
  headshotUrl: string | null;
  headshotAlt: string;
  profileUrl: string | null;
};

export type AptoFigureKind =
  | "agent-network"
  | "causal-graph"
  | "evidence-stream"
  | "global-map"
  | "knowledge-map"
  | "problem-landscape"
  | "scenario-curves"
  | "signal-matrix"
  | "technology-timeline"
  | "translation-funnel";

export type AptoMockTool = {
  id: string;
  participantId: AptoParticipantId;
  /** Alias retained for straightforward UI joins. */
  organizationId: AptoParticipantId;
  name: string;
  description: string;
  figure: {
    kind: AptoFigureKind;
    label: string;
    alt: string;
  };
  /** Convenience label for compact card treatments. */
  figureLabel: string;
  status: "Concept only · not a released tool";
  isConceptOnly: true;
  demoVideoUrl: null;
  demoVideoLabel: "Demo video placeholder";
  toolUrl: null;
  toolLinkLabel: "Tool link coming soon";
  organizationUrl: string;
  awardUrl: string;
};

export type AptoParticipant = {
  id: AptoParticipantId;
  displayName: string;
  /** Short alias for UI variants that expect `name`. */
  name: string;
  legalName: string;
  kind: AptoParticipantKind;
  location: string;
  website: string;
  awardId: string;
  people: AptoPerson[];
  tools: AptoMockTool[];
  accent: string;
};

export type AptoOutcome = "Capability" | "Production" | "Use";

export type AptoLineOfEffortId = "models" | "data-tools";

export type AptoProjectFunding = {
  /** Funds obligated in the NSF Awards API snapshot. */
  obligatedAmount: number;
  /** Estimated total intended award amount in the NSF Awards API snapshot. */
  estimatedTotalAmount: number;
  currency: "USD";
  dataAsOf: "2026-07-20";
  dataAsOfLabel: "NSF Awards API snapshot · July 20, 2026";
  caveat?: string;
};

export type AptoProject = {
  id: string;
  awardId: string;
  shortName: string;
  officialTitle: string;
  participantId: AptoParticipantId;
  organization: string;
  legalAwardeeName: string;
  location: string;
  agreementType: "Cooperative Agreement";
  startDate: string;
  endDate: string;
  funding: AptoProjectFunding;
  people: AptoPerson[];
  pi: string;
  coPIs: string[];
  summary: string;
  outcomes: AptoOutcome[];
  linesOfEffort: AptoLineOfEffortId[];
  awardUrl: string;
  apiUrl: string;
};

export type AptoProgramStat = {
  value: string;
  label: string;
  detail: string;
};

export type AptoProgramLineOfEffort = {
  id: AptoLineOfEffortId;
  title: string;
  description: string;
};

export type AptoProgram = {
  eyebrow: string;
  name: string;
  acronym: "APTO";
  title: string;
  shortSummary: string;
  description: string;
  cohortDescription: string;
  lastVerified: "2026-07-20";
  stats: AptoProgramStat[];
  outcomes: Array<{
    name: AptoOutcome;
    description: string;
  }>;
  linesOfEffort: AptoProgramLineOfEffort[];
  technologyAreas: string[];
  openAccessNote: string;
};

export type AptoSourceKind =
  | "program"
  | "award-search"
  | "awards-api"
  | "award"
  | "brand"
  | "organization";

export type AptoSource = {
  id: string;
  label: string;
  url: string;
  detail: string;
  kind: AptoSourceKind;
};

const northwesternPeople: AptoPerson[] = [
  {
    name: "Dashun Wang",
    initials: "DW",
    role: "Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Dashun Wang",
    profileUrl: null,
  },
  {
    name: "Alicia I. Loffler",
    initials: "AL",
    role: "Co-Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Alicia I. Loffler",
    profileUrl: null,
  },
  {
    name: "Jian Cao",
    initials: "JC",
    role: "Co-Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Jian Cao",
    profileUrl: null,
  },
  {
    name: "Benjamin Jones",
    initials: "BJ",
    role: "Co-Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Benjamin Jones",
    profileUrl: null,
  },
  {
    name: "Yian Yin",
    initials: "YY",
    role: "Co-Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Yian Yin",
    profileUrl: null,
  },
];

const uchicagoPeople: AptoPerson[] = [
  {
    name: "James Evans",
    initials: "JE",
    role: "Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for James Evans",
    profileUrl: null,
  },
  {
    name: "Ian Foster",
    initials: "IF",
    role: "Co-Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Ian Foster",
    profileUrl: null,
  },
  {
    name: "Ufuk Akcigit",
    initials: "UA",
    role: "Co-Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Ufuk Akcigit",
    profileUrl: null,
  },
];

const macrocosmPeople: AptoPerson[] = [
  {
    name: "James Farmer",
    initials: "JF",
    role: "Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for James Farmer",
    profileUrl: null,
  },
  {
    name: "Daniel Eichelsdoerfer",
    initials: "DE",
    role: "Co-Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Daniel Eichelsdoerfer",
    profileUrl: null,
  },
];

const insilicomPeople: AptoPerson[] = [
  {
    name: "Jinfeng Zhang",
    initials: "JZ",
    role: "Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Jinfeng Zhang",
    profileUrl: null,
  },
];

const aperturePeople: AptoPerson[] = [
  {
    name: "Jonathan Fegely",
    initials: "JF",
    role: "Principal Investigator",
    headshotUrl: null,
    headshotAlt: "Headshot placeholder for Jonathan Fegely",
    profileUrl: null,
  },
];

const awardUrl = (awardId: string) =>
  `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${awardId}`;

const awardApiUrl = (awardId: string) =>
  `https://api.nsf.gov/services/v1/awards.json?id=${awardId}`;

export const aptoMockTools: AptoMockTool[] = [
  {
    id: "northwestern-research-market-navigator",
    participantId: "northwestern",
    organizationId: "northwestern",
    name: "Research-to-Market Navigator",
    description:
      "A concept interface for following research investments through disclosures, licenses, startups, and downstream technology outcomes.",
    figure: {
      kind: "translation-funnel",
      label: "Research-to-market pathway mockup",
      alt: "Placeholder figure showing research flowing through invention, licensing, and market-use stages",
    },
    figureLabel: "Research-to-market pathway mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://www.northwestern.edu/",
    awardUrl: awardUrl("2404035"),
  },
  {
    id: "northwestern-trajectory-forecaster",
    participantId: "northwestern",
    organizationId: "northwestern",
    name: "Technology Trajectory Forecaster",
    description:
      "A concept workspace for comparing capability, production, and use trajectories across selected technology domains and assumptions.",
    figure: {
      kind: "technology-timeline",
      label: "Multi-technology forecast mockup",
      alt: "Placeholder chart with several technology trajectories and uncertainty bands over time",
    },
    figureLabel: "Multi-technology forecast mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://www.northwestern.edu/",
    awardUrl: awardUrl("2404035"),
  },
  {
    id: "uchicago-global-observatory",
    participantId: "uchicago",
    organizationId: "uchicago",
    name: "Global S&T Observatory",
    description:
      "A concept map for exploring how research, patents, products, funding, workforce, and markets connect across the global technology system.",
    figure: {
      kind: "global-map",
      label: "Global observatory mockup",
      alt: "Placeholder world map linking research and technology signals among regions",
    },
    figureLabel: "Global observatory mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://www.uchicago.edu/",
    awardUrl: awardUrl("2404109"),
  },
  {
    id: "uchicago-virtual-policy-lab",
    participantId: "uchicago",
    organizationId: "uchicago",
    name: "Virtual Policy Laboratory",
    description:
      "A concept environment for testing simulated changes in funding, competition, and immigration against technology-performance scenarios.",
    figure: {
      kind: "scenario-curves",
      label: "Policy experiment mockup",
      alt: "Placeholder plot comparing baseline and policy-scenario technology trajectories",
    },
    figureLabel: "Policy experiment mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://www.uchicago.edu/",
    awardUrl: awardUrl("2404109"),
  },
  {
    id: "macrocosm-energy-digital-twin",
    participantId: "macrocosm",
    organizationId: "macrocosm",
    name: "Energy System Digital Twin",
    description:
      "A concept view of firms, physical energy assets, local markets, investment decisions, and feedbacks in a spatially explicit U.S. model.",
    figure: {
      kind: "agent-network",
      label: "Firm and asset network mockup",
      alt: "Placeholder network of energy firms, power plants, markets, and investment relationships",
    },
    figureLabel: "Firm and asset network mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://macrocosm.group/",
    awardUrl: awardUrl("2403999"),
  },
  {
    id: "macrocosm-policy-investment-lab",
    participantId: "macrocosm",
    organizationId: "macrocosm",
    name: "Policy & Investment Scenario Lab",
    description:
      "A concept simulator for comparing how policy and private-investment choices could influence energy technologies, firms, employment, and materials.",
    figure: {
      kind: "scenario-curves",
      label: "Energy scenario comparison mockup",
      alt: "Placeholder small-multiple charts comparing energy policy and investment scenarios",
    },
    figureLabel: "Energy scenario comparison mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://macrocosm.group/",
    awardUrl: awardUrl("2403999"),
  },
  {
    id: "insilicom-causal-knowledge-graph",
    participantId: "insilicom",
    organizationId: "insilicom",
    name: "Causal Technology Knowledge Graph",
    description:
      "A concept explorer for navigating technologies, features, problems, methods, datasets, organizations, and their directed relationships.",
    figure: {
      kind: "causal-graph",
      label: "Causal knowledge-graph mockup",
      alt: "Placeholder directed graph connecting technologies, problems, evidence, and organizations",
    },
    figureLabel: "Causal knowledge-graph mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://insilicom.com/",
    awardUrl: awardUrl("2403911"),
  },
  {
    id: "insilicom-evidence-workbench",
    participantId: "insilicom",
    organizationId: "insilicom",
    name: "Evidence Extraction Workbench",
    description:
      "A concept end-to-end workspace for annotating text, reviewing AI-assisted extractions, and assembling domain-specific knowledge graphs.",
    figure: {
      kind: "evidence-stream",
      label: "Information-extraction workflow mockup",
      alt: "Placeholder workflow turning articles and patents into reviewed entities and relations",
    },
    figureLabel: "Information-extraction workflow mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://insilicom.com/",
    awardUrl: awardUrl("2403911"),
  },
  {
    id: "aperture-problem-landscape",
    participantId: "aperture",
    organizationId: "aperture",
    name: "Problem Landscape Explorer",
    description:
      "A concept landscape that organizes problems, technologies, and organizations so users can inspect unmet needs alongside proposed solutions.",
    figure: {
      kind: "problem-landscape",
      label: "Problem-to-solution landscape mockup",
      alt: "Placeholder terrain connecting problem clusters to technologies and organizations",
    },
    figureLabel: "Problem-to-solution landscape mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://www.aperture.ai/",
    awardUrl: awardUrl("2404082"),
  },
  {
    id: "aperture-leverage-point-finder",
    participantId: "aperture",
    organizationId: "aperture",
    name: "Leverage Point Finder",
    description:
      "A concept matrix for comparing signals that may reveal high-value research questions, complementary partners, and investment leverage points.",
    figure: {
      kind: "signal-matrix",
      label: "Opportunity signal matrix mockup",
      alt: "Placeholder matrix ranking technical problems by evidence, activity, and potential leverage",
    },
    figureLabel: "Opportunity signal matrix mockup",
    status: "Concept only · not a released tool",
    isConceptOnly: true,
    demoVideoUrl: null,
    demoVideoLabel: "Demo video placeholder",
    toolUrl: null,
    toolLinkLabel: "Tool link coming soon",
    organizationUrl: "https://www.aperture.ai/",
    awardUrl: awardUrl("2404082"),
  },
];

export const aptoParticipants: AptoParticipant[] = [
  {
    id: "northwestern",
    displayName: "Northwestern University",
    name: "Northwestern University",
    legalName: "Northwestern University at Chicago",
    kind: "University",
    location: "Evanston, Illinois",
    website: "https://www.northwestern.edu/",
    awardId: "2404035",
    people: northwesternPeople,
    tools: aptoMockTools.filter(
      (tool) => tool.participantId === "northwestern",
    ),
    accent: "#005699",
  },
  {
    id: "uchicago",
    displayName: "University of Chicago",
    name: "University of Chicago",
    legalName: "University of Chicago",
    kind: "University",
    location: "Chicago, Illinois",
    website: "https://www.uchicago.edu/",
    awardId: "2404109",
    people: uchicagoPeople,
    tools: aptoMockTools.filter((tool) => tool.participantId === "uchicago"),
    accent: "#002554",
  },
  {
    id: "macrocosm",
    displayName: "Macrocosm",
    name: "Macrocosm",
    legalName: "MACROCOSM, INC.",
    kind: "Company",
    location: "Brooklyn, New York",
    website: "https://macrocosm.group/",
    awardId: "2403999",
    people: macrocosmPeople,
    tools: aptoMockTools.filter((tool) => tool.participantId === "macrocosm"),
    accent: "#00758D",
  },
  {
    id: "insilicom",
    displayName: "Insilicom",
    name: "Insilicom",
    legalName: "INSILICOM LLC",
    kind: "Company",
    location: "Tallahassee, Florida",
    website: "https://insilicom.com/",
    awardId: "2403911",
    people: insilicomPeople,
    tools: aptoMockTools.filter((tool) => tool.participantId === "insilicom"),
    accent: "#473B70",
  },
  {
    id: "aperture",
    displayName: "Aperture",
    name: "Aperture",
    legalName: "ARTEMIS INTELLIGENCE LLC",
    kind: "Company",
    location: "Rocky River, Ohio",
    website: "https://www.aperture.ai/",
    awardId: "2404082",
    people: aperturePeople,
    tools: aptoMockTools.filter((tool) => tool.participantId === "aperture"),
    accent: "#D3B34E",
  },
];

export const aptoProjects: AptoProject[] = [
  {
    id: "northwestern-technology-outcomes",
    awardId: "2404035",
    shortName: "Measuring and accelerating outcomes",
    officialTitle:
      "APTO: Measuring, Understanding, Predicting, and Accelerating Technology Outcomes",
    participantId: "northwestern",
    organization: "Northwestern University",
    legalAwardeeName: "Northwestern University at Chicago",
    location: "Evanston, Illinois",
    agreementType: "Cooperative Agreement",
    startDate: "2024-07-01",
    endDate: "2029-06-30",
    funding: {
      obligatedAmount: 7_993_116,
      estimatedTotalAmount: 19_979_400,
      currency: "USD",
      dataAsOf: "2026-07-20",
      dataAsOfLabel: "NSF Awards API snapshot · July 20, 2026",
    },
    people: northwesternPeople,
    pi: "Dashun Wang",
    coPIs: ["Alicia I. Loffler", "Jian Cao", "Benjamin Jones", "Yian Yin"],
    summary:
      "Northwestern and its partners are building an integrated research-to-market data pipeline and predictive and causal models to measure, understand, predict, and accelerate technology outcomes. The work links university research and investment to disclosures, licensing, startups, and technology-specific measures across additive manufacturing, synthetic biology, advanced materials, AI algorithms, and therapeutics.",
    outcomes: ["Capability", "Production", "Use"],
    linesOfEffort: ["data-tools", "models"],
    awardUrl: awardUrl("2404035"),
    apiUrl: awardApiUrl("2404035"),
  },
  {
    id: "uchicago-global-observatory",
    awardId: "2404109",
    shortName: "Global observatory and virtual laboratory",
    officialTitle:
      "APTO: Collaborative Research: Global Observatory and Virtual Laboratory for Science and Technology Advance",
    participantId: "uchicago",
    organization: "University of Chicago",
    legalAwardeeName: "University of Chicago",
    location: "Chicago, Illinois",
    agreementType: "Cooperative Agreement",
    startDate: "2024-07-01",
    endDate: "2029-06-30",
    funding: {
      obligatedAmount: 8_004_743,
      estimatedTotalAmount: 20_000_000,
      currency: "USD",
      dataAsOf: "2026-07-20",
      dataAsOfLabel: "NSF Awards API snapshot · July 20, 2026",
    },
    people: uchicagoPeople,
    pi: "James Evans",
    coPIs: ["Ian Foster", "Ufuk Akcigit"],
    summary:
      "The University of Chicago team is creating a global observatory and virtual laboratory for science and technology. A chronologically trained language model will serve as a data-driven digital double of the global techno-scientific system, connecting research artifacts and metadata to measures of capability, production, and use and supporting simulated policy experiments and causal analysis.",
    outcomes: ["Capability", "Production", "Use"],
    linesOfEffort: ["data-tools", "models"],
    awardUrl: awardUrl("2404109"),
    apiUrl: awardApiUrl("2404109"),
  },
  {
    id: "macrocosm-energy-sector",
    awardId: "2403999",
    shortName: "Firm-level energy-system model",
    officialTitle:
      "APTO: A firm-level model of technological improvement, production and diffusion in the energy sector",
    participantId: "macrocosm",
    organization: "Macrocosm",
    legalAwardeeName: "MACROCOSM, INC.",
    location: "Brooklyn, New York",
    agreementType: "Cooperative Agreement",
    startDate: "2024-08-01",
    endDate: "2029-07-31",
    funding: {
      obligatedAmount: 2_071_590,
      estimatedTotalAmount: 4_603_600,
      currency: "USD",
      dataAsOf: "2026-07-20",
      dataAsOfLabel: "NSF Awards API snapshot · July 20, 2026",
    },
    people: macrocosmPeople,
    pi: "James Farmer",
    coPIs: ["Daniel Eichelsdoerfer"],
    summary:
      "Macrocosm is developing a data-driven, agent-based model of U.S. energy firms, their geolocated physical assets, and their interactions in local markets. The model is intended to explore feedbacks among technological improvement, investment, firm performance, infrastructure, and policy over the next two decades.",
    outcomes: ["Capability", "Production", "Use"],
    linesOfEffort: ["data-tools", "models"],
    awardUrl: awardUrl("2403999"),
    apiUrl: awardApiUrl("2403999"),
  },
  {
    id: "insilicom-causal-knowledge-graphs",
    awardId: "2403911",
    shortName: "Causal technology knowledge graphs",
    officialTitle:
      "APTO: Constructing causal knowledge graphs for assessing and predicting technology outcomes",
    participantId: "insilicom",
    organization: "Insilicom",
    legalAwardeeName: "INSILICOM LLC",
    location: "Tallahassee, Florida",
    agreementType: "Cooperative Agreement",
    startDate: "2024-08-01",
    endDate: "2027-07-31",
    funding: {
      obligatedAmount: 3_865_636,
      estimatedTotalAmount: 5_798_454,
      currency: "USD",
      dataAsOf: "2026-07-20",
      dataAsOfLabel: "NSF Awards API snapshot · July 20, 2026",
    },
    people: insilicomPeople,
    pi: "Jinfeng Zhang",
    coPIs: [],
    summary:
      "Insilicom is expanding its iKraph biomedical knowledge graph with technology entities and directed relationships drawn from publications, patents, reports, Wikipedia, and public databases. The team will also create an AI-assisted, end-to-end toolkit that APTO teams can use to extract information and construct domain knowledge graphs, including a case study in advanced manufacturing for generic drugs.",
    outcomes: ["Capability", "Production", "Use"],
    linesOfEffort: ["data-tools", "models"],
    awardUrl: awardUrl("2403911"),
    apiUrl: awardApiUrl("2403911"),
  },
  {
    id: "aperture-problem-focused-analysis",
    awardId: "2404082",
    shortName: "Problem-focused technology analysis",
    officialTitle:
      "APTO: Problem-Focused Analysis for Predicting Technology Outcomes and Leverage Points",
    participantId: "aperture",
    organization: "Aperture",
    legalAwardeeName: "ARTEMIS INTELLIGENCE LLC",
    location: "Rocky River, Ohio",
    agreementType: "Cooperative Agreement",
    startDate: "2024-07-01",
    endDate: "2027-06-30",
    funding: {
      obligatedAmount: 1_396_296,
      estimatedTotalAmount: 1_168_047,
      currency: "USD",
      dataAsOf: "2026-07-20",
      dataAsOfLabel: "NSF Awards API snapshot · July 20, 2026",
      caveat:
        "The NSF API currently reports funds obligated above the estimated total for this record; both values are shown exactly as published.",
    },
    people: aperturePeople,
    pi: "Jonathan Fegely",
    coPIs: [],
    summary:
      "Aperture, the platform of Artemis Intelligence, is developing problem-focused datasets that connect technical needs with technologies and organizations across selected domains. The project will mine diverse evidence sources and compare statistical signals with expert and historical ground truth to identify predictive factors, hidden opportunities, promising partners, and high-leverage research or investment targets.",
    outcomes: ["Capability", "Production", "Use"],
    linesOfEffort: ["data-tools", "models"],
    awardUrl: awardUrl("2404082"),
    apiUrl: awardApiUrl("2404082"),
  },
];

export const aptoProgram: AptoProgram = {
  eyebrow: "U.S. National Science Foundation · TIP",
  name: "Assessing and Predicting Technology Outcomes",
  acronym: "APTO",
  title: "Evidence for better technology decisions",
  shortSummary:
    "APTO supports a cohort of projects building data, tools, and generalizable models to understand how science and technology investments contribute to national outcomes.",
  description:
    "Through the NSF Directorate for Technology, Innovation and Partnerships, APTO advances the assessment of how investments in science and technology research and development lead to changes in technology capability, production, and use. Projects study past and possible future states, create models that can extend across technology areas, and develop evidence intended to improve R&D investment decisions and strengthen long-term U.S. competitiveness.",
  cohortDescription:
    "This mockup includes the five active records under NSF Program Element Code 267Y00 whose official award titles begin with “APTO.”",
  lastVerified: "2026-07-20",
  stats: [
    {
      value: "5",
      label: "APTO-titled projects",
      detail: "Filtered from the active NSF award records for Program Element Code 267Y00",
    },
    {
      value: "2",
      label: "lines of effort",
      detail: "Technology Outcome Models and Data Sets and Tools",
    },
    {
      value: "3",
      label: "outcome dimensions",
      detail: "Technology capability, production, and use",
    },
    {
      value: "10",
      label: "critical technology groupings",
      detail: "Areas identified in the NSF 23-600 solicitation",
    },
  ],
  outcomes: [
    {
      name: "Capability",
      description:
        "What a technology can do and how its technical performance changes.",
    },
    {
      name: "Production",
      description:
        "How a technology is made, scaled, supplied, and supported by organizations and infrastructure.",
    },
    {
      name: "Use",
      description:
        "How a technology is adopted, deployed, and translated into economic or societal outcomes.",
    },
  ],
  linesOfEffort: [
    {
      id: "models",
      title: "Technology Outcome Models",
      description:
        "Generalizable, empirically grounded models for assessing and predicting technology capability, production, and use across past and possible future states.",
    },
    {
      id: "data-tools",
      title: "Data Sets and Tools",
      description:
        "Data resources, measurement approaches, and tools that make technology-outcome evidence easier to assemble, analyze, validate, and share.",
    },
  ],
  technologyAreas: [
    "Artificial intelligence, machine learning, autonomy, and related advances",
    "High-performance computing, semiconductors, and advanced computer hardware and software",
    "Quantum information science and technology",
    "Robotics, automation, and advanced manufacturing",
    "Natural and anthropogenic disaster prevention or mitigation",
    "Advanced communications, networking, sensing, and immersive technologies",
    "Biotechnology, medical technology, genomics, and synthetic biology",
    "Data storage and management, distributed ledgers, and cybersecurity",
    "Advanced energy and industrial-efficiency technologies",
    "Advanced materials science, including manufacturing-related advances",
  ],
  openAccessNote:
    "The solicitation calls for models, data sets, and tools to be openly accessible to the broadest possible range of users whenever possible, while recognizing that some projects may rely on proprietary data or tools that cannot be shared.",
};

export const aptoBoilerplate =
  "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.";

export const aptoSources: AptoSource[] = [
  {
    id: "nsf-apto-solicitation",
    label: "NSF 23-600: Assessing and Predicting Technology Outcomes",
    url: "https://www.nsf.gov/funding/opportunities/apto-assessing-predicting-technology-outcomes/506195/nsf23-600/solicitation",
    detail:
      "Official program purpose, lines of effort, outcome dimensions, technology areas, and access expectations.",
    kind: "program",
  },
  {
    id: "nsf-apto-award-search",
    label: "NSF Award Search · Program Element Code 267Y00",
    url: "https://www.nsf.gov/awardsearch/search-results/?ProgEleCode=267Y00&BooleanElement=Any&BooleanRef=Any&ActiveAwards=true#results",
    detail:
      "Official active-award search; this mockup includes only records whose titles begin with APTO.",
    kind: "award-search",
  },
  {
    id: "nsf-awards-api",
    label: "NSF Awards API · Program Element Code 267Y00",
    url: "https://api.nsf.gov/services/v1/awards.json?ProgEleCode=267Y00",
    detail:
      "Machine-readable source for official titles, investigators, dates, locations, award amounts, and abstracts; data snapshot verified July 20, 2026.",
    kind: "awards-api",
  },
  {
    id: "nsf-brand-policy",
    label: "NSF Brand Standards and Usage",
    url: "https://www.nsf.gov/policies/brand",
    detail: "Official NSF identity, logo-use, acknowledgment, and attribution policy.",
    kind: "brand",
  },
  {
    id: "nsf-brand-manual",
    label: "NSF Brand Standards Manual",
    url: "https://nsf.widen.net/s/xzrd9bgklh",
    detail:
      "Official March 2025 manual covering the NSF logo, colors, typography, partnerships, award-recipient sites, and accessibility considerations.",
    kind: "brand",
  },
  ...aptoProjects.map<AptoSource>((project) => ({
    id: `nsf-award-${project.awardId}`,
    label: `NSF Award ${project.awardId}`,
    url: project.awardUrl,
    detail: `${project.officialTitle} · official NSF award record.`,
    kind: "award",
  })),
  ...aptoParticipants.map<AptoSource>((participant) => ({
    id: `organization-${participant.id}`,
    label: `${participant.displayName} website`,
    url: participant.website,
    detail: `Official website for ${participant.displayName}.`,
    kind: "organization",
  })),
];
