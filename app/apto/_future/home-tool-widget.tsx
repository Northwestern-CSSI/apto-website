"use client";

/*
 * Dormant by design. This module is intentionally not imported by any route.
 * Its editable configuration is preserved in content/apto/future/home-tool-widget.md.
 * Import ./home-tool-widget.css when this component is re-enabled.
 */

import BadgeCheck from "lucide-react/dist/esm/icons/badge-check.mjs";
import ChartNoAxesCombined from "lucide-react/dist/esm/icons/chart-no-axes-combined.mjs";
import Network from "lucide-react/dist/esm/icons/network.mjs";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up.mjs";
import { useState, type CSSProperties, type KeyboardEvent } from "react";

type SignalPreview = {
  kind: "signals";
  rows: Array<{ label: string; category: string; value: number }>;
};

type MapPreview = {
  kind: "map";
  clusters: string[];
  focusLabel: string;
  focusTitle: string;
};

type TranslationPreview = {
  kind: "translation";
  composite: number;
  maximum: number;
  rows: Array<{ label: string; value: number }>;
};

type TrajectoryPreview = {
  kind: "trajectories";
  rows: Array<{ label: string; category: string; tone: "blue" | "gold" | "purple" }>;
  observedLabel: string;
  forecastLabel: string;
};

export type FutureHomeWidgetItem = {
  id: string;
  icon: "trend-up" | "network-map" | "shield-check" | "trajectory";
  tabLabel: string;
  kicker: string;
  title: string;
  summary: string;
  preview: SignalPreview | MapPreview | TranslationPreview | TrajectoryPreview;
};

export type FutureHomeWidgetConfig = {
  eyebrow: string;
  title: string;
  allToolsLabel: string;
  disclaimer: string;
  exploreLabel: string;
  previewAriaLabel: string;
  chooserAriaLabel: string;
  momentumScaleLabel: string;
  momentumListAriaLabel: string;
  mapCaptionPrefix: string;
  mapCaptionSuffix: string;
  compositeAriaPrefix: string;
  compositeAriaJoiner: string;
  demoIndexLabel: string;
  trajectoryScaleLabel: string;
  trajectoryAriaSuffix: string;
  items: FutureHomeWidgetItem[];
};

function WidgetIcon({ icon }: { icon: FutureHomeWidgetItem["icon"] }) {
  const Icon = icon === "trend-up"
    ? TrendingUp
    : icon === "network-map"
      ? Network
      : icon === "shield-check"
        ? BadgeCheck
        : ChartNoAxesCombined;
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.8} />;
}

function WidgetVisual({ widget, config }: { widget: FutureHomeWidgetItem; config: FutureHomeWidgetConfig }) {
  const preview = widget.preview;
  switch (preview.kind) {
    case "signals":
      return <div className="nsf-widget-signal-preview">
        <p className="nsf-widget-scale">{config.momentumScaleLabel}</p>
        <ul className="nsf-widget-signal-list" aria-label={config.momentumListAriaLabel}>
          {preview.rows.map((row) => <li key={row.label}>
            <div><small>{row.category}</small><strong>{row.label}</strong></div>
            <i aria-hidden="true"><span style={{ "--nsf-widget-value": `${row.value}%` } as CSSProperties} /></i>
            <b>{row.value}<span aria-hidden="true">/100</span></b>
          </li>)}
        </ul>
      </div>;
    case "map":
      return <figure className="nsf-widget-science-map">
        <figcaption className="nsf-visually-hidden">{config.mapCaptionPrefix} {preview.clusters.join(", ")} {config.mapCaptionSuffix}</figcaption>
        {preview.clusters.map((label, index) => <span aria-hidden="true" className={`cluster-index-${index}`} key={label}><i />{label}</span>)}
        <p><small>{preview.focusLabel}</small><strong>{preview.focusTitle}</strong></p>
      </figure>;
    case "translation":
      return <div className="nsf-widget-translation-preview">
        <div className="nsf-widget-composite" aria-label={`${config.compositeAriaPrefix} ${preview.composite} ${config.compositeAriaJoiner} ${preview.maximum}`}>
          <small>{config.demoIndexLabel}</small><strong>{preview.composite}</strong><span>/ {preview.maximum}</span>
        </div>
        <dl>{preview.rows.map((row) => <div key={row.label}>
          <dt>{row.label}</dt><dd><i aria-hidden="true"><span style={{ "--nsf-widget-value": `${row.value}%` } as CSSProperties} /></i><b>{row.value}</b></dd>
        </div>)}</dl>
      </div>;
    case "trajectories":
      return <div className="nsf-widget-trajectory-preview">
        <p className="nsf-widget-scale">{config.trajectoryScaleLabel}</p>
        <div className="nsf-widget-trajectory-grid">
          {preview.rows.map((row, index) => <article key={row.label}>
            <small>{row.category}</small><strong>{row.label}</strong>
            <div className={`nsf-widget-mini-curve curve-${row.tone} curve-index-${index}`} role="img" aria-label={`${row.label} ${config.trajectoryAriaSuffix}`}><i /><i /><i /><i /></div>
            <footer><span>{preview.observedLabel}</span><span>{preview.forecastLabel}</span></footer>
          </article>)}
        </div>
      </div>;
  }
}

export function FutureAptoHomeToolWidget({
  config,
  toolsHref,
  direction = "home",
  idPrefix = "apto",
}: {
  config: FutureHomeWidgetConfig;
  toolsHref: string;
  direction?: "home" | "network";
  idPrefix?: string;
}) {
  const [active, setActive] = useState(config.items[0]?.id ?? "");
  const widget = config.items.find((item) => item.id === active) ?? config.items[0];
  if (!widget) return null;
  const panelId = `${idPrefix}-future-widget-panel`;

  const handleKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const supportedKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!supportedKeys.includes(event.key)) return;
    event.preventDefault();
    const last = config.items.length - 1;
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : (index + (event.key === "ArrowRight" ? 1 : -1) + config.items.length) % config.items.length;
    setActive(config.items[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return <aside className={`nsf-hero-widget is-${direction}`} aria-label={config.previewAriaLabel}>
    <header className="nsf-hero-widget-header">
      <div><span>{config.eyebrow}</span><h2>{config.title}</h2></div>
      <a href={toolsHref}>{config.allToolsLabel}</a>
    </header>
    <div className="nsf-hero-widget-tabs" role="tablist" aria-label={config.chooserAriaLabel} data-local-arrows="true">
      {config.items.map((item, index) => <button
        type="button"
        role="tab"
        id={`${idPrefix}-future-widget-tab-${item.id}`}
        aria-selected={active === item.id}
        aria-controls={panelId}
        tabIndex={active === item.id ? 0 : -1}
        key={item.id}
        onClick={() => setActive(item.id)}
        onKeyDown={(event) => handleKeys(event, index)}
      ><i><WidgetIcon icon={item.icon} /></i><span>{item.tabLabel}</span></button>)}
    </div>
    <section className="nsf-hero-widget-panel" id={panelId} role="tabpanel" aria-labelledby={`${idPrefix}-future-widget-tab-${active}`} key={active}>
      <header><small>{widget.kicker}</small><h3>{widget.title}</h3><p>{widget.summary}</p></header>
      <div className="nsf-hero-widget-visual"><WidgetVisual widget={widget} config={config} /></div>
      <footer><span>{config.disclaimer}</span><a href={toolsHref}>{config.exploreLabel}</a></footer>
    </section>
  </aside>;
}
