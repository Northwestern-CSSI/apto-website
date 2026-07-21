import generatedContent from "./nsf-apto-content.generated.json";

// IDs are intentionally open strings: adding a Markdown record must not
// require a TypeScript edit.
export type AptoParticipantId = string;
export type AptoParticipantKind = "University" | "Company";
export type AptoOutcome = "Capability" | "Production" | "Use";
export type AptoLineOfEffortId = "models" | "data-tools";

export type AptoParticipantLogo = {
  src: string;
  width: number;
  height: number;
  surface: "dark" | "light";
  kind: "symbol" | "wordmark";
  sourceUrl: string;
  sourceLabel: string;
  status: string;
  approved: boolean;
};

export type AptoPersonRole =
  | "Program Manager"
  | "Principal Investigator"
  | "Co-Principal Investigator";

export type AptoPerson = {
  id: string;
  participantId: AptoParticipantId | null;
  name: string;
  initials: string;
  role: AptoPersonRole;
  organization: string;
  headshotUrl: string | null;
  headshotAlt: string;
  profileUrl: string | null;
};

export type AptoProgramPerson = AptoPerson & {
  participantId: null;
  role: "Program Manager";
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

export type AptoTool = {
  id: string;
  participantId: AptoParticipantId;
  organizationId: AptoParticipantId;
  organizationName: string;
  name: string;
  categories: AptoOutcome[];
  description: string;
  useCase: string;
  figure: {
    kind: AptoFigureKind;
    label: string;
    alt: string;
  };
  figureLabel: string;
  statusLabel: string;
  demoVideoUrl: string | null;
  toolUrl: string | null;
  organizationUrl: string;
};

// Kept as an export alias while existing page imports migrate to AptoTool.
export type AptoMockTool = AptoTool;

export type AptoParticipant = {
  id: AptoParticipantId;
  displayName: string;
  name: string;
  kind: AptoParticipantKind;
  location: string;
  website: string;
  logo: AptoParticipantLogo;
  accent: string;
  mapPosition: { x: number; y: number };
  description: string;
  people: AptoPerson[];
  tools: AptoTool[];
  projectIds: string[];
};

export type AptoProject = {
  id: string;
  participantId: AptoParticipantId;
  awardId: string;
  shortName: string;
  officialTitle: string;
  awardedYear: number;
  statusLabel: string;
  awardUrl: string;
  organization: string;
  location: string;
  people: AptoPerson[];
  pi: string;
  coPIs: string[];
  summary: string;
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
  programTeam: AptoProgramPerson[];
  framework: {
    ariaLabel: string;
    outcomesTitle: string;
    outcomesNote: string;
    effortsTitle: string;
    effortsNote: string;
  };
  outcomes: Array<{
    name: AptoOutcome;
    description: string;
  }>;
  linesOfEffort: AptoProgramLineOfEffort[];
};

export type AptoPageSlug =
  | "/"
  | "/about"
  | "/cohort"
  | "/projects"
  | "/tools";

export type AptoPage = {
  slug: AptoPageSlug;
  navLabel: string;
  metadataTitle: string;
  eyebrow: string;
  title: string;
  introduction: string;
};

export type AptoInterfaceSection = "about" | "cohort" | "projects" | "tools";

export type AptoInterfaceContent = {
  directions: Array<{
    id: "nsfhome" | "nsfnetwork";
    label: string;
    note: string;
  }>;
  study: {
    siteTitle: string;
    siteDescription: string;
    socialImageSrc: string;
    socialImageAlt: string;
    galleryLabel: string;
    barLabel: string;
    themeChooserLabel: string;
  };
  primaryNavigation: Array<{
    label: string;
    section: AptoInterfaceSection;
  }>;
  home: {
    primaryActionLabel: string;
    secondaryActionLabel: string;
    outcomeVisualNote: string;
    cohortEyebrow: string;
    cohortTitle: string;
    cohortLinkLabel: string;
    logoDisclosure: string;
    networkCoreLabel: string;
    networkVisualAlt: string;
    networkVisualCaption: string;
    ledgerVisualEyebrow: string;
    ledgerVisualTitle: string;
    pathways: Array<{
      section: AptoInterfaceSection;
      title: string;
      description: string;
    }>;
  };
  common: {
    organizationWebsiteLabel: string;
    participantWebsiteLabel: string;
  };
  accessibility: {
    skipLinkLabel: string;
    primaryNavigationLabel: string;
    footerNavigationLabel: string;
    homePathwaysLabel: string;
    projectInvestigatorsLabel: string;
    projectMapLabel: string;
    toolFiltersLabel: string;
  };
  projects: {
    ledgerTitle: string;
    awardLabel: string;
    awardedPrefix: string;
    dateStatusSeparator: string;
    expandLabel: string;
    collapseLabel: string;
    map: {
      eyebrow: string;
      title: string;
      description: string;
      caption: string;
      imageUrl: string;
      imageAlt: string;
      sourceUrl: string;
      sourceLabel: string;
    };
  };
  tools: {
    registerTitle: string;
    allOrganizationsLabel: string;
    allCategoriesLabel: string;
    organizationFilterLabel: string;
    organizationFilterAriaLabel: string;
    categoryFilterLabel: string;
    categoryFilterAriaLabel: string;
    showingPrefix: string;
    toolSingular: string;
    toolPlural: string;
    useCaseLabel: string;
    categoriesLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    watchDemoLabel: string;
    openToolLabel: string;
    statusLabel: string;
  };
  people: {
    programTeamEyebrow: string;
    programTeamTitle: string;
    projectProfileLabel: string;
    portraitForthcomingLabel: string;
    viewProfileLabel: string;
  };
  cohort: {
    prominentTitle: string;
    markStatusSuffix: string;
    peopleTitle: string;
    projectLabel: string;
  };
  disclosures: {
    cohort: string;
  };
  footer: {
    supportTitle: string;
    supportDescription: string;
    disclaimerTitle: string;
    backToTopLabel: string;
    homeLinkLabel: string;
    programLinkLabel: string;
    nsfWebsiteUrl: string;
    nsfLogoSrc: string;
    nsfWebsiteAriaLabel: string;
    nsfLogoAlt: string;
  };
};

export type AptoSourceKind =
  | "program"
  | "award-search"
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
  interface: AptoInterfaceContent;
  pages: AptoPage[];
  boilerplate: string;
  participants: AptoParticipant[];
  projects: AptoProject[];
  tools: AptoTool[];
  sources: AptoSource[];
};

// The browser-facing records are generated from content/apto/**/*.md. Keeping
// this module as the typed boundary means components never need to parse or
// join content files themselves.
const aptoContent = generatedContent as unknown as AptoGeneratedContent;

export const aptoContentBuild = aptoContent._generated;
export const aptoProgram = aptoContent.program;
export const aptoInterface = aptoContent.interface;
export const aptoPages = aptoContent.pages;
export const aptoBoilerplate = aptoContent.boilerplate;
export const aptoParticipants = aptoContent.participants;
export const aptoProjects = aptoContent.projects;
export const aptoTools = aptoContent.tools;
export const aptoMockTools = aptoContent.tools;
export const aptoSources = aptoContent.sources;
