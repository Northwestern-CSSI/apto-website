"use client";

/* Content-managed images use deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useId, useState, type FocusEvent, type MouseEvent } from "react";

import { withDeploymentBase } from "./paths";

type ToolResource = {
  name: string;
  description: string;
  status: string;
  url: string | null;
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
  const summaryId = useId();
  const activeResource = activeIndex === null ? null : resources[activeIndex] ?? null;
  const activeAvailable = activeResource ? isAvailable(activeResource) : false;
  const Heading = variant === "atlas" ? "h2" : "h3";

  const resetAfterKeyboardExit = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveIndex(null);
  };

  const resetAfterPointerExit = (event: MouseEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Element && nextTarget.closest(".apto-resource-node")) return;
    setActiveIndex(null);
  };

  return <section
    className={`apto-resource-path apto-resource-path-${variant}${featured ? " is-featured" : ""}${activeResource ? " has-active-resource" : ""}`}
    aria-label={label}
    data-active-resource={activeIndex === null ? "tool" : activeIndex}
    onMouseLeave={() => setActiveIndex(null)}
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
        const common = {
          className,
          onMouseEnter: () => setActiveIndex(index),
          onMouseLeave: resetAfterPointerExit,
          onFocus: () => setActiveIndex(index),
          "aria-describedby": summaryId,
          "aria-current": active ? "true" as const : undefined,
        };

        return <li key={resource.name}>
          {available && resource.url
            ? <a {...common} href={resource.url}>{content}</a>
            : <button
                {...common}
                type="button"
                aria-disabled="true"
                onClick={(event) => event.preventDefault()}
                title={`${resource.name}: coming soon`}
              >{content}</button>}
        </li>;
      })}
    </ol>

    <article className={`apto-resource-summary${activeResource ? " is-showing-resource" : ""}`} id={summaryId} aria-live="polite">
      <div className="apto-resource-summary-copy">
        {(activeResource || summary.eyebrow) && <p>{activeResource
          ? activeResource.status === "coming-soon" ? "Coming soon" : "Available"
          : summary.eyebrow}</p>}
        <Heading>{activeResource?.name ?? summary.title}</Heading>
        {activeResource
          ? <span>{activeResource.description}</span>
          : summary.paragraphs.map((paragraph, index) => <span key={`${summary.title}-summary-${index}`}>{paragraph}</span>)}
        {activeResource && activeAvailable && activeResource.url
          ? <a href={activeResource.url}>Open this piece <span aria-hidden="true">↗</span></a>
          : !activeResource && summary.url
            ? <a href={summary.url}>{summary.linkLabel ?? "Open tool"} <span aria-hidden="true">↗</span></a>
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
