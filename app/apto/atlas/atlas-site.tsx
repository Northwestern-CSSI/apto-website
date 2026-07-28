"use client";

/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import { useState, type CSSProperties, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoConvenings,
  aptoInterface,
  aptoOutcomes,
  aptoPages,
  aptoParticipants,
  aptoProgram,
  aptoProjects,
  aptoTools,
} from "../content";
import { ConveningGallery } from "../convening-gallery";
import { aptoRoute, withDeploymentBase } from "../paths";
import type { AptoTheme } from "../theme";
import { ToolKenBurnsGallery } from "../tool-gallery";
import { useAptoTheme } from "../use-apto-theme";

export type AtlasSection = "home" | "projects" | "tools" | "cohort" | "convening";

type Participant = (typeof aptoParticipants)[number];
type Person = Participant["people"][number] | (typeof aptoProgram.programTeam)[number];

const sectionSlugs: Record<AtlasSection, "\/" | "\/projects" | "\/tools" | "\/cohort" | "\/convening"> = {
  home: "/",
  projects: "/projects",
  tools: "/tools",
  cohort: "/cohort",
  convening: "/convening",
};

function pageCopy(slug: "\/" | "\/about" | "\/projects" | "\/tools" | "\/cohort" | "\/convening") {
  const page = aptoPages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Missing Markdown page content for ${slug}`);
  return page;
}

function participantFor(id: string) {
  return aptoParticipants.find((participant) => participant.id === id);
}

function atlasRoute(section: AtlasSection) {
  return aptoRoute(section === "home" ? "/atlas" : `/atlas/${section}`);
}

function ExternalLink({ href, children, className }: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return <a className={className} href={href}>
    <span>{children}</span>
    <ArrowUpRight aria-hidden="true" focusable="false" />
  </a>;
}

function ParticipantLogo({ participant, eager = false, className = "" }: {
  participant: Participant;
  eager?: boolean;
  className?: string;
}) {
  return <span
    className={`atlas-logo logo-${participant.id} logo-kind-${participant.logo.kind} ${className}`.trim()}
    aria-hidden="true"
  >
    <span className="atlas-logo-canvas">
      <img
        className="atlas-logo-asset is-light"
        src={withDeploymentBase(participant.logo.variants.light.src)}
        alt=""
        width={participant.logo.variants.light.width}
        height={participant.logo.variants.light.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <img
        className="atlas-logo-asset is-dark"
        src={withDeploymentBase(participant.logo.variants.dark.src)}
        alt=""
        width={participant.logo.variants.dark.width}
        height={participant.logo.variants.dark.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  </span>;
}

function ThemeToggle({ theme, onToggle }: { theme: AptoTheme; onToggle: () => void }) {
  const lightLabel = aptoInterface.directions.find((direction) => direction.id === "nsfhome")?.label ?? "Light";
  const darkLabel = aptoInterface.directions.find((direction) => direction.id === "nsfnetwork")?.label ?? "Dark";
  const nextLabel = theme === "dark" ? lightLabel : darkLabel;

  return <button
    className="atlas-theme-toggle"
    type="button"
    role="switch"
    aria-checked={theme === "dark"}
    aria-label={`${aptoInterface.study.themeChooserLabel}: ${darkLabel}`}
    title={`${aptoInterface.study.themeSwitchActionPrefix} ${nextLabel}`}
    onClick={onToggle}
    data-testid="atlas-theme-toggle"
  >
    <Sun aria-hidden="true" focusable="false" />
    <span className="atlas-theme-track" aria-hidden="true"><i /></span>
    <Moon aria-hidden="true" focusable="false" />
  </button>;
}

function AtlasHeader({ section, theme, onToggle }: {
  section: AtlasSection;
  theme: AptoTheme;
  onToggle: () => void;
}) {
  return <header className="atlas-header" data-testid="atlas-header">
    <a className="atlas-brand" href={atlasRoute("home")} aria-label="APTO Atlas home">
      <strong>{aptoProgram.acronym}</strong>
      <span>{aptoProgram.name}</span>
    </a>
    <nav className="atlas-primary-nav" aria-label={aptoInterface.atlas.navigationLabel}>
      {aptoInterface.primaryNavigation.map((item) => <a
        key={item.section}
        href={atlasRoute(item.section)}
        aria-current={section === item.section ? "page" : undefined}
      >{item.label}</a>)}
    </nav>
    <div className="atlas-header-actions">
      <nav className="atlas-view-nav" aria-label={aptoInterface.atlas.viewNavigationLabel}>
        <span aria-current="page">{aptoInterface.atlas.viewLabel.replace("APTO ", "")}</span>
        <a href={aptoRoute("/story")}>{aptoInterface.atlas.continuumLabel}</a>
      </nav>
      <ThemeToggle theme={theme} onToggle={onToggle} />
    </div>
  </header>;
}

function PageIntroduction({ section }: { section: AtlasSection }) {
  const slug = sectionSlugs[section];
  const page = pageCopy(slug);
  return <header className="atlas-page-intro">
    <h1 id={`atlas-${section}-title`}>{page.title}</h1>
    <div><p>{page.introduction}</p></div>
  </header>;
}

function OrganizationIndex({ labelledBy }: { labelledBy: string }) {
  return <div className="atlas-organization-index" aria-labelledby={labelledBy}>
    {aptoParticipants.map((participant) => <a
      href={atlasRoute("cohort") + `#atlas-team-${participant.id}`}
      key={participant.id}
      style={{ "--atlas-participant-accent": participant.accent } as CSSProperties}
    >
      <ParticipantLogo participant={participant} />
      <strong>{participant.displayName}</strong>
    </a>)}
  </div>;
}

