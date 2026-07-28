"use client";

/* Content-managed images use deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useId, useState, type CSSProperties, type FocusEvent } from "react";

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
  description: string;
  url?: string | null;
  linkLabel?: string;
};

function routePosition(index: number) {
  return index === 0
    ? { gridColumn: 4, gridRow: 3 }
    : { gridColumn: Math.max(1, 5 - index), gridRow: 1 };
}

function isAvailable(resource: ToolResource) {
  return Boolean(resource.url) && resource.status !== "coming-soon";
}

export function ToolResourcePath({
  resources,
  label,
  summary,
  variant,
}: {
  resources: readonly ToolResource[];
  label: string;
  summary: ToolSummary;
  variant: "story" | "atlas";
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const summaryId = useId();
  const activeResource = activeIndex === null ? null : resources[activeIndex] ?? null;
  const activeAvailable = activeResource ? isAvailable(activeResource) : false;
  const Heading = variant === "atlas" ? "h2" : "h3";

  const resetAfterKeyboardExit = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveIndex(null);
  };

  return <section
    className={`apto-resource-path apto-resource-path-${variant}${activeResource ? " has-active-resource" : ""}`}
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
          onMouseLeave: () => setActiveIndex((current) => current === index ? null : current),
          onFocus: () => setActiveIndex(index),
          "aria-describedby": summaryId,
          "aria-current": active ? "true" as const : undefined,
        };

        return <li key={resource.name} style={routePosition(index) as CSSProperties}>
          {available && resource.url
            ? <a {...common} href={resource.url}>{content}</a>
            : <button
                {...common}
                type="button"
                aria-disabled="true"
                onClick={(event) => event.preventDefault()}
                title={`${resource.name} — coming soon`}
              >{content}</button>}
        </li>;
      })}
    </ol>

    <article className="apto-resource-summary" id={summaryId} aria-live="polite">
      {activeResource
        ? <p>{activeResource.status === "coming-soon" ? "Coming soon" : "Available"}</p>
        : null}
      <Heading>{activeResource?.name ?? summary.title}</Heading>
      <span>{activeResource?.description ?? summary.description}</span>
      {activeResource && activeAvailable && activeResource.url
        ? <a href={activeResource.url}>Open this piece <span aria-hidden="true">↗</span></a>
        : !activeResource && summary.url
          ? <a href={summary.url}>{summary.linkLabel ?? "Open tool"} <span aria-hidden="true">↗</span></a>
          : null}
    </article>
  </section>;
}
