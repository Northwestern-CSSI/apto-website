"use client";

/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";
import { useState, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoInterface,
  aptoPages,
  aptoParticipants,
  aptoProgram,
  aptoProjects,
  aptoTools,
} from "./content";
import type { AptoTheme } from "./theme";
import { useAptoTheme } from "./use-apto-theme";
import { aptoRoute, withDeploymentBase } from "./paths";

export type AptoSection = "home" | "about" | "cohort" | "projects" | "tools";

type AptoProject = (typeof aptoProjects)[number];
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoTool = (typeof aptoTools)[number];
type AptoPerson = AptoProject["people"][number];
type AptoProgramPerson = (typeof aptoProgram.programTeam)[number];

const sectionPath: Record<AptoSection, string> = {
  home: "",
  about: "about",
  cohort: "cohort",
  projects: "projects",
  tools: "tools",
};

const pageSlug: Record<AptoSection, string> = {
  home: "/",
  about: "/about",
  cohort: "/cohort",
  projects: "/projects",
  tools: "/tools",
};

function aptoHref(section: AptoSection) {
  const path = sectionPath[section];
  return aptoRoute(path);
}

function copyFor(section: AptoSection) {
  const page = aptoPages.find((candidate) => candidate.slug === pageSlug[section]);
  if (!page) throw new Error(`Missing Markdown page content for ${section}`);
  return page;
}

function displayRecord(value: unknown) {
  if (typeof value === "string") return { label: value, description: "" };
  if (!value || typeof value !== "object") return { label: String(value ?? ""), description: "" };
  const record = value as Record<string, unknown>;
  return {
    label: String(record.label ?? record.name ?? record.title ?? record.value ?? ""),
    description: String(record.description ?? record.detail ?? record.note ?? ""),
  };
}

function participantFor(id: string) {
  return aptoParticipants.find((participant) => participant.id === id);
}

function projectForParticipant(id: string) {
  return aptoProjects.find((project) => project.participantId === id);
}

function participantMonogram(name: string) {
  const words = name
    .split(/[\s-]+/)
    .filter((word) => word && !["and", "of", "the"].includes(word.toLowerCase()));
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href}>{children}<span aria-hidden="true"> ↗</span></a>;
}

function ParticipantMark({
  participant,
  size = "directory",
}: {
  participant: AptoParticipant;
  size?: "compact" | "directory" | "feature";
}) {
  const logo = participant.logo;
  return <span
    className={`nsf-participant-mark is-${size} is-${logo.kind} logo-${participant.id}`}
    aria-hidden="true"
  >
    <img
      className="nsf-logo-asset is-light"
      src={withDeploymentBase(logo.variants.light.src)}
      width={logo.variants.light.width}
      height={logo.variants.light.height}
      alt=""
    />
    <img
      className="nsf-logo-asset is-dark"
      src={withDeploymentBase(logo.variants.dark.src)}
      width={logo.variants.dark.width}
      height={logo.variants.dark.height}
      alt=""
    />
  </span>;
}

function NsfThemeSwitch({ theme, onToggle }: { theme: AptoTheme; onToggle: () => void }) {
  const lightLabel = aptoInterface.directions.find((direction) => direction.id === "nsfhome")?.label;
  const darkLabel = aptoInterface.directions.find((direction) => direction.id === "nsfnetwork")?.label;
  if (!lightLabel || !darkLabel) throw new Error("Missing APTO theme labels in Markdown content");
  const nextLabel = theme === "dark" ? lightLabel : darkLabel;
  return <div className="nsf-theme-switch">
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={`${aptoInterface.study.themeChooserLabel}: ${darkLabel}`}
      title={`${aptoInterface.study.themeSwitchActionPrefix} ${nextLabel}`}
      onClick={onToggle}
    >
      <span className="nsf-theme-switch-track" aria-hidden="true">
        <span className="nsf-theme-switch-thumb">
          <Sun className="is-sun" focusable="false" />
          <Moon className="is-moon" focusable="false" />
        </span>
      </span>
    </button>
  </div>;
}

