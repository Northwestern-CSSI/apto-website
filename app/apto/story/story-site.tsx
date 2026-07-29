"use client";

/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoConvenings,
  aptoInterface,
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
import { presentationMediaForTool, storyHeroMedia } from "../tool-media";
import { ToolResourcePath } from "../tool-resource-path";
import { ProgramIntroduction } from "../program-introduction";
import { useAptoTheme } from "../use-apto-theme";

type StorySection = "program" | "projects" | "tools" | "convening";
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoPerson = AptoParticipant["people"][number];

const storySections: StorySection[] = ["program", "projects", "tools", "convening"];

function pageCopy(slug: "/" | "/about" | "/projects" | "/tools" | "/convening") {
  const page = aptoPages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Missing Markdown page content for ${slug}`);
  return page;
}

function participantFor(id: string) {
  return aptoParticipants.find((participant) => participant.id === id);
}

function ParticipantLogo({ participant, eager = false }: { participant: AptoParticipant; eager?: boolean }) {
  return <span
    className={`story-participant-logo logo-${participant.id} logo-kind-${participant.logo.kind}`}
    aria-hidden="true"
  >
    <span className="story-logo-canvas">
      <img
        className="story-logo-asset is-light"
        src={withDeploymentBase(participant.logo.variants.light.src)}
        width={participant.logo.variants.light.width}
        height={participant.logo.variants.light.height}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <img
        className="story-logo-asset is-dark"
        src={withDeploymentBase(participant.logo.variants.dark.src)}
        width={participant.logo.variants.dark.width}
        height={participant.logo.variants.dark.height}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  </span>;
}

function StoryExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href}>{children}<span aria-hidden="true"> ↗</span></a>;
}

function StoryThemeToggle({ theme, onToggle }: { theme: AptoTheme; onToggle: () => void }) {
  const lightLabel = aptoInterface.directions.find((direction) => direction.id === "nsfhome")?.label ?? "Light";
  const darkLabel = aptoInterface.directions.find((direction) => direction.id === "nsfnetwork")?.label ?? "Dark";
  const nextLabel = theme === "dark" ? lightLabel : darkLabel;
  return <button
    className="story-theme-toggle"
    type="button"
    role="switch"
    aria-checked={theme === "dark"}
    aria-label={`${aptoInterface.study.themeChooserLabel}: ${darkLabel}`}
    title={`${aptoInterface.study.themeSwitchActionPrefix} ${nextLabel}`}
    onClick={onToggle}
    data-testid="story-theme-toggle"
  >
    <Sun aria-hidden="true" focusable="false" />
    <span aria-hidden="true" />
    <Moon aria-hidden="true" focusable="false" />
  </button>;
}

function useStoryExperience(
  rootRef: React.RefObject<HTMLDivElement | null>,
  setActiveSection: (section: StorySection) => void,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionPreference.matches;
    const revealElements = [...root.querySelectorAll<HTMLElement>("[data-story-reveal]")];
    const sectionElements = [...root.querySelectorAll<HTMLElement>("[data-story-section]")];
    const parallaxElements = [...root.querySelectorAll<HTMLElement>("[data-story-parallax]")];
    const impactGroups = [...root.querySelectorAll<HTMLElement>("[data-story-impact-group]")];
    const impactLogos = [...root.querySelectorAll<HTMLElement>("[data-story-impact-logo]")];
    const revealVectors: Record<string, readonly [number, number]> = {
      heading: [0, 0],
      left: [-18, 0],
      right: [18, 0],
      media: [0, 16],
      up: [0, 26],
    };
    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
    const documentTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    let frame = 0;
    const updateScrollState = () => {
      frame = 0;
      const headerHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue("--story-header-height")) || 72;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const sectionLine = headerHeight + viewportHeight * 0.2;
      let nextSection: StorySection = "program";
      sectionElements.forEach((element) => {
        const candidate = element.dataset.storySection as StorySection | undefined;
        if (candidate && storySections.includes(candidate) && element.getBoundingClientRect().top <= sectionLine) {
          nextSection = candidate;
        }
      });
      setActiveSection(nextSection);

      if (!reduceMotion) {
        const revealStart = viewportHeight * 0.92;
        const revealEnd = Math.max(headerHeight + 24, viewportHeight * 0.59);
        const revealDistance = Math.max(1, revealStart - revealEnd);
        revealElements.forEach((element) => {
          const screenTop = documentTop(element) - window.scrollY;
          const order = Number(element.dataset.storyRevealOrder ?? "0");
          const stagger = Number.isFinite(order) ? order * 18 : 0;
          const linearProgress = clamp01((revealStart - screenTop - stagger) / revealDistance);
          const progress = linearProgress * linearProgress * (3 - 2 * linearProgress);
          const [baseX, baseY] = revealVectors[element.dataset.storyReveal ?? "up"] ?? revealVectors.up;
          const remaining = 1 - progress;
          element.style.setProperty("--story-reveal-progress", progress.toFixed(4));
          element.style.setProperty("--story-reveal-opacity", progress.toFixed(4));
          element.style.setProperty("--story-reveal-x", `${(baseX * remaining).toFixed(2)}px`);
          element.style.setProperty("--story-reveal-y", `${(baseY * remaining).toFixed(2)}px`);
          element.classList.toggle("is-visible", progress >= 0.995);
        });

        parallaxElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const centerDelta = rect.top + rect.height / 2 - viewportHeight / 2;
          const speed = Number(element.dataset.storyParallax ?? "0.06");
          const requestedLimit = Number(element.dataset.storyParallaxLimit ?? "48");
          const limit = Number.isFinite(requestedLimit) ? Math.max(0, requestedLimit) : 48;
          const shift = Math.max(-limit, Math.min(limit, -centerDelta * speed));
          const progress = clamp01((viewportHeight - rect.top) / (viewportHeight + rect.height));
          element.style.setProperty("--story-shift", `${shift.toFixed(2)}px`);
          element.style.setProperty("--story-shift-soft", `${(shift * .38).toFixed(2)}px`);
          element.style.setProperty("--story-shift-reverse", `${(-shift * .68).toFixed(2)}px`);
          element.style.setProperty("--story-local-progress", progress.toFixed(4));
          element.style.setProperty("--story-scale", (1.035 + progress * .04).toFixed(4));
        });
      } else {
        revealElements.forEach((element) => {
          element.style.setProperty("--story-reveal-progress", "1");
          element.style.setProperty("--story-reveal-opacity", "1");
          element.style.setProperty("--story-reveal-x", "0px");
          element.style.setProperty("--story-reveal-y", "0px");
          element.classList.add("is-visible");
        });
      }

      if (impactGroups.length > 0) {
        const marker = window.scrollY + headerHeight + Math.max(0, viewportHeight - headerHeight) * .48;
        const centers = impactGroups.map((element) => documentTop(element) + element.offsetHeight / 2);
        let impactPosition = 0;
        if (centers.length > 1 && marker >= centers.at(-1)!) {
          impactPosition = centers.length - 1;
        } else if (centers.length > 1 && marker > centers[0]) {
          for (let index = 0; index < centers.length - 1; index += 1) {
            if (marker <= centers[index + 1]) {
              const linear = clamp01((marker - centers[index]) / Math.max(1, centers[index + 1] - centers[index]));
              const progress = reduceMotion ? (linear >= .5 ? 1 : 0) : linear * linear * (3 - 2 * linear);
              impactPosition = index + progress;
              break;
            }
          }
        }
        const currentIndex = Math.round(impactPosition);
        impactGroups.forEach((element, index) => {
          const distance = Math.abs(index - impactPosition);
          const focus = reduceMotion ? 1 : Math.max(.34, 1 - distance * .56);
          element.style.setProperty("--story-impact-focus", focus.toFixed(4));
          element.classList.toggle("is-current", index === currentIndex);
        });
        impactLogos.forEach((element, index) => {
          const delta = index - impactPosition;
          const distance = Math.abs(delta);
          const opacity = reduceMotion ? (index === currentIndex ? 1 : 0) : clamp01(1 - distance * 1.18);
          const sideDirection = element.dataset.storyImpactSide === "left" ? -1 : 1;
          const shift = reduceMotion ? 0 : sideDirection * (delta < 0 ? delta * 86 : delta * 48);
          const scale = reduceMotion ? 1 : .9 + opacity * .1;
          const blur = reduceMotion ? 0 : Math.min(7, distance * 4.5);
          element.style.setProperty("--story-impact-logo-opacity", opacity.toFixed(4));
          element.style.setProperty("--story-impact-logo-x", `${shift.toFixed(2)}px`);
          element.style.setProperty("--story-impact-logo-scale", scale.toFixed(4));
          element.style.setProperty("--story-impact-logo-blur", `${blur.toFixed(2)}px`);
          element.classList.toggle("is-current", index === currentIndex);
        });
      }
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };
    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      updateScrollState();
      root.classList.toggle("is-motion-ready", !reduceMotion);
    };
    // Scrollspy remains functional when motion is reduced; only decorative
    // transforms are omitted in that preference.
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.visualViewport?.addEventListener("resize", handleScroll);
    motionPreference.addEventListener("change", handleMotionPreference);
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(handleScroll) : undefined;
    resizeObserver?.observe(root);
    updateScrollState();
    root.classList.toggle("is-motion-ready", !reduceMotion);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.visualViewport?.removeEventListener("resize", handleScroll);
      motionPreference.removeEventListener("change", handleMotionPreference);
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("is-motion-ready");
    };
  }, [rootRef, setActiveSection]);
}

function StoryHeader({ activeSection, theme, onToggle }: {
  activeSection: StorySection;
  theme: AptoTheme;
  onToggle: () => void;
}) {
  const navLabels: Record<StorySection, string> = {
    program: aptoInterface.story.programLabel,
    projects: aptoInterface.primaryNavigation.find((item) => item.section === "projects")?.label ?? "Projects",
    tools: aptoInterface.primaryNavigation.find((item) => item.section === "tools")?.label ?? "Tools",
    convening: aptoInterface.primaryNavigation.find((item) => item.section === "convening")?.label ?? "Convening",
  };
  return <header className="story-header" data-testid="story-header">
    <a className="story-brand" href="#story-top" aria-label="APTO story home">
      <strong>{aptoProgram.acronym}</strong>
      <span>{aptoProgram.name}</span>
    </a>
    <nav aria-label={aptoInterface.story.navigationLabel}>
      {storySections.map((section) => <a
        key={section}
        href={`#story-${section}`}
        aria-current={activeSection === section ? "location" : undefined}
        data-testid={`story-nav-${section}`}
      >{navLabels[section]}</a>)}
    </nav>
    <div className="story-header-actions">
      <a className="story-directory-link" href={aptoRoute("/atlas")}>Atlas view</a>
      <StoryThemeToggle theme={theme} onToggle={onToggle} />
    </div>
  </header>;
}

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

