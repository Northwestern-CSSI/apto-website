"use client";

import Link from "next/link";
import BadgeCheck from "lucide-react/dist/esm/icons/badge-check.mjs";
import ChartNoAxesCombined from "lucide-react/dist/esm/icons/chart-no-axes-combined.mjs";
import Network from "lucide-react/dist/esm/icons/network.mjs";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up.mjs";
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
export type NsfAptoSection = "home" | "about" | "cohort" | "people" | "projects" | "tools";

type AptoProject = (typeof aptoProjects)[number];
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoTool = (typeof aptoMockTools)[number];
type AptoPerson = AptoProject["people"][number];
type AptoProgramPerson = (typeof aptoProgram.programTeam)[number];
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

const directionFor = (id: NsfAptoMockupId): NsfDirection => id.startsWith("nsfledger") ? "ledger" : id.startsWith("nsfnetwork") ? "network" : "home";
const hasHeroWidgets = (id: NsfAptoMockupId) => id.endsWith("widgets");
const directionConcepts: Record<NsfDirection, { standard: NsfAptoMockupId; widget: NsfAptoMockupId }> = {
  home: { standard: "nsfhome", widget: "nsfhomewidgets" },
  ledger: { standard: "nsfledger", widget: "nsfledgerwidgets" },
  network: { standard: "nsfnetwork", widget: "nsfnetworkwidgets" },
};

function aptoHref(section: NsfAptoSection, id: NsfAptoMockupId) {
  const path = sectionPath[section];
  return `/apto${path ? `/${path}` : ""}?concept=${id}`;
}

function copyFor(section: NsfAptoSection) {
  const page = aptoPages.find((candidate) => candidate.slug === pageSlug[section]);
  if (!page) throw new Error(`Missing Markdown page content for ${section}`);
  return page;
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
    { id: "all", label: aptoInterface.tools.allOrganizationsLabel },
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
    title={`${participant.displayName} ${aptoInterface.cohort.markStatusSuffix}`}
  >
    <img src={logo.src} width={logo.width} height={logo.height} alt="" />
  </span>;
}

function NsfDirectionStudyBar({ id, section }: { id: NsfAptoMockupId; section: NsfAptoSection }) {
  const directions = aptoInterface.directions as Array<{ id: NsfAptoMockupId; label: string; note: string }>;
  const widgetMode = hasHeroWidgets(id);
  const currentDirection = directionFor(id);
  const study = aptoInterface.study;
  const themeDirections = (["home", "ledger", "network"] as const).map((theme) => {
    const conceptId = directionConcepts[theme][widgetMode ? "widget" : "standard"];
    const content = directions.find((direction) => direction.id === conceptId) ?? directions[0];
    return { theme, conceptId, label: content.label, note: content.note };
  });
  const pair = directionConcepts[currentDirection];

  return <aside className="nsf-direction-bar" aria-label={study.barLabel}>
    <Link href="/">{study.galleryLabel}</Link>
    <nav className="nsf-direction-themes" aria-label={study.themeChooserLabel}>
      {themeDirections.map((direction) => <a
        key={direction.theme}
        href={aptoHref(section, direction.conceptId)}
        aria-current={direction.theme === currentDirection ? "page" : undefined}
      ><strong>{direction.label}</strong><span>{direction.note}</span></a>)}
    </nav>
    <nav className="nsf-direction-mode" aria-label={study.formatChooserLabel}>
      <span>{study.formatLabel}</span>
      <a
        className={!widgetMode ? "is-current" : undefined}
        href={aptoHref("home", pair.standard)}
        aria-label={`${study.standardLabel} ${study.formatLabel.toLowerCase()}${!widgetMode ? `, ${study.selectedFormatLabel}` : ""}`}
        aria-current={!widgetMode ? (section === "home" ? "page" : "true") : undefined}
      >{study.standardLabel}</a>
      <a
        className={widgetMode ? "is-current" : undefined}
        href={aptoHref("home", pair.widget)}
        aria-label={`${study.widgetLabel} ${study.formatLabel.toLowerCase()}${widgetMode ? `, ${study.selectedFormatLabel}` : ""}`}
        aria-current={widgetMode ? (section === "home" ? "page" : "true") : undefined}
      >{study.widgetLabel}</a>
    </nav>
  </aside>;
}