function NsfProgramHeader({ activeSection, theme, onToggle, showThemeSwitch = true }: {
  activeSection: AptoSection;
  theme: AptoTheme;
  onToggle: () => void;
  showThemeSwitch?: boolean;
}) {
  return <header className="nsf-program-header">
    <div className="nsf-program-brand">
      <a
        className="nsf-apto-wordmark"
        href={aptoHref("home")}
        aria-current={activeSection === "home" ? "page" : undefined}
      >
        <strong>{aptoProgram.acronym}</strong>
        <span>{aptoProgram.name}</span>
      </a>
    </div>
    <nav aria-label={aptoInterface.accessibility.primaryNavigationLabel}>
      {aptoInterface.primaryNavigation.map((link) => <a
        key={link.section}
        href={aptoHref(link.section)}
        aria-current={activeSection === link.section ? "page" : undefined}
      >{link.label}</a>)}
    </nav>
    {showThemeSwitch && <NsfThemeSwitch theme={theme} onToggle={onToggle} />}
  </header>;
}

function CompactProgramHero({ id }: { id: string }) {
  const homeCopy = copyFor("home");
  return <section className="nsf-program-hero has-partner-grid" aria-labelledby={`${id}-title`}>
    <div className="nsf-hero-copy">
      <p className="nsf-eyebrow">{homeCopy.eyebrow}</p>
      <h1 id={`${id}-title`}>{homeCopy.title}</h1>
      <p className="nsf-hero-summary">{homeCopy.introduction}</p>
      <div className="nsf-hero-actions">
        <a className="nsf-primary-action" href={aptoHref("projects")}>{aptoInterface.home.primaryActionLabel} <span aria-hidden="true">→</span></a>
        <a href={`${aptoHref("home")}#${id}-about`}>{aptoInterface.home.secondaryActionLabel} <span aria-hidden="true">↓</span></a>
      </div>
    </div>
    <aside className="nsf-hero-partners" aria-labelledby={`${id}-hero-partners-title`}>
      <header>
        <p id={`${id}-hero-partners-title`}>{aptoInterface.home.cohortEyebrow}</p>
        <a href={aptoHref("cohort")}>{aptoInterface.home.cohortLinkLabel} <span aria-hidden="true">→</span></a>
      </header>
      <ul>
        {aptoParticipants.map((participant) => <li key={participant.id}>
          <a href={`${aptoHref("cohort")}#participant-${participant.id}`}>
            <ParticipantMark participant={participant} size="compact" />
            <span>{participant.displayName}</span>
          </a>
        </li>)}
      </ul>
    </aside>
  </section>;
}

function HomePathways() {
  return <nav className="nsf-home-pathways" aria-label={aptoInterface.accessibility.homePathwaysLabel}>
    {aptoInterface.home.pathways.map((pathway) => <a key={pathway.section} href={aptoHref(pathway.section)}>
      <span><strong>{pathway.title}</strong><small>{pathway.description}</small></span>
      <i aria-hidden="true">↗</i>
    </a>)}
  </nav>;
}

function HomePage({ id }: { id: string }) {
  return <>
    <CompactProgramHero id={id} />
    <ProgramOverview id={id} />
    <HomePathways />
  </>;
}

function SectionIntro({ eyebrow, title, description, id, pageHeading = false }: { eyebrow: string; title: string; description: string; id?: string; pageHeading?: boolean }) {
  return <header className="nsf-section-intro">
    <p className="nsf-section-intro-eyebrow">{eyebrow}</p>
    {pageHeading ? <h1 id={id}>{title}</h1> : <h2 id={id}>{title}</h2>}
    <p className="nsf-section-intro-description">{description}</p>
  </header>;
}

