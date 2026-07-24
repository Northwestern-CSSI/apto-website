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

type InteriorMode = "milestones" | "pieces" | "checklist" | "resources" | "flow";

const storySections = ["program", "projects", "tools", "cohort", "convening"] as const;

const modeOptions: Array<{
  id: InteriorMode;
  label: string;
  shortLabel: string;
  tone: string;
  description: string;
}> = [
  {
    id: "milestones",
    label: "Milestone rail",
    shortLabel: "Milestones",
    tone: "Conservative",
    description: "A cumulative sequence of subprojects and handoffs.",
  },
  {
    id: "pieces",
    label: "Connected pieces",
    shortLabel: "Pieces",
    tone: "Creative",
    description: "A component mosaic that reveals how the parts combine.",
  },
  {
    id: "checklist",
    label: "Narrative checklist",
    shortLabel: "Checklist",
    tone: "Conservative",
    description: "A fast, expandable scan of the tool’s building blocks.",
  },
  {
    id: "resources",
    label: "Field guide",
    shortLabel: "Resources",
    tone: "Editorial",
    description: "A simple description, use case, and supporting links.",
  },
  {
    id: "flow",
    label: "Capability flow",
    shortLabel: "Flow",
    tone: "Creative",
    description: "Three stages show how evidence becomes a useful outcome.",
  },
];