function NsfProgramHeader({ id, activeSection }: { id: NsfAptoMockupId; activeSection: NsfAptoSection }) {
  const links = aptoInterface.primaryNavigation;

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
        {links.map((link) => <a
          key={link.section}
          href={aptoHref(link.section, id)}
          aria-current={activeSection === link.section ? "page" : undefined}
        >{link.label}</a>)}
      </nav>
    </header>;
}

type NsfHeroWidget = (typeof aptoInterface.widget.items)[number];
type NsfHeroWidgetId = NsfHeroWidget["id"];

function NsfWidgetIcon({ icon }: { icon: NsfHeroWidget["icon"] }) {
  const Icon = icon === "trend-up"
    ? TrendingUp
    : icon === "network-map"
      ? Network
      : icon === "shield-check"
        ? BadgeCheck
        : ChartNoAxesCombined;
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.8} />;
}

function NsfHeroWidgetVisual({ widget }: { widget: NsfHeroWidget }) {
  const preview = widget.preview;
  switch (preview.kind) {
    case "signals":
      return <div className="nsf-widget-signal-preview">
        <p className="nsf-widget-scale">{aptoInterface.widget.momentumScaleLabel}</p>
        <ul className="nsf-widget-signal-list" aria-label={aptoInterface.widget.momentumListAriaLabel}>
          {preview.rows.map((row) => <li key={row.label}>
            <div><small>{row.category}</small><strong>{row.label}</strong></div>
            <i aria-hidden="true"><span style={{ "--nsf-widget-value": `${row.value}%` } as CSSProperties} /></i>
            <b>{row.value}<span aria-hidden="true">/100</span></b>
          </li>)}
        </ul>
      </div>;
    case "map":
      return <figure className="nsf-widget-science-map">
        <figcaption className="nsf-visually-hidden">{aptoInterface.widget.mapCaptionPrefix} {preview.clusters.join(", ")} {aptoInterface.widget.mapCaptionSuffix}</figcaption>
        {preview.clusters.map((label, index) => <span aria-hidden="true" className={`cluster-index-${index}`} key={label}><i />{label}</span>)}
        <p><small>{preview.focusLabel}</small><strong>{preview.focusTitle}</strong></p>
      </figure>;
    case "translation":
      return <div className="nsf-widget-translation-preview">
        <div className="nsf-widget-composite" aria-label={`${aptoInterface.widget.compositeAriaPrefix} ${preview.composite} ${aptoInterface.widget.compositeAriaJoiner} ${preview.maximum}`}><small>{aptoInterface.widget.demoIndexLabel}</small><strong>{preview.composite}</strong><span>/ {preview.maximum}</span></div>
        <dl>{preview.rows.map((row) => <div key={row.label}>
          <dt>{row.label}</dt><dd><i aria-hidden="true"><span style={{ "--nsf-widget-value": `${row.value}%` } as CSSProperties} /></i><b>{row.value}</b></dd>
        </div>)}</dl>
      </div>;
    case "trajectories":
      return <div className="nsf-widget-trajectory-preview">
        <p className="nsf-widget-scale">{aptoInterface.widget.trajectoryScaleLabel}</p>
        <div className="nsf-widget-trajectory-grid">
          {preview.rows.map((row, index) => <article key={row.label}>
            <small>{row.category}</small><strong>{row.label}</strong>
            <div className={`nsf-widget-mini-curve curve-${row.tone} curve-index-${index}`} role="img" aria-label={`${row.label} ${aptoInterface.widget.trajectoryAriaSuffix}`}><i /><i /><i /><i /></div>
            <footer><span>{preview.observedLabel}</span><span>{preview.forecastLabel}</span></footer>
          </article>)}
        </div>
      </div>;
  }
}

