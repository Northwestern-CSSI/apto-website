"use client";

import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";
import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoInterface,
  aptoMockTools,
  aptoPages,
  aptoParticipants,
  aptoProgram,
  aptoProjects,
} from "./nsf-apto-data";

export type NsfAptoMockupId =
  | "nsfhome"
  | "nsfhomewidgets"
  | "nsfledger"
  | "nsfledgerwidgets"
  | "nsfnetwork"
  | "nsfnetworkwidgets";
export type NsfAptoSection = "home" | "about" | "cohort" | "projects" | "tools";

type AptoProject = (typeof aptoProjects)[number];
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoTool = (typeof aptoMockTools)[number];
type AptoPerson = AptoProject["people"][number];
type AptoProgramPerson = (typeof aptoProgram.programTeam)[number];
type NsfDirection = "home" | "network";

const sectionPath: Record<NsfAptoSection, string> = {
  home: "",
  about: "about",
  cohort: "cohort",
  projects: "projects",
  tools: "tools",
};

const pageSlug: Record<NsfAptoSection, string> = {
  home: "/",
  about: "/about",
  cohort: "/cohort",
  projects: "/projects",
  tools: "/tools",
};

const directionFor = (id: NsfAptoMockupId): NsfDirection => id.startsWith("nsfnetwork") ? "network" : "home";
const canonicalId = (id: NsfAptoMockupId): NsfAptoMockupId => directionFor(id) === "network" ? "nsfnetwork" : "nsfhome";

function aptoHref(section: NsfAptoSection, id: NsfAptoMockupId) {
  const path = sectionPath[section];
  return `/apto${path ? `/${path}` : ""}?concept=${canonicalId(id)}`;
}

