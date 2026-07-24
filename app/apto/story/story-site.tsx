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
import { useAptoTheme } from "../use-apto-theme";

type StorySection = "program" | "projects" | "tools" | "cohort" | "convening";
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoPerson = AptoParticipant["people"][number];

const storySections: StorySection[] = ["program", "projects", "tools", "cohort", "convening"];

function pageCopy(slug: "/" | "/about" | "/projects" | "/tools" | "/cohort" | "/convening") {
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
    cohort: aptoInterface.primaryNavigation.find((item) => item.section === "cohort")?.label ?? "Cohort",
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
      <a className="story-directory-link" href={aptoRoute()}>{aptoInterface.story.directoryLabel}</a>
      <StoryThemeToggle theme={theme} onToggle={onToggle} />
    </div>
  </header>;
}

function StoryHero() {
  const home = pageCopy("/");
  const heroTool = aptoTools.find((tool) => tool.figure.kind === "knowledge-map") ?? aptoTools[0];
  const heroDetail = heroTool.galleryImages[0];
  return <section className="story-hero" id="story-top" aria-labelledby="story-title">
    <div className="story-hero-copy" data-story-reveal="heading">
      <h1 id="story-title">{home.title}</h1>
      <p>{home.introduction}</p>
      <a className="story-scroll-cue" href="#story-program">
        <span>{aptoInterface.story.scrollPrompt}</span>
        <span aria-hidden="true">↓</span>
      </a>
    </div>
    <figure className="story-hero-visual" data-story-reveal="media" data-story-parallax="0.038">
      <div className="story-hero-image">
        <img
          className="story-hero-primary"
          src={withDeploymentBase(heroTool.figure.src)}
          alt={heroTool.figure.alt}
          width="1200"
          height="900"
          decoding="async"
          fetchPriority="high"
        />
        {heroDetail && <span
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
      <figcaption>{heroTool.figure.label}</figcaption>
    </figure>
  </section>;
}

function ProgramStory() {
  const about = pageCopy("/about");
  return <section className="story-section story-program" id="story-program" data-story-section="program" aria-labelledby="story-program-title">
    <header className="story-section-heading" data-story-reveal="heading">
      <h2 id="story-program-title">{about.title}</h2>
      <span>{aptoProgram.description}</span>
    </header>
    <div className="story-objectives">
      <h3 data-story-reveal="left">{aptoProgram.objectivesTitle}</h3>
      <ul>{aptoProgram.objectives.map((objective, index) => <li
        key={objective}
        data-story-reveal="right"
        data-story-reveal-order={index}
      >{objective}</li>)}</ul>
    </div>
  </section>;
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
              <div><p>{project.organization} · {project.location}</p><h3>{project.shortName}</h3></div>
            </header>
            <p>{project.summary}</p>
            <div className="story-project-meta">
              <span>{aptoInterface.projects.awardedPrefix} {project.awardedYear} {aptoInterface.projects.dateStatusSeparator} {project.statusLabel}</span>
              <StoryExternalLink href={project.awardUrl}>{aptoInterface.projects.awardLabel} {project.awardId}</StoryExternalLink>
            </div>
            <div className="story-project-people" aria-label={aptoInterface.accessibility.projectInvestigatorsLabel}>
              {project.people.map((person) => <span key={person.id}><strong>{person.name}</strong><small>{person.role}</small></span>)}
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
    const participant = participantFor(tool.participantId);
    return <article className="story-tool" key={tool.id} data-story-reveal="media">
      <figure data-story-parallax={(.01 + index % 3 * .004).toFixed(3)}>
        <img src={withDeploymentBase(tool.figure.src)} alt={tool.figure.alt} width="900" height="600" loading="lazy" decoding="async" />
        <figcaption>{tool.figure.label}</figcaption>
      </figure>
      <div className="story-tool-copy">
        <header>
          <p>{participant?.displayName} · {tool.statusLabel}</p>
          <h3>{tool.name}</h3>
        </header>
        <p>{tool.description}</p>
        <dl><dt>{aptoInterface.tools.useCaseLabel}</dt><dd>{tool.useCase}</dd></dl>
        <div className="story-tool-footer">
          <ul aria-label={aptoInterface.tools.categoriesLabel}>{tool.categories.map((category) => <li key={category}>{category}</li>)}</ul>
          <span>
            {tool.demoVideoUrl && <StoryExternalLink href={tool.demoVideoUrl}>{aptoInterface.tools.watchDemoLabel}</StoryExternalLink>}
            {tool.toolUrl && <StoryExternalLink href={tool.toolUrl}>{aptoInterface.tools.openToolLabel}</StoryExternalLink>}
          </span>
        </div>
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
        {row.map((tool, columnIndex) => tool ? toolCard(tool, rowIndex * 2 + columnIndex) : null)}
      </div>)}
    </div>
    <div className="story-supporting-tools">
      <h3>Tools from across the APTO cohort</h3>
      <div className="story-tool-grid">
        {supportingTools.map((tool, index) => toolCard(tool, index))}
      </div>
    </div>
  </section>;
}

