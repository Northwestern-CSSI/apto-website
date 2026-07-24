"use client";

/* Existing content-managed artwork uses deployment-aware paths. */
/* eslint-disable @next/next/no-img-element */

import { useState, type CSSProperties } from "react";

import { aptoRoute, withDeploymentBase } from "../paths";
import {
  northwesternToolStories,
  type StoryPiece,
  type ToolStory,
} from "./tool-story-data";
import styles from "./tools-lab.module.css";

type StoryFormat = "compare" | "milestones" | "puzzle" | "checklist" | "resources";
type AppliedFormat = Exclude<StoryFormat, "compare">;

const formatOptions: Array<{
  id: StoryFormat;
  label: string;
  shortLabel: string;
  tone: string;
  description: string;
}> = [
  {
    id: "compare",
    label: "Compare concepts",
    shortLabel: "Compare",
    tone: "Design workspace",
    description: "See four treatments of one tool side by side.",
  },
  {
    id: "milestones",
    label: "Milestone path",
    shortLabel: "Path",
    tone: "Conservative",
    description: "Best when sequence, handoffs, and cumulative progress carry the story.",
  },
  {
    id: "puzzle",
    label: "Puzzle mosaic",
    shortLabel: "Mosaic",
    tone: "Creative",
    description: "Best when distinct subprojects combine into one larger capability.",
  },
  {
    id: "checklist",
    label: "Narrative checklist",
    shortLabel: "Checklist",
    tone: "Conservative",
    description: "Best for fast scanning, concrete milestones, and clear accountability.",
  },
  {
    id: "resources",
    label: "Field guide",
    shortLabel: "Guide",
    tone: "Editorial",
    description: "Best when a concise explanation and useful supporting links matter most.",
  },
];

