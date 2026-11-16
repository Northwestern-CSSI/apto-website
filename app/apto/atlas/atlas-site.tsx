"use client";

/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type CSSProperties } from "react";

import {
  aptoBoilerplate,
  aptoConvenings,
  aptoInterface,
  aptoOutcomes,
  aptoPages,
  aptoParticipants,
  aptoProgram,
} from "../content";
import { AptoHeader, AptoViewActions } from "../apto-header";
import { ProjectPortfolio } from "../project-portfolio";
import { ConveningGallery } from "../convening-gallery";
import { aptoRoute, withDeploymentBase } from "../paths";
import { ToolKenBurnsGallery } from "../tool-gallery";
import { presentationMediaForTool } from "../tool-media";
import type { AptoTheme } from "../theme";
import { ToolResourcePath } from "../tool-resource-path";
import {
  featuredRows,
  orderByParticipant,
  orderParticipantMentions,
  useParticipantOrders,
} from "../participant-order";
import { aptoPresentationTools } from "../presentation-tools";
import { useAptoTheme } from "../use-apto-theme";
import { ProgramSections } from "../story/program-sections";
import { useStoryExperience } from "../story/use-story-experience";

export type AtlasSection = "home" | "projects" | "tools" | "convening";

type Participant = (typeof aptoParticipants)[number];

