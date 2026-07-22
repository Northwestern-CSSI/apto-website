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
  aptoInterface,
  aptoPages,
  aptoParticipants,
  aptoProgram,
  aptoProjects,
  aptoTools,
  type AptoTool,
} from "../content";
import { aptoRoute, withDeploymentBase } from "../paths";
import type { AptoTheme } from "../theme";
import { useAptoTheme } from "../use-apto-theme";

export type AtlasSection = "home" | "projects" | "tools" | "cohort";

type Participant = (typeof aptoParticipants)[number];
type Person = Participant["people"][number] | (typeof aptoProgram.programTeam)[number];

const sectionSlugs: Record<AtlasSection, "\/" | "\/projects" | "\/tools" | "\/cohort"> = {
  home: "/",
  projects: "/projects",
  tools: "/tools",
  cohort: "/cohort",
};

function pageCopy(slug: "\/" | "\/about" | "\/projects" | "\/tools" | "\/cohort") {
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
    className={`atlas-logo logo-${participant.id} asset-on-${participant.logo.surface} ${className}`.trim()}
    aria-hidden="true"
  >
    <img
      src={withDeploymentBase(participant.logo.src)}
      alt=""
      width={participant.logo.width}
      height={participant.logo.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
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
        <a href={aptoRoute()}>{aptoInterface.atlas.directoryLabel}</a>
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
    <p>{page.eyebrow}</p>
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
  const mosaicTools = [
    "aperture-problem-landscape",
    "macrocosm-energy-digital-twin",
    "uchicago-global-observatory",
  ].map((id) => aptoTools.find((tool) => tool.id === id)).filter((tool): tool is AptoTool => Boolean(tool));

  return <main className="atlas-main atlas-program" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-home-title">
    <PageIntroduction section="home" />
    <section className="atlas-program-mosaic" aria-label={aptoInterface.atlas.programMosaicLabel}>
      {mosaicTools.map((tool, index) => <figure key={tool.id} className={`is-${index + 1}`}>
        <img
          src={withDeploymentBase(tool.galleryImages[0].src)}
          alt={tool.galleryImages[0].alt}
          width="1536"
          height="1024"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={index === 0 ? "high" : undefined}
        />
        <figcaption>{participantFor(tool.participantId)?.displayName}<span>{tool.name}</span></figcaption>
      </figure>)}
      <a className="atlas-mosaic-link" href={atlasRoute("tools")}>Explore the tool gallery <span aria-hidden="true">→</span></a>
    </section>

    <section className="atlas-program-description" aria-labelledby="atlas-program-description-title">
      <p>{pageCopy("/about").eyebrow}</p>
      <div>
        <h2 id="atlas-program-description-title">{pageCopy("/about").title}</h2>
        <p>{aptoProgram.description}</p>
      </div>
    </section>

    <section className="atlas-objective-field" aria-labelledby="atlas-objectives-title">
      <header>
        <p>{aptoInterface.atlas.objectivesLabel}</p>
        <h2 id="atlas-objectives-title">{aptoProgram.objectivesTitle}</h2>
      </header>
      <ol>{aptoProgram.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
    </section>

    <section className="atlas-framework" aria-label={aptoProgram.framework.ariaLabel}>
      <article>
        <header><p>{aptoProgram.framework.outcomesNote}</p><h2>{aptoProgram.framework.outcomesTitle}</h2></header>
        <dl>{aptoProgram.outcomes.map((outcome) => <div key={outcome.name}><dt>{outcome.name}</dt><dd>{outcome.description}</dd></div>)}</dl>
      </article>
      <article>
        <header><p>{aptoProgram.framework.effortsNote}</p><h2>{aptoProgram.framework.effortsTitle}</h2></header>
        <dl>{aptoProgram.linesOfEffort.map((effort) => <div key={effort.id}><dt>{effort.title}</dt><dd>{effort.description}</dd></div>)}</dl>
      </article>
    </section>

    <section className="atlas-participants" aria-labelledby="atlas-participants-title">
      <header>
        <p>{aptoInterface.atlas.participantsLabel}</p>
        <h2 id="atlas-participants-title">A nationwide research cohort</h2>
        <a href={atlasRoute("cohort")}>Meet the cohort <span aria-hidden="true">→</span></a>
      </header>
      <OrganizationIndex labelledBy="atlas-participants-title" />
    </section>
  </main>;
}

function ProjectMap() {
  return <section className="atlas-project-map-section" aria-labelledby="atlas-project-map-title">
    <div className="atlas-project-map-copy">
      <p>{aptoInterface.atlas.projectsMapLabel}</p>
      <h2 id="atlas-project-map-title">{aptoInterface.projects.map.title}</h2>
      <span>{aptoInterface.projects.map.description}</span>
    </div>
    <div className="atlas-project-map">
      <img
        src={withDeploymentBase(aptoInterface.projects.map.imageUrl)}
        alt={aptoInterface.projects.map.imageAlt}
        width="959"
        height="593"
        loading="eager"
        decoding="async"
      />
      {aptoProjects.map((project) => {
        const participant = participantFor(project.participantId);
        if (!participant) return null;
        return <a
          key={project.id}
          href={`#atlas-project-${project.id}`}
          className="atlas-map-pin"
          data-participant={participant.id}
          aria-label={`${participant.displayName}: ${project.shortName}`}
          style={{
            left: `${participant.mapPosition.x}%`,
            top: `${participant.mapPosition.y}%`,
            "--atlas-participant-accent": participant.accent,
          } as CSSProperties}
        ><span>{participant.displayName}</span></a>;
      })}
    </div>
    <div className="atlas-map-legend" aria-label={aptoInterface.projects.map.caption}>
      {aptoParticipants.map((participant) => <a
        href={`#atlas-project-${aptoProjects.find((project) => project.participantId === participant.id)?.id}`}
        key={participant.id}
      ><i style={{ background: participant.accent }} aria-hidden="true" /><span>{participant.displayName}</span><small>{participant.location}</small></a>)}
    </div>
  </section>;
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
    <ProjectMap />
    <section className="atlas-project-portfolio" aria-labelledby="atlas-portfolio-title">
      <header><p>{aptoInterface.atlas.projectPortfolioLabel}</p><h2 id="atlas-portfolio-title">Five approaches to technology outcomes</h2></header>
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
  if (!participant) return null;
  const detailId = `atlas-tool-details-${tool.id}`;
  const media = [tool.galleryImages[0], { src: tool.figure.src, alt: tool.figure.alt }, ...tool.galleryImages.slice(1)];

  return <article
    className={`atlas-tool-card${expanded ? " is-expanded" : ""}`}
    style={{ "--atlas-participant-accent": participant.accent } as CSSProperties}
  >
    <figure className="atlas-tool-media">
      {media.map((image, index) => <img
        key={`${image.src}-${index}`}
        src={withDeploymentBase(image.src)}
        alt={index === 0 ? image.alt : ""}
        aria-hidden={index === 0 ? undefined : "true"}
        width={index === 0 ? "1536" : "1200"}
        height={index === 0 ? "1024" : "800"}
        loading="lazy"
        decoding="async"
      />)}
      <figcaption>{tool.figure.label}</figcaption>
    </figure>
    <div className="atlas-tool-shade" aria-hidden="true" />
    <div className="atlas-tool-summary">
      <p>{participant.displayName} <span>{tool.statusLabel}</span></p>
      <h2>{tool.name}</h2>
      <p className="atlas-tool-description">{tool.description}</p>
    </div>
    <div className="atlas-tool-details" id={detailId}>
      <dl><dt>{aptoInterface.tools.useCaseLabel}</dt><dd>{tool.useCase}</dd></dl>
      <ul aria-label={aptoInterface.tools.categoriesLabel}>{tool.categories.map((category) => <li key={category}>{category}</li>)}</ul>
      {(tool.demoVideoUrl || tool.toolUrl) && <nav aria-label={`${tool.name} links`}>
        {tool.demoVideoUrl && <ExternalLink href={tool.demoVideoUrl}>{aptoInterface.tools.watchDemoLabel}</ExternalLink>}
        {tool.toolUrl && <ExternalLink href={tool.toolUrl}>{aptoInterface.tools.openToolLabel}</ExternalLink>}
      </nav>}
    </div>
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
        <div><p>{aptoInterface.atlas.toolCollectionLabel}</p><h2 id="atlas-tool-collection-title">Explore the collection</h2></div>
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
              {aptoProgram.outcomes.map((outcome) => <option key={outcome.name} value={outcome.name}>{outcome.name}</option>)}
            </select>
          </label>
        </fieldset>
        <p className="atlas-tool-count" aria-live="polite">{aptoInterface.tools.showingPrefix} {filteredTools.length} {filteredTools.length === 1 ? aptoInterface.tools.toolSingular : aptoInterface.tools.toolPlural}</p>
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
      <header><p>{aptoInterface.people.programTeamEyebrow}</p><h2 id="atlas-leadership-title">{aptoInterface.atlas.programLeadershipLabel}</h2></header>
      <div>{aptoProgram.programTeam.map((person) => <PersonEntry person={person} key={person.id} />)}</div>
    </section>
    <section className="atlas-cohort-index" aria-labelledby="atlas-cohort-index-title">
      <header><p>{aptoInterface.atlas.cohortIndexLabel}</p><h2 id="atlas-cohort-index-title">Five organizations, one program</h2></header>
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
    <AtlasFooter />
  </div>;
}
