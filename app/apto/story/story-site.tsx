"use client";

/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoInterface,
  aptoPages,
  aptoParticipants,
  aptoProgram,
  aptoProjects,
  aptoTools,
} from "../content";
import { aptoRoute, withDeploymentBase } from "../paths";
import type { AptoTheme } from "../theme";
import { useAptoTheme } from "../use-apto-theme";

type StorySection = "program" | "projects" | "tools" | "cohort";
type AptoParticipant = (typeof aptoParticipants)[number];
type AptoPerson = AptoParticipant["people"][number];

const storySections: StorySection[] = ["program", "projects", "tools", "cohort"];

function pageCopy(slug: "/" | "/about" | "/projects" | "/tools" | "/cohort") {
  const page = aptoPages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Missing Markdown page content for ${slug}`);
  return page;
}

function participantFor(id: string) {
  return aptoParticipants.find((participant) => participant.id === id);
}

function ParticipantLogo({ participant, eager = false }: { participant: AptoParticipant; eager?: boolean }) {
  return <span className={`story-participant-logo logo-${participant.id} asset-on-${participant.logo.surface}`} aria-hidden="true">
    <img
      src={withDeploymentBase(participant.logo.src)}
      width={participant.logo.width}
      height={participant.logo.height}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
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
  setActiveProject: (projectId: string) => void,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsObserver = "IntersectionObserver" in window;
    const revealElements = [...root.querySelectorAll<HTMLElement>("[data-story-reveal]")];
    let revealObserver: IntersectionObserver | undefined;

    if (!reduceMotion && supportsObserver) {
      root.classList.add("is-motion-ready");
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("is-visible");
          revealObserver?.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -4% 0px", threshold: 0.04 });
      revealElements.forEach((element) => revealObserver?.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    }

    const sectionElements = [...root.querySelectorAll<HTMLElement>("[data-story-section]")];
    const projectElements = [...root.querySelectorAll<HTMLElement>("[data-project-id]")];
    const parallaxElements = [...root.querySelectorAll<HTMLElement>("[data-story-parallax]")];
    let frame = 0;
    const updateScrollState = () => {
      frame = 0;
      const headerHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue("--story-header-height")) || 72;
      const sectionLine = headerHeight + window.innerHeight * 0.2;
      let nextSection: StorySection = "program";
      sectionElements.forEach((element) => {
        const candidate = element.dataset.storySection as StorySection | undefined;
        if (candidate && storySections.includes(candidate) && element.getBoundingClientRect().top <= sectionLine) {
          nextSection = candidate;
        }
      });
      setActiveSection(nextSection);

      const projectLine = headerHeight + window.innerHeight * 0.34;
      const nearestProject = projectElements
        .map((element) => ({ element, distance: Math.abs(element.getBoundingClientRect().top - projectLine) }))
        .sort((left, right) => left.distance - right.distance)[0]?.element;
      const projectId = nearestProject?.dataset.projectId;
      if (projectId) setActiveProject(projectId);

      if (!reduceMotion) {
        parallaxElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const centerDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
          const speed = Number(element.dataset.storyParallax ?? "0.06");
          const shift = Math.max(-48, Math.min(48, -centerDelta * speed));
          element.style.setProperty("--story-shift", `${shift.toFixed(2)}px`);
        });
      }
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };
    // Scrollspy remains functional when motion is reduced; only decorative
    // transforms are omitted in that preference.
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    updateScrollState();

    return () => {
      revealObserver?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("is-motion-ready");
    };
  }, [rootRef, setActiveProject, setActiveSection]);
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
  return <section className="story-hero" id="story-top" aria-labelledby="story-title">
    <div className="story-hero-copy" data-story-reveal>
      <p className="story-kicker">{home.eyebrow}</p>
      <h1 id="story-title">{home.title}</h1>
      <p>{home.introduction}</p>
      <a className="story-scroll-cue" href="#story-program">
        <span>{aptoInterface.story.scrollPrompt}</span>
        <span aria-hidden="true">↓</span>
      </a>
    </div>
    <figure className="story-hero-visual" data-story-reveal>
      <div className="story-hero-image" data-story-parallax="0.045">
        <img
          src={withDeploymentBase(heroTool.figure.src)}
          alt={heroTool.figure.alt}
          width="1200"
          height="900"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <span className="story-orbit is-one" aria-hidden="true" />
      <span className="story-orbit is-two" aria-hidden="true" />
      <figcaption><span>{aptoInterface.story.viewLabel}</span>{heroTool.figure.label}</figcaption>
    </figure>
  </section>;
}

function ProgramStory() {
  const about = pageCopy("/about");
  return <section className="story-section story-program" id="story-program" data-story-section="program" aria-labelledby="story-program-title">
    <header className="story-section-heading" data-story-reveal>
      <p>{aptoInterface.story.programLabel}</p>
      <h2 id="story-program-title">{about.title}</h2>
      <span>{aptoProgram.description}</span>
    </header>
    <div className="story-objectives" data-story-reveal>
      <h3>{aptoProgram.objectivesTitle}</h3>
      <ul>{aptoProgram.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
    </div>
    <div className="story-framework" aria-label={aptoProgram.framework.ariaLabel}>
      <section data-story-reveal>
        <header><p>{aptoProgram.framework.outcomesTitle}</p><span>{aptoProgram.framework.outcomesNote}</span></header>
        <dl>{aptoProgram.outcomes.map((outcome) => <div key={outcome.name}><dt>{outcome.name}</dt><dd>{outcome.description}</dd></div>)}</dl>
      </section>
      <section data-story-reveal>
        <header><p>{aptoProgram.framework.effortsTitle}</p><span>{aptoProgram.framework.effortsNote}</span></header>
        <dl>{aptoProgram.linesOfEffort.map((effort) => <div key={effort.id}><dt>{effort.title}</dt><dd>{effort.description}</dd></div>)}</dl>
      </section>
    </div>
  </section>;
}

function StoryProjectStage({ activeProject }: { activeProject: string }) {
  const current = aptoProjects.find((project) => project.id === activeProject) ?? aptoProjects[0];
  const participant = participantFor(current.participantId);
  return <aside className="story-project-stage" aria-label={aptoInterface.story.projectStageTitle}>
    <div className="story-project-stage-copy">
      <p>{aptoInterface.story.projectsLabel}</p>
      <h3>{aptoInterface.story.projectStageTitle}</h3>
      <span>{aptoInterface.story.projectStageDescription}</span>
    </div>
    <div className="story-map">
      <img src={withDeploymentBase(aptoInterface.projects.map.imageUrl)} alt="" width="959" height="593" loading="lazy" />
      {aptoProjects.map((project) => {
        const projectParticipant = participantFor(project.participantId);
        if (!projectParticipant) return null;
        return <a
          key={project.id}
          className={activeProject === project.id ? "is-active" : undefined}
          href={`#story-project-${project.id}`}
          aria-label={`${projectParticipant.displayName}: ${project.shortName}`}
          style={{ left: `${projectParticipant.mapPosition.x}%`, top: `${projectParticipant.mapPosition.y}%`, "--project-accent": projectParticipant.accent } as CSSProperties}
        ><span>{projectParticipant.displayName}</span></a>;
      })}
    </div>
    <div className="story-project-stage-active" style={{ "--project-accent": participant?.accent ?? "var(--story-teal)" } as CSSProperties}>
      {participant && <ParticipantLogo participant={participant} />}
      <div><strong>{current.shortName}</strong><span>{current.location}</span></div>
    </div>
  </aside>;
}