function ProgramOverview({ id, pageHeading = false }: { id: string; pageHeading?: boolean }) {
  const copy = copyFor("about");
  return <section className="nsf-program-overview" id={`${id}-about`} aria-labelledby={`${id}-about-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={pageHeading ? copy.introduction : aptoProgram.description} id={`${id}-about-title`} pageHeading={pageHeading} />
    <section className="nsf-program-objectives" aria-labelledby={`${id}-objectives-title`}>
      <h2 id={`${id}-objectives-title`}>{aptoProgram.objectivesTitle}</h2>
      <ul>{aptoProgram.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
    </section>
    <div className="nsf-overview-framework" role="group" aria-label={aptoProgram.framework.ariaLabel}>
      <section className="nsf-framework-block is-outcomes" aria-labelledby={`${id}-outcomes-title`}>
        <header className="nsf-framework-heading"><h2 id={`${id}-outcomes-title`}>{aptoProgram.framework.outcomesTitle}</h2><p>{aptoProgram.framework.outcomesNote}</p></header>
        <dl className="nsf-framework-items">{aptoProgram.outcomes.map((outcome) => {
          const item = displayRecord(outcome);
          return <div key={item.label}><dt>{item.label}</dt>{item.description && <dd>{item.description}</dd>}</div>;
        })}</dl>
      </section>
      <section className="nsf-framework-block is-efforts" aria-labelledby={`${id}-efforts-title`}>
        <header className="nsf-framework-heading"><h2 id={`${id}-efforts-title`}>{aptoProgram.framework.effortsTitle}</h2><p>{aptoProgram.framework.effortsNote}</p></header>
        <dl className="nsf-framework-items">{aptoProgram.linesOfEffort.map((line) => {
          const item = displayRecord(line);
          return <div key={item.label}><dt>{item.label}</dt>{item.description && <dd>{item.description}</dd>}</div>;
        })}</dl>
      </section>
    </div>
  </section>;
}

function ProjectPeopleList({ people }: { people: readonly AptoPerson[] }) {
  return <ul className="nsf-project-people" aria-label={aptoInterface.accessibility.projectInvestigatorsLabel}>
    {people.map((person) => <li key={person.name}>
      <span aria-hidden="true">{person.initials}</span>
      <div><strong>{person.name}</strong><small>{person.role}</small></div>
    </li>)}
  </ul>;
}

function ProjectAccordionItem({ project }: { project: AptoProject }) {
  const participant = participantFor(project.participantId);
  return <details className="nsf-project-accordion" id={`nsf-award-${project.awardId}`}>
    <summary className="nsf-project-summary">
      {participant
        ? <ParticipantMark participant={participant} size="directory" />
        : <span className="nsf-participant-mark is-directory is-fallback" aria-hidden="true">{participantMonogram(project.organization)}</span>}
      <span className="nsf-project-summary-copy">
        <span className="nsf-project-context">{project.organization} <span aria-hidden="true">·</span> {project.location}</span>
        <h2>{project.shortName}</h2>
        <span className="nsf-project-meta">{aptoInterface.projects.awardedPrefix} {project.awardedYear} <span aria-hidden="true">{aptoInterface.projects.dateStatusSeparator}</span> {project.statusLabel}</span>
      </span>
      <span className="nsf-project-toggle" aria-hidden="true"><span>{aptoInterface.projects.expandLabel}</span><ChevronDown /></span>
    </summary>
    <div className="nsf-project-detail">
      <h3>{project.officialTitle}</h3>
      <p>{project.summary}</p>
      <ProjectPeopleList people={project.people} />
      <div className="nsf-project-actions">
        <ExternalLink href={project.awardUrl}>{aptoInterface.projects.awardLabel} {project.awardId}</ExternalLink>
        {participant && <ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>}
      </div>
    </div>
  </details>;
}

function ProjectsSection({ id, pageHeading = false }: { id: string; pageHeading?: boolean }) {
  const copy = copyFor("projects");
  const projects = aptoProjects;
  return <section className="nsf-projects-section" id={`${id}-projects`} aria-labelledby={`${id}-projects-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.introduction} id={`${id}-projects-title`} pageHeading={pageHeading} />
    <div className="nsf-projects-layout">
      <div className="nsf-project-ledger" id={`${id}-project-list`}>
        {projects.map((project) => <ProjectAccordionItem key={project.awardId} project={project} />)}
      </div>
    </div>
  </section>;
}

function ToolFigure({ tool }: { tool: AptoTool }) {
  return <figure className={`nsf-tool-figure is-${tool.figure.kind}`}>
    <div className="nsf-tool-image-frame">
      <img src={withDeploymentBase(tool.figure.src)} alt={tool.figure.alt} width="1600" height="1000" loading="lazy" decoding="async" />
    </div>
    <figcaption>{tool.figure.label}</figcaption>
  </figure>;
}

type FilterOption = { id: string; label: string };

function FilterSelect({ value, onChange, controls, title, label, options }: {
  value: string;
  onChange: (value: string) => void;
  controls: string;
  title: string;
  label: string;
  options: FilterOption[];
}) {
  return <label className="nsf-filter-group">
    <span className="nsf-filter-title">{title}</span>
    <span className="nsf-filter-select">
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} aria-controls={controls}>
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
      <ChevronDown aria-hidden="true" focusable="false" />
    </span>
  </label>;
}