function ResourceLink({
  resource,
  className,
}: {
  resource: NonNullable<StoryPiece["resource"]>;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={resource.href}
      target="_blank"
      rel="noreferrer"
    >
      {resource.label}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

function ToolArtwork({
  tool,
  compact = false,
}: {
  tool: ToolStory;
  compact?: boolean;
}) {
  return (
    <div className={`${styles.artwork} ${compact ? styles.artworkCompact : ""}`}>
      <img
        src={withDeploymentBase(tool.figure.src)}
        alt=""
        width="1600"
        height="1000"
        loading="lazy"
        decoding="async"
      />
      <div className={styles.artworkVeil} />
      <span className={styles.artworkNumber}>{tool.number}</span>
      <span className={styles.artworkLabel}>Northwestern · Research preview</span>
    </div>
  );
}

function ToolTitle({
  tool,
  headingLevel = "h2",
  compact = false,
}: {
  tool: ToolStory;
  headingLevel?: "h2" | "h3" | "h4";
  compact?: boolean;
}) {
  const Heading = headingLevel;
  return (
    <header className={`${styles.toolTitle} ${compact ? styles.toolTitleCompact : ""}`}>
      <p>
        <span>{tool.number}</span>
        Northwestern University
      </p>
      <Heading>{tool.name}</Heading>
      <div className={styles.outcomeTags} aria-label="Technology outcome dimensions">
        {tool.categories.map((category) => (
          <span key={category}>{category}</span>
        ))}
      </div>
    </header>
  );
}

function MilestoneStory({
  tool,
  compact = false,
}: {
  tool: ToolStory;
  compact?: boolean;
}) {
  return (
    <article
      className={`${styles.storyCard} ${styles.milestoneCard} ${compact ? styles.isCompact : ""}`}
    >
      <div className={styles.storyCardTop}>
        <ToolArtwork tool={tool} compact={compact} />
        <ToolTitle tool={tool} headingLevel={compact ? "h4" : "h2"} compact={compact} />
      </div>
      {!compact && <p className={styles.storyLine}>{tool.storyLine}</p>}
      <ol className={styles.milestoneList}>
        {tool.pieces.map((piece, index) => (
          <li key={piece.title}>
            <span className={styles.milestoneIndex}>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p>{piece.role}</p>
              <h3>{piece.title}</h3>
              {!compact && <span>{piece.summary}</span>}
              {!compact && piece.resource && (
                <ResourceLink resource={piece.resource} className={styles.inlineLink} />
              )}
            </div>
          </li>
        ))}
      </ol>
      {!compact && <p className={styles.synthesis}>{tool.synthesis}</p>}
    </article>
  );
}

function PuzzleStory({
  tool,
  compact = false,
}: {
  tool: ToolStory;
  compact?: boolean;
}) {
  return (
    <article
      className={`${styles.storyCard} ${styles.puzzleCard} ${compact ? styles.isCompact : ""}`}
    >
      <div className={styles.puzzleHeader}>
        <ToolTitle tool={tool} headingLevel={compact ? "h4" : "h2"} compact={compact} />
        {!compact && <p>{tool.storyLine}</p>}
      </div>
      <div className={styles.puzzleBoard} aria-label={`${tool.name} component mosaic`}>
        {tool.pieces.map((piece, index) => (
          <section
            className={styles.puzzlePiece}
            data-piece={String((index % 4) + 1)}
            key={piece.title}
          >
            <p>{piece.role}</p>
            <h3>{piece.title}</h3>
            {!compact && <span>{piece.summary}</span>}
            {!compact && piece.resource && (
              <ResourceLink resource={piece.resource} className={styles.puzzleLink} />
            )}
          </section>
        ))}
        <div className={styles.puzzleCore}>
          <span>One connected capability</span>
        </div>
      </div>
      {!compact && <p className={styles.puzzleSynthesis}>{tool.synthesis}</p>}
    </article>
  );
}

function ChecklistStory({
  tool,
  compact = false,
}: {
  tool: ToolStory;
  compact?: boolean;
}) {
  return (
    <article
      className={`${styles.storyCard} ${styles.checklistCard} ${compact ? styles.isCompact : ""}`}
    >
      <div className={styles.checklistHeading}>
        <div>
          <p className={styles.sheetLabel}>Narrative checklist · {tool.pieces.length} beats</p>
          <ToolTitle tool={tool} headingLevel={compact ? "h4" : "h2"} compact={compact} />
        </div>
        {!compact && <span className={styles.sheetNumber}>{tool.number}</span>}
      </div>
      {!compact && <p className={styles.checklistIntro}>{tool.storyLine}</p>}
      <ol className={styles.checklistList}>
        {tool.pieces.map((piece, index) => (
          <li key={piece.title}>
            <span className={styles.checkmark} aria-hidden="true">{index + 1}</span>
            <div>
              <p>{piece.role}</p>
              <h3>{piece.title}</h3>
              {!compact && <span>{piece.summary}</span>}
            </div>
            {!compact && piece.resource && (
              <ResourceLink resource={piece.resource} className={styles.checklistLink} />
            )}
          </li>
        ))}
      </ol>
      {!compact && (
        <footer className={styles.checklistFooter}>
          <strong>What the sequence adds up to</strong>
          <p>{tool.synthesis}</p>
        </footer>
      )}
    </article>
  );
}

function ResourceStory({
  tool,
  compact = false,
}: {
  tool: ToolStory;
  compact?: boolean;
}) {
  const linkedPieces = tool.pieces.filter((piece) => piece.resource);
  return (
    <article
      className={`${styles.storyCard} ${styles.resourceCard} ${compact ? styles.isCompact : ""}`}
    >
      <div className={styles.resourceLead}>
        <ToolArtwork tool={tool} compact={compact} />
        <ToolTitle tool={tool} headingLevel={compact ? "h4" : "h2"} compact={compact} />
        <p>{compact ? tool.storyLine : tool.description}</p>
        {!compact && (
          <div className={styles.useCase}>
            <span>Why it matters</span>
            <p>{tool.useCase}</p>
          </div>
        )}
      </div>
      <div className={styles.resourceBody}>
        <p className={styles.resourceEyebrow}>
          {compact ? "Selected components" : "Components + supporting resources"}
        </p>
        <div className={styles.resourceGrid}>
          {(compact ? tool.pieces.slice(0, 4) : tool.pieces).map((piece) => (
            <section key={piece.title}>
              <p>{piece.role}</p>
              <h3>{piece.title}</h3>
              {!compact && <span>{piece.summary}</span>}
              {piece.resource ? (
                <ResourceLink resource={piece.resource} className={styles.resourceLink} />
              ) : (
                !compact && <small>Research stream</small>
              )}
            </section>
          ))}
        </div>
        {!compact && linkedPieces.length > 0 && (
          <p className={styles.resourceNote}>
            Links point to supporting tools, datasets, papers, or source material—not a
            deployed version of the umbrella tool.
          </p>
        )}
      </div>
    </article>
  );
}

function StoryForFormat({
  format,
  tool,
  compact = false,
}: {
  format: AppliedFormat;
  tool: ToolStory;
  compact?: boolean;
}) {
  if (format === "milestones") return <MilestoneStory tool={tool} compact={compact} />;
  if (format === "puzzle") return <PuzzleStory tool={tool} compact={compact} />;
  if (format === "checklist") return <ChecklistStory tool={tool} compact={compact} />;
  return <ResourceStory tool={tool} compact={compact} />;
}

function CompareWorkspace({
  activeToolIndex,
  onToolChange,
  onApply,
}: {
  activeToolIndex: number;
  onToolChange: (index: number) => void;
  onApply: (format: AppliedFormat) => void;
}) {
  const tool = northwesternToolStories[activeToolIndex];
  const concepts = formatOptions.filter(
    (option): option is (typeof formatOptions)[number] & { id: AppliedFormat } =>
      option.id !== "compare",
  );

  return (
    <>
      <nav className={styles.toolPicker} aria-label="Choose a Northwestern tool to compare">
        <p>Choose a tool</p>
        <div>
          {northwesternToolStories.map((candidate, index) => (
            <button
              type="button"
              key={candidate.id}
              aria-pressed={index === activeToolIndex}
              onClick={() => onToolChange(index)}
            >
              <span>{candidate.number}</span>
              {candidate.name}
            </button>
          ))}
        </div>
      </nav>
      <section className={styles.compareIntro} aria-labelledby="compare-tool-title">
        <div>
          <p>Currently comparing</p>
          <h2 id="compare-tool-title">{tool.name}</h2>
        </div>
        <p>{tool.description}</p>
      </section>
      <div className={styles.compareGrid}>
        {concepts.map((concept) => (
          <section className={styles.conceptPreview} key={concept.id}>
            <header>
              <div>
                <p>{concept.tone}</p>
                <h3>{concept.label}</h3>
              </div>
              <span>{concept.description}</span>
            </header>
            <div className={styles.previewCanvas}>
              <StoryForFormat format={concept.id} tool={tool} compact />
            </div>
            <button type="button" onClick={() => onApply(concept.id)}>
              Apply to all five tools
              <span aria-hidden="true"> →</span>
            </button>
          </section>
        ))}
      </div>
    </>
  );
}

function FullStoryCollection({ format }: { format: AppliedFormat }) {
  const selectedFormat = formatOptions.find((option) => option.id === format);
  if (!selectedFormat) return null;
  return (
    <>
      <header className={styles.collectionIntro}>
        <div>
          <p>{selectedFormat.tone} direction</p>
          <h2>{selectedFormat.label}</h2>
        </div>
        <p>{selectedFormat.description} The five cards below stay in the requested sequence.</p>
      </header>
      <div className={styles.storyCollection}>
        {northwesternToolStories.map((tool) => (
          <StoryForFormat format={format} tool={tool} key={tool.id} />
        ))}
      </div>
    </>
  );
}

export function ToolsLabSite() {
  const [format, setFormat] = useState<StoryFormat>("compare");
  const [activeToolIndex, setActiveToolIndex] = useState(0);

  return (
    <div className={styles.lab}>
      <a className={styles.skipLink} href="#lab-output">Skip to storytelling concepts</a>
      <header className={styles.siteHeader}>
        <a className={styles.brand} href={aptoRoute()} aria-label="APTO program home">
          <span>APTO</span>
          <small>Assessing and Predicting Technology Outcomes</small>
        </a>
        <a className={styles.collectionLink} href={aptoRoute("tools")}>
          Full tools collection <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section
          className={styles.hero}
          aria-labelledby="tools-lab-title"
          style={{
            "--hero-art": `url("${withDeploymentBase("/apto/tools/previews/aggregating-research-pipeline-at-scale.jpg")}")`,
          } as CSSProperties}
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Northwestern University · Storytelling lab</p>
            <h1 id="tools-lab-title">
              Five tools.
              <br />
              Four ways into the story.
            </h1>
            <p>
              An isolated test page for tuning how subprojects, methods, datasets, and
              resources build into each Northwestern research tool.
            </p>
          </div>
          <aside className={styles.heroNote} aria-label="How to use this page">
            <img
              src={withDeploymentBase("/apto/partners/northwestern.png")}
              width="368"
              height="69"
              alt="Northwestern University"
            />
            <p>
              Start in <strong>Compare concepts</strong>. Pick one treatment, then review
              that format across all five tools in the requested order.
            </p>
            <dl>
              <div><dt>5</dt><dd>Northwestern tools</dd></div>
              <div><dt>4</dt><dd>Story formats</dd></div>
              <div><dt>1</dt><dd>Shared content model</dd></div>
            </dl>
          </aside>
        </section>

        <section className={styles.formatBar} aria-labelledby="format-heading">
          <div className={styles.formatBarCopy}>
            <p>Story format</p>
            <h2 id="format-heading">Change the structure, keep the content.</h2>
          </div>
          <div className={styles.formatControls} aria-label="Choose a storytelling format">
            {formatOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                aria-pressed={format === option.id}
                aria-controls="lab-output"
                onClick={() => setFormat(option.id)}
              >
                <span>{option.shortLabel}</span>
                <small>{option.tone}</small>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.output} id="lab-output" aria-live="polite">
          {format === "compare" ? (
            <CompareWorkspace
              activeToolIndex={activeToolIndex}
              onToolChange={setActiveToolIndex}
              onApply={setFormat}
            />
          ) : (
            <FullStoryCollection format={format} />
          )}
        </section>
      </main>

      <footer className={styles.siteFooter}>
        <div>
          <span>APTO</span>
          <p>Northwestern tool storytelling study</p>
        </div>
        <p>
          Supporting links identify live tools, datasets, papers, or source material.
          The five umbrella tool panels remain research previews.
        </p>
      </footer>
    </div>
  );
}