const initialModes: InteriorMode[] = [
  "milestones",
  "pieces",
  "checklist",
  "resources",
  "flow",
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

function PieceLink({
  resource,
  className,
}: {
  resource: NonNullable<StoryPiece["resource"]>;
  className?: string;
}) {
  return (
    <ExternalLink className={className} href={resource.href}>
      {resource.label}
    </ExternalLink>
  );
}

function Synthesis({ children }: { children: ReactNode }) {
  return (
    <div className={styles.synthesis}>
      <strong>What this adds up to</strong>
      <p>{children}</p>
    </div>
  );
}

function MilestoneInterior({ tool }: { tool: ToolStory }) {
  return (
    <div className={styles.milestoneInterior}>
      <p className={styles.storyLine}>{tool.storyLine}</p>
      <ol className={styles.milestoneRail}>
        {tool.pieces.map((piece, index) => (
          <li key={piece.title}>
            <span className={styles.milestoneNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p>{piece.role}</p>
              <h4>{piece.title}</h4>
              <span>{piece.summary}</span>
              {piece.resource && (
                <PieceLink resource={piece.resource} className={styles.inlineLink} />
              )}
            </div>
          </li>
        ))}
      </ol>
      <Synthesis>{tool.synthesis}</Synthesis>
    </div>
  );
}

function PiecesInterior({ tool }: { tool: ToolStory }) {
  const [activePiece, setActivePiece] = useState(0);
  const selectedPiece = tool.pieces[activePiece] ?? tool.pieces[0];

  return (
    <div className={styles.piecesInterior}>
      <p className={styles.storyLine}>{tool.storyLine}</p>
      <div className={styles.pieceMosaic} aria-label={`${tool.name} components`}>
        {tool.pieces.map((piece, index) => (
          <button
            type="button"
            key={piece.title}
            className={styles.pieceButton}
            aria-pressed={activePiece === index}
            onClick={() => setActivePiece(index)}
          >
            <span>{piece.role}</span>
            <strong>{piece.title}</strong>
          </button>
        ))}
      </div>
      <div className={styles.pieceDetail} aria-live="polite">
        <p>{selectedPiece.role}</p>
        <h4>{selectedPiece.title}</h4>
        <span>{selectedPiece.summary}</span>
        {selectedPiece.resource && (
          <PieceLink resource={selectedPiece.resource} className={styles.inlineLink} />
        )}
      </div>
      <Synthesis>{tool.synthesis}</Synthesis>
    </div>
  );
}

function ChecklistInterior({ tool }: { tool: ToolStory }) {
  return (
    <div className={styles.checklistInterior}>
      <p className={styles.storyLine}>{tool.storyLine}</p>
      <div className={styles.checklist}>
        {tool.pieces.map((piece, index) => (
          <details key={piece.title} open={index === 0}>
            <summary>
              <span className={styles.checkNumber}>{index + 1}</span>
              <span>
                <small>{piece.role}</small>
                <strong>{piece.title}</strong>
              </span>
              <span className={styles.disclosure} aria-hidden="true">
                +
              </span>
            </summary>
            <div>
              <p>{piece.summary}</p>
              {piece.resource && (
                <PieceLink resource={piece.resource} className={styles.inlineLink} />
              )}
            </div>
          </details>
        ))}
      </div>
      <Synthesis>{tool.synthesis}</Synthesis>
    </div>
  );
}

function ResourcesInterior({ tool }: { tool: ToolStory }) {
  return (
    <div className={styles.resourcesInterior}>
      <div className={styles.useCase}>
        <strong>{aptoInterface.tools.useCaseLabel}</strong>
        <p>{tool.useCase}</p>
      </div>
      <div className={styles.resourceIndex}>
        {tool.pieces.map((piece) => (
          <section key={piece.title}>
            <p>{piece.role}</p>
            <h4>{piece.title}</h4>
            <span>{piece.summary}</span>
            {piece.resource ? (
              <PieceLink resource={piece.resource} className={styles.resourceLink} />
            ) : (
              <small>Research stream</small>
            )}
          </section>
        ))}
      </div>
      <p className={styles.resourceNote}>
        Links lead to supporting tools, datasets, papers, or source material for this
        research-preview panel.
      </p>
    </div>
  );
}

function FlowInterior({ tool }: { tool: ToolStory }) {
  const phases = [
    { label: "Foundation", pieces: tool.pieces.slice(0, 2) },
    { label: "Interpretation", pieces: tool.pieces.slice(2, 4) },
    { label: "Outcome", pieces: tool.pieces.slice(4, 6) },
  ];

  return (
    <div className={styles.flowInterior}>
      <p className={styles.storyLine}>{tool.storyLine}</p>
      <ol className={styles.flow}>
        {phases.map((phase, phaseIndex) => (
          <li key={phase.label}>
            <header>
              <span>{phaseIndex + 1}</span>
              <strong>{phase.label}</strong>
            </header>
            <div>
              {phase.pieces.map((piece) => (
                <section key={piece.title}>
                  <p>{piece.role}</p>
                  <h4>{piece.title}</h4>
                  <span>{piece.summary}</span>
                  {piece.resource && (
                    <PieceLink resource={piece.resource} className={styles.inlineLink} />
                  )}
                </section>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <Synthesis>{tool.synthesis}</Synthesis>
    </div>
  );
}

function ToolInterior({
  tool,
  mode,
}: {
  tool: ToolStory;
  mode: InteriorMode;
}) {
  if (mode === "milestones") return <MilestoneInterior tool={tool} />;
  if (mode === "pieces") return <PiecesInterior tool={tool} />;
  if (mode === "checklist") return <ChecklistInterior tool={tool} />;
  if (mode === "resources") return <ResourcesInterior tool={tool} />;
  return <FlowInterior tool={tool} />;
}

function ToolCard({
  tool,
  initialMode,
}: {
  tool: ToolStory;
  initialMode: InteriorMode;
}) {
  const [mode, setMode] = useState<InteriorMode>(initialMode);
  const activeOption = modeOptions.find((option) => option.id === mode) ?? modeOptions[0];
  const panelId = `${tool.id}-inside`;

  return (
    <article className="story-tool">
      <figure>
        <img
          src={withDeploymentBase(tool.figure.src)}
          alt={tool.figure.alt}
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <figcaption>{tool.figure.label}</figcaption>
      </figure>
      <div className={`story-tool-copy ${styles.cardCopy}`}>
        <header>
          <p>Northwestern University · {tool.statusLabel}</p>
          <h3>{tool.name}</h3>
        </header>
        <p>{tool.description}</p>

        <section className={styles.experiment} aria-labelledby={`${panelId}-label`}>
          <header className={styles.experimentHeader}>
            <div>
              <p id={`${panelId}-label`}>Inside-card layout</p>
              <strong>{activeOption.label}</strong>
            </div>
            <span>
              {activeOption.tone} · {activeOption.description}
            </span>
          </header>
          <div className={styles.modePicker} aria-label={`Change the layout inside ${tool.name}`}>
            {modeOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                aria-pressed={mode === option.id}
                aria-controls={panelId}
                onClick={() => setMode(option.id)}
              >
                {option.shortLabel}
              </button>
            ))}
          </div>
          <div className={styles.interiorPanel} id={panelId}>
            <ToolInterior tool={tool} mode={mode} />
          </div>
        </section>

        <div className="story-tool-footer">
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
        </div>
      </div>
    </article>
  );
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
              Five research tools in the existing Story cards. Each card starts with a
              different interior experiment; its controls affect only that card.
            </span>
          </header>
          <div
            className="story-tool-matrix"
            aria-label="Northwestern University tool storytelling experiments"
          >
            {rows.map((row, rowIndex) => (
              <div className="story-tool-pair" key={`tool-row-${rowIndex}`}>
                {row.map((tool, columnIndex) => {
                  const toolIndex = rowIndex * 2 + columnIndex;
                  return (
                    <ToolCard
                      tool={tool}
                      initialMode={initialModes[toolIndex]}
                      key={tool.id}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </main>
      <StoryFooter />
    </div>
  );
}