function ProjectsStory({ activeProject }: { activeProject: string }) {
  const projects = pageCopy("/projects");
  return <section className="story-section story-projects" id="story-projects" data-story-section="projects" aria-labelledby="story-projects-title">
    <header className="story-section-heading" data-story-reveal>
      <p>{aptoInterface.story.projectsLabel}</p>
      <h2 id="story-projects-title">{projects.title}</h2>
      <span>{projects.introduction}</span>
    </header>
    <div className="story-projects-layout">
      <StoryProjectStage activeProject={activeProject} />
      <div className="story-project-chapters">
        {aptoProjects.map((project) => {
          const participant = participantFor(project.participantId);
          return <article
            className="story-project-chapter"
            id={`story-project-${project.id}`}
            key={project.id}
            data-project-id={project.id}
            data-story-reveal
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
  return <section className="story-section story-tools" id="story-tools" data-story-section="tools" aria-labelledby="story-tools-title">
    <header className="story-section-heading" data-story-reveal>
      <p>{aptoInterface.story.toolsLabel}</p>
      <h2 id="story-tools-title">{tools.title}</h2>
      <span>{tools.introduction}</span>
    </header>
    <p className="story-tools-count" data-story-reveal>{aptoTools.length} {aptoInterface.story.toolCollectionLabel}</p>
    <div className="story-tool-grid">
      {aptoTools.map((tool) => {
        const participant = participantFor(tool.participantId);
        return <article className="story-tool" key={tool.id} data-story-reveal>
          <figure>
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
      })}
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
    <div className="story-cohort-art" data-story-parallax="0.028" aria-hidden="true">
      <img src={withDeploymentBase(aptoInterface.story.cohortArtSrc)} alt="" width="1400" height="900" loading="lazy" decoding="async" />
    </div>
    <header className="story-section-heading" data-story-reveal>
      <p>{aptoInterface.story.cohortLabel}</p>
      <h2 id="story-cohort-title">{cohort.title}</h2>
      <span>{cohort.introduction}</span>
    </header>
    <section className="story-program-team" aria-labelledby="story-program-team-title" data-story-reveal>
      <h3 id="story-program-team-title">{aptoInterface.story.programLeadershipLabel}</h3>
      <div>{aptoProgram.programTeam.map((person) => <StoryPerson person={person} key={person.id} />)}</div>
    </section>
    <div className="story-cohort-directory">
      {aptoParticipants.map((participant) => <article
        className="story-cohort-group"
        key={participant.id}
        data-story-reveal
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
  const [activeProject, setActiveProject] = useState(aptoProjects[0]?.id ?? "");
  const { theme, toggleTheme } = useAptoTheme("light");
  useStoryExperience(rootRef, setActiveSection, setActiveProject);

  return <div className="apto-story" ref={rootRef} data-theme={theme}>
    <a className="story-skip-link" href="#story-main">{aptoInterface.accessibility.skipLinkLabel}</a>
    <StoryHeader activeSection={activeSection} theme={theme} onToggle={toggleTheme} />
    <main id="story-main" tabIndex={-1}>
      <StoryHero />
      <ProgramStory />
      <ProjectsStory activeProject={activeProject} />
      <ToolsStory />
      <CohortStory />
    </main>
    <StoryFooter />
  </div>;
}
