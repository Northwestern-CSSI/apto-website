"use client";

/* Content-managed images use deployment-aware paths. */
/* eslint-disable @next/next/no-img-element */

import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";
import { useState, type ReactNode } from "react";

import {
  aptoBoilerplate,
  aptoInterface,
  aptoProgram,
} from "../content";
import { aptoRoute, withDeploymentBase } from "../paths";
import type { AptoTheme } from "../theme";
import { useAptoTheme } from "../use-apto-theme";
import {
  northwesternToolStories,
  type StoryPiece,
  type ToolStory,
} from "./tool-story-data";
import styles from "./tools-lab.module.css";

type ConceptId =
  | "dossier"
  | "journey"
  | "blueprint"
  | "assembly"
  | "constellation";

const storySections = ["program", "projects", "tools", "cohort", "convening"] as const;

const concepts: Array<{
  id: ConceptId;
  number: string;
  name: string;
  tone: string;
  prompt: string;
  description: string;
}> = [
  {
    id: "dossier",
    number: "01",
    name: "Editorial dossier",
    tone: "Conservative",
    prompt: "Read the argument",
    description:
      "An image-led research brief with a crisp evidence index and explicit supporting resources.",
  },
  {
    id: "journey",
    number: "02",
    name: "Milestone journey",
    tone: "Structured",
    prompt: "Follow the sequence",
    description:
      "A cinematic horizon leads into a sequenced route from foundation to destination.",
  },
  {
    id: "blueprint",
    number: "03",
    name: "Evidence blueprint",
    tone: "Analytical",
    prompt: "Trace the system",
    description:
      "A technical map links image callouts, research components, phases, and system output.",
  },
  {
    id: "assembly",
    number: "04",
    name: "Assembly mosaic",
    tone: "Creative",
    prompt: "Assemble the parts",
    description:
      "Six interlocking research streams literally assemble one complete tool and its story.",
  },
  {
    id: "constellation",
    number: "05",
    name: "Signal constellation",
    tone: "Experimental",
    prompt: "See the relationships",
    description:
      "The tool becomes a luminous core surrounded by orbiting evidence, methods, and outcomes.",
  },
];

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href}>
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

function PieceLink({
  resource,
  className,
  compact = false,
}: {
  resource: NonNullable<StoryPiece["resource"]>;
  className?: string;
  compact?: boolean;
}) {
  return (
    <ExternalLink className={className} href={resource.href}>
      {compact ? "Evidence" : resource.label}
    </ExternalLink>
  );
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: AptoTheme;
  onToggle: () => void;
}) {
  const lightLabel =
    aptoInterface.directions.find((direction) => direction.id === "nsfhome")?.label ??
    "Light";
  const darkLabel =
    aptoInterface.directions.find((direction) => direction.id === "nsfnetwork")?.label ??
    "Dark";
  const nextLabel = theme === "dark" ? lightLabel : darkLabel;

  return (
    <button
      className="story-theme-toggle"
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={`${aptoInterface.study.themeChooserLabel}: ${darkLabel}`}
      title={`${aptoInterface.study.themeSwitchActionPrefix} ${nextLabel}`}
      onClick={onToggle}
    >
      <Sun aria-hidden="true" focusable="false" />
      <span aria-hidden="true" />
      <Moon aria-hidden="true" focusable="false" />
    </button>
  );
}

function StoryHeader({
  theme,
  onToggle,
}: {
  theme: AptoTheme;
  onToggle: () => void;
}) {
  const labels = {
    program: aptoInterface.story.programLabel,
    projects:
      aptoInterface.primaryNavigation.find((item) => item.section === "projects")?.label ??
      "Projects",
    tools:
      aptoInterface.primaryNavigation.find((item) => item.section === "tools")?.label ??
      "Tools",
    cohort:
      aptoInterface.primaryNavigation.find((item) => item.section === "cohort")?.label ??
      "Cohort",
    convening:
      aptoInterface.primaryNavigation.find((item) => item.section === "convening")?.label ??
      "Convening",
  };

  return (
    <header className="story-header">
      <a
        className="story-brand"
        href={`${aptoRoute("story")}#story-top`}
        aria-label="APTO story home"
      >
        <strong>{aptoProgram.acronym}</strong>
        <span>{aptoProgram.name}</span>
      </a>
      <nav aria-label={aptoInterface.story.navigationLabel}>
        {storySections.map((section) => (
          <a
            key={section}
            href={
              section === "tools"
                ? "#story-tools"
                : `${aptoRoute("story")}#story-${section}`
            }
            aria-current={section === "tools" ? "location" : undefined}
          >
            {labels[section]}
          </a>
        ))}
      </nav>
      <div className="story-header-actions">
        <a className="story-directory-link" href={aptoRoute()}>
          {aptoInterface.story.directoryLabel}
        </a>
        <ThemeToggle theme={theme} onToggle={onToggle} />
      </div>
    </header>
  );
}

