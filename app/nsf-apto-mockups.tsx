"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoMockTools,
  aptoPages,
  aptoParticipants,
  aptoProgram,
  aptoProjects,
} from "./nsf-apto-data";

export type NsfAptoMockupId = "nsfhome" | "nsfledger" | "nsfnetwork";
export type NsfAptoSection = "home" | "about" | "cohort" | "people" | "projects" | "tools";

type AptoProject = (typeof aptoProjects)[number];
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoTool = (typeof aptoMockTools)[number];
type AptoPerson = AptoProject["people"][number];
type NsfDirection = "home" | "ledger" | "network";

const sectionPath: Record<NsfAptoSection, string> = {
  home: "",
  about: "about",
  cohort: "cohort",
  people: "people",
  projects: "projects",
  tools: "tools",
};

const pageSlug: Record<NsfAptoSection, string> = {
  home: "/",
  about: "/about",
  cohort: "/cohort",
  people: "/people",
  projects: "/projects",
  tools: "/tools",
};

const directionFor = (id: NsfAptoMockupId): NsfDirection => id === "nsfledger" ? "ledger" : id === "nsfnetwork" ? "network" : "home";

function aptoHref(section: NsfAptoSection, id: NsfAptoMockupId) {
  const path = sectionPath[section];
  return `/apto${path ? `/${path}` : ""}?concept=${id}`;
}

