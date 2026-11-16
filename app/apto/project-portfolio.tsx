/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, type CSSProperties, type ReactNode } from "react";

import { aptoInterface, aptoPages, aptoParticipants, aptoProjects } from "./content";
import { ParticipantLogo } from "./participant-logo";
import { orderByParticipant, orderParticipantMentions, participantOrderForOccurrence } from "./participant-order";
import { withDeploymentBase } from "./paths";

type AptoPerson = (typeof aptoParticipants)[number]["people"][number];

function ProjectLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href}>{children}<span aria-hidden="true"> ↗</span></a>;
}

function ProjectPerson({ person, Heading }: { person: AptoPerson; Heading: "h3" | "h4" }) {
  return <article className="story-person">
    {person.headshotUrl
      ? <img src={withDeploymentBase(person.headshotUrl)} alt={person.headshotAlt} width="120" height="120" loading="lazy" decoding="async" />
      : <span className="story-person-initials" aria-hidden="true">{person.initials}</span>}
    <div><Heading>{person.name}</Heading><p>{person.role}</p>{person.profileUrl && <ProjectLink href={person.profileUrl}>{aptoInterface.people.viewProfileLabel}</ProjectLink>}</div>
  </article>;
}

export function ProjectPortfolio({ participantOrder, view }: {
  participantOrder: readonly string[];
  view: "atlas" | "story";
}) {
  const projects = aptoPages.find((page) => page.slug === "/projects");
  if (!projects) throw new Error("Missing Markdown page content for /projects");
  const orderedProjects = orderByParticipant(
    aptoProjects,
    participantOrderForOccurrence(participantOrder, 1),
  );
  const isAtlas = view === "atlas";
  const Wrapper = isAtlas ? "main" : "section";
  const Title = isAtlas ? "h1" : "h2";
  const ProjectHeading = isAtlas ? "h2" : "h3";
  const titleId = `${view}-projects-title`;

  useEffect(() => {
    const hash = window.location.hash;
    if (isAtlas && hash.startsWith("#atlas-project-")) {
      // The first client render can reorder the cards after the browser resolves the fragment.
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant" });
    }
  }, [isAtlas, participantOrder]);

  return <Wrapper
    className="story-section story-projects"
    id={isAtlas ? "atlas-main" : "story-projects"}
    tabIndex={isAtlas ? -1 : undefined}
    data-story-section={isAtlas ? undefined : "projects"}
    aria-labelledby={titleId}
  >
    <header className="story-section-heading" data-story-reveal="heading">
      <Title id={titleId}>{projects.title}</Title>
      <span>{orderParticipantMentions(projects.introduction, participantOrder)}</span>
    </header>
    <div className="story-projects-layout">
      <div className="story-project-chapters">
        {orderedProjects.map((project) => {
          const participant = aptoParticipants.find((candidate) => candidate.id === project.participantId);
          return <article
            className="story-project-chapter"
            id={`${view}-project-${project.id}`}
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
                <ProjectHeading>{project.shortName}</ProjectHeading>
              </div>
            </header>
            <p>{project.summary}</p>
            <div className="story-project-meta">
              <span>{aptoInterface.projects.awardedPrefix} {project.awardedYear} {aptoInterface.projects.dateStatusSeparator} {project.statusLabel}</span>
              <div>
                <ProjectLink href={project.awardUrl}>{aptoInterface.projects.awardLabel} {project.awardId}</ProjectLink>
                {participant && <ProjectLink href={participant.website}>{aptoInterface.common.organizationWebsiteLabel}</ProjectLink>}
              </div>
            </div>
            <div
              className="story-project-people"
              data-people-layout={["northwestern", "uchicago"].includes(project.participantId) ? "grid" : "rows"}
              aria-label={aptoInterface.accessibility.projectInvestigatorsLabel}
            >
              {project.people.map((person) => <ProjectPerson person={person} Heading={isAtlas ? "h3" : "h4"} key={person.id} />)}
            </div>
          </article>;
        })}
      </div>
    </div>
  </Wrapper>;
}
