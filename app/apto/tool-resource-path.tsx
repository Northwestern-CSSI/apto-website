"use client";

/* Content-managed images use deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useId, useState, type CSSProperties } from "react";

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

function routePosition(index: number) {
  return index === 0
    ? { gridColumn: 4, gridRow: 2 }
    : { gridColumn: Math.max(1, 5 - index), gridRow: 1 };
}

export function ToolResourcePath({
  resources,
  label,
  variant,
}: {
  resources: readonly ToolResource[];
  label: string;
  variant: "story" | "atlas";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const detailId = useId();
  const activeResource = resources[activeIndex] ?? resources[0];

  if (!activeResource) return null;

  return <section
    className={`apto-resource-path apto-resource-path-${variant}`}
    aria-label={label}
    data-active-resource={activeIndex}
    onMouseLeave={() => setActiveIndex(0)}
  >
    <ol className="apto-resource-route">
      {resources.map((resource, index) => {
        const isActive = index === activeIndex;
        const available = Boolean(resource.url) && resource.status !== "coming-soon";
        const className = `apto-resource-node${isActive ? " is-active" : ""}${available ? " is-available" : " is-coming-soon"}`;
        const content = <>
          <span className="apto-resource-thumb"><img src={withDeploymentBase(resource.image.src)} alt="" width="180" height="120" loading="lazy" decoding="async" /></span>
          <strong>{resource.name}</strong>
        </>;
        const common = {
          className,
          onMouseEnter: () => setActiveIndex(index),
          onFocus: () => setActiveIndex(index),
          "aria-describedby": detailId,
          "aria-current": isActive ? "true" as const : undefined,
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

    <article className="apto-resource-detail" id={detailId} aria-live="polite">
      <div>
        <p>{activeResource.status === "coming-soon" ? "Coming soon" : "Available"}</p>
        <h5>{activeResource.name}</h5>
        <span>{activeResource.description}</span>
        {activeResource.url && activeResource.status !== "coming-soon" && <a href={activeResource.url}>Open this piece <span aria-hidden="true">↗</span></a>}
      </div>
      <figure><img src={withDeploymentBase(activeResource.image.src)} alt={activeResource.image.alt} width="720" height="480" loading="lazy" decoding="async" /></figure>
    </article>
  </section>;
}
