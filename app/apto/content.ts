import generatedContent from "./content.generated.json";

// IDs are intentionally open strings: adding a Markdown record must not
// require a TypeScript edit.
export type AptoParticipantId = string;
export type AptoOutcome = "Capability" | "Production" | "Use";
export type AptoLineOfEffortId = "models" | "data-tools";

export type AptoParticipantLogo = {
  src: string;
  width: number;
  height: number;
  surface: "dark" | "light";
  kind: "symbol" | "wordmark";
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
  name: string;
  categories: AptoOutcome[];
  description: string;
  useCase: string;
  figure: {
    kind: AptoFigureKind;
    src: string;
    label: string;
    alt: string;
  };
  galleryImages: Array<{
    src: string;
    alt: string;
  }>;
  statusLabel: string;
  demoVideoUrl: string | null;
  toolUrl: string | null;
};

export type AptoParticipant = {
  id: AptoParticipantId;
  displayName: string;
  location: string;
  website: string;
  logo: AptoParticipantLogo;
  accent: string;
  mapPosition: { x: number; y: number };
  people: AptoPerson[];
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
  summary: string;
};

export type AptoProgramLineOfEffort = {
  id: AptoLineOfEffortId;
  title: string;
  description: string;
};

export type AptoProgram = {
  name: string;
  acronym: "APTO";
  description: string;
  objectivesTitle: string;
  objectives: string[];
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
  metadataTitle: string;
  eyebrow: string;
  title: string;
  introduction: string;
};

export type AptoInterfaceSection = "home" | "cohort" | "projects" | "tools";

export type AptoInterfaceContent = {
  directions: Array<{
    id: "nsfhome" | "nsfnetwork";
    label: string;
  }>;
  study: {
    siteTitle: string;
    siteDescription: string;
    socialImageSrc: string;
    socialImageAlt: string;
    themeChooserLabel: string;
    themeSwitchActionPrefix: string;
  };
  primaryNavigation: Array<{
    label: string;
    section: AptoInterfaceSection;
  }>;
  home: {
    primaryActionLabel: string;
    secondaryActionLabel: string;
    cohortEyebrow: string;
    cohortTitle: string;
    cohortLinkLabel: string;
    pathways: Array<{
      section: AptoInterfaceSection;
      title: string;
      description: string;
    }>;
  };
  story: {
    viewLabel: string;
    socialImageSrc: string;
    socialImageAlt: string;
    cohortArtSrc: string;
    directoryLabel: string;
    navigationLabel: string;
    scrollPrompt: string;
    programLabel: string;
    projectsLabel: string;
    toolsLabel: string;
    cohortLabel: string;
    projectStageTitle: string;
    projectStageDescription: string;
    toolCollectionLabel: string;
    programLeadershipLabel: string;
    supportedByLabel: string;
  };
  atlas: {
    viewLabel: string;
    socialImageSrc: string;
    socialImageAlt: string;
    directoryLabel: string;
    continuumLabel: string;
    navigationLabel: string;
    viewNavigationLabel: string;
    programMosaicLabel: string;
    objectivesLabel: string;
    participantsLabel: string;
    projectsMapLabel: string;
    projectPortfolioLabel: string;
    toolCollectionLabel: string;
    toolDetailsLabel: string;
    closeDetailsLabel: string;
    cohortIndexLabel: string;
    programLeadershipLabel: string;
    supportedByLabel: string;
  };
  common: {
    organizationWebsiteLabel: string;
  };
  accessibility: {
    skipLinkLabel: string;
    primaryNavigationLabel: string;
    footerNavigationLabel: string;
    homePathwaysLabel: string;
    projectInvestigatorsLabel: string;
    toolFiltersLabel: string;
  };
  projects: {
    awardLabel: string;
    awardedPrefix: string;
    dateStatusSeparator: string;
    expandLabel: string;
    map: {
      eyebrow: string;
      title: string;
      description: string;
      caption: string;
      imageUrl: string;
      imageAlt: string;
      nearbyLocationsLabel: string;
      nearbyProjectsLabel: string;
    };
  };
  tools: {
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
  };
  people: {
    programTeamEyebrow: string;
    programTeamTitle: string;
    viewProfileLabel: string;
  };
  footer: {
    supportTitle: string;
    supportDescription: string;
    disclaimerTitle: string;
    backToTopLabel: string;
    nsfWebsiteUrl: string;
    nsfLogoSrc: string;
    nsfWebsiteAriaLabel: string;
    nsfLogoAlt: string;
  };
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
};

// The browser-facing records are generated from content/apto/**/*.md. Keeping
// this module as the typed boundary means components never need to parse or
// join content files themselves.
const aptoContent = generatedContent as unknown as AptoGeneratedContent;

export const aptoProgram = aptoContent.program;
export const aptoInterface = aptoContent.interface;
export const aptoPages = aptoContent.pages;
export const aptoBoilerplate = aptoContent.boilerplate;
export const aptoParticipants = aptoContent.participants;
export const aptoProjects = aptoContent.projects;
export const aptoTools = aptoContent.tools;
