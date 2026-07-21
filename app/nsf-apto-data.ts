import generatedContent from "./nsf-apto-content.generated.json";

export type AptoParticipantId =
  | "northwestern"
  | "uchicago"
  | "macrocosm"
  | "insilicom"
  | "aperture";

export type AptoParticipantKind = "University" | "Company";

export type AptoParticipantLogo = {
  src: string;
  width: number;
  height: number;
  surface: "dark" | "light";
  kind: "symbol" | "wordmark";
  sourceUrl: string;
  sourceLabel: string;
  status: "approval-required/mockup";
  approved: false;
};

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
  logo: AptoParticipantLogo;
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
  dataAsOf: string;
  dataAsOfLabel: string;
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
  lastVerified: string;
  stats: AptoProgramStat[];
  outcomes: Array<{
    name: AptoOutcome;
    description: string;
  }>;
  linesOfEffort: AptoProgramLineOfEffort[];
  technologyAreas: string[];
  openAccessNote: string;
};

export type AptoPageSlug =
  | "/"
  | "/about"
  | "/cohort"
  | "/people"
  | "/projects"
  | "/tools";

export type AptoPage = {
  slug: AptoPageSlug;
  navLabel: string;
  eyebrow: string;
  title: string;
  introduction: string;
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

export type AptoContentBuild = {
  warning: string;
  schemaVersion: number;
  generator: string;
  sourceDirectory: string;
  generatedFrom: string[];
  dataAsOf: string;
};

type AptoGeneratedContent = {
  _generated: AptoContentBuild;
  program: AptoProgram;
  pages: AptoPage[];
  boilerplate: string;
  participants: AptoParticipant[];
  projects: AptoProject[];
  tools: AptoMockTool[];
  sources: AptoSource[];
};

// The browser-facing records are generated from content/apto/**/*.md. Keeping
// this module as the typed boundary means the React concepts never need to
// know how the Markdown files are parsed or joined.
const aptoContent = generatedContent as unknown as AptoGeneratedContent;

export const aptoContentBuild = aptoContent._generated;
export const aptoProgram = aptoContent.program;
export const aptoPages = aptoContent.pages;
export const aptoBoilerplate = aptoContent.boilerplate;
export const aptoParticipants = aptoContent.participants;
export const aptoProjects = aptoContent.projects;
export const aptoMockTools = aptoContent.tools;
export const aptoSources = aptoContent.sources;
