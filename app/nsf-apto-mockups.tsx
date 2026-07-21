"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoMockTools,
  aptoParticipants,
  aptoProgram,
  aptoProjects,
  aptoSources,
} from "./nsf-apto-data";

export type NsfAptoMockupId = "nsfhome" | "nsfledger" | "nsfnetwork";

type AptoProject = (typeof aptoProjects)[number];
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoTool = (typeof aptoMockTools)[number];
type AptoPerson = AptoProject["people"][number];
type NsfDirection = "home" | "ledger" | "network";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const programSourceUrl = aptoSources.find(
  (source) => source.id === "nsf-apto-solicitation",
)?.url ?? "https://www.nsf.gov/funding/opportunities/apto-assessing-predicting-technology-outcomes/506195/nsf23-600/solicitation";

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

function NsfProgramHeader({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  const links = direction === "network"
    ? [["Cohort", "participants"], ["Projects", "projects"], ["Tools", "tools"], ["People", "people"], ["About", "about"]]
    : [["About", "about"], ["Projects", "projects"], ["Tools", "tools"], ["People", "people"], ["Participants", "participants"]];

  return <>
    <a className="nsf-skip-link" href={`#${id}-main`}>Skip to main content</a>
    <header className="nsf-program-header">
      <div className="nsf-program-brand">
        <a className="nsf-apto-wordmark" href={`#${id}-main`}>
          <strong>{aptoProgram.acronym}</strong>
          <span>{aptoProgram.name}</span>
        </a>
      </div>
      <nav aria-label="Primary navigation">
        {links.map(([label, section]) => <a key={section} href={`#${id}-${section}`}>{label}</a>)}
      </nav>
    </header>
  </>;
}

function CompactProgramHero({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  return <section className="nsf-program-hero" aria-labelledby={`${id}-title`}>
    <div className="nsf-hero-copy">
      <p className="nsf-eyebrow">{aptoProgram.eyebrow}</p>
      <h1 id={`${id}-title`}>{aptoProgram.title}</h1>
      <p className="nsf-hero-summary">{aptoProgram.shortSummary}</p>
      <div className="nsf-hero-actions">
        <a className="nsf-primary-action" href={`#${id}-projects`}>Explore the projects <span aria-hidden="true">↓</span></a>
        <ExternalLink href={programSourceUrl}>Read the program description</ExternalLink>
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

function SectionIntro({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: string; id?: string }) {
  return <header className="nsf-section-intro">
    <p>{eyebrow}</p>
    <h2 id={id}>{title}</h2>
    <span>{description}</span>
  </header>;
}

function ProgramOverview({ id, ledger = false }: { id: NsfAptoMockupId; ledger?: boolean }) {
  return <section className={`nsf-program-overview ${ledger ? "is-ledger" : ""}`} id={`${id}-about`} aria-labelledby={`${id}-about-title`}>
    <SectionIntro
      eyebrow="About APTO"
      title="A shared framework for understanding technological change"
      description={aptoProgram.description}
      id={`${id}-about-title`}
    />
    <div className="nsf-overview-framework">
      <article className="nsf-framework-block">
        <span>Three outcome types</span>
        <div className="nsf-framework-items">
          {aptoProgram.outcomes.map((outcome) => {
            const item = displayRecord(outcome);
            return <div key={item.label}><strong>{item.label}</strong>{item.description && <p>{item.description}</p>}</div>;
          })}
        </div>
      </article>
      <article className="nsf-framework-block">
        <span>Two lines of effort</span>
        <div className="nsf-framework-items">
          {aptoProgram.linesOfEffort.map((line) => {
            const item = displayRecord(line);
            return <div key={item.label}><strong>{item.label}</strong>{item.description && <p>{item.description}</p>}</div>;
          })}
        </div>
      </article>
    </div>
    <div className="nsf-program-notes">
      <article><strong>Technology areas named by NSF</strong><ul>{aptoProgram.technologyAreas.map((area) => <li key={displayRecord(area).label}>{displayRecord(area).label}</li>)}</ul></article>
      <article><strong>Open access</strong><p>{aptoProgram.openAccessNote}</p></article>
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
  return <div className="nsf-tag-group" aria-label={label}>{values.map((value) => {
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
      <div className="nsf-project-orbit" aria-hidden="true"><span>{participantMonogram(participant?.displayName ?? project.organization)}</span></div>
      <div>
        <p className="nsf-project-context">{project.organization} <span aria-hidden="true">·</span> {project.location}</p>
        <h3>{project.officialTitle}</h3>
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
      <strong>{project.shortName}</strong>
      <small>{participant?.displayName ?? project.organization}</small>
      <span>NSF award {project.awardId}</span>
      <i aria-hidden="true">+</i>
    </summary>
    <div className="nsf-ledger-detail">
      <header><h3>{project.officialTitle}</h3><p>{project.organization} · {project.location} · {project.startDate}—{project.endDate}</p></header>
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

function ProjectsSection({ id, ledger = false }: { id: NsfAptoMockupId; ledger?: boolean }) {
  const [participant, setParticipant] = useState("all");
  const projects = participant === "all" ? aptoProjects : aptoProjects.filter((project) => project.participantId === participant);
  const listId = `${id}-project-list`;

  return <section className={`nsf-projects-section ${ledger ? "is-ledger" : ""}`} id={`${id}-projects`} aria-labelledby={`${id}-projects-title`}>
    <SectionIntro
      eyebrow="APTO project portfolio"
      title={ledger ? "The project evidence ledger" : "Independent projects. One consequential question."}
      description="Only active awards whose official titles begin with “APTO” are included. Projects are listed alphabetically by official title; use the organization filter to focus the records."
      id={`${id}-projects-title`}
    />
    <FilterBar value={participant} onChange={setParticipant} controls={listId} label="Filter projects by participant" />
    <p className="nsf-filter-status" aria-live="polite">{participant === "all" ? "Showing all APTO projects · alphabetical by official title" : `Showing APTO projects for ${participantFor(participant)?.displayName ?? participant}`}</p>
    <div className={ledger ? "nsf-project-ledger" : "nsf-project-grid"} id={listId}>
      {projects.map((project) => ledger
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
        <h3>{tool.name}</h3>
        <p className="nsf-tool-context">A concept by <strong>{participant?.displayName ?? tool.organizationId}</strong><span aria-hidden="true"> · </span><span>{tool.status}</span></p>
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

function ToolsSection({ id, register = false }: { id: NsfAptoMockupId; register?: boolean }) {
  const [participant, setParticipant] = useState("all");
  const tools = participant === "all" ? aptoMockTools : aptoMockTools.filter((tool) => tool.participantId === participant);
  const listId = `${id}-tool-list`;

  return <section className={`nsf-tools-section ${register ? "is-register" : ""}`} id={`${id}-tools`} aria-labelledby={`${id}-tools-title`}>
    <SectionIntro
      eyebrow="Tools — interface mockups"
      title={register ? "A proposed tool register" : "Ideas for exploring each team’s work"}
      description="Illustrative concepts are shown for every participating organization and listed alphabetically by tool name. Names, figures, links, and video states remain placeholders pending confirmation."
      id={`${id}-tools-title`}
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
      <h4>{person.name}</h4>
      <p>{person.role}</p>
      <span>{person.headshotUrl ? "Project profile" : "Portrait forthcoming"}</span>
      {person.profileUrl && <ExternalLink href={person.profileUrl}>View profile</ExternalLink>}
    </div>
  </article>;
}

function PeopleSection({ id }: { id: NsfAptoMockupId }) {
  return <section className="nsf-people-section" id={`${id}-people`} aria-labelledby={`${id}-people-title`}>
    <SectionIntro
      eyebrow="People"
      title="The investigators across the APTO cohort"
      description="Organizations are listed alphabetically by display name. Investigator names and roles come from award records; initials stand in until approved photography and profile links are available."
      id={`${id}-people-title`}
    />
    <div className="nsf-people-groups">
      {aptoParticipants.map((participant) => <section key={participant.id} aria-labelledby={`${id}-people-${participant.id}`}>
        <header><h3 id={`${id}-people-${participant.id}`}>{participant.displayName}</h3><ExternalLink href={participant.website}>Organization website</ExternalLink></header>
        <div>{participant.people.map((person) => <PersonCard key={person.name} person={person} participant={participant} awardId={participant.awardId} />)}</div>
      </section>)}
    </div>
  </section>;
}

function ParticipantDirectory({ id, prominent = false }: { id: NsfAptoMockupId; prominent?: boolean }) {
  return <section className={`nsf-participants-section ${prominent ? "is-prominent" : ""}`} id={`${id}-participants`} aria-labelledby={`${id}-participants-title`}>
    <SectionIntro
      eyebrow="Participating organizations"
      title={prominent ? "The organizations behind the APTO cohort" : "The APTO participants"}
      description="Organizations are listed alphabetically by display name and paired with the legal awardee names used in official records. Organization marks remain omitted until approved assets are available."
      id={`${id}-participants-title`}
    />
    <div className="nsf-participant-directory">
      {aptoParticipants.map((participant) => {
        const project = projectForParticipant(participant.id);
        return <article className="nsf-participant-entry" key={participant.id}>
          <div className="nsf-participant-node" aria-hidden="true">
            <span>{participantMonogram(participant.displayName)}</span>
          </div>
          <div className="nsf-participant-profile">
            <header className="nsf-participant-heading">
              <p className="nsf-participant-context">{participant.kind} <span aria-hidden="true">·</span> {participant.location}</p>
              <h3>{participant.displayName}</h3>
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

function SourcesSection({ id }: { id: NsfAptoMockupId }) {
  return <section className="nsf-sources-section" id={`${id}-sources`} aria-labelledby={`${id}-sources-title`}>
    <SectionIntro
      eyebrow="Sources and provenance"
      title="Follow the information back to NSF"
      description="Program language, award metadata, investigator names, dates, and funding figures are grounded in official records. Sources are listed alphabetically by label."
      id={`${id}-sources-title`}
    />
    <ul>{aptoSources.map((source) => <li key={source.id}>
      <div><strong>{source.label}</strong><p>{source.detail}</p></div>
      <ExternalLink href={source.url}>Open {source.kind}</ExternalLink>
    </li>)}</ul>
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
    <div className="nsf-accessibility-note"><strong>Prototype accessibility approach</strong><p>Semantic landmarks, keyboard-operable filters, visible focus, text alternatives, non-color cues, responsive reflow, and reduced-motion support are specified for this concept. Automated checks support—but do not constitute—formal ADA or Section 508 certification.</p></div>
    <nav aria-label="Footer navigation"><a href={`#${id}-main`}>Back to top ↑</a><a href={`#${id}-sources`}>Sources</a><ExternalLink href="https://www.nsf.gov/policies/brand">NSF brand policy</ExternalLink></nav>
    <p className="nsf-approval-note">Brand application draft — NSF review and participant approval are required before public production use. The supplied disclaimer names Award 2404035; confirm whether cohort-level production copy should acknowledge all five cooperative agreements.</p>
  </footer>;
}

function NsfHome() {
  const id: NsfAptoMockupId = "nsfhome";
  return <div className="concept concept-nsfhome nsf-apto nsf-apto-home">
    <NsfProgramHeader id={id} direction="home" />
    <main id={`${id}-main`} tabIndex={-1}>
      <CompactProgramHero id={id} direction="home" />
      <ProgramOverview id={id} />
      <ProjectsSection id={id} />
      <ToolsSection id={id} />
      <PeopleSection id={id} />
      <ParticipantDirectory id={id} />
      <SourcesSection id={id} />
    </main>
    <NsfAcknowledgementFooter id={id} />
  </div>;
}

function NsfLedger() {
  const id: NsfAptoMockupId = "nsfledger";
  return <div className="concept concept-nsfledger nsf-apto nsf-apto-ledger">
    <NsfProgramHeader id={id} direction="ledger" />
    <main id={`${id}-main`} tabIndex={-1}>
      <CompactProgramHero id={id} direction="ledger" />
      <ProjectsSection id={id} ledger />
      <ProgramOverview id={id} ledger />
      <ToolsSection id={id} register />
      <ParticipantDirectory id={id} />
      <PeopleSection id={id} />
      <SourcesSection id={id} />
    </main>
    <NsfAcknowledgementFooter id={id} />
  </div>;
}

function NsfNetwork() {
  const id: NsfAptoMockupId = "nsfnetwork";
  return <div className="concept concept-nsfnetwork nsf-apto nsf-apto-network">
    <NsfProgramHeader id={id} direction="network" />
    <main id={`${id}-main`} tabIndex={-1}>
      <CompactProgramHero id={id} direction="network" />
      <ParticipantDirectory id={id} prominent />
      <ProjectsSection id={id} />
      <ToolsSection id={id} />
      <PeopleSection id={id} />
      <ProgramOverview id={id} />
      <SourcesSection id={id} />
    </main>
    <NsfAcknowledgementFooter id={id} />
  </div>;
}

export function NsfAptoMockup({ id }: { id: NsfAptoMockupId }) {
  switch (id) {
    case "nsfhome": return <NsfHome />;
    case "nsfledger": return <NsfLedger />;
    case "nsfnetwork": return <NsfNetwork />;
  }
}

export default NsfAptoMockup;