function ConceptMark({ concept }: { concept: ConceptId }) {
  return (
    <span className={styles.conceptMark} data-mark={concept} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <i key={index} />
      ))}
    </span>
  );
}

function ConceptSelector({
  concept,
  onChange,
}: {
  concept: ConceptId;
  onChange: (concept: ConceptId) => void;
}) {
  const active = concepts.find((candidate) => candidate.id === concept) ?? concepts[0];

  return (
    <section className={styles.conceptDeck} aria-labelledby="concept-deck-title">
      <header className={styles.conceptDeckHeader}>
        <div>
          <p>Card concept</p>
          <h3 id="concept-deck-title">Change the storytelling system</h3>
        </div>
        <p aria-live="polite">
          <strong>{active.name}</strong>
          <span>{active.description}</span>
        </p>
      </header>
      <div className={styles.conceptTrack} aria-label="Choose one concept for all tool cards">
        {concepts.map((option) => (
          <button
            type="button"
            key={option.id}
            data-concept={option.id}
            aria-pressed={concept === option.id}
            aria-controls="tool-story-grid"
            onClick={() => onChange(option.id)}
          >
            <span className={styles.conceptNumber}>{option.number}</span>
            <ConceptMark concept={option.id} />
            <span className={styles.conceptTone}>{option.tone}</span>
            <strong>{option.name}</strong>
            <small>{option.prompt}</small>
          </button>
        ))}
      </div>
      <div className={styles.conceptRange} aria-hidden="true">
        <span>More familiar</span>
        <i />
        <span>More experimental</span>
      </div>
    </section>
  );
}

function ToolKicker({ tool, inverse = false }: { tool: ToolStory; inverse?: boolean }) {
  return (
    <p className={styles.toolKicker} data-inverse={inverse ? "true" : undefined}>
      <span>{tool.number}</span>
      Northwestern University · {tool.statusLabel}
    </p>
  );
}

function CardFooter({ tool, inverse = false }: { tool: ToolStory; inverse?: boolean }) {
  return (
    <footer className={styles.cardFooter} data-inverse={inverse ? "true" : undefined}>
      <ul aria-label={aptoInterface.tools.categoriesLabel}>
        {tool.categories.map((category) => (
          <li key={category}>{category}</li>
        ))}
      </ul>
      <span>
        {tool.demoVideoUrl && (
          <ExternalLink href={tool.demoVideoUrl}>
            {aptoInterface.tools.watchDemoLabel}
          </ExternalLink>
        )}
        {tool.toolUrl && (
          <ExternalLink href={tool.toolUrl}>
            {aptoInterface.tools.openToolLabel}
          </ExternalLink>
        )}
      </span>
    </footer>
  );
}

