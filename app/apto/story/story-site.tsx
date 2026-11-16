"use client";

/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";

import {
  aptoBoilerplate,
  aptoConvenings,
  aptoInterface,
  aptoPages,
  aptoParticipants,
  aptoProgram,
} from "../content";
import { AptoHeader } from "../apto-header";
import { ProjectPortfolio } from "../project-portfolio";
import { ConveningGallery } from "../convening-gallery";
import { aptoRoute, withDeploymentBase } from "../paths";
import { ToolKenBurnsGallery } from "../tool-gallery";
import { presentationMediaForTool } from "../tool-media";
import { ToolResourcePath } from "../tool-resource-path";
import {
  featuredRows,
  formatParticipantList,
  orderByParticipant,
  useParticipantOrders,
} from "../participant-order";
import { aptoPresentationTools } from "../presentation-tools";
import { useAptoTheme } from "../use-apto-theme";

import { ProgramSections } from "./program-sections";
import { useStoryExperience, type StorySection } from "./use-story-experience";

const storyNavigation = aptoInterface.primaryNavigation.map((item) => {
  const section = item.section === "home" ? "program" : item.section;
  return {
    section,
    label: section === "program" ? aptoInterface.story.programLabel : item.label,
    href: `#story-${section}`,
  };
});

function pageCopy(slug: "/tools" | "/convening") {
  const page = aptoPages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Missing Markdown page content for ${slug}`);
  return page;
}

function participantFor(id: string) {
  return aptoParticipants.find((participant) => participant.id === id);
}

function ToolsStory({ participantOrder }: { participantOrder: readonly string[] }) {
  const tools = pageCopy("/tools");
  const pairedRows = featuredRows(aptoPresentationTools, participantOrder);
  const supportingTools = orderByParticipant(
    aptoPresentationTools.filter((tool) => !["northwestern", "uchicago"].includes(tool.participantId)),
    participantOrder,
  );

  const toolCard = (tool: (typeof aptoPresentationTools)[number], index: number) => {
    const media = presentationMediaForTool(tool);
    const participant = participantFor(tool.participantId);
    return <article className="story-tool" key={tool.id} data-story-reveal="media">
      <div data-story-parallax={(.01 + index % 3 * .004).toFixed(3)} className="story-tool-gallery-wrap">
        <ToolKenBurnsGallery galleryId={`story-${tool.id}`} images={media} className="story-tool-gallery" />
      </div>
      <div className="story-tool-shade" aria-hidden="true" />
      <div className="story-tool-copy">
        <ToolResourcePath
          resources={tool.resources}
          label={`${tool.name} supporting pieces`}
          summary={{
            title: tool.name,
            paragraphs: tool.summaryParagraphs,
            eyebrow: participant ? `Led by ${participant.displayName}` : undefined,
            url: tool.toolUrl,
            linkLabel: aptoInterface.tools.openToolLabel,
          }}
          variant="story"
          featured={["northwestern", "uchicago"].includes(tool.participantId)}
        />
      </div>
    </article>;
  };

  return <section className="story-section story-tools" id="story-tools" data-story-section="tools" aria-labelledby="story-tools-title">
    <header className="story-section-heading" data-story-reveal="heading">
      <h2 id="story-tools-title">{tools.title}</h2>
      <span>{tools.introduction}</span>
    </header>
    <div className="story-tool-matrix" aria-label={`${formatParticipantList(participantOrder.slice(0, 2))} tools`}>
      {pairedRows.map((row, rowIndex) => <div className="story-tool-pair" key={`tool-row-${rowIndex}`}>
        {row.map((tool, columnIndex) => tool
          ? toolCard(tool, rowIndex * 2 + columnIndex)
          : <span className="story-tool-placeholder" aria-hidden="true" key={`empty-${rowIndex}-${columnIndex}`} />)}
      </div>)}
    </div>
    <div className="story-tool-grid story-tool-grid-compact" aria-label="Tools from participating organizations">
      {supportingTools.map((tool, index) => toolCard(tool, index))}
    </div>
  </section>;
}

function ConveningStory() {
  const page = pageCopy("/convening");
  return <section className="story-section story-convening" id="story-convening" data-story-section="convening" aria-labelledby="story-convening-title">
    <header className="story-section-heading" data-story-reveal="heading">
      <h2 id="story-convening-title">{page.title}</h2>
      <span>{page.introduction}</span>
    </header>
    <div className="story-convening-list">
      {aptoConvenings.map((convening) => <article className="story-convening-card" key={convening.id} data-story-reveal="media" data-story-parallax="0.012">
        <ConveningGallery convening={convening} className="story-convening-gallery" />
        <div className="story-convening-overlay">
          <strong>{convening.year}</strong>
          <div>
            <p>{convening.location}</p>
            <h3>{convening.title}</h3>
            <span>{convening.summary}</span>
            <span>{convening.discussion}</span>
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}

function StoryFooter() {
  const programManager = aptoProgram.programTeam.find((person) => person.role === "Program Manager");
  const nsfTeam = aptoProgram.programTeam.filter((person) => person.role === "NSF Team");
  return <footer className="story-footer">
    <a className="story-footer-brand" href="#story-top"><strong>{aptoProgram.acronym}</strong><span>{aptoProgram.name}</span></a>
    <div className="story-footer-support">
      <img src={withDeploymentBase(aptoInterface.footer.nsfLogoSrc)} alt={aptoInterface.footer.nsfLogoAlt} width="64" height="64" loading="lazy" />
      <div><strong>{aptoInterface.story.supportedByLabel}</strong><p>{aptoInterface.footer.supportDescription}</p></div>
    </div>
    <address className="story-footer-contacts">
      <strong>{aptoInterface.footer.programContactsLabel}</strong>
      <ul>
        {programManager && <li className="story-footer-contact-primary">
          <span><b>{programManager.name}</b><small>{programManager.role}</small></span>
          {programManager.email && <a href={`mailto:${programManager.email}`}>{programManager.email}</a>}
        </li>}
        {nsfTeam.length > 0 && <li className="story-footer-team">
          <small>NSF team</small>
          <span>{nsfTeam.map((person) => person.name).join(" · ")}</span>
        </li>}
      </ul>
    </address>
    <div className="story-footer-links"><a href={aptoRoute("/atlas")}>Atlas view</a><a href="#story-top">{aptoInterface.footer.backToTopLabel} ↑</a></div>
    <p className="story-footer-disclaimer">{aptoBoilerplate}</p>
  </footer>;
}

export function AptoStoryPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<StorySection>("program");
  const { theme, toggleTheme } = useAptoTheme("light");
  const participantOrders = useParticipantOrders();
  useStoryExperience(rootRef, participantOrders.program.join("|"), setActiveSection);

  return <div className="apto-story" ref={rootRef} data-theme={theme}>
    <a className="story-skip-link" href="#story-main">{aptoInterface.accessibility.skipLinkLabel}</a>
    <AptoHeader
      view="story"
      brandHref="#story-top"
      navigationLabel={aptoInterface.story.navigationLabel}
      items={storyNavigation}
      activeSection={activeSection}
      alternateView={{ href: aptoRoute("/atlas"), label: aptoInterface.story.directoryLabel }}
      theme={theme}
      onToggle={toggleTheme}
    />
    <main id="story-main" tabIndex={-1}>
      <ProgramSections view="story" participantOrder={participantOrders.program} />
      <ProjectPortfolio view="story" participantOrder={participantOrders.projects} />
      <ToolsStory participantOrder={participantOrders.tools} />
      <ConveningStory />
    </main>
    <StoryFooter />
  </div>;
}