function NsfHeroToolWidget({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  const widgets = aptoInterface.widget.items;
  const [active, setActive] = useState<NsfHeroWidgetId>(widgets[0].id);
  const widget = widgets.find((item) => item.id === active) ?? widgets[0];
  const panelId = `${id}-hero-widget-panel`;

  const handleKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const isMobileGrid = window.matchMedia("(max-width: 640px)").matches;
    const supportedKeys = isMobileGrid
      ? ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]
      : ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!supportedKeys.includes(event.key)) return;
    event.preventDefault();
    const last = widgets.length - 1;
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : (index + (
          event.key === "ArrowRight"
            ? 1
            : event.key === "ArrowLeft"
              ? -1
              : event.key === "ArrowDown"
                ? 2
                : -2
        ) + widgets.length) % widgets.length;
    setActive(widgets[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return <aside className={`nsf-hero-widget is-${direction}`} aria-label={aptoInterface.widget.previewAriaLabel}>
    <header className="nsf-hero-widget-header">
      <div><span>{aptoInterface.widget.eyebrow}</span><h2>{aptoInterface.widget.title}</h2></div>
      <a href={aptoHref("tools", id)}>{aptoInterface.widget.allToolsLabel}</a>
    </header>
    <div className="nsf-hero-widget-tabs" role="tablist" aria-label={aptoInterface.widget.chooserAriaLabel} data-local-arrows="true">
      {widgets.map((item, index) => <button
        type="button"
        role="tab"
        id={`${id}-hero-widget-tab-${item.id}`}
        aria-selected={active === item.id}
        aria-controls={panelId}
        tabIndex={active === item.id ? 0 : -1}
        key={item.id}
        onClick={() => setActive(item.id)}
        onKeyDown={(event) => handleKeys(event, index)}
      ><i><NsfWidgetIcon icon={item.icon} /></i><span>{item.tabLabel}</span></button>)}
    </div>
    <section className="nsf-hero-widget-panel" id={panelId} role="tabpanel" aria-labelledby={`${id}-hero-widget-tab-${active}`} key={active}>
      <header>
        <small>{widget.kicker}</small>
        <h3>{widget.title}</h3>
        <p>{widget.summary}</p>
      </header>
      <div className="nsf-hero-widget-visual"><NsfHeroWidgetVisual widget={widget} /></div>
      <footer><span>{aptoInterface.widget.disclaimer}</span><a href={aptoHref("tools", id)}>{aptoInterface.widget.exploreLabel}</a></footer>
    </section>
  </aside>;
}

function NsfHeroOutcomeVisual({ direction }: { direction: NsfDirection }) {
  return direction === "network" ? <figure className="nsf-network-hero-art">
    <picture>
      <source srcSet="/apto/nsf-network-art.avif" type="image/avif" />
      <img src="/apto/nsf-network-art-fallback.jpg" width="1200" height="600" decoding="async" alt={aptoInterface.home.networkVisualAlt} />
    </picture>
    <figcaption>{aptoInterface.home.networkVisualCaption}</figcaption>
  </figure> : direction === "ledger" ? <figure className="nsf-ledger-hero-art">
    <header><span>{aptoInterface.home.ledgerVisualEyebrow}</span><strong>{aptoInterface.home.ledgerVisualTitle}</strong></header>
    <dl>{aptoProgram.outcomes.map((outcome) => {
      const item = displayRecord(outcome);
      return <div key={item.label}><dt>{item.label}</dt><dd>{item.description}</dd></div>;
    })}</dl>
    <figcaption>{aptoInterface.home.outcomeVisualNote}</figcaption>
  </figure> : <aside className="nsf-hero-program-note" aria-label={aptoProgram.framework.ariaLabel}>
    <div className="nsf-outcome-lens">
      {aptoProgram.outcomes.map((outcome) => <span key={displayRecord(outcome).label}>{displayRecord(outcome).label}</span>)}
      <strong>{aptoProgram.acronym}</strong>
    </div>
    <p>{aptoInterface.home.outcomeVisualNote}</p>
  </aside>;
}

function CompactProgramHero({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  const homeCopy = copyFor("home");
  return <section className={`nsf-program-hero ${hasHeroWidgets(id) ? "has-widget" : "has-framework"}`} aria-labelledby={`${id}-title`}>
    <div className="nsf-hero-copy">
      <p className="nsf-eyebrow">{homeCopy.eyebrow}</p>
      <h1 id={`${id}-title`}>{homeCopy.title}</h1>
      <p className="nsf-hero-summary">{homeCopy.introduction}</p>
      <div className="nsf-hero-actions">
        <a className="nsf-primary-action" href={aptoHref("projects", id)}>{aptoInterface.home.primaryActionLabel} <span aria-hidden="true">→</span></a>
        <a href={aptoHref("about", id)}>{aptoInterface.home.secondaryActionLabel} <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    {hasHeroWidgets(id) ? <NsfHeroToolWidget id={id} direction={direction} /> : <NsfHeroOutcomeVisual direction={direction} />}
    <dl className="nsf-hero-facts">
      {aptoProgram.stats.map((stat) => {
        const item = displayStat(stat);
        return <div key={`${item.value}-${item.label}`}><dt>{item.value}</dt><dd><span>{item.label}</span>{item.detail && <small>{item.detail}</small>}</dd></div>;
      })}
    </dl>
  </section>;
}

function CohortIdentityStage({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  return <section className={`nsf-cohort-stage is-${direction}`} aria-labelledby={`${id}-cohort-stage-title`}>
    <header>
      <p>{aptoInterface.home.cohortEyebrow}</p>
      <h2 id={`${id}-cohort-stage-title`}>{aptoInterface.home.cohortTitle}</h2>
      <a href={aptoHref("cohort", id)}>{aptoInterface.home.cohortLinkLabel} <span aria-hidden="true">→</span></a>
    </header>
    <div className="nsf-cohort-canvas">
      {direction === "network" && <div className="nsf-network-core" aria-hidden="true"><strong>{aptoProgram.acronym}</strong><span>{aptoInterface.home.networkCoreLabel}</span></div>}
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
    <p className="nsf-logo-disclosure">{aptoInterface.home.logoDisclosure}</p>
  </section>;
}

function HomePathways({ id, direction }: { id: NsfAptoMockupId; direction: NsfDirection }) {
  const pathways = aptoInterface.home.pathways;

  return <nav className={`nsf-home-pathways is-${direction}`} aria-label={aptoInterface.accessibility.homePathwaysLabel}>
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
    <div className="nsf-overview-framework" role="group" aria-label={aptoProgram.framework.ariaLabel}>
      <section className="nsf-framework-block is-outcomes" aria-labelledby={`${id}-outcomes-title`}>
        <header className="nsf-framework-heading">
          <h2 id={`${id}-outcomes-title`}>{aptoProgram.framework.outcomesTitle}</h2>
          <p>{aptoProgram.framework.outcomesNote}</p>
        </header>
        <dl className="nsf-framework-items">
          {aptoProgram.outcomes.map((outcome) => {
            const item = displayRecord(outcome);
            return <div key={item.label}><dt>{item.label}</dt>{item.description && <dd>{item.description}</dd>}</div>;
          })}
        </dl>
      </section>
      <section className="nsf-framework-block is-efforts" aria-labelledby={`${id}-efforts-title`}>
        <header className="nsf-framework-heading">
          <h2 id={`${id}-efforts-title`}>{aptoProgram.framework.effortsTitle}</h2>
          <p>{aptoProgram.framework.effortsNote}</p>
        </header>
        <dl className="nsf-framework-items">
          {aptoProgram.linesOfEffort.map((line) => {
            const item = displayRecord(line);
            return <div key={item.label}><dt>{item.label}</dt>{item.description && <dd>{item.description}</dd>}</div>;
          })}
        </dl>
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

function ProjectTags({ values, label }: { values: readonly unknown[]; label: string }) {
  return <div className="nsf-tag-group" role="group" aria-label={label}>{values.map((value) => {
    const item = displayRecord(value);
    return <span key={item.label}>{item.label}</span>;
  })}</div>;
}

function projectEffortLabels(project: AptoProject) {
  return project.linesOfEffort.map((effort) => aptoProgram.linesOfEffort.find((line) => line.id === effort)?.title ?? effort);
}

function ProjectCard({ project, tone }: { project: AptoProject; tone: "light" | "dark" }) {
  const participant = participantFor(project.participantId);
  return <article className="nsf-project-card" id={`nsf-award-${project.awardId}`}>
    <header className="nsf-project-heading">
      {participant
        ? <ParticipantMark participant={participant} size="directory" tone={tone} />
        : <span className={`nsf-participant-mark is-directory is-fallback tone-${tone}`} aria-hidden="true">{participantMonogram(project.organization)}</span>}
      <div>
        <p className="nsf-project-context">{project.organization} <span aria-hidden="true">·</span> {project.location}</p>
        <h2>{project.officialTitle}</h2>
        <p className="nsf-project-record">{aptoInterface.projects.awardLabel} {project.awardId} <span aria-hidden="true">·</span> {project.startDate}—{project.endDate}</p>
      </div>
    </header>
    <div className="nsf-project-body">
      <p className="nsf-project-summary">{project.summary}</p>
      <div className="nsf-project-taxonomy"><ProjectTags values={project.outcomes} label={aptoInterface.accessibility.outcomeTypesLabel} /><ProjectTags values={projectEffortLabels(project)} label={aptoInterface.accessibility.linesOfEffortLabel} /></div>
      <ProjectPeopleList people={project.people} />
      <dl className="nsf-award-funding">
        <div><dt>{aptoInterface.projects.legalAwardeeLabel}</dt><dd>{project.legalAwardeeName}</dd></div>
        <div><dt>{aptoInterface.projects.agreementLabel}</dt><dd>{project.agreementType}</dd></div>
        <div><dt>{aptoInterface.projects.obligatedAmountLabel}</dt><dd>{moneyFormatter.format(project.funding.obligatedAmount)}</dd></div>
        <div><dt>{aptoInterface.projects.estimatedTotalLabel}</dt><dd>{moneyFormatter.format(project.funding.estimatedTotalAmount)}</dd></div>
        <div><dt>{aptoInterface.projects.dataAsOfLabel}</dt><dd>{project.funding.dataAsOfLabel}</dd></div>
      </dl>
      {project.funding.caveat && <p className="nsf-data-caveat">{project.funding.caveat}</p>}
      <footer>
        <ExternalLink href={project.awardUrl}>{aptoInterface.common.officialAwardRecordLabel}</ExternalLink>
        <ExternalLink href={project.apiUrl}>{aptoInterface.common.awardApiRecordLabel}</ExternalLink>
        {participant && <ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>}
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
      <span>{aptoInterface.projects.awardLabel} {project.awardId}</span>
      <i aria-hidden="true">+</i>
    </summary>
    <div className="nsf-ledger-detail">
      <header><h2>{project.officialTitle}</h2><p>{project.organization} · {project.location} · {project.startDate}—{project.endDate}</p></header>
      <p>{project.summary}</p>
      <div className="nsf-ledger-taxonomy"><ProjectTags values={project.outcomes} label={aptoInterface.accessibility.outcomeTypesLabel} /><ProjectTags values={projectEffortLabels(project)} label={aptoInterface.accessibility.linesOfEffortLabel} /></div>
      <ProjectPeopleList people={project.people} />
      <dl className="nsf-award-funding">
        <div><dt>{aptoInterface.projects.legalAwardeeLabel}</dt><dd>{project.legalAwardeeName}</dd></div>
        <div><dt>{aptoInterface.projects.agreementLabel}</dt><dd>{project.agreementType}</dd></div>
        <div><dt>{aptoInterface.projects.obligatedAmountLabel}</dt><dd>{moneyFormatter.format(project.funding.obligatedAmount)}</dd></div>
        <div><dt>{aptoInterface.projects.estimatedTotalLabel}</dt><dd>{moneyFormatter.format(project.funding.estimatedTotalAmount)}</dd></div>
        <div><dt>{aptoInterface.projects.dataAsOfLabel}</dt><dd>{project.funding.dataAsOfLabel}</dd></div>
      </dl>
      {project.funding.caveat && <p className="nsf-data-caveat">{project.funding.caveat}</p>}
      <div className="nsf-ledger-actions"><ExternalLink href={project.awardUrl}>{aptoInterface.common.officialAwardRecordLabel}</ExternalLink><ExternalLink href={project.apiUrl}>{aptoInterface.common.awardApiRecordLabel}</ExternalLink>{participant && <ExternalLink href={participant.website}>{aptoInterface.common.participantWebsiteLabel}</ExternalLink>}</div>
    </div>
  </details>;
}

function ProjectsSection({ id, ledger = false, pageHeading = false }: { id: NsfAptoMockupId; ledger?: boolean; pageHeading?: boolean }) {
  const copy = copyFor("projects");
  const tone = directionFor(id) === "network" ? "dark" : "light";
  const projects = ledger
    ? [...aptoProjects].sort((a, b) => a.shortName.localeCompare(b.shortName))
    : aptoProjects;

  return <section className={`nsf-projects-section ${ledger ? "is-ledger" : ""}`} id={`${id}-projects`} aria-labelledby={`${id}-projects-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={ledger ? aptoInterface.projects.ledgerTitle : copy.title}
      description={copy.introduction}
      id={`${id}-projects-title`}
      pageHeading={pageHeading}
    />
    <div className={ledger ? "nsf-project-ledger" : "nsf-project-grid"} id={`${id}-project-list`}>
      {projects.map((project) => ledger
        ? <ProjectLedgerRow key={project.awardId} project={project} />
        : <ProjectCard key={project.awardId} project={project} tone={tone} />)}
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

function ToolCard({ tool, tone }: { tool: AptoTool; tone: "light" | "dark" }) {
  const participant = participantFor(tool.participantId);
  return <article className="nsf-tool-card">
    <div className="nsf-tool-copy">
      <header className="nsf-tool-heading">
        <h2>{tool.name}</h2>
        <div className="nsf-tool-context">
          {participant && <ParticipantMark participant={participant} size="compact" tone={tone} />}
          <p>{aptoInterface.tools.conceptByLabel} <strong>{participant?.displayName ?? tool.organizationId}</strong><span aria-hidden="true"> · </span><span>{tool.status}</span></p>
        </div>
      </header>
      <p className="nsf-tool-description">{tool.description}</p>
      <dl className="nsf-tool-availability">
        <div><dt>{aptoInterface.tools.demoVideoLabel}</dt><dd aria-label={tool.demoVideoLabel}>{tool.demoVideoUrl ? <ExternalLink href={tool.demoVideoUrl}>{aptoInterface.tools.watchWithCaptionsLabel}</ExternalLink> : aptoInterface.tools.captionsForthcomingLabel}</dd></div>
        <div><dt>{aptoInterface.tools.toolLinkLabel}</dt><dd aria-label={tool.toolLinkLabel}>{tool.toolUrl ? <ExternalLink href={tool.toolUrl}>{aptoInterface.tools.openToolLabel}</ExternalLink> : aptoInterface.tools.linkForthcomingLabel}</dd></div>
      </dl>
      <footer>
        <ExternalLink href={tool.organizationUrl}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>
        <ExternalLink href={tool.awardUrl}>{aptoInterface.common.nsfAwardRecordLabel}</ExternalLink>
      </footer>
    </div>
    <ToolFigure tool={tool} />
  </article>;
}

function ToolsSection({ id, register = false, pageHeading = false }: { id: NsfAptoMockupId; register?: boolean; pageHeading?: boolean }) {
  const [participant, setParticipant] = useState("all");
  const tools = participant === "all" ? aptoMockTools : aptoMockTools.filter((tool) => tool.participantId === participant);
  const tone = directionFor(id) === "network" ? "dark" : "light";
  const listId = `${id}-tool-list`;
  const copy = copyFor("tools");

  return <section className={`nsf-tools-section ${register ? "is-register" : ""}`} id={`${id}-tools`} aria-labelledby={`${id}-tools-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={register ? aptoInterface.tools.registerTitle : copy.title}
      description={copy.introduction}
      id={`${id}-tools-title`}
      pageHeading={pageHeading}
    />
    <div className="nsf-mockup-disclosure" role="note"><strong>{aptoInterface.disclosures.toolsLabel}</strong><span>{aptoInterface.disclosures.toolsNote}</span></div>
    <FilterBar value={participant} onChange={setParticipant} controls={listId} label={aptoInterface.tools.filterAriaLabel} />
    <p className="nsf-filter-status" aria-live="polite">{participant === "all" ? aptoInterface.tools.showingAllLabel : `${aptoInterface.tools.showingParticipantPrefix} ${participantFor(participant)?.displayName ?? participant}`}</p>
    <div className="nsf-tool-grid" id={listId}>{tools.map((tool) => <ToolCard key={tool.id} tool={tool} tone={tone} />)}</div>
  </section>;
}

function PersonCard({ person, participant, awardId }: { person: AptoPerson; participant: AptoParticipant; awardId: string }) {
  return <article className="nsf-person-card">
    {person.headshotUrl
      ? <img src={person.headshotUrl} alt={person.headshotAlt} />
      : <div className="nsf-headshot-placeholder" aria-hidden="true"><span>{person.initials}</span></div>}
    <div>
      <p className="nsf-person-context">{participant.displayName} <span aria-hidden="true">·</span> {aptoInterface.projects.personAwardLabel} {awardId}</p>
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      <span>{person.headshotUrl ? aptoInterface.people.projectProfileLabel : aptoInterface.people.portraitForthcomingLabel}</span>
      {person.profileUrl && <ExternalLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</ExternalLink>}
    </div>
  </article>;
}

function ProgramPersonCard({ person }: { person: AptoProgramPerson }) {
  return <article className="nsf-person-card nsf-program-person-card">
    {person.headshotUrl
      ? <img src={person.headshotUrl} alt={person.headshotAlt} />
      : <div className="nsf-headshot-placeholder" aria-hidden="true"><span>{person.initials}</span></div>}
    <div>
      <p className="nsf-person-context">{person.organization}</p>
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      <span>{person.headshotUrl ? aptoInterface.people.projectProfileLabel : aptoInterface.people.portraitForthcomingLabel}</span>
      {person.profileUrl && <ExternalLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</ExternalLink>}
    </div>
  </article>;
}

function PeopleSection({ id, pageHeading = false }: { id: NsfAptoMockupId; pageHeading?: boolean }) {
  const copy = copyFor("people");
  const tone = directionFor(id) === "network" ? "dark" : "light";
  return <section className="nsf-people-section" id={`${id}-people`} aria-labelledby={`${id}-people-title`}>
    <SectionIntro
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.introduction}
      id={`${id}-people-title`}
      pageHeading={pageHeading}
    />
    <div className="nsf-people-groups">
      <section className="nsf-program-team" aria-labelledby={`${id}-program-team-title`}>
        <header><div className="nsf-people-identity"><h2 id={`${id}-program-team-title`}>{aptoInterface.people.programTeamTitle}</h2></div></header>
        <div>{aptoProgram.programTeam.map((person) => <ProgramPersonCard key={person.name} person={person} />)}</div>
      </section>
      {aptoParticipants.map((participant) => <section key={participant.id} aria-labelledby={`${id}-people-${participant.id}`}>
        <header><div className="nsf-people-identity"><ParticipantMark participant={participant} size="compact" tone={tone} /><h2 id={`${id}-people-${participant.id}`}>{participant.displayName}</h2></div><ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink></header>
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
      title={prominent ? aptoInterface.cohort.prominentTitle : copy.title}
      description={copy.introduction}
      id={`${id}-participants-title`}
      pageHeading={pageHeading}
    />
    <p className="nsf-logo-disclosure">{aptoInterface.disclosures.cohort}</p>
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
              <ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>
              {project && <ExternalLink href={project.awardUrl}>{aptoInterface.common.nsfAwardRecordLabel}</ExternalLink>}
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
    {!embedded && <a className="nsf-skip-link" href={`#${id}-main`}>{aptoInterface.accessibility.skipLinkLabel}</a>}
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
    const match = window.location.hash.match(/^#(nsfhome(?:widgets)?|nsfledger(?:widgets)?|nsfnetwork(?:widgets)?)-(about|cohort|participants|people|projects|sources|tools)$/);
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