function DossierCard({ tool }: { tool: ToolStory }) {
  return (
    <article className={`story-tool ${styles.toolCard}`} data-concept="dossier">
      <figure className={styles.dossierVisual}>
        <img
          src={withDeploymentBase(tool.figure.src)}
          alt={tool.figure.alt}
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <span className={styles.visualNumber}>{tool.number}</span>
        <figcaption>{tool.figure.label}</figcaption>
      </figure>
      <div className={styles.dossierBody}>
        <header className={styles.dossierTitle}>
          <ToolKicker tool={tool} />
          <h3>{tool.name}</h3>
          <p>{tool.description}</p>
        </header>
        <blockquote className={styles.dossierThesis}>
          <span>The argument</span>
          <p>{tool.storyLine}</p>
        </blockquote>
        <div className={styles.dossierIndex}>
          {tool.pieces.map((piece, index) => (
            <section key={piece.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{piece.role}</p>
                <h4>{piece.title}</h4>
                <small>{piece.summary}</small>
                {piece.resource && (
                  <PieceLink resource={piece.resource} className={styles.dossierLink} />
                )}
              </div>
            </section>
          ))}
        </div>
        <aside className={styles.dossierUseCase}>
          <strong>{aptoInterface.tools.useCaseLabel}</strong>
          <p>{tool.useCase}</p>
        </aside>
        <div className={styles.dossierOutcome}>
          <span>What it adds up to</span>
          <p>{tool.synthesis}</p>
        </div>
        <CardFooter tool={tool} />
      </div>
    </article>
  );
}

function JourneyCard({ tool }: { tool: ToolStory }) {
  const [activePiece, setActivePiece] = useState(0);
  const selectedPiece = tool.pieces[activePiece] ?? tool.pieces[0];

  return (
    <article className={`story-tool ${styles.toolCard}`} data-concept="journey">
      <figure className={styles.journeyVisual}>
        <img
          src={withDeploymentBase(tool.figure.src)}
          alt={tool.figure.alt}
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <header>
          <ToolKicker tool={tool} inverse />
          <h3>{tool.name}</h3>
        </header>
        <span className={styles.journeyHorizon} aria-hidden="true" />
        <figcaption>{tool.figure.label}</figcaption>
      </figure>
      <div className={styles.journeyBody}>
        <p className={styles.journeyLead}>{tool.storyLine}</p>
        <ol className={styles.journeyTrail}>
          {tool.pieces.map((piece, index) => (
            <li key={piece.title}>
              <button
                type="button"
                aria-pressed={activePiece === index}
                onClick={() => setActivePiece(index)}
              >
                <small>{piece.role}</small>
                <strong>{piece.title}</strong>
              </button>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </li>
          ))}
        </ol>
        <section className={styles.journeyDetail} aria-live="polite">
          <p>Selected milestone · {selectedPiece.role}</p>
          <h4>{selectedPiece.title}</h4>
          <span>{selectedPiece.summary}</span>
          {selectedPiece.resource && (
            <PieceLink resource={selectedPiece.resource} className={styles.journeyLink} />
          )}
        </section>
        <div className={styles.journeyDestination}>
          <span aria-hidden="true">◆</span>
          <div>
            <strong>Destination</strong>
            <p>{tool.synthesis}</p>
          </div>
        </div>
        <CardFooter tool={tool} />
      </div>
    </article>
  );
}

function BlueprintCard({ tool }: { tool: ToolStory }) {
  const [activePiece, setActivePiece] = useState(0);
  const selectedPiece = tool.pieces[activePiece] ?? tool.pieces[0];
  const blueprintImage = tool.galleryImages[0];

  return (
    <article className={`story-tool ${styles.toolCard}`} data-concept="blueprint">
      <div className={styles.blueprintSheet}>
        <figure className={styles.blueprintVisual}>
          <img
            src={withDeploymentBase(blueprintImage?.src ?? tool.figure.src)}
            alt={blueprintImage?.alt ?? tool.figure.alt}
            width="900"
            height="600"
            loading="lazy"
            decoding="async"
          />
          <div className={styles.blueprintScrim} aria-hidden="true" />
          <header>
            <ToolKicker tool={tool} inverse />
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </header>
          <div className={styles.blueprintCallouts} aria-label="Image component callouts">
            {tool.pieces.map((piece, index) => (
              <button
                type="button"
                key={piece.title}
                data-position={index + 1}
                aria-label={`Highlight ${piece.title}`}
                aria-pressed={activePiece === index}
                onClick={() => setActivePiece(index)}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <figcaption>{blueprintImage ? "Detail view · " : ""}{tool.figure.label}</figcaption>
        </figure>
        <div className={styles.blueprintBody}>
          <div className={styles.blueprintSpec}>
            <span>System objective</span>
            <p>{tool.storyLine}</p>
          </div>
          <div className={styles.blueprintPhases}>
            {tool.phaseLabels.map((phase, phaseIndex) => (
              <section key={phase}>
                <header>
                  <span>Phase {phaseIndex + 1}</span>
                  <strong>{phase}</strong>
                </header>
                <div>
                  {tool.pieces.slice(phaseIndex * 2, phaseIndex * 2 + 2).map((piece) => {
                    const pieceIndex = tool.pieces.indexOf(piece);
                    return (
                      <button
                        type="button"
                        key={piece.title}
                        aria-pressed={activePiece === pieceIndex}
                        onClick={() => setActivePiece(pieceIndex)}
                      >
                        <span>{String(pieceIndex + 1).padStart(2, "0")}</span>
                        <span>
                          <small>{piece.role}</small>
                          <strong>{piece.title}</strong>
                        </span>
                        {piece.resource && <i>Evidence</i>}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <section className={styles.blueprintDetail} aria-live="polite">
            <p>Component {String(activePiece + 1).padStart(2, "0")}</p>
            <h4>{selectedPiece.title}</h4>
            <span>{selectedPiece.summary}</span>
            {selectedPiece.resource && (
              <PieceLink
                resource={selectedPiece.resource}
                className={styles.blueprintLink}
                compact
              />
            )}
          </section>
          <div className={styles.blueprintOutput}>
            <span>System output</span>
            <p>{tool.synthesis}</p>
          </div>
          <CardFooter tool={tool} inverse />
        </div>
      </div>
    </article>
  );
}

function AssemblyCard({ tool }: { tool: ToolStory }) {
  const [activePiece, setActivePiece] = useState(0);
  const selectedPiece = tool.pieces[activePiece] ?? tool.pieces[0];

  return (
    <article className={`story-tool ${styles.toolCard}`} data-concept="assembly">
      <figure className={styles.assemblyVisual}>
        <img
          src={withDeploymentBase(tool.figure.src)}
          alt={tool.figure.alt}
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <div className={styles.assemblyScrim} aria-hidden="true" />
        <header className={styles.assemblyHeading}>
          <ToolKicker tool={tool} inverse />
          <h3>{tool.name}</h3>
          <p>{tool.storyLine}</p>
        </header>
        <div className={styles.assemblyGrid} aria-label={`${tool.name} assembly pieces`}>
          {tool.pieces.map((piece, index) => (
            <button
              type="button"
              key={piece.title}
              data-resource={piece.resource ? "true" : undefined}
              aria-pressed={activePiece === index}
              onClick={() => setActivePiece(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{piece.role}</small>
              <strong>{piece.title}</strong>
            </button>
          ))}
        </div>
        <figcaption>Six research streams · one tool</figcaption>
      </figure>
      <div className={styles.assemblyBody}>
        <section className={styles.assemblyDetail} aria-live="polite">
          <div>
            <p>Piece {String(activePiece + 1).padStart(2, "0")} · {selectedPiece.role}</p>
            <h4>{selectedPiece.title}</h4>
          </div>
          <div>
            <p>{selectedPiece.summary}</p>
            {selectedPiece.resource && (
              <PieceLink resource={selectedPiece.resource} className={styles.assemblyLink} />
            )}
          </div>
        </section>
        <div className={styles.assemblyOutcome}>
          <span>The assembled capability</span>
          <p>{tool.synthesis}</p>
        </div>
        <CardFooter tool={tool} inverse />
      </div>
    </article>
  );
}

function ConstellationCard({ tool }: { tool: ToolStory }) {
  const [activePiece, setActivePiece] = useState(0);
  const selectedPiece = tool.pieces[activePiece] ?? tool.pieces[0];

  return (
    <article className={`story-tool ${styles.toolCard}`} data-concept="constellation">
      <figure className={styles.constellationScene}>
        <img
          src={withDeploymentBase(tool.figure.src)}
          alt={tool.figure.alt}
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <div className={styles.constellationScrim} aria-hidden="true" />
        <header className={styles.constellationHeading}>
          <ToolKicker tool={tool} inverse />
          <h3>{tool.name}</h3>
          <p>{tool.storyLine}</p>
        </header>
        <div className={styles.constellationLines} aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
        </div>
        <div className={styles.constellationCore}>
          <span>Tool core</span>
          <strong>{tool.synthesis}</strong>
        </div>
        <div className={styles.constellationNodes} aria-label={`${tool.name} signal nodes`}>
          {tool.pieces.map((piece, index) => (
            <button
              type="button"
              key={piece.title}
              data-position={index + 1}
              data-resource={piece.resource ? "true" : undefined}
              aria-pressed={activePiece === index}
              onClick={() => setActivePiece(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{piece.role}</small>
              <strong>{piece.title}</strong>
            </button>
          ))}
        </div>
        <figcaption>{tool.figure.label}</figcaption>
      </figure>
      <div className={styles.constellationBody}>
        <section className={styles.constellationDetail} aria-live="polite">
          <span>Signal {String(activePiece + 1).padStart(2, "0")}</span>
          <div>
            <p>{selectedPiece.role}</p>
            <h4>{selectedPiece.title}</h4>
          </div>
          <div>
            <p>{selectedPiece.summary}</p>
            {selectedPiece.resource && (
              <PieceLink
                resource={selectedPiece.resource}
                className={styles.constellationLink}
              />
            )}
          </div>
        </section>
        <CardFooter tool={tool} inverse />
      </div>
    </article>
  );
}

function ToolCard({
  tool,
  concept,
}: {
  tool: ToolStory;
  concept: ConceptId;
}) {
  if (concept === "dossier") return <DossierCard tool={tool} />;
  if (concept === "journey") return <JourneyCard tool={tool} />;
  if (concept === "blueprint") return <BlueprintCard tool={tool} />;
  if (concept === "assembly") return <AssemblyCard tool={tool} />;
  return <ConstellationCard tool={tool} />;
}

function StoryFooter() {
  return (
    <footer className="story-footer">
      <a className="story-footer-brand" href="#story-tools">
        <strong>{aptoProgram.acronym}</strong>
        <span>{aptoProgram.name}</span>
      </a>
      <div className="story-footer-support">
        <img
          src={withDeploymentBase(aptoInterface.footer.nsfLogoSrc)}
          alt={aptoInterface.footer.nsfLogoAlt}
          width="64"
          height="64"
          loading="lazy"
        />
        <div>
          <strong>{aptoInterface.story.supportedByLabel}</strong>
          <p>{aptoBoilerplate}</p>
        </div>
      </div>
      <div className="story-footer-links">
        <a href={aptoRoute()}>{aptoInterface.story.directoryLabel}</a>
        <a href="#story-tools">
          {aptoInterface.footer.backToTopLabel} <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}

export function ToolsLabSite() {
  const { theme, toggleTheme } = useAptoTheme("light");
  const [concept, setConcept] = useState<ConceptId>("assembly");
  const rows = [
    northwesternToolStories.slice(0, 2),
    northwesternToolStories.slice(2, 4),
    northwesternToolStories.slice(4, 5),
  ];

  return (
    <div className="apto-story" data-theme={theme}>
      <a className="story-skip-link" href="#story-main">
        {aptoInterface.accessibility.skipLinkLabel}
      </a>
      <StoryHeader theme={theme} onToggle={toggleTheme} />
      <main id="story-main" tabIndex={-1}>
        <section
          className="story-section story-tools"
          id="story-tools"
          aria-labelledby="story-tools-title"
        >
          <header className="story-section-heading">
            <h2 id="story-tools-title">Northwestern tool stories</h2>
            <span>
              One set of five research tools, interpreted through five complete card
              systems—from a restrained editorial dossier to a highly expressive signal
              constellation.
            </span>
          </header>
          <ConceptSelector concept={concept} onChange={setConcept} />
          <div
            className={styles.conceptGrid}
            id="tool-story-grid"
            key={concept}
            data-active-concept={concept}
          >
            <div
              className="story-tool-matrix"
              aria-label="Northwestern University tool storytelling concepts"
            >
              {rows.map((row, rowIndex) => (
                <div className="story-tool-pair" key={`tool-row-${rowIndex}`}>
                  {row.map((tool) => (
                    <ToolCard tool={tool} concept={concept} key={tool.id} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <StoryFooter />
    </div>
  );
}
