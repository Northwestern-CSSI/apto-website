"use client";

/* Content-managed images use deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent } from "react";

import { withDeploymentBase } from "./paths";

type ToolResource = {
  name: string;
  description: string;
  status: string;
  url: string | null;
  actionLabel?: string;
  image: {
    src: string;
    alt: string;
  };
};

type ToolSummary = {
  title: string;
  paragraphs: readonly string[];
  eyebrow?: string;
  url?: string | null;
  linkLabel?: string;
};

function isAvailable(resource: ToolResource) {
  return Boolean(resource.url) && resource.status !== "coming-soon";
}

function pointerInstruction(actionLabel: string) {
  return `Click the icon to ${actionLabel.charAt(0).toLocaleLowerCase("en-US")}${actionLabel.slice(1)}.`;
}

export function ToolResourcePath({
  resources,
  label,
  summary,
  variant,
  featured = false,
}: {
  resources: readonly ToolResource[];
  label: string;
  summary: ToolSummary;
  variant: "story" | "atlas";
  featured?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchMode, setTouchMode] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const summaryId = useId();
  const activeResource = activeIndex === null ? null : resources[activeIndex] ?? null;
  const activeAvailable = activeResource ? isAvailable(activeResource) : false;
  const Heading = variant === "atlas" ? "h2" : "h3";

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const updateTouchMode = () => setTouchMode(media.matches);
    updateTouchMode();
    media.addEventListener("change", updateTouchMode);
    return () => media.removeEventListener("change", updateTouchMode);
  }, []);

  useEffect(() => {
    if (!touchMode || activeIndex === null) return;
    const dismissOutsidePiece = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactiveTarget = target.closest(".apto-resource-node, .apto-resource-touch-action");
      if (interactiveTarget && rootRef.current?.contains(interactiveTarget)) return;
      setActiveIndex(null);
    };
    document.addEventListener("pointerdown", dismissOutsidePiece, true);
    return () => document.removeEventListener("pointerdown", dismissOutsidePiece, true);
  }, [activeIndex, touchMode]);

  const resetAfterKeyboardExit = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveIndex(null);
  };

  const resetAfterPointerExit = (event: MouseEvent<HTMLElement>) => {
    if (touchMode) return;
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Element && nextTarget.closest(".apto-resource-node")) return;
    setActiveIndex(null);
  };

  return <section
    ref={rootRef}
    className={`apto-resource-path apto-resource-path-${variant}${featured ? " is-featured" : ""}${activeResource ? " has-active-resource" : ""}`}
    aria-label={label}
    data-active-resource={activeIndex === null ? "tool" : activeIndex}
    onMouseLeave={() => { if (!touchMode) setActiveIndex(null); }}
    onBlurCapture={resetAfterKeyboardExit}
  >
    <ol className="apto-resource-route">
      {resources.map((resource, index) => {
        const active = index === activeIndex;
        const available = isAvailable(resource);
        const className = `apto-resource-node${active ? " is-active" : ""}${available ? " is-available" : " is-coming-soon"}`;
        const content = <>
          <span className="apto-resource-thumb"><img src={withDeploymentBase(resource.image.src)} alt="" width="180" height="180" loading="lazy" decoding="async" /></span>
          <strong>{resource.name}</strong>
        </>;
        const selectOnTouch = (event: MouseEvent<HTMLElement>) => {
          if (!touchMode) return;
          event.preventDefault();
          setActiveIndex((current) => current === index ? null : index);
        };
        const common = {
          className,
          onMouseEnter: () => { if (!touchMode) setActiveIndex(index); },
          onMouseLeave: resetAfterPointerExit,
          onFocus: () => { if (!touchMode) setActiveIndex(index); },
          onClick: selectOnTouch,
          "aria-describedby": summaryId,
          "aria-controls": summaryId,
          "aria-current": active ? "true" as const : undefined,
        };

        return <li key={resource.name}>
          {available && resource.url
            ? <a
                {...common}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${resource.name} (opens in a new tab)`}
              >{content}</a>
            : <button
                {...common}
                type="button"
                title={`${resource.name}: coming soon`}
              >{content}</button>}
        </li>;
      })}
    </ol>

    <article className={`apto-resource-summary${activeResource ? " is-showing-resource" : ""}`} id={summaryId} aria-live="polite">
      <div className="apto-resource-summary-copy">
        {activeResource?.status === "coming-soon"
          ? <p>Coming soon</p>
          : !activeResource && summary.eyebrow ? <p>{summary.eyebrow}</p> : null}
        <Heading>{activeResource?.name ?? summary.title}</Heading>
        {activeResource
          ? <span>{activeResource.description}</span>
          : summary.paragraphs.map((paragraph, index) => <span key={`${summary.title}-summary-${index}`}>{paragraph}</span>)}
        {activeResource && activeAvailable && activeResource.url
          ? <>
              <a
                className="apto-resource-touch-action"
                href={activeResource.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${activeResource.actionLabel ?? "Open the link"} for ${activeResource.name} in a new tab`}
              >{activeResource.actionLabel ?? "Open the link"} <span aria-hidden="true">↗</span></a>
              <span className="apto-resource-pointer-hint" aria-hidden="true">
                {pointerInstruction(activeResource.actionLabel ?? "Open the link")}
              </span>
            </>
          : !activeResource && summary.url
            ? <a
                href={summary.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${summary.linkLabel ?? "Open tool"} in a new tab`}
              >{summary.linkLabel ?? "Open tool"} <span aria-hidden="true">↗</span></a>
            : null}
      </div>
      {activeResource && <figure className="apto-resource-summary-inset">
        <img
          src={withDeploymentBase(activeResource.image.src)}
          alt={activeResource.image.alt}
          width="360"
          height="360"
          loading="lazy"
          decoding="async"
        />
      </figure>}
    </article>
  </section>;
}