function copyFor(section: NsfAptoSection) {
  return aptoPages.find((page) => page.slug === pageSlug[section]) ?? {
    slug: pageSlug[section],
    navLabel: section === "home" ? "Home" : section[0].toUpperCase() + section.slice(1),
    eyebrow: "APTO",
    title: aptoProgram.title,
    introduction: aptoProgram.shortSummary,
  };
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function displayRecord(value: unknown) {
  if (typeof value === "string") return { label: value, description: "" };
  if (!value || typeof value !== "object") return { label: String(value ?? ""), description: "" };
  const record = value as Record<string, unknown>;
  const label = record.label ?? record.name ?? record.title ?? record.value ?? "";
  const description = record.description ?? record.detail ?? record.note ?? "";
  return { label: String(label), description: String(description) };
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

function FilterBar({
  value,
  onChange,
  controls,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  controls: string;
  label: string;
}) {
  const options = [
    { id: "all", label: "All organizations" },
    ...aptoParticipants.map((participant) => ({ id: participant.id, label: participant.displayName })),
  ];

  const handleKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const last = options.length - 1;
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
    onChange(options[next].id);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[next]?.focus();
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
    title={`${participant.displayName} mark — mockup use pending participant approval`}
  >
    <img src={logo.src} width={logo.width} height={logo.height} alt="" />
  </span>;
}

function NsfDirectionStudyBar({ id, section }: { id: NsfAptoMockupId; section: NsfAptoSection }) {
  const directions: Array<{ id: NsfAptoMockupId; label: string; note: string }> = [
    { id: "nsfnetwork", label: "Cohort network", note: "Organization-first" },
    { id: "nsfledger", label: "Evidence ledger", note: "Editorial index" },
    { id: "nsfhome", label: "Program home", note: "Institutional clarity" },
  ];

  return <aside className="nsf-direction-bar" aria-label="APTO design directions">
    <Link href="/">All design directions</Link>
    <nav aria-label="Switch APTO design direction">
      {directions.map((direction) => <a
        key={direction.id}
        href={aptoHref(section, direction.id)}
        aria-current={direction.id === id ? "page" : undefined}
      ><strong>{direction.label}</strong><span>{direction.note}</span></a>)}
    </nav>
  </aside>;
}

function NsfProgramHeader({ id, activeSection }: { id: NsfAptoMockupId; activeSection: NsfAptoSection }) {
  const links: Array<[string, NsfAptoSection]> = [
    ["Program", "about"],
    ["Projects", "projects"],
    ["Tools", "tools"],
    ["People", "people"],
    ["Cohort", "cohort"],
  ];

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
      <nav aria-label="Primary navigation">
        {links.map(([label, section]) => <a
          key={section}
          href={aptoHref(section, id)}
          aria-current={activeSection === section ? "page" : undefined}
        >{label}</a>)}
      </nav>
    </header>;
}

function CompactProgramHero({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  const homeCopy = copyFor("home");
  return <section className="nsf-program-hero" aria-labelledby={`${id}-title`}>
    <div className="nsf-hero-copy">
      <p className="nsf-eyebrow">{homeCopy.eyebrow}</p>
      <h1 id={`${id}-title`}>{homeCopy.title}</h1>
      <p className="nsf-hero-summary">{homeCopy.introduction}</p>
      <div className="nsf-hero-actions">
        <a className="nsf-primary-action" href={aptoHref("projects", id)}>Explore the projects <span aria-hidden="true">→</span></a>
        <a href={aptoHref("about", id)}>How the program works <span aria-hidden="true">↗</span></a>
      </div>
      <dl className="nsf-hero-facts">
        {aptoProgram.stats.map((stat) => {
          const item = displayStat(stat);
          return <div key={`${item.value}-${item.label}`}><dt>{item.value}</dt><dd><span>{item.label}</span>{item.detail && <small>{item.detail}</small>}</dd></div>;
        })}
      </dl>
    </div>
    {direction === "network" ? <figure className="nsf-network-hero-art">
      <img src="/apto/nsf-network-art.png" alt="Abstract illustration of research organizations connected through a shared evidence network" />
      <figcaption>Independent research teams connected by a shared question about technology outcomes.</figcaption>
    </figure> : <aside className="nsf-hero-program-note" aria-label="APTO outcome framework">
      <div className="nsf-outcome-lens">
        {aptoProgram.outcomes.map((outcome) => <span key={displayRecord(outcome).label}>{displayRecord(outcome).label}</span>)}
        <strong>APTO</strong>
      </div>
      <p>Connecting evidence about what technologies can do, how they are produced, and how they are used.</p>
    </aside>}
  </section>;
}

function CohortIdentityStage({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  return <section className={`nsf-cohort-stage is-${direction}`} aria-labelledby={`${id}-cohort-stage-title`}>
    <header>
      <p>Participating organizations</p>
      <h2 id={`${id}-cohort-stage-title`}>Five distinct teams, presented with equal visual weight</h2>
      <a href={aptoHref("cohort", id)}>Meet the full cohort <span aria-hidden="true">→</span></a>
    </header>
    <div className="nsf-cohort-canvas">
      {direction === "network" && <div className="nsf-network-core" aria-hidden="true"><strong>APTO</strong><span>shared evidence</span></div>}
      {aptoParticipants.map((participant) => {
        const project = projectForParticipant(participant.id);
        return <a
          className="nsf-cohort-identity"
          key={participant.id}
          href={`${aptoHref("cohort", id)}#participant-${participant.id}`}
        >
          <ParticipantMark
            participant={participant}
            size={direction === "network" ? "feature" : "directory"}
            tone={direction === "network" ? "dark" : "light"}
          />
          <span><strong>{participant.displayName}</strong><small>{project?.shortName}</small></span>
        </a>;
      })}
    </div>
    <p className="nsf-logo-disclosure">Organization marks are website-sourced mockup assets. Final artwork and permission should be confirmed with every participant before production release.</p>
  </section>;
}

function HomePathways({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  const pathways: Array<{ section: Exclude<NsfAptoSection, "home">; title: string; description: string }> = [
    { section: "about", title: "Program", description: "The shared outcome framework, research scope, and open-access commitments." },
    { section: "cohort", title: "Cohort", description: "Participating organizations, legal awardees, projects, and official links." },
    { section: "people", title: "People", description: "Principal investigators and co-principal investigators across the program." },
    { section: "projects", title: "Projects", description: "The active APTO awards and the questions each team is pursuing." },
    { section: "tools", title: "Tools", description: "Illustrative interfaces for future datasets, models, and exploration tools." },
  ];

  return <nav className={`nsf-home-pathways is-${direction}`} aria-label="Explore APTO">
    {pathways.map((pathway) => <a key={pathway.section} href={aptoHref(pathway.section, id)}>
      <span><strong>{pathway.title}</strong><small>{pathway.description}</small></span>
      <i aria-hidden="true">↗</i>
    </a>)}
  </nav>;
}

function HomePage({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  return <>
    <CompactProgramHero id={id} direction={direction} />
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

function ProgramOverview({ id, ledger = false, pageHeading = false }: { id: NsfAptoMockupId; ledger?: boolean; pageHeading?: boolean }) {
  const copy = copyFor("about");
  return <section className={`nsf-program-overview ${ledger ? "is-ledger" : ""}`} id={`${id}-about`} aria-labelledby={`${id}-about-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.introduction}
      id={`${id}-about-title`}
      pageHeading={pageHeading}
    />
    <div className="nsf-overview-framework">
      <article className="nsf-framework-block">
        <h2>Three outcome types</h2>
        <div className="nsf-framework-items">
          {aptoProgram.outcomes.map((outcome) => {
            const item = displayRecord(outcome);
            return <div key={item.label}><strong>{item.label}</strong>{item.description && <p>{item.description}</p>}</div>;
          })}
        </div>
      </article>
      <article className="nsf-framework-block">
        <h2>Two lines of effort</h2>
        <div className="nsf-framework-items">
          {aptoProgram.linesOfEffort.map((line) => {
            const item = displayRecord(line);
            return <div key={item.label}><strong>{item.label}</strong>{item.description && <p>{item.description}</p>}</div>;
          })}
        </div>
      </article>
    </div>
  </section>;
}

function ProjectPeopleList({ people }: { people: readonly AptoPerson[] }) {
  return <ul className="nsf-project-people" aria-label="Project investigators">
    {people.map((person) => <li key={person.name}>
      <span aria-hidden="true">{person.initials}</span>
      <div><strong>{person.name}</strong><small>{person.role}</small></div>
    </li>)}
  </ul>;
}

function ProjectTags({ values, label }: { values: readonly unknown[]; label: string }) {
  return <div className="nsf-tag-group" role="group" aria-label={label}>{values.map((value) => {
    const item = displayRecord(value);
    const displayLabel = item.label === "models"
      ? "Technology Outcome Models"
      : item.label === "data-tools"
        ? "Data Sets and Tools"
        : item.label;
    return <span key={item.label}>{displayLabel}</span>;
  })}</div>;
}

function projectEffortLabels(project: AptoProject) {
  return project.linesOfEffort.map((effort) => aptoProgram.linesOfEffort.find((line) => line.id === effort)?.title ?? effort);
}

function ProjectCard({ project }: { project: AptoProject }) {
  const participant = participantFor(project.participantId);
  return <article className="nsf-project-card" id={`nsf-award-${project.awardId}`}>
    <header className="nsf-project-heading">
      {participant
        ? <ParticipantMark participant={participant} size="directory" tone="light" />
        : <span className="nsf-participant-mark is-directory is-fallback tone-light" aria-hidden="true">{participantMonogram(project.organization)}</span>}
      <div>
        <p className="nsf-project-context">{project.organization} <span aria-hidden="true">·</span> {project.location}</p>
        <h2>{project.officialTitle}</h2>
        <p className="nsf-project-record">NSF award {project.awardId} <span aria-hidden="true">·</span> {project.startDate}—{project.endDate}</p>
      </div>
    </header>
    <div className="nsf-project-body">
      <p className="nsf-project-summary">{project.summary}</p>
      <div className="nsf-project-taxonomy"><ProjectTags values={project.outcomes} label="Outcome types" /><ProjectTags values={projectEffortLabels(project)} label="Lines of effort" /></div>
      <ProjectPeopleList people={project.people} />
      <dl className="nsf-award-funding">
        <div><dt>Legal awardee</dt><dd>{project.legalAwardeeName}</dd></div>
        <div><dt>Agreement</dt><dd>{project.agreementType}</dd></div>
        <div><dt>Current obligated amount</dt><dd>{moneyFormatter.format(project.funding.obligatedAmount)}</dd></div>
        <div><dt>NSF estimated total</dt><dd>{moneyFormatter.format(project.funding.estimatedTotalAmount)}</dd></div>
        <div><dt>NSF data as of</dt><dd>{project.funding.dataAsOfLabel}</dd></div>
      </dl>
      {project.funding.caveat && <p className="nsf-data-caveat">{project.funding.caveat}</p>}
      <footer>
        <ExternalLink href={project.awardUrl}>Official award record</ExternalLink>
        <ExternalLink href={project.apiUrl}>Award API record</ExternalLink>
        {participant && <ExternalLink href={participant.website}>{participant.displayName} website</ExternalLink>}
      </footer>
    </div>
  </article>;
}

function ProjectLedgerRow({ project }: { project: AptoProject }) {
  const participant = participantFor(project.participantId);
  return <details className="nsf-project-ledger-row">
    <summary>
      {participant && <ParticipantMark participant={participant} size="compact" tone="light" />}
      <strong>{project.shortName}</strong>
      <small>{participant?.displayName ?? project.organization}</small>
      <span>NSF award {project.awardId}</span>
      <i aria-hidden="true">+</i>
    </summary>
    <div className="nsf-ledger-detail">
      <header><h2>{project.officialTitle}</h2><p>{project.organization} · {project.location} · {project.startDate}—{project.endDate}</p></header>
      <p>{project.summary}</p>
      <div className="nsf-ledger-taxonomy"><ProjectTags values={project.outcomes} label="Outcome types" /><ProjectTags values={projectEffortLabels(project)} label="Lines of effort" /></div>
      <ProjectPeopleList people={project.people} />
      <dl className="nsf-award-funding">
        <div><dt>Legal awardee</dt><dd>{project.legalAwardeeName}</dd></div>
        <div><dt>Agreement</dt><dd>{project.agreementType}</dd></div>
        <div><dt>Current obligated amount</dt><dd>{moneyFormatter.format(project.funding.obligatedAmount)}</dd></div>
        <div><dt>NSF estimated total</dt><dd>{moneyFormatter.format(project.funding.estimatedTotalAmount)}</dd></div>
        <div><dt>NSF data as of</dt><dd>{project.funding.dataAsOfLabel}</dd></div>
      </dl>
      {project.funding.caveat && <p className="nsf-data-caveat">{project.funding.caveat}</p>}
      <div className="nsf-ledger-actions"><ExternalLink href={project.awardUrl}>Official award record</ExternalLink><ExternalLink href={project.apiUrl}>Award API record</ExternalLink>{participant && <ExternalLink href={participant.website}>Participant website</ExternalLink>}</div>
    </div>
  </details>;
}

function ProjectsSection({ id, ledger = false, pageHeading = false }: { id: NsfAptoMockupId; ledger?: boolean; pageHeading?: boolean }) {
  const copy = copyFor("projects");

  return <section className={`nsf-projects-section ${ledger ? "is-ledger" : ""}`} id={`${id}-projects`} aria-labelledby={`${id}-projects-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={ledger ? "The project evidence ledger" : copy.title}
      description={copy.introduction}
      id={`${id}-projects-title`}
      pageHeading={pageHeading}
    />
    <div className={ledger ? "nsf-project-ledger" : "nsf-project-grid"} id={`${id}-project-list`}>
      {aptoProjects.map((project) => ledger
        ? <ProjectLedgerRow key={project.awardId} project={project} />
        : <ProjectCard key={project.awardId} project={project} />)}
    </div>
  </section>;
}

function ToolFigure({ tool }: { tool: AptoTool }) {
  return <figure className={`nsf-tool-figure is-${tool.figure.kind}`}>
    <div role="img" aria-label={tool.figure.alt}>
      <span /><span /><span /><span /><span /><span />
    </div>
    <figcaption>{tool.figure.label}</figcaption>
  </figure>;
}

function ToolCard({ tool }: { tool: AptoTool }) {
  const participant = participantFor(tool.participantId);
  return <article className="nsf-tool-card">
    <div className="nsf-tool-copy">
      <header className="nsf-tool-heading">
        <h2>{tool.name}</h2>
        <div className="nsf-tool-context">
          {participant && <ParticipantMark participant={participant} size="compact" tone="dark" />}
          <p>A concept by <strong>{participant?.displayName ?? tool.organizationId}</strong><span aria-hidden="true"> · </span><span>{tool.status}</span></p>
        </div>
      </header>
      <p className="nsf-tool-description">{tool.description}</p>
      <dl className="nsf-tool-availability">
        <div><dt>Demo video</dt><dd>{tool.demoVideoUrl ? <ExternalLink href={tool.demoVideoUrl}>Watch with captions</ExternalLink> : "Forthcoming — captions and transcript planned"}</dd></div>
        <div><dt>Tool link</dt><dd>{tool.toolUrl ? <ExternalLink href={tool.toolUrl}>Open tool</ExternalLink> : "Forthcoming"}</dd></div>
      </dl>
      <footer>
        <ExternalLink href={tool.organizationUrl}>Organization website</ExternalLink>
        <ExternalLink href={tool.awardUrl}>NSF award record</ExternalLink>
      </footer>
    </div>
    <ToolFigure tool={tool} />
  </article>;
}

function ToolsSection({ id, register = false, pageHeading = false }: { id: NsfAptoMockupId; register?: boolean; pageHeading?: boolean }) {
  const [participant, setParticipant] = useState("all");
  const tools = participant === "all" ? aptoMockTools : aptoMockTools.filter((tool) => tool.participantId === participant);
  const listId = `${id}-tool-list`;
  const copy = copyFor("tools");

  return <section className={`nsf-tools-section ${register ? "is-register" : ""}`} id={`${id}-tools`} aria-labelledby={`${id}-tools-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={register ? "A proposed tool register" : copy.title}
      description={copy.introduction}
      id={`${id}-tools-title`}
      pageHeading={pageHeading}
    />
    <div className="nsf-mockup-disclosure" role="note"><strong>Mock content</strong><span>Nothing in this section should be interpreted as a released tool, validated model, or APTO finding.</span></div>
    <FilterBar value={participant} onChange={setParticipant} controls={listId} label="Filter tool concepts by participant" />
    <p className="nsf-filter-status" aria-live="polite">{participant === "all" ? "Showing all concept tools · alphabetical by name" : `Showing concept tools for ${participantFor(participant)?.displayName ?? participant}`}</p>
    <div className="nsf-tool-grid" id={listId}>{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
  </section>;
}

function PersonCard({ person, participant, awardId }: { person: AptoPerson; participant: AptoParticipant; awardId: string }) {
  return <article className="nsf-person-card">
    {person.headshotUrl
      ? <img src={person.headshotUrl} alt={person.headshotAlt} />
      : <div className="nsf-headshot-placeholder" aria-hidden="true"><span>{person.initials}</span></div>}
    <div>
      <p className="nsf-person-context">{participant.displayName} <span aria-hidden="true">·</span> Award {awardId}</p>
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      <span>{person.headshotUrl ? "Project profile" : "Portrait forthcoming"}</span>
      {person.profileUrl && <ExternalLink href={person.profileUrl}>View profile</ExternalLink>}
    </div>
  </article>;
}

function PeopleSection({ id, pageHeading = false }: { id: NsfAptoMockupId; pageHeading?: boolean }) {
  const copy = copyFor("people");
  return <section className="nsf-people-section" id={`${id}-people`} aria-labelledby={`${id}-people-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.introduction}
      id={`${id}-people-title`}
      pageHeading={pageHeading}
    />
    <div className="nsf-people-groups">
      {aptoParticipants.map((participant) => <section key={participant.id} aria-labelledby={`${id}-people-${participant.id}`}>
        <header><div className="nsf-people-identity"><ParticipantMark participant={participant} size="compact" tone="light" /><h2 id={`${id}-people-${participant.id}`}>{participant.displayName}</h2></div><ExternalLink href={participant.website}>Organization website</ExternalLink></header>
        <div>{participant.people.map((person) => <PersonCard key={person.name} person={person} participant={participant} awardId={participant.awardId} />)}</div>
      </section>)}
    </div>
  </section>;
}

function ParticipantDirectory({ id, prominent = false, pageHeading = false }: { id: NsfAptoMockupId; prominent?: boolean; pageHeading?: boolean }) {
  const copy = copyFor("cohort");
  return <section className={`nsf-participants-section ${prominent ? "is-prominent" : ""}`} id={`${id}-participants`} aria-labelledby={`${id}-participants-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={prominent ? "The organizations behind the APTO cohort" : copy.title}
      description={copy.introduction}
      id={`${id}-participants-title`}
      pageHeading={pageHeading}
    />
    <p className="nsf-logo-disclosure">Marks shown here come from participant websites or official university brand resources. Their use is provisional and requires participant confirmation before a production launch.</p>
    <div className="nsf-participant-directory">
      {aptoParticipants.map((participant) => {
        const project = projectForParticipant(participant.id);
        return <article className="nsf-participant-entry" id={`participant-${participant.id}`} key={participant.id}>
          <ParticipantMark participant={participant} size="feature" tone={prominent ? "dark" : "light"} />
          <div className="nsf-participant-profile">
            <header className="nsf-participant-heading">
              <p className="nsf-participant-context">{participant.kind} <span aria-hidden="true">·</span> {participant.location}</p>
              <h2>{participant.displayName}</h2>
              <p className="nsf-participant-legal-name">{participant.legalName}</p>
            </header>
            {project && <div className="nsf-participant-project"><strong>{project.shortName}</strong></div>}
            <footer className="nsf-participant-links">
              <ExternalLink href={participant.website}>Organization website</ExternalLink>
              {project && <ExternalLink href={project.awardUrl}>NSF award record</ExternalLink>}
            </footer>
          </div>
        </article>;
      })}
    </div>
  </section>;
}

function NsfAcknowledgementFooter({ id }: { id: NsfAptoMockupId }) {
  return <footer className="nsf-program-footer">
    <div className="nsf-footer-brand">
      <div><strong>{aptoProgram.acronym}</strong><span>{aptoProgram.name}</span></div>
    </div>
    <div className="nsf-acknowledgement">
      <div className="nsf-funder-mark">
        <a href="https://www.nsf.gov/" aria-label="Visit the U.S. National Science Foundation website">
          <img src="/apto/nsf-logo.png" width="64" height="64" alt="U.S. National Science Foundation logo" />
        </a>
        <div><strong>Supported by the U.S. National Science Foundation</strong><span>APTO is a portfolio of NSF-supported research projects.</span></div>
      </div>
      <div className="nsf-funder-copy"><strong>NSF acknowledgement and disclaimer</strong><p>{aptoBoilerplate}</p></div>
    </div>
    <nav aria-label="Footer navigation"><a href={`#${id}-main`}>Back to top ↑</a><a href={aptoHref("home", id)}>Home</a><a href={aptoHref("about", id)}>Program</a></nav>
  </footer>;
}

function NsfSectionBody({ id, section, direction }: { id: NsfAptoMockupId; section: NsfAptoSection; direction: NsfDirection }) {
  switch (section) {
    case "home": return <HomePage id={id} direction={direction} />;
    case "about": return <ProgramOverview id={id} ledger={direction === "ledger"} pageHeading />;
    case "cohort": return <ParticipantDirectory id={id} prominent={direction === "network"} pageHeading />;
    case "people": return <PeopleSection id={id} pageHeading />;
    case "projects": return <ProjectsSection id={id} ledger={direction === "ledger"} pageHeading />;
    case "tools": return <ToolsSection id={id} register={direction === "ledger"} pageHeading />;
  }
}

export function NsfAptoPage({
  id,
  section,
  embedded = false,
}: {
  id: NsfAptoMockupId;
  section: NsfAptoSection;
  embedded?: boolean;
}) {
  const direction = directionFor(id);
  return <div className={`concept concept-${id} nsf-apto nsf-apto-${direction} ${embedded ? "is-embedded" : "is-routed"}`}>
    {!embedded && <a className="nsf-skip-link" href={`#${id}-main`}>Skip to main content</a>}
    {!embedded && <NsfDirectionStudyBar id={id} section={section} />}
    <NsfProgramHeader id={id} activeSection={section} />
    <main id={`${id}-main`} tabIndex={-1}>
      <NsfSectionBody id={id} section={section} direction={direction} />
    </main>
    <NsfAcknowledgementFooter id={id} />
  </div>;
}

export function NsfAptoMockup({ id }: { id: NsfAptoMockupId }) {
  useEffect(() => {
    const match = window.location.hash.match(/^#(nsfhome|nsfledger|nsfnetwork)-(about|cohort|participants|people|projects|sources|tools)$/);
    if (!match || match[1] !== id) return;

    const legacySection = match[2] === "participants"
      ? "cohort"
      : match[2] === "sources"
        ? "home"
        : match[2];
    window.location.replace(aptoHref(legacySection as NsfAptoSection, id));
  }, [id]);

  return <NsfAptoPage id={id} section="home" embedded />;
}

export default NsfAptoMockup;
