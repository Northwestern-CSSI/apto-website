/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";

import { aptoPages, aptoParticipants, aptoProgram } from "../content";
import { ParticipantLogo } from "../participant-logo";
import { orderByParticipant, participantOrderForOccurrence } from "../participant-order";
import { aptoRoute, withDeploymentBase } from "../paths";
import { aptoPresentationTools } from "../presentation-tools";
import { ProgramIntroduction } from "../program-introduction";
import { ToolKenBurnsGallery } from "../tool-gallery";
import { storyHeroMedia } from "../tool-media";

function OutcomePanorama() {
  const motion = [
    { speed: "0.022", limit: "48" },
    { speed: "0.095", limit: "88" },
    { speed: "0.160", limit: "92" },
  ] as const;

  return <div className="story-outcome-panorama" data-story-reveal="media">
    {aptoProgram.buildingItems.map((item, index) => <div
      className="story-outcome-depth"
      data-story-parallax={motion[index].speed}
      data-story-parallax-limit={motion[index].limit}
      key={item.title}
    >
      <figure>
        <img
          src={withDeploymentBase(aptoProgram.landingGallery[index].src)}
          alt={aptoProgram.landingGallery[index].alt}
          width="1536"
          height="1024"
          loading="lazy"
          decoding="async"
        />
        <figcaption>
          <strong>{item.title}</strong>
          {item.subtitle && <small>{item.subtitle}</small>}
          <span>{item.description}</span>
        </figcaption>
      </figure>
    </div>)}
  </div>;
}

type ProgramProps = { view: "story" | "atlas"; participantOrder: readonly string[] };

function ProgramHero({ view, participantOrder }: ProgramProps) {
  const home = aptoPages.find((page) => page.slug === "/");
  if (!home) throw new Error("Missing Markdown page content for /");
  const isAtlas = view === "atlas";
  const titleId = isAtlas ? "atlas-home-title" : "story-title";
  const heroTool = aptoPresentationTools.find((tool) => tool.figure.kind === "knowledge-map") ?? aptoPresentationTools[0];
  const heroDetail = heroTool.galleryImages[0];
  // Retain the inset implementation for a future re-enable without loading or
  // displaying it in the current design.
  const showHeroInset = false;
  return <section className="story-hero" id={`${view}-top`} aria-labelledby={titleId}>
    <div className="story-hero-copy" data-story-reveal="heading" data-story-parallax="-0.030" data-story-parallax-limit="48">
      <h1 id={titleId}>{home.title}</h1>
      <ProgramIntroduction
        introduction={isAtlas ? home.atlasIntroduction ?? home.introduction : home.introduction}
        participantOrder={participantOrder}
        projectHref={(projectId) => isAtlas
          ? `${aptoRoute("/atlas/projects")}#atlas-project-${projectId}`
          : `#story-project-${projectId}`}
      />
    </div>
    <figure className="story-hero-visual" data-story-reveal="media" data-story-parallax="0.072" data-story-parallax-limit="92">
      <div className="story-hero-image">
        <ToolKenBurnsGallery
          galleryId={`${view}-hero`}
          images={storyHeroMedia}
          className="story-hero-primary"
          eager
          randomStart
          randomOrder
        />
        {showHeroInset && heroDetail && <span
          className="story-hero-detail-anchor"
          data-story-parallax="0.095"
          data-story-parallax-limit="76"
          aria-hidden="true"
        >
          <span className="story-hero-detail">
            <img src={withDeploymentBase(heroDetail.src)} alt="" width="1536" height="1024" decoding="async" />
          </span>
        </span>}
      </div>
    </figure>
  </section>;
}

export function ProgramSections({ view, participantOrder }: ProgramProps) {
  const buildingId = view === "atlas" ? "atlas-building" : "story-program";
  const impactId = `${view}-impact`;
  const impactGroups = orderByParticipant(
    aptoProgram.impactGroups,
    participantOrderForOccurrence(participantOrder, 1),
  );
  return <>
    <ProgramHero view={view} participantOrder={participantOrder} />
    <section className="story-section story-program" id={buildingId} data-story-section="program" aria-labelledby={`${buildingId}-title`}>
      <header className="story-section-heading" data-story-reveal="heading">
        <h2 id={`${buildingId}-title`}>{aptoProgram.buildingTitle}</h2>
        <span>{aptoProgram.buildingIntroduction}</span>
      </header>
      <OutcomePanorama />
    </section>
    <section className="story-section story-impact" id={impactId} data-story-section="program" aria-labelledby={`${impactId}-title`}>
      <header className="story-section-heading" data-story-reveal="heading">
        <h2 id={`${impactId}-title`}>{aptoProgram.objectivesTitle}</h2>
        <span>{aptoProgram.impactIntroduction}</span>
      </header>
      <div className="story-impact-layout">
        <div className="story-impact-stream">
          {impactGroups.map((group, groupIndex) => {
            const participant = aptoParticipants.find((candidate) => candidate.id === group.participantId);
            if (!participant) return null;
            const logoSide = groupIndex % 2 === 0 ? "right" : "left";
            const revealDirection = logoSide === "right" ? "right" : "left";
            return <div
              className={`story-impact-row${logoSide === "left" ? " is-reversed" : ""}`}
              data-story-impact-row={logoSide}
              key={participant.id}
            >
              <section
                className="story-impact-group"
                data-story-impact-group
                aria-labelledby={`${impactId}-${participant.id}`}
                style={{
                  "--story-impact-accent": participant.accent,
                  "--story-impact-focus": groupIndex === 0 ? 1 : .34,
                } as CSSProperties}
              >
                <header>
                  <span className="story-impact-inline-logo"><ParticipantLogo participant={participant} /></span>
                  <h3 id={`${impactId}-${participant.id}`}>{participant.displayName}</h3>
                </header>
                <ul className="story-impact-goals">
                  {group.entries.map((objective, index) => <li
                    key={`${participant.id}-${index}`}
                    data-story-reveal={revealDirection}
                    data-story-reveal-order={index}
                  >{objective}</li>)}
                </ul>
              </section>
              <aside className="story-impact-stage" aria-hidden="true">
                <div className="story-impact-logo-stack">
                  <div
                    className="story-impact-logo"
                    data-story-impact-logo
                    data-story-impact-side={logoSide}
                    style={{
                      "--story-impact-accent": participant.accent,
                      "--story-impact-logo-opacity": groupIndex === 0 ? 1 : 0,
                      "--story-impact-logo-x": groupIndex === 0 ? "0px" : logoSide === "right" ? "48px" : "-48px",
                      "--story-impact-logo-scale": groupIndex === 0 ? 1 : .9,
                      "--story-impact-logo-blur": groupIndex === 0 ? "0px" : "4.5px",
                    } as CSSProperties}
                  >
                    <ParticipantLogo participant={participant} />
                    <strong>{participant.displayName}</strong>
                  </div>
                </div>
              </aside>
            </div>;
          })}
        </div>
      </div>
    </section>
  </>;
}