function ProgramPage() {
  return <main className="atlas-main atlas-program" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-home-title">
    <PageIntroduction section="home" />
    <section className="atlas-program-mosaic" aria-label={aptoInterface.atlas.programMosaicLabel}>
      {aptoProgram.landingGallery.map((image, index) => <figure key={image.src} data-program-visual="true">
        <img
          className={`motion-${index + 1}`}
          src={withDeploymentBase(image.src)}
          alt={image.alt}
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
        />
      </figure>)}
    </section>

    <section className="atlas-program-description" aria-labelledby="atlas-program-description-title">
      <div>
        <h2 id="atlas-program-description-title">{pageCopy("/about").title}</h2>
        <p>{aptoProgram.description}</p>
      </div>
    </section>

    <section className="atlas-objective-field" aria-labelledby="atlas-objectives-title">
      <header>
        <h2 id="atlas-objectives-title">{aptoProgram.objectivesTitle}</h2>
      </header>
      <ol>{aptoProgram.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
    </section>

    <section className="atlas-participants" aria-labelledby="atlas-participants-title">
      <header>
        <h2 id="atlas-participants-title">A nationwide research cohort</h2>
        <a href={atlasRoute("cohort")}>Meet the cohort <span aria-hidden="true">→</span></a>
      </header>
      <OrganizationIndex labelledBy="atlas-participants-title" />
    </section>
  </main>;
}

function ProjectFolio({ project }: { project: (typeof aptoProjects)[number] }) {
  const participant = participantFor(project.participantId);
  if (!participant) return null;
  const tool = aptoTools.find((candidate) => candidate.participantId === participant.id);

  return <details
    className="atlas-project-folio"
    id={`atlas-project-${project.id}`}
    style={{ "--atlas-participant-accent": participant.accent } as CSSProperties}
  >
    <summary>
      <span className="atlas-project-identity">
        <ParticipantLogo participant={participant} />
        <span><small>{participant.displayName} · {participant.location}</small><strong>{project.shortName}</strong></span>
      </span>
      <span className="atlas-project-date">{aptoInterface.projects.awardedPrefix} {project.awardedYear} {aptoInterface.projects.dateStatusSeparator} {project.statusLabel}</span>
      <span className="atlas-project-expand" aria-label={aptoInterface.projects.expandLabel}><ChevronDown aria-hidden="true" focusable="false" /></span>
    </summary>
    <div className="atlas-project-body">
      <div>
        <p>{project.summary}</p>
        <ul aria-label={aptoInterface.accessibility.projectInvestigatorsLabel}>
          {project.people.map((person) => <li key={person.id}><strong>{person.name}</strong><span>{person.role}</span></li>)}
        </ul>
        <nav aria-label={`${participant.displayName} project links`}>
          <ExternalLink href={project.awardUrl}>{aptoInterface.projects.awardLabel} {project.awardId}</ExternalLink>
          <ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>
        </nav>
      </div>
      {tool && <figure>
        <img src={withDeploymentBase(tool.galleryImages[0].src)} alt={tool.galleryImages[0].alt} width="1536" height="1024" loading="lazy" decoding="async" />
        <figcaption>{participant.displayName}</figcaption>
      </figure>}
    </div>
  </details>;
}

function ProjectsPage() {
  return <main className="atlas-main atlas-projects" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-projects-title">
    <PageIntroduction section="projects" />
    <section className="atlas-project-portfolio" aria-labelledby="atlas-portfolio-title">
      <header><h2 id="atlas-portfolio-title">Five approaches to technology outcomes</h2></header>
      <div>{aptoProjects.map((project) => <ProjectFolio project={project} key={project.id} />)}</div>
    </section>
  </main>;
}

function ToolPoster({ tool, expanded, onToggle }: {
  tool: (typeof aptoTools)[number];
  expanded: boolean;
  onToggle: () => void;
}) {
  const participant = participantFor(tool.participantId);
  const detailId = `atlas-tool-details-${tool.id}`;
  const media = [{ src: tool.figure.src, alt: tool.figure.alt }, ...tool.galleryImages];

  if (!participant) return null;

  return <article
    className={`atlas-tool-card${expanded ? " is-expanded" : ""}`}
    data-gallery-count={media.length}
    style={{ "--atlas-participant-accent": participant.accent } as CSSProperties}
  >
    <ToolKenBurnsGallery galleryId={`atlas-${tool.id}`} images={media} className="atlas-tool-media" />
    <div className="atlas-tool-shade" aria-hidden="true" />
    <div className="atlas-tool-panel">
      <div className="atlas-tool-copy">
        <div className="atlas-tool-summary">
          <p>{participant.displayName} <span>{tool.statusLabel}</span></p>
          <h2>{tool.name}</h2>
          <p className="atlas-tool-description">{tool.description}</p>
        </div>
        <div className="atlas-tool-details" id={detailId}>
          <dl><dt>{aptoInterface.tools.useCaseLabel}</dt><dd>{tool.useCase}</dd></dl>
          <ul aria-label={aptoInterface.tools.categoriesLabel}>{tool.categories.map((category) => <li key={category}>{category}</li>)}</ul>
          <div className="atlas-tool-resources" aria-label={`${tool.name} supporting resources`}>
            {tool.resources.map((resource) => {
              const content = <><img src={withDeploymentBase(resource.image.src)} alt="" width="96" height="64" loading="lazy" /><span><strong>{resource.name}</strong><small>{resource.description}</small><em>{resource.status === "coming-soon" ? "Coming soon" : "Available"}</em></span></>;
              return resource.url
                ? <a href={resource.url} key={resource.name}>{content}</a>
                : <div key={resource.name}>{content}</div>;
            })}
          </div>
          {(tool.demoVideoUrl || tool.toolUrl) && <nav aria-label={`${tool.name} links`}>
            {tool.demoVideoUrl && <ExternalLink href={tool.demoVideoUrl}>{aptoInterface.tools.watchDemoLabel}</ExternalLink>}
            {tool.toolUrl && <ExternalLink href={tool.toolUrl}>{aptoInterface.tools.openToolLabel}</ExternalLink>}
          </nav>}
        </div>
      </div>
      <div className="atlas-tool-panel-footer">
        <button
          className="atlas-tool-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls={detailId}
          aria-label={`${expanded ? aptoInterface.atlas.closeDetailsLabel : aptoInterface.atlas.toolDetailsLabel}: ${tool.name}`}
          onClick={onToggle}
        >
          {expanded ? <X aria-hidden="true" focusable="false" /> : <Plus aria-hidden="true" focusable="false" />}
          <span>{expanded ? aptoInterface.atlas.closeDetailsLabel : aptoInterface.atlas.toolDetailsLabel}</span>
        </button>
      </div>
    </div>
  </article>;
}

function ToolsPage() {
  const [organization, setOrganization] = useState("all");
  const [category, setCategory] = useState("all");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const filteredTools = aptoTools.filter((tool) => (
    (organization === "all" || tool.participantId === organization)
    && (category === "all" || tool.categories.includes(category as "Capability" | "Production" | "Use"))
  ));

  return <main className="atlas-main atlas-tools" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-tools-title">
    <PageIntroduction section="tools" />
    <section className="atlas-tool-collection" aria-labelledby="atlas-tool-collection-title">
      <header className="atlas-tool-toolbar">
        <div><h2 id="atlas-tool-collection-title">Explore the collection</h2></div>
        <fieldset aria-label={aptoInterface.accessibility.toolFiltersLabel}>
          <label>
            <span>{aptoInterface.tools.organizationFilterLabel}</span>
            <select
              aria-label={aptoInterface.tools.organizationFilterAriaLabel}
              value={organization}
              onChange={(event) => { setOrganization(event.target.value); setExpandedTool(null); }}
            >
              <option value="all">{aptoInterface.tools.allOrganizationsLabel}</option>
              {aptoParticipants.map((participant) => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}
            </select>
          </label>
          <label>
            <span>{aptoInterface.tools.categoryFilterLabel}</span>
            <select
              aria-label={aptoInterface.tools.categoryFilterAriaLabel}
              value={category}
              onChange={(event) => { setCategory(event.target.value); setExpandedTool(null); }}
            >
              <option value="all">{aptoInterface.tools.allCategoriesLabel}</option>
              {aptoOutcomes.map((outcome) => <option key={outcome} value={outcome}>{outcome}</option>)}
            </select>
          </label>
        </fieldset>
      </header>
      {filteredTools.length > 0
        ? <div className="atlas-tool-grid">{filteredTools.map((tool) => <ToolPoster
            key={tool.id}
            tool={tool}
            expanded={expandedTool === tool.id}
            onToggle={() => setExpandedTool((current) => current === tool.id ? null : tool.id)}
          />)}</div>
        : <div className="atlas-tool-empty"><h2>{aptoInterface.tools.emptyTitle}</h2><p>{aptoInterface.tools.emptyDescription}</p></div>}
    </section>
  </main>;
}

function PersonEntry({ person }: { person: Person }) {
  return <article className="atlas-person">
    {person.headshotUrl
      ? <img src={withDeploymentBase(person.headshotUrl)} alt={person.headshotAlt} width="112" height="112" loading="lazy" decoding="async" />
      : <span className="atlas-person-initials" aria-hidden="true">{person.initials}</span>}
    <div><h3>{person.name}</h3><p>{person.role}</p>{person.profileUrl && <ExternalLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</ExternalLink>}</div>
  </article>;
}

function CohortPage() {
  return <main className="atlas-main atlas-cohort" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-cohort-title">
    <PageIntroduction section="cohort" />
    <section className="atlas-leadership" aria-labelledby="atlas-leadership-title">
      <header><h2 id="atlas-leadership-title">{aptoInterface.atlas.programLeadershipLabel}</h2></header>
      <div>{aptoProgram.programTeam.map((person) => <PersonEntry person={person} key={person.id} />)}</div>
    </section>
    <section className="atlas-cohort-index" aria-labelledby="atlas-cohort-index-title">
      <header><h2 id="atlas-cohort-index-title">Five organizations, one program</h2></header>
      <OrganizationIndex labelledBy="atlas-cohort-index-title" />
    </section>
    <section className="atlas-team-chapters" aria-label={aptoInterface.atlas.participantsLabel}>
      {aptoParticipants.map((participant, index) => {
        const project = aptoProjects.find((candidate) => candidate.participantId === participant.id);
        return <article
          className={`atlas-team-chapter${index % 2 ? " is-reversed" : ""}`}
          id={`atlas-team-${participant.id}`}
          key={participant.id}
          style={{ "--atlas-participant-accent": participant.accent } as CSSProperties}
        >
          <div className="atlas-team-identity">
            <ParticipantLogo participant={participant} />
            <p>{participant.location}</p>
            <h2>{participant.displayName}</h2>
            {project && <span>{project.shortName}</span>}
            <ExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ExternalLink>
          </div>
          <div className="atlas-team-people">
            {participant.people.map((person) => <PersonEntry person={person} key={person.id} />)}
          </div>
        </article>;
      })}
    </section>
  </main>;
}

function ConveningPage() {
  return <main className="atlas-main atlas-convening" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-convening-title">
    <PageIntroduction section="convening" />
    <section className="atlas-convening-list" aria-label="Annual convenings">
      {aptoConvenings.map((convening) => <article className="atlas-convening-card" key={convening.id}>
        <ConveningGallery convening={convening} className="atlas-convening-gallery" />
        <div className="atlas-convening-copy">
          <strong>{convening.year}</strong>
          <div>
            <p>{convening.location}</p>
            <h2>{convening.title}</h2>
            <span>{convening.summary}</span>
            <span>{convening.discussion}</span>
          </div>
        </div>
      </article>)}
    </section>
  </main>;
}

function AtlasFooter() {
  return <footer className="atlas-footer">
    <div className="atlas-footer-support">
      <a href={aptoInterface.footer.nsfWebsiteUrl} aria-label={aptoInterface.footer.nsfWebsiteAriaLabel}>
        <img src={withDeploymentBase(aptoInterface.footer.nsfLogoSrc)} alt={aptoInterface.footer.nsfLogoAlt} width="96" height="96" loading="lazy" decoding="async" />
      </a>
      <div><p>{aptoInterface.atlas.supportedByLabel}</p><span>{aptoInterface.footer.supportDescription}</span></div>
    </div>
    <p>{aptoBoilerplate}</p>
    <nav aria-label={aptoInterface.accessibility.footerNavigationLabel}>
      {aptoInterface.primaryNavigation.map((item) => <a href={atlasRoute(item.section)} key={item.section}>{item.label}</a>)}
    </nav>
  </footer>;
}

export function AtlasSitePage({ section }: { section: AtlasSection }) {
  const { theme, toggleTheme } = useAptoTheme("light");
  return <div className="apto-atlas" data-theme={theme} data-testid="apto-atlas-root">
    <a className="atlas-skip-link" href="#atlas-main">{aptoInterface.accessibility.skipLinkLabel}</a>
    <AtlasHeader section={section} theme={theme} onToggle={toggleTheme} />
    {section === "home" && <ProgramPage />}
    {section === "projects" && <ProjectsPage />}
    {section === "tools" && <ToolsPage />}
    {section === "cohort" && <CohortPage />}
    {section === "convening" && <ConveningPage />}
    <AtlasFooter />
  </div>;
}