function StoryHero() {
  const home = pageCopy("/");
  const heroTool = aptoTools.find((tool) => tool.figure.kind === "knowledge-map") ?? aptoTools[0];
  const heroDetail = heroTool.galleryImages[0];
  // Retain the inset implementation for a future re-enable without loading or
  // displaying it in the current design.
  const showHeroInset = false;
  return <section className="story-hero" id="story-top" aria-labelledby="story-title">
    <div className="story-hero-copy" data-story-reveal="heading" data-story-parallax="-0.030" data-story-parallax-limit="48">
      <h1 id="story-title">{home.title}</h1>
      <ProgramIntroduction
        introduction={home.introduction}
        projectHref={(projectId) => `#story-project-${projectId}`}
      />
    </div>
    <figure className="story-hero-visual" data-story-reveal="media" data-story-parallax="0.072" data-story-parallax-limit="92">
      <div className="story-hero-image">
        <ToolKenBurnsGallery
          galleryId="story-hero"
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

function ProgramStory() {
  return <>
    <section className="story-section story-program" id="story-program" data-story-section="program" aria-labelledby="story-program-title">
      <header className="story-section-heading" data-story-reveal="heading">
        <h2 id="story-program-title">{aptoProgram.buildingTitle}</h2>
        <span>{aptoProgram.buildingIntroduction}</span>
      </header>
      <OutcomePanorama />
    </section>
    <section className="story-section story-impact" id="story-impact" data-story-section="program" aria-labelledby="story-impact-title">
      <header className="story-section-heading" data-story-reveal="heading">
        <h2 id="story-impact-title">{aptoProgram.objectivesTitle}</h2>
        <span>{aptoProgram.impactIntroduction}</span>
      </header>
      <div className="story-impact-layout">
        <div className="story-impact-stream">
          {aptoProgram.impactGroups.map((group, groupIndex) => {
            const participant = participantFor(group.participantId);
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
                aria-labelledby={`story-impact-${participant.id}`}
                style={{
                  "--story-impact-accent": participant.accent,
                  "--story-impact-focus": groupIndex === 0 ? 1 : .34,
                } as CSSProperties}
              >
                <header>
                  <span className="story-impact-inline-logo"><ParticipantLogo participant={participant} /></span>
                  <h3 id={`story-impact-${participant.id}`}>{participant.displayName}</h3>
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

function StoryPerson({ person }: { person: AptoPerson }) {
  return <article className="story-person">
    {person.headshotUrl
      ? <img src={withDeploymentBase(person.headshotUrl)} alt={person.headshotAlt} width="120" height="120" loading="lazy" decoding="async" />
      : <span className="story-person-initials" aria-hidden="true">{person.initials}</span>}
    <div><h4>{person.name}</h4><p>{person.role}</p>{person.profileUrl && <StoryExternalLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</StoryExternalLink>}</div>
  </article>;
}

function ProjectsStory() {
  const projects = pageCopy("/projects");
  return <section className="story-section story-projects" id="story-projects" data-story-section="projects" aria-labelledby="story-projects-title">
    <header className="story-section-heading" data-story-reveal="heading">
      <h2 id="story-projects-title">{projects.title}</h2>
      <span>{projects.introduction}</span>
    </header>
    <div className="story-projects-layout">
      <div className="story-project-chapters">
        {aptoProjects.map((project) => {
          const participant = participantFor(project.participantId);
          return <article
            className="story-project-chapter"
            id={`story-project-${project.id}`}
            key={project.id}
            data-project-id={project.id}
            data-story-reveal="up"
            style={{ "--project-accent": participant?.accent ?? "var(--story-teal)" } as CSSProperties}
          >
            <header>
              {participant && <ParticipantLogo participant={participant} />}
              <div>
                <p>Led by {participant?.displayName ?? project.organization}</p>
                <span className="story-project-location">{project.location}</span>
                <h3>{project.shortName}</h3>
              </div>
            </header>
            <p>{project.summary}</p>
            <div className="story-project-meta">
              <span>{aptoInterface.projects.awardedPrefix} {project.awardedYear} {aptoInterface.projects.dateStatusSeparator} {project.statusLabel}</span>
              <div>
                <StoryExternalLink href={project.awardUrl}>{aptoInterface.projects.awardLabel} {project.awardId}</StoryExternalLink>
                {participant && <StoryExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</StoryExternalLink>}
              </div>
            </div>
            <div
              className="story-project-people"
              data-people-layout={["northwestern", "uchicago"].includes(project.participantId) ? "grid" : "rows"}
              aria-label={aptoInterface.accessibility.projectInvestigatorsLabel}
            >
              {project.people.map((person) => <StoryPerson person={person} key={person.id} />)}
            </div>
          </article>;
        })}
      </div>
    </div>
  </section>;
}

function ToolsStory() {
  const tools = pageCopy("/tools");
  const northwesternTools = aptoTools.filter((tool) => tool.participantId === "northwestern");
  const uchicagoTools = aptoTools.filter((tool) => tool.participantId === "uchicago");
  const supportingTools = aptoTools.filter((tool) => !["northwestern", "uchicago"].includes(tool.participantId));
  const pairedRows = Array.from(
    { length: Math.max(northwesternTools.length, uchicagoTools.length) },
    (_, index) => [northwesternTools[index], uchicagoTools[index]] as const,
  );

  const toolCard = (tool: (typeof aptoTools)[number], index: number) => {
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
    <div className="story-tool-matrix" aria-label="Northwestern University and University of Chicago tools">
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
  useStoryExperience(rootRef, setActiveSection);

  return <div className="apto-story" ref={rootRef} data-theme={theme}>
    <a className="story-skip-link" href="#story-main">{aptoInterface.accessibility.skipLinkLabel}</a>
    <StoryHeader activeSection={activeSection} theme={theme} onToggle={toggleTheme} />
    <main id="story-main" tabIndex={-1}>
      <StoryHero />
      <ProgramStory />
      <ProjectsStory />
      <ToolsStory />
      <ConveningStory />
    </main>
    <StoryFooter />
  </div>;
}