function copyFor(section: NsfAptoSection) {
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

function displayStat(value: unknown) {
  if (!value || typeof value !== "object") return { value: String(value ?? ""), label: "", detail: "" };
  const record = value as Record<string, unknown>;
  return {
    value: String(record.value ?? record.number ?? ""),
    label: String(record.label ?? record.name ?? record.detail ?? ""),
    detail: String(record.detail ?? record.note ?? ""),
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
  tone,
}: {
  participant: AptoParticipant;
  size?: "compact" | "directory" | "feature";
  tone: "light" | "dark";
}) {
  const logo = participant.logo;
  return <span
    className={`nsf-participant-mark is-${size} is-${logo.kind} tone-${tone} asset-on-${logo.surface} logo-${participant.id}`}
    aria-hidden="true"
  >
    <img src={logo.src} width={logo.width} height={logo.height} alt="" />
  </span>;
}

function NsfThemeSwitch({ id, section }: { id: NsfAptoMockupId; section: NsfAptoSection }) {
  const current = directionFor(id);
  const lightLabel = aptoInterface.directions.find((direction) => direction.id === "nsfhome")?.label;
  const darkLabel = aptoInterface.directions.find((direction) => direction.id === "nsfnetwork")?.label;
  if (!lightLabel || !darkLabel) throw new Error("Missing APTO theme labels in Markdown content");
  return <nav className="nsf-theme-switch" aria-label={aptoInterface.study.themeChooserLabel}>
    <a href={aptoHref(section, "nsfhome")} aria-current={current === "home" ? "true" : undefined}>
      <Sun aria-hidden="true" focusable="false" />
      <span>{lightLabel}</span>
    </a>
    <a href={aptoHref(section, "nsfnetwork")} aria-current={current === "network" ? "true" : undefined}>
      <Moon aria-hidden="true" focusable="false" />
      <span>{darkLabel}</span>
    </a>
  </nav>;
}

function NsfProgramHeader({ id, activeSection }: { id: NsfAptoMockupId; activeSection: NsfAptoSection }) {
  return <header className="nsf-program-header">
    <div className="nsf-program-brand">
      <a
        className="nsf-apto-wordmark"
        href={aptoHref("home", id)}
        aria-current={activeSection === "home" ? "page" : undefined}
      >
        <strong>{aptoProgram.acronym}</strong>
        <span>{aptoProgram.name}</span>
      </a>
    </div>
    <nav aria-label={aptoInterface.accessibility.primaryNavigationLabel}>
      {aptoInterface.primaryNavigation.map((link) => <a
        key={link.section}
        href={aptoHref(link.section, id)}
        aria-current={activeSection === link.section ? "page" : undefined}
      >{link.label}</a>)}
    </nav>
    <NsfThemeSwitch id={id} section={activeSection} />
  </header>;
}

function CompactProgramHero({ id }: { id: NsfAptoMockupId }) {
  const homeCopy = copyFor("home");
  return <section className="nsf-program-hero" aria-labelledby={`${id}-title`}>
    <div className="nsf-hero-copy">
      <p className="nsf-eyebrow">{homeCopy.eyebrow}</p>
      <h1 id={`${id}-title`}>{homeCopy.title}</h1>
      <p className="nsf-hero-summary">{homeCopy.introduction}</p>
      <div className="nsf-hero-actions">
        <a className="nsf-primary-action" href={aptoHref("projects", id)}>{aptoInterface.home.primaryActionLabel} <span aria-hidden="true">→</span></a>
        <a href={aptoHref("about", id)}>{aptoInterface.home.secondaryActionLabel} <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <dl className="nsf-hero-facts">
      {aptoProgram.stats.map((stat) => {
        const item = displayStat(stat);
        return <div key={`${item.value}-${item.label}`}><dt>{item.value}</dt><dd><span>{item.label}</span>{item.detail && <small>{item.detail}</small>}</dd></div>;
      })}
    </dl>
  </section>;
}

function CohortIdentityStage({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  const tone = direction === "network" ? "dark" : "light";
  return <section className={`nsf-cohort-stage is-${direction}`} aria-labelledby={`${id}-cohort-stage-title`}>
    <header>
      <p>{aptoInterface.home.cohortEyebrow}</p>
      <h2 id={`${id}-cohort-stage-title`}>{aptoInterface.home.cohortTitle}</h2>
      <a href={aptoHref("cohort", id)}>{aptoInterface.home.cohortLinkLabel} <span aria-hidden="true">→</span></a>
    </header>
    <div className="nsf-cohort-canvas">
      {aptoParticipants.map((participant) => {
        const project = projectForParticipant(participant.id);
        return <a className="nsf-cohort-identity" key={participant.id} href={`${aptoHref("cohort", id)}#participant-${participant.id}`}>
          <ParticipantMark participant={participant} size="directory" tone={tone} />
          <span><strong>{participant.displayName}</strong><small>{project?.shortName}</small></span>
        </a>;
      })}
    </div>
  </section>;
}

function HomePathways({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  return <nav className={`nsf-home-pathways is-${direction}`} aria-label={aptoInterface.accessibility.homePathwaysLabel}>
    {aptoInterface.home.pathways.map((pathway) => <a key={pathway.section} href={aptoHref(pathway.section, id)}>
      <span><strong>{pathway.title}</strong><small>{pathway.description}</small></span>
      <i aria-hidden="true">↗</i>
    </a>)}
  </nav>;
}

function HomePage({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  return <>
    <CompactProgramHero id={id} />
    <CohortIdentityStage id={id} direction={direction} />
    <HomePathways id={id} direction={direction} />
  </>;
}

function SectionIntro({ eyebrow, title, description, id, pageHeading = false }: { eyebrow: string; title: string; description: string; id?: string; pageHeading?: boolean }) {
  return <header className="nsf-section-intro">
    <p>{eyebrow}</p>
    {pageHeading ? <h1 id={id}>{title}</h1> : <h2 id={id}>{title}</h2>}
    <span>{description}</span>
  </header>;
}

function ProgramOverview({ id, pageHeading = false }: { id: NsfAptoMockupId; pageHeading?: boolean }) {
  const copy = copyFor("about");
  return <section className="nsf-program-overview" id={`${id}-about`} aria-labelledby={`${id}-about-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.introduction} id={`${id}-about-title`} pageHeading={pageHeading} />
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

function ProjectAccordionItem({ project, tone }: { project: AptoProject; tone: "light" | "dark" }) {
  const participant = participantFor(project.participantId);
  return <details className="nsf-project-accordion" id={`nsf-award-${project.awardId}`}>
    <summary className="nsf-project-summary">
      {participant
        ? <ParticipantMark participant={participant} size="directory" tone={tone} />
        : <span className={`nsf-participant-mark is-directory is-fallback tone-${tone}`} aria-hidden="true">{participantMonogram(project.organization)}</span>}
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

function revealProject(awardId: string) {
  const target = document.getElementById(`nsf-award-${awardId}`);
  if (target instanceof HTMLDetailsElement) target.open = true;
}

function AwardeeMap({ id, tone }: { id: NsfAptoMockupId; tone: "light" | "dark" }) {
  const map = aptoInterface.projects.map;
  return <aside className="nsf-awardee-map" aria-labelledby={`${id}-awardee-map-title`}>
    <header><p>{map.eyebrow}</p><h2 id={`${id}-awardee-map-title`}>{map.title}</h2><span>{map.description}</span></header>
    <figure>
      <div className="nsf-awardee-map-plot">
        <img className="nsf-awardee-map-base" src={map.imageUrl} alt={map.imageAlt} width="960" height="593" loading="lazy" />
        {aptoParticipants.map((participant) => {
          const project = projectForParticipant(participant.id);
          return project ? <a
            className="nsf-awardee-map-pin"
            key={participant.id}
            href={`#nsf-award-${project.awardId}`}
            onClick={() => revealProject(project.awardId)}
            style={{ left: `${participant.mapPosition.x}%`, top: `${participant.mapPosition.y}%`, "--nsf-participant-accent": participant.accent } as CSSProperties}
            aria-label={`${participant.displayName}, ${participant.location}`}
          ><span aria-hidden="true">{participantMonogram(participant.displayName)}</span></a> : null;
        })}
      </div>
      <figcaption>{map.caption}</figcaption>
    </figure>
    <ul className="nsf-awardee-map-legend">
      {aptoParticipants.map((participant) => {
        const project = projectForParticipant(participant.id);
        return project ? <li key={participant.id}>
          <a href={`#nsf-award-${project.awardId}`} onClick={() => revealProject(project.awardId)}>
            <ParticipantMark participant={participant} size="compact" tone={tone} />
            <span><strong>{participant.displayName}</strong><small>{participant.location}</small></span>
          </a>
        </li> : null;
      })}
    </ul>
  </aside>;
}

function ProjectsSection({ id, pageHeading = false }: { id: NsfAptoMockupId; pageHeading?: boolean }) {
  const copy = copyFor("projects");
  const tone = directionFor(id) === "network" ? "dark" : "light";
  const projects = [...aptoProjects].sort((a, b) => a.shortName.localeCompare(b.shortName));
  return <section className="nsf-projects-section" id={`${id}-projects`} aria-labelledby={`${id}-projects-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.introduction} id={`${id}-projects-title`} pageHeading={pageHeading} />
    <div className="nsf-projects-layout">
      <div className="nsf-project-ledger" id={`${id}-project-list`}>
        {projects.map((project) => <ProjectAccordionItem key={project.awardId} project={project} tone={tone} />)}
      </div>
      <AwardeeMap id={id} tone={tone} />
    </div>
  </section>;
}

function ToolFigure({ tool }: { tool: AptoTool }) {
  return <figure className={`nsf-tool-figure is-${tool.figure.kind}`}>
    <div role="img" aria-label={tool.figure.alt}><span /><span /><span /><span /><span /><span /></div>
    <figcaption>{tool.figure.label}</figcaption>
  </figure>;
}

type FilterOption = { id: string; label: string };

function FilterBar({ value, onChange, controls, label, options }: {
  value: string;
  onChange: (value: string) => void;
  controls: string;
  label: string;
  options: FilterOption[];
}) {
  const handleKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const last = options.length - 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? last : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
    onChange(options[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };
  return <div className="nsf-filter" role="group" aria-label={label} data-local-arrows="true">
    {options.map((option, index) => <button
      type="button"
      key={option.id}
      aria-controls={controls}
      aria-pressed={value === option.id}
      className={value === option.id ? "is-active" : undefined}
      onClick={() => onChange(option.id)}
      onKeyDown={(event) => handleKeys(event, index)}
    >{option.label}</button>)}
  </div>;
}

function ToolCard({ tool, tone }: { tool: AptoTool; tone: "light" | "dark" }) {
  const participant = participantFor(tool.participantId);
  return <article className="nsf-tool-card">
    <div className="nsf-tool-copy">
      <header className="nsf-tool-heading">
        <div className="nsf-tool-context">
          {participant && <ParticipantMark participant={participant} size="compact" tone={tone} />}
          <p><strong>{participant?.displayName ?? tool.organizationId}</strong><span aria-hidden="true"> · </span><span>{tool.statusLabel}</span></p>
        </div>
        <h2>{tool.name}</h2>
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

function ToolsSection({ id, pageHeading = false }: { id: NsfAptoMockupId; pageHeading?: boolean }) {
  const [participant, setParticipant] = useState("all");
  const [category, setCategory] = useState("all");
  const tone = directionFor(id) === "network" ? "dark" : "light";
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
  const tools = aptoMockTools.filter((tool) => (
    (participant === "all" || tool.participantId === participant)
    && (category === "all" || tool.categories.includes(category as (typeof tool.categories)[number]))
  ));

  return <section className="nsf-tools-section" id={`${id}-tools`} aria-labelledby={`${id}-tools-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.introduction} id={`${id}-tools-title`} pageHeading={pageHeading} />
    <div className="nsf-filter-groups">
      <div className="nsf-filter-group"><h2 className="nsf-filter-title">{aptoInterface.tools.organizationFilterLabel}</h2><FilterBar value={participant} onChange={setParticipant} controls={listId} label={aptoInterface.tools.organizationFilterAriaLabel} options={organizationOptions} /></div>
      <div className="nsf-filter-group"><h2 className="nsf-filter-title">{aptoInterface.tools.categoryFilterLabel}</h2><FilterBar value={category} onChange={setCategory} controls={listId} label={aptoInterface.tools.categoryFilterAriaLabel} options={categoryOptions} /></div>
    </div>
    <p className="nsf-filter-status" aria-live="polite">{aptoInterface.tools.showingPrefix} {tools.length} {tools.length === 1 ? aptoInterface.tools.toolSingular : aptoInterface.tools.toolPlural}</p>
    {tools.length > 0
      ? <div className="nsf-tool-grid" id={listId}>{tools.map((tool) => <ToolCard key={tool.id} tool={tool} tone={tone} />)}</div>
      : <div className="nsf-tool-empty" id={listId}><h2>{aptoInterface.tools.emptyTitle}</h2><p>{aptoInterface.tools.emptyDescription}</p></div>}
  </section>;
}

function PersonCard({ person }: { person: AptoPerson | AptoProgramPerson }) {
  return <article className="nsf-person-card">
    {person.headshotUrl
      ? <img src={person.headshotUrl} alt={person.headshotAlt} />
      : <div className="nsf-headshot-placeholder" aria-hidden="true"><span>{person.initials}</span></div>}
    <div>
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      {person.profileUrl && <ExternalLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</ExternalLink>}
    </div>
  </article>;
}

function CohortPeopleSection({ id, pageHeading = false }: { id: NsfAptoMockupId; pageHeading?: boolean }) {
  const copy = copyFor("cohort");
  const tone = directionFor(id) === "network" ? "dark" : "light";
  return <section className="nsf-cohort-people" id={`${id}-cohort`} aria-labelledby={`${id}-cohort-title`}>
    <SectionIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.introduction} id={`${id}-cohort-title`} pageHeading={pageHeading} />
    <section className="nsf-program-leadership" aria-labelledby={`${id}-program-leadership-title`}>
      <header><p>{aptoInterface.people.programTeamEyebrow}</p><h2 id={`${id}-program-leadership-title`}>{aptoInterface.people.programTeamTitle}</h2></header>
      <div>{aptoProgram.programTeam.map((person) => <PersonCard key={person.name} person={person} />)}</div>
    </section>
    <div>
      {aptoParticipants.map((participant) => {
        const project = projectForParticipant(participant.id);
        return <section className="nsf-cohort-group" id={`participant-${participant.id}`} key={participant.id} aria-labelledby={`${id}-cohort-${participant.id}`}>
          <header className="nsf-cohort-group-header">
            <ParticipantMark participant={participant} size="feature" tone={tone} />
            <div><p>{participant.location}</p><h2 id={`${id}-cohort-${participant.id}`}>{participant.displayName}</h2>{project && <span>{project.shortName}</span>}</div>
            <ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>
          </header>
          <div className="nsf-cohort-team">{participant.people.map((person) => <PersonCard key={person.name} person={person} />)}</div>
        </section>;
      })}
    </div>
  </section>;
}

function NsfAcknowledgementFooter({ id }: { id: NsfAptoMockupId }) {
  return <footer className="nsf-program-footer">
    <div className="nsf-footer-brand"><div><strong>{aptoProgram.acronym}</strong><span>{aptoProgram.name}</span></div></div>
    <div className="nsf-acknowledgement">
      <div className="nsf-funder-mark">
        <a href={aptoInterface.footer.nsfWebsiteUrl} aria-label={aptoInterface.footer.nsfWebsiteAriaLabel}>
          <img src={aptoInterface.footer.nsfLogoSrc} width="64" height="64" alt={aptoInterface.footer.nsfLogoAlt} />
        </a>
        <div><strong>{aptoInterface.footer.supportTitle}</strong><span>{aptoInterface.footer.supportDescription}</span></div>
      </div>
      <div className="nsf-funder-copy"><strong>{aptoInterface.footer.disclaimerTitle}</strong><p>{aptoBoilerplate}</p></div>
    </div>
    <nav aria-label={aptoInterface.accessibility.footerNavigationLabel}><a href={`#${id}-main`}>{aptoInterface.footer.backToTopLabel} ↑</a><a href={aptoHref("home", id)}>{aptoInterface.footer.homeLinkLabel}</a><a href={aptoHref("about", id)}>{aptoInterface.footer.programLinkLabel}</a></nav>
  </footer>;
}

function NsfSectionBody({ id, section, direction }: { id: NsfAptoMockupId; section: NsfAptoSection; direction: NsfDirection }) {
  switch (section) {
    case "home": return <HomePage id={id} direction={direction} />;
    case "about": return <ProgramOverview id={id} pageHeading />;
    case "cohort": return <CohortPeopleSection id={id} pageHeading />;
    case "projects": return <ProjectsSection id={id} pageHeading />;
    case "tools": return <ToolsSection id={id} pageHeading />;
  }
}

export function NsfAptoPage({ id, section, embedded = false }: { id: NsfAptoMockupId; section: NsfAptoSection; embedded?: boolean }) {
  const direction = directionFor(id);
  return <div className={`concept concept-${canonicalId(id)} nsf-apto nsf-apto-${direction} ${embedded ? "is-embedded" : "is-routed"}`}>
    {!embedded && <a className="nsf-skip-link" href={`#${id}-main`}>{aptoInterface.accessibility.skipLinkLabel}</a>}
    <NsfProgramHeader id={id} activeSection={section} />
    <main id={`${id}-main`} tabIndex={-1}><NsfSectionBody id={id} section={section} direction={direction} /></main>
    <NsfAcknowledgementFooter id={id} />
  </div>;
}

export function NsfAptoMockup({ id }: { id: NsfAptoMockupId }) {
  useEffect(() => {
    const match = window.location.hash.match(/^#(nsfhome(?:widgets)?|nsfledger(?:widgets)?|nsfnetwork(?:widgets)?)-(about|cohort|participants|people|projects|sources|tools)$/);
    if (!match || match[1] !== id) return;
    const legacySection = ["participants", "people"].includes(match[2]) ? "cohort" : match[2] === "sources" ? "home" : match[2];
    window.location.replace(aptoHref(legacySection as NsfAptoSection, id));
  }, [id]);
  return <NsfAptoPage id={id} section="home" embedded />;
}

export default NsfAptoMockup;