function ToolCard({ tool }: { tool: AptoTool }) {
  const participant = participantFor(tool.participantId);
  return <article className="nsf-tool-card">
    <div className="nsf-tool-copy">
      <header className="nsf-tool-heading">
        {participant && <ParticipantMark participant={participant} size="compact" />}
        <div className="nsf-tool-title-group">
          <p className="nsf-tool-context"><strong>{participant?.displayName ?? tool.participantId}</strong><span aria-hidden="true"> · </span><span>{tool.statusLabel}</span></p>
          <h2>{tool.name}</h2>
        </div>
      </header>
      <p className="nsf-tool-description">{tool.description}</p>
      <p className="nsf-tool-use-case"><strong>{aptoInterface.tools.useCaseLabel}</strong> {tool.useCase}</p>
      <ul className="nsf-tool-categories" aria-label={aptoInterface.tools.categoriesLabel}>
        {tool.categories.map((category) => <li key={category}>{category}</li>)}
      </ul>
      <footer>
        {tool.toolUrl && <ExternalLink href={tool.toolUrl}>{aptoInterface.tools.openToolLabel}</ExternalLink>}
        {tool.demoVideoUrl && <ExternalLink href={tool.demoVideoUrl}>{aptoInterface.tools.watchDemoLabel}</ExternalLink>}
        {participant && <ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>}
      </footer>
    </div>
    <ToolFigure tool={tool} />
  </article>;
}

function ToolsSection({ id, pageHeading = false }: { id: string; pageHeading?: boolean }) {
  const [participant, setParticipant] = useState("all");
  const [category, setCategory] = useState("all");
  const listId = `${id}-tool-list`;
  const copy = copyFor("tools");
  const organizationOptions = [
    { id: "all", label: aptoInterface.tools.allOrganizationsLabel },
    ...aptoParticipants.map((item) => ({ id: item.id, label: item.displayName })),
  ];
  const categoryOptions = [
    { id: "all", label: aptoInterface.tools.allCategoriesLabel },
    ...aptoProgram.outcomes.map((outcome) => ({ id: outcome.name, label: outcome.name })),
  ];
  const tools = aptoTools.filter((tool) => (
    (participant === "all" || tool.participantId === participant)
    && (category === "all" || tool.categories.includes(category as (typeof tool.categories)[number]))
  ));

  return <section className="nsf-tools-section" id={`${id}-tools`} aria-labelledby={`${id}-tools-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.introduction} id={`${id}-tools-title`} pageHeading={pageHeading} />
    <div className="nsf-filter-groups" role="group" aria-label={aptoInterface.accessibility.toolFiltersLabel}>
      <FilterSelect title={aptoInterface.tools.organizationFilterLabel} value={participant} onChange={setParticipant} controls={listId} label={aptoInterface.tools.organizationFilterAriaLabel} options={organizationOptions} />
      <FilterSelect title={aptoInterface.tools.categoryFilterLabel} value={category} onChange={setCategory} controls={listId} label={aptoInterface.tools.categoryFilterAriaLabel} options={categoryOptions} />
      <p className="nsf-filter-status" aria-live="polite">{aptoInterface.tools.showingPrefix} {tools.length} {tools.length === 1 ? aptoInterface.tools.toolSingular : aptoInterface.tools.toolPlural}</p>
    </div>
    {tools.length > 0
      ? <div className="nsf-tool-grid" id={listId}>{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
      : <div className="nsf-tool-empty" id={listId}><h2>{aptoInterface.tools.emptyTitle}</h2><p>{aptoInterface.tools.emptyDescription}</p></div>}
  </section>;
}

function PersonCard({ person }: { person: AptoPerson | AptoProgramPerson }) {
  return <article className="nsf-person-card">
    {person.headshotUrl
      ? <img src={withDeploymentBase(person.headshotUrl)} alt={person.headshotAlt} />
      : <div className="nsf-headshot-placeholder" aria-hidden="true"><span>{person.initials}</span></div>}
    <div>
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      {person.profileUrl && <ExternalLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</ExternalLink>}
    </div>
  </article>;
}

function CohortPeopleSection({ id, pageHeading = false }: { id: string; pageHeading?: boolean }) {
  const copy = copyFor("cohort");
  return <section className="nsf-cohort-people" id={`${id}-cohort`} aria-labelledby={`${id}-cohort-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.introduction} id={`${id}-cohort-title`} pageHeading={pageHeading} />
    <section className="nsf-program-leadership" aria-labelledby={`${id}-program-leadership-title`}>
      <header><p>{aptoInterface.people.programTeamEyebrow}</p><h2 id={`${id}-program-leadership-title`}>{aptoInterface.people.programTeamTitle}</h2></header>
      <div>{aptoProgram.programTeam.map((person) => <PersonCard key={person.name} person={person} />)}</div>
    </section>
    <header className="nsf-cohort-directory-heading">
      <p>{aptoInterface.home.cohortEyebrow}</p>
      <h2>{aptoInterface.home.cohortTitle}</h2>
    </header>
    <div className="nsf-cohort-directory">
      {aptoParticipants.map((participant) => {
        const project = projectForParticipant(participant.id);
        return <section className="nsf-cohort-group" id={`participant-${participant.id}`} key={participant.id} aria-labelledby={`${id}-cohort-${participant.id}`}>
          <header className="nsf-cohort-group-header">
            <ParticipantMark participant={participant} size="feature" />
            <div className="nsf-cohort-identity-copy"><p>{participant.location}</p><h2 id={`${id}-cohort-${participant.id}`}>{participant.displayName}</h2>{project && <span>{project.shortName}</span>}</div>
            <ExternalLink className="nsf-cohort-website" href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>
          </header>
          <div className="nsf-cohort-team">{participant.people.map((person) => <PersonCard key={person.name} person={person} />)}</div>
        </section>;
      })}
    </div>
  </section>;
}