function pageCopy(slug: "/tools" | "/convening") {
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

const atlasNavigation = aptoInterface.primaryNavigation.map((item) => ({
  ...item,
  href: atlasRoute(item.section),
}));
const continuumView = { href: aptoRoute("/story"), label: aptoInterface.atlas.continuumLabel };

function PageIntroduction({ section, participantOrder }: {
  section: "tools" | "convening";
  participantOrder: readonly string[];
}) {
  const page = pageCopy(`/${section}`);
  return <header className="atlas-page-intro">
    <h1 id={`atlas-${section}-title`}>{page.title}</h1>
    <div><p>{orderParticipantMentions(page.introduction, participantOrder)}</p></div>
  </header>;
}

function ProgramPage({ participantOrder }: { participantOrder: readonly string[] }) {
  const mainRef = useRef<HTMLElement>(null);
  useStoryExperience(mainRef, participantOrder.join("|"), { revealEarlier: true });

  return <main className="apto-story" ref={mainRef} id="atlas-main" tabIndex={-1} aria-labelledby="atlas-home-title">
    <ProgramSections view="atlas" participantOrder={participantOrder} />
  </main>;
}

function ToolPoster({ tool }: {
  tool: (typeof aptoPresentationTools)[number];
}) {
  const participant = participantFor(tool.participantId);
  const media = presentationMediaForTool(tool);

  if (!participant) return null;

  return <article
    className="atlas-tool-card"
    data-gallery-count={media.length}
    style={{ "--atlas-participant-accent": participant.accent } as CSSProperties}
  >
    <ToolKenBurnsGallery galleryId={`atlas-${tool.id}`} images={media} className="atlas-tool-media" />
    <div className="atlas-tool-shade" aria-hidden="true" />
    <div className="atlas-tool-panel">
      <ToolResourcePath
        resources={tool.resources}
        label={`${tool.name} supporting pieces`}
        summary={{
          title: tool.name,
          paragraphs: tool.summaryParagraphs,
          eyebrow: `Led by ${participant.displayName}`,
          url: tool.toolUrl,
          linkLabel: aptoInterface.tools.openToolLabel,
        }}
        variant="atlas"
        featured={["northwestern", "uchicago"].includes(tool.participantId)}
      />
    </div>
  </article>;
}

function ToolsPage({ participantOrder }: { participantOrder: readonly string[] }) {
  const [organization, setOrganization] = useState("all");
  const [category, setCategory] = useState("all");
  const supportingTools = orderByParticipant(
    aptoPresentationTools.filter((tool) => !["northwestern", "uchicago"].includes(tool.participantId)),
    participantOrder,
  );
  const featuredTools = featuredRows(aptoPresentationTools, participantOrder)
    .flat()
    .filter((tool): tool is (typeof aptoPresentationTools)[number] => Boolean(tool));
  const orderedTools = [...featuredTools, ...supportingTools];
  const filteredTools = orderedTools.filter((tool) => (
    (organization === "all" || tool.participantId === organization)
    && (category === "all" || tool.categories.includes(category as "Capability" | "Production" | "Use"))
  ));

  return <main className="atlas-main atlas-tools" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-tools-title">
    <PageIntroduction section="tools" participantOrder={participantOrder} />
    <section className="atlas-tool-collection" aria-labelledby="atlas-tool-collection-title">
      <header className="atlas-tool-toolbar">
        <div><h2 id="atlas-tool-collection-title">Explore the collection</h2></div>
        <fieldset aria-label={aptoInterface.accessibility.toolFiltersLabel}>
          <label>
            <span>{aptoInterface.tools.organizationFilterLabel}</span>
            <select
              aria-label={aptoInterface.tools.organizationFilterAriaLabel}
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
            >
              <option value="all">{aptoInterface.tools.allOrganizationsLabel}</option>
              {participantOrder.map((participantId) => participantFor(participantId)).filter((participant): participant is Participant => Boolean(participant)).map((participant) => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}
            </select>
          </label>
          <label>
            <span>{aptoInterface.tools.categoryFilterLabel}</span>
            <select
              aria-label={aptoInterface.tools.categoryFilterAriaLabel}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">{aptoInterface.tools.allCategoriesLabel}</option>
              {aptoOutcomes.map((outcome) => <option key={outcome} value={outcome}>{outcome}</option>)}
            </select>
          </label>
        </fieldset>
      </header>
      {filteredTools.length > 0
        ? <div className="atlas-tool-grid">{filteredTools.map((tool) => <ToolPoster key={tool.id} tool={tool} />)}</div>
        : <div className="atlas-tool-empty"><h2>{aptoInterface.tools.emptyTitle}</h2><p>{aptoInterface.tools.emptyDescription}</p></div>}
    </section>
  </main>;
}

function ConveningPage({ participantOrder }: { participantOrder: readonly string[] }) {
  return <main className="atlas-main atlas-convening" id="atlas-main" tabIndex={-1} aria-labelledby="atlas-convening-title">
    <PageIntroduction section="convening" participantOrder={participantOrder} />
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

function AtlasFooter({ theme, onToggle }: { theme: AptoTheme; onToggle: () => void }) {
  const programManager = aptoProgram.programTeam.find((person) => person.role === "Program Manager");
  const nsfTeam = aptoProgram.programTeam.filter((person) => person.role === "NSF Team");
  return <footer className="atlas-footer">
    <div className="atlas-footer-support">
      <a href={aptoInterface.footer.nsfWebsiteUrl} aria-label={aptoInterface.footer.nsfWebsiteAriaLabel}>
        <img src={withDeploymentBase(aptoInterface.footer.nsfLogoSrc)} alt={aptoInterface.footer.nsfLogoAlt} width="96" height="96" loading="lazy" decoding="async" />
      </a>
      <div><p>{aptoInterface.atlas.supportedByLabel}</p><span>{aptoInterface.footer.supportDescription}</span></div>
    </div>
    <address className="atlas-footer-contacts">
      <strong>{aptoInterface.footer.programContactsLabel}</strong>
      <ul>
        {programManager && <li className="atlas-footer-contact-primary">
          <span><b>{programManager.name}</b><small>{programManager.role}</small></span>
          {programManager.email && <a href={`mailto:${programManager.email}`}>{programManager.email}</a>}
        </li>}
        {nsfTeam.length > 0 && <li className="atlas-footer-team">
          <small>NSF team</small>
          <span>{nsfTeam.map((person) => person.name).join(" · ")}</span>
        </li>}
      </ul>
    </address>
    <nav aria-label={aptoInterface.accessibility.footerNavigationLabel}>
      {aptoInterface.primaryNavigation.map((item) => <a href={atlasRoute(item.section)} key={item.section}>{item.label}</a>)}
    </nav>
    <p className="atlas-footer-disclaimer">{aptoBoilerplate}</p>
    <AptoViewActions
      alternateView={continuumView}
      theme={theme}
      onToggle={onToggle}
      className="atlas-footer-actions"
      testIdPrefix="atlas-footer"
    />
  </footer>;
}

export function AtlasSitePage({ section }: { section: AtlasSection }) {
  const { theme, toggleTheme } = useAptoTheme("light");
  const participantOrders = useParticipantOrders();
  return <div className="apto-atlas" data-theme={theme} data-testid="apto-atlas-root">
    <a className="atlas-skip-link" href="#atlas-main">{aptoInterface.accessibility.skipLinkLabel}</a>
    <AptoHeader
      view="atlas"
      brandHref={atlasRoute("home")}
      navigationLabel={aptoInterface.atlas.navigationLabel}
      items={atlasNavigation}
      activeSection={section}
      alternateView={continuumView}
      theme={theme}
      onToggle={toggleTheme}
    />
    {section === "home" && <ProgramPage participantOrder={participantOrders.program} />}
    {section === "projects" && <ProjectPortfolio view="atlas" participantOrder={participantOrders.projects} />}
    {section === "tools" && <ToolsPage participantOrder={participantOrders.tools} />}
    {section === "convening" && <ConveningPage participantOrder={participantOrders.program} />}
    <AtlasFooter theme={theme} onToggle={toggleTheme} />
  </div>;
}