function StoryPerson({ person }: { person: AptoPerson | (typeof aptoProgram.programTeam)[number] }) {
  return <article className="story-person">
    {person.headshotUrl
      ? <img src={withDeploymentBase(person.headshotUrl)} alt={person.headshotAlt} width="120" height="120" loading="lazy" decoding="async" />
      : <span className="story-person-initials" aria-hidden="true">{person.initials}</span>}
    <div><h4>{person.name}</h4><p>{person.role}</p>{person.profileUrl && <StoryExternalLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</StoryExternalLink>}</div>
  </article>;
}

function CohortStory() {
  const cohort = pageCopy("/cohort");
  return <section className="story-section story-cohort" id="story-cohort" data-story-section="cohort" aria-labelledby="story-cohort-title">
    <div className="story-cohort-art" data-story-parallax="-0.018" aria-hidden="true">
      <img src={withDeploymentBase(aptoInterface.story.cohortArtSrc)} alt="" width="1400" height="900" loading="lazy" decoding="async" />
    </div>
    <header className="story-section-heading" data-story-reveal="heading">
      <h2 id="story-cohort-title">{cohort.title}</h2>
      <span>{cohort.introduction}</span>
    </header>
    <section className="story-program-team" aria-labelledby="story-program-team-title" data-story-reveal="up">
      <h3 id="story-program-team-title">{aptoInterface.story.programLeadershipLabel}</h3>
      <div>{aptoProgram.programTeam.map((person) => <StoryPerson person={person} key={person.id} />)}</div>
    </section>
    <div className="story-cohort-directory">
      {aptoParticipants.map((participant) => <article
        className="story-cohort-group"
        key={participant.id}
        data-story-reveal="up"
        style={{ "--participant-accent": participant.accent } as CSSProperties}
      >
        <header>
          <ParticipantLogo participant={participant} />
          <div><p>{participant.location}</p><h3>{participant.displayName}</h3><StoryExternalLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</StoryExternalLink></div>
        </header>
        <div className="story-cohort-people">{participant.people.map((person) => <StoryPerson person={person} key={person.id} />)}</div>
      </article>)}
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
  return <footer className="story-footer">
    <a className="story-footer-brand" href="#story-top"><strong>{aptoProgram.acronym}</strong><span>{aptoProgram.name}</span></a>
    <div className="story-footer-support">
      <img src={withDeploymentBase(aptoInterface.footer.nsfLogoSrc)} alt={aptoInterface.footer.nsfLogoAlt} width="64" height="64" loading="lazy" />
      <div><strong>{aptoInterface.story.supportedByLabel}</strong><p>{aptoBoilerplate}</p></div>
    </div>
    <div className="story-footer-links"><a href={aptoRoute()}>{aptoInterface.story.directoryLabel}</a><a href="#story-top">{aptoInterface.footer.backToTopLabel} ↑</a></div>
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
      <CohortStory />
      <ConveningStory />
    </main>
    <StoryFooter />
  </div>;
}