function NsfAcknowledgementFooter({ id }: { id: string }) {
  return <footer className="nsf-program-footer">
    <div className="nsf-footer-brand"><div><strong>{aptoProgram.acronym}</strong><span>{aptoProgram.name}</span></div></div>
    <div className="nsf-acknowledgement">
      <div className="nsf-funder-mark">
        <a href={aptoInterface.footer.nsfWebsiteUrl} aria-label={aptoInterface.footer.nsfWebsiteAriaLabel}>
          <img src={withDeploymentBase(aptoInterface.footer.nsfLogoSrc)} width="64" height="64" alt={aptoInterface.footer.nsfLogoAlt} />
        </a>
        <div><strong>{aptoInterface.footer.supportTitle}</strong><span>{aptoInterface.footer.supportDescription}</span></div>
      </div>
      <div className="nsf-funder-copy"><strong>{aptoInterface.footer.disclaimerTitle}</strong><p>{aptoBoilerplate}</p></div>
    </div>
    <nav aria-label={aptoInterface.accessibility.footerNavigationLabel}>
      {aptoInterface.primaryNavigation.map((link) => <a key={link.section} href={aptoHref(link.section)}>{link.label}</a>)}
      <a href={`#${id}-main`}>{aptoInterface.footer.backToTopLabel} ↑</a>
    </nav>
  </footer>;
}

function AptoSectionBody({ id, section }: { id: string; section: AptoSection }) {
  switch (section) {
    case "home": return <HomePage id={id} />;
    case "about": return <ProgramOverview id={id} pageHeading />;
    case "cohort": return <CohortPeopleSection id={id} pageHeading />;
    case "projects": return <ProjectsSection id={id} pageHeading />;
    case "tools": return <ToolsSection id={id} pageHeading />;
  }
}

export function AptoSitePage({ section }: { section: AptoSection }) {
  const instanceId = "apto";
  const { theme, toggleTheme } = useAptoTheme("light");
  return <div className="concept concept-apto nsf-apto is-routed">
    <a className="nsf-skip-link" href={`#${instanceId}-main`}>{aptoInterface.accessibility.skipLinkLabel}</a>
    <NsfProgramHeader activeSection={section} theme={theme} onToggle={toggleTheme} />
    <main id={`${instanceId}-main`} tabIndex={-1}><AptoSectionBody id={instanceId} section={section} /></main>
    <NsfAcknowledgementFooter id={instanceId} />
  </div>;
}
