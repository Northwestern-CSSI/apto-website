"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { technologyTrends } from "./apto-data";

export type PortfolioId =
  | "pulseboard"
  | "signalgrid"
  | "horizon"
  | "leaderboard"
  | "weatherboard"
  | "constellation"
  | "newsroom"
  | "matrix"
  | "exchange"
  | "watchtower";

type Trend = {
  id: string;
  name: string;
  short: string;
  domain: "Digital" | "Physical" | "Biological" | "Energy";
  momentum: number;
  maturity: number;
  evidence: number;
  uncertainty: number;
  change: number;
  horizon: string;
  status: string;
  color: string;
  pulse: readonly number[];
};

const trendIds = ["ai", "quantum", "energy", "manufacturing", "bio", "structural", "materials", "chips"] as const;
const trendDomains: Trend["domain"][] = ["Digital", "Physical", "Energy", "Physical", "Biological", "Biological", "Physical", "Digital"];
const recentChanges = [14, 8, 10, 5, 13, 7, 4, 12] as const;

const trendData: readonly Trend[] = technologyTrends.map((trend, index) => ({
  id: trendIds[index],
  name: trend.name,
  short: trend.shortName,
  domain: trendDomains[index],
  momentum: trend.momentum,
  maturity: trend.maturity,
  evidence: trend.confidence,
  uncertainty: 100 - trend.confidence,
  change: recentChanges[index],
  horizon: trend.horizon,
  status: trend.direction,
  color: trend.color,
  pulse: trend.spark,
}));

const domains = ["All", "Digital", "Physical", "Biological", "Energy"] as const;
type DomainFilter = (typeof domains)[number];

const metricLabels = {
  momentum: "Momentum",
  maturity: "Maturity",
  evidence: "Evidence",
  uncertainty: "Uncertainty",
  change: "Recent change",
} as const;
type TrendMetric = keyof typeof metricLabels;

function PortfolioMark({ light = false }: { light?: boolean }) {
  return <div className={`portfolio-mark ${light ? "is-light" : ""}`}><i aria-hidden="true" /><strong>APTO</strong><span>TECHNOLOGY OBSERVATORY</span></div>;
}

function PortfolioHeader({ number, title, children, light = false }: { number: string; title: string; children?: ReactNode; light?: boolean }) {
  return <header className="portfolio-header"><PortfolioMark light={light} /><span>{number} / {title}</span><div>{children}<small className="portfolio-mock-label">ILLUSTRATIVE DATA</small></div></header>;
}

function DemoNotice({ children = "Illustrative values for design evaluation — not APTO findings." }: { children?: ReactNode }) {
  return <p className="portfolio-demo-notice"><i aria-hidden="true" />{children}</p>;
}

function MetricButtons({ metric, onChange, metrics = ["momentum", "maturity", "evidence"] }: { metric: TrendMetric; onChange: (metric: TrendMetric) => void; metrics?: readonly TrendMetric[] }) {
  return <fieldset className="portfolio-metric-buttons" data-local-arrows="true"><legend>Display metric</legend>{metrics.map((item) => <button type="button" key={item} aria-pressed={metric === item} className={metric === item ? "is-active" : ""} onClick={() => onChange(item)}>{metricLabels[item]}</button>)}</fieldset>;
}

function DomainButtons({ value, onChange }: { value: DomainFilter; onChange: (domain: DomainFilter) => void }) {
  return <fieldset className="portfolio-domain-buttons" data-local-arrows="true"><legend>Filter technology areas</legend>{domains.map((domain) => <button type="button" key={domain} aria-pressed={value === domain} className={value === domain ? "is-active" : ""} onClick={() => onChange(domain)}>{domain}</button>)}</fieldset>;
}

function SparkBars({ values, label }: { values: readonly number[]; label: string }) {
  return <div className="portfolio-spark" role="img" aria-label={`${label}: illustrative trend rising from ${values[0]} to ${values.at(-1)}`}>
    {values.map((value, index) => <i key={index} style={{ "--bar": `${value}%` } as CSSProperties} />)}
  </div>;
}

function filteredTrends(domain: DomainFilter) {
  return domain === "All" ? trendData : trendData.filter((trend) => trend.domain === domain);
}

export function Pulseboard() {
  const [metric, setMetric] = useState<TrendMetric>("momentum");
  const [domain, setDomain] = useState<DomainFilter>("All");
  const [selected, setSelected] = useState(trendData[0].id);
  const visible = filteredTrends(domain);
  const active = trendData.find((trend) => trend.id === selected) ?? visible[0] ?? trendData[0];
  return <div className="concept concept-pulseboard portfolio-page portfolio-pulseboard">
    <PortfolioHeader number="31" title="NATIONAL PULSEBOARD"><span className="portfolio-live-tag">● UPDATED THIS QUARTER</span></PortfolioHeader>
    <section className="portfolio-pulse-hero"><div><span>TOP TECHNOLOGIES WE ARE TRACKING</span><h1>Eight frontiers.<br /><em>One immediate view.</em></h1><p>Scan the technology areas APTO tracks, compare signals, then open the evidence behind any trend.</p></div><aside><small>COMPOSITE PULSE</small><strong>78</strong><span>+8 points / illustrative</span></aside></section>
    <section className="portfolio-pulse-toolbar"><DomainButtons value={domain} onChange={setDomain} /><MetricButtons metric={metric} onChange={setMetric} metrics={["momentum", "maturity", "evidence", "uncertainty"]} /></section>
    <section className="portfolio-pulse-grid" aria-label="Tracked technology areas" aria-live="polite">
      {visible.map((trend, index) => <button type="button" key={trend.id} className={`portfolio-pulse-card portfolio-tone-${index % 4} ${active.id === trend.id ? "is-active" : ""}`} style={{ "--tone": trend.color, "--value": `${trend[metric]}%` } as CSSProperties} onClick={() => setSelected(trend.id)} aria-pressed={active.id === trend.id}><span>{String(index + 1).padStart(2, "0")} · {trend.domain}</span><h2>{trend.name}</h2><SparkBars values={trend.pulse} label={trend.name} /><div><strong>{trend[metric]}</strong><small>{metricLabels[metric]}</small></div><p>{trend.status} · {trend.horizon}</p></button>)}
    </section>
    <section className="portfolio-pulse-detail"><span>SELECTED FRONTIER</span><h2>{active.name}</h2><div><dl><dt>Momentum</dt><dd>{active.momentum}</dd><dt>Evidence breadth</dt><dd>{active.evidence}</dd><dt>Uncertainty</dt><dd>±{active.uncertainty}</dd></dl><button type="button">Open technology brief →</button></div><DemoNotice /></section>
  </div>;
}

export function SignalGrid() {
  const [domain, setDomain] = useState<DomainFilter>("All");
  const [signal, setSignal] = useState<"all" | "strong" | "uncertain">("all");
  const [expanded, setExpanded] = useState<string | null>("ai");
  const visible = filteredTrends(domain).filter((trend) => signal === "all" || (signal === "strong" ? trend.momentum >= 75 : trend.uncertainty >= 40));
  return <div className="concept concept-signalgrid portfolio-page portfolio-signalgrid">
    <PortfolioHeader number="32" title="SIGNAL GRID" light><span>{visible.length} AREAS IN VIEW</span></PortfolioHeader>
    <section className="portfolio-grid-intro"><div><span>READ THE WHOLE PORTFOLIO AT ONCE</span><h1>A grid of<br /><em>moving signals.</em></h1></div><p>Every box shows momentum, maturity, evidence, and uncertainty before you choose a specific technology.</p></section>
    <section className="portfolio-grid-controls"><DomainButtons value={domain} onChange={setDomain} /><fieldset><legend>Signal condition</legend>{(["all", "strong", "uncertain"] as const).map((item) => <button type="button" key={item} className={signal === item ? "is-active" : ""} aria-pressed={signal === item} onClick={() => setSignal(item)}>{item === "all" ? "All signals" : item === "strong" ? "High momentum" : "High uncertainty"}</button>)}</fieldset></section>
    <section className="portfolio-signal-grid" aria-live="polite">
      {visible.map((trend) => <article key={trend.id} className={expanded === trend.id ? "is-open" : ""} style={{ "--tone": trend.color } as CSSProperties}><div className="portfolio-signal-card-head"><span>{trend.short}</span><small>{trend.domain}</small><b>{trend.status}</b></div><h2>{trend.name}</h2><div className="portfolio-signal-quadrants"><div><span>Momentum</span><strong>{trend.momentum}</strong><i style={{ "--value": `${trend.momentum}%` } as CSSProperties} /></div><div><span>Maturity</span><strong>{trend.maturity}</strong><i style={{ "--value": `${trend.maturity}%` } as CSSProperties} /></div><div><span>Evidence</span><strong>{trend.evidence}</strong><i style={{ "--value": `${trend.evidence}%` } as CSSProperties} /></div><div><span>Uncertainty</span><strong>{trend.uncertainty}</strong><i style={{ "--value": `${trend.uncertainty}%` } as CSSProperties} /></div></div><button type="button" aria-expanded={expanded === trend.id} onClick={() => setExpanded(expanded === trend.id ? null : trend.id)}>{expanded === trend.id ? "Close evidence" : "Expand evidence"}<b>+</b></button>{expanded === trend.id && <div className="portfolio-signal-expanded"><SparkBars values={trend.pulse} label={trend.name} /><p>Signals combine publications, capability measures, translation indicators, and adoption evidence in this mock interface.</p><a href="#portfolio-signal-method">View sources and method →</a></div>}</article>)}
    </section>
    <footer id="portfolio-signal-method"><DemoNotice /></footer>
  </div>;
}

const horizonMultipliers = { "3 years": .55, "5 years": .8, "10 years": 1.2 } as const;
type HorizonWindow = keyof typeof horizonMultipliers;

export function Horizon() {
  const [window, setWindow] = useState<HorizonWindow>("5 years");
  const [selected, setSelected] = useState("materials");
  const [view, setView] = useState<"trajectory" | "confidence">("trajectory");
  const active = trendData.find((trend) => trend.id === selected) ?? trendData[0];
  return <div className="concept concept-horizon portfolio-page portfolio-horizon">
    <PortfolioHeader number="33" title="MULTI-TECH HORIZON"><span>SCENARIO VIEW · NOT A FORECAST</span></PortfolioHeader>
    <section className="portfolio-horizon-hero"><div><span>LOOK ACROSS, NOT JUST AHEAD</span><h1>Many technologies.<br /><em>Different horizons.</em></h1><p>Compare plausible paths across the full APTO portfolio while keeping evidence and uncertainty visible.</p></div><fieldset><legend>Scenario horizon</legend>{(Object.keys(horizonMultipliers) as HorizonWindow[]).map((item) => <button type="button" key={item} className={window === item ? "is-active" : ""} aria-pressed={window === item} onClick={() => setWindow(item)}>{item}</button>)}</fieldset></section>
    <section className="portfolio-horizon-stage"><div className="portfolio-horizon-axis"><span>OBSERVED</span><i /><span>NOW</span><i /><span>{window.toUpperCase()}</span></div><div className="portfolio-horizon-lanes">{trendData.map((trend, index) => { const projected = Math.min(98, Math.round(trend.momentum + trend.change * horizonMultipliers[window])); const width = view === "trajectory" ? projected : 100 - trend.uncertainty; return <button type="button" key={trend.id} className={active.id === trend.id ? "is-active" : ""} onClick={() => setSelected(trend.id)} style={{ "--tone": trend.color, "--lane": `${width}%`, "--start": `${12 + index * 3}%` } as CSSProperties}><span>{trend.short}</span><strong>{trend.name}</strong><i><b /></i><small>{view === "trajectory" ? `${trend.momentum} → ${projected}` : `${100 - trend.uncertainty}% confidence`}</small></button>; })}</div></section>
    <section className="portfolio-horizon-console"><fieldset><legend>Display</legend><button type="button" className={view === "trajectory" ? "is-active" : ""} onClick={() => setView("trajectory")}>Trajectory</button><button type="button" className={view === "confidence" ? "is-active" : ""} onClick={() => setView("confidence")}>Confidence</button></fieldset><article aria-live="polite"><span>SELECTED / {active.domain}</span><h2>{active.name}</h2><p>{active.status} across a {active.horizon.toLowerCase()} evidence horizon. Longer scenarios widen uncertainty.</p><dl><dt>Current momentum</dt><dd>{active.momentum}</dd><dt>Illustrative uncertainty</dt><dd>±{active.uncertainty}</dd></dl></article><DemoNotice>Projected endpoints are interface placeholders, not APTO predictions.</DemoNotice></section>
  </div>;
}

export function Leaderboard() {
  const [metric, setMetric] = useState<TrendMetric>("momentum");
  const [domain, setDomain] = useState<DomainFilter>("All");
  const [selected, setSelected] = useState("ai");
  const ranked = useMemo(() => [...filteredTrends(domain)].sort((a, b) => b[metric] - a[metric]), [domain, metric]);
  const active = trendData.find((trend) => trend.id === selected) ?? ranked[0] ?? trendData[0];
  return <div className="concept concept-leaderboard portfolio-page portfolio-leaderboard">
    <PortfolioHeader number="34" title="FRONTIER LEADERBOARD" light><span>COMPARE · DO NOT OVERSIMPLIFY</span></PortfolioHeader>
    <section className="portfolio-leader-hero"><div><span>THE PORTFOLIO, RANKED BY THE SIGNAL YOU CHOOSE</span><h1>No single list<br />tells the <em>whole story.</em></h1></div><DemoNotice>Rankings change with metric and are intentionally labeled as illustrative.</DemoNotice></section>
    <section className="portfolio-leader-controls"><MetricButtons metric={metric} onChange={setMetric} metrics={["momentum", "maturity", "evidence", "uncertainty", "change"]} /><DomainButtons value={domain} onChange={setDomain} /></section>
    <section className="portfolio-leader-table" aria-label={`Technology areas ranked by ${metricLabels[metric]}`} aria-live="polite"><div className="portfolio-leader-row is-head"><span>Rank</span><span>Technology area</span><span>Pattern</span><span>{metricLabels[metric]}</span><span>Change</span></div>{ranked.map((trend, index) => <button type="button" key={trend.id} className={`portfolio-leader-row ${active.id === trend.id ? "is-active" : ""}`} onClick={() => setSelected(trend.id)} style={{ "--tone": trend.color, "--value": `${trend[metric]}%` } as CSSProperties}><strong>{String(index + 1).padStart(2, "0")}</strong><span><i>{trend.short}</i><b>{trend.name}</b><small>{trend.domain}</small></span><span>{trend.status}</span><span><i /><b>{trend[metric]}</b></span><span className="is-up">↗ {trend.change}</span></button>)}</section>
    <aside className="portfolio-leader-detail"><span>WHY THIS POSITION?</span><h2>{active.name}</h2><p>The chosen metric is <strong>{metricLabels[metric].toLowerCase()}</strong>. Evidence breadth is {active.evidence}; uncertainty is {active.uncertainty}. Switch metrics to see why the order changes.</p><button type="button">Inspect the underlying signals →</button></aside>
  </div>;
}

const weatherModes = {
  "This quarter": ["Surge", "Building", "Broad", "Branching", "Steady", "Mixed", "Stable", "Building"],
  "Near horizon": ["High energy", "Front forming", "Brightening", "Converging", "Scaling", "Variable", "Crosswinds", "Expanding"],
  "Long horizon": ["Uncertain", "Wide range", "Layered", "Wide range", "Moderate", "Uncertain", "Moderate", "Layered"],
} as const;
type WeatherMode = keyof typeof weatherModes;

export function Weatherboard() {
  const [mode, setMode] = useState<WeatherMode>("This quarter");
  const [selected, setSelected] = useState(0);
  const active = trendData[selected];
  return <div className="concept concept-weatherboard portfolio-page portfolio-weatherboard">
    <PortfolioHeader number="35" title="TECHNOLOGY WEATHER"><span>CONDITIONS ACROSS THE PORTFOLIO</span></PortfolioHeader>
    <section className="portfolio-weather-top"><div><span>A FAMILIAR LANGUAGE FOR COMPLEX SIGNALS</span><h1>Today across<br />the <em>frontier.</em></h1><p>Weather is the visual metaphor; every condition opens into explicit measures, sources, and uncertainty.</p></div><fieldset><legend>Observation window</legend>{(Object.keys(weatherModes) as WeatherMode[]).map((item) => <button type="button" key={item} aria-pressed={mode === item} className={mode === item ? "is-active" : ""} onClick={() => setMode(item)}>{item}</button>)}</fieldset></section>
    <section className="portfolio-weather-grid">{trendData.map((trend, index) => <button type="button" key={trend.id} className={`portfolio-weather-card weather-${index % 5} ${selected === index ? "is-active" : ""}`} style={{ "--tone": trend.color, "--heat": `${trend.momentum}%` } as CSSProperties} onClick={() => setSelected(index)}><div className="portfolio-weather-icon" aria-hidden="true"><i /><i /><i /></div><span>{trend.domain}</span><h2>{trend.name}</h2><strong>{weatherModes[mode][index]}</strong><p>{trend.momentum} momentum · ±{trend.uncertainty}</p></button>)}</section>
    <section className="portfolio-weather-detail" aria-live="polite"><div><span>SELECTED CONDITION</span><h2>{active.name}</h2><strong>{weatherModes[mode][selected]}</strong></div><SparkBars values={active.pulse} label={active.name} /><dl><dt>Momentum</dt><dd>{active.momentum}</dd><dt>Maturity</dt><dd>{active.maturity}</dd><dt>Evidence</dt><dd>{active.evidence}</dd><dt>Uncertainty</dt><dd>±{active.uncertainty}</dd></dl><DemoNotice /></section>
  </div>;
}

const constellationPositions = [
  [48, 16], [73, 28], [82, 58], [64, 78], [37, 82], [16, 63], [19, 31], [48, 49],
] as const;

export function Constellation() {
  const [domain, setDomain] = useState<DomainFilter>("All");
  const [selected, setSelected] = useState(0);
  const [connections, setConnections] = useState(true);
  const active = trendData[selected];
  return <div className="concept concept-constellation portfolio-page portfolio-constellation">
    <PortfolioHeader number="36" title="PORTFOLIO CONSTELLATION" light><span>RELATIONSHIPS BEFORE SILOS</span></PortfolioHeader>
    <section className="portfolio-constellation-intro"><div><span>TECHNOLOGIES DEVELOP TOGETHER</span><h1>See the portfolio<br />as a <em>system.</em></h1><p>Select any technology to foreground its shared methods, capabilities, and translation pathways.</p></div><DomainButtons value={domain} onChange={setDomain} /></section>
    <section className={`portfolio-constellation-stage ${connections ? "show-connections" : ""}`}><div className="portfolio-constellation-orbit" aria-label="Interactive constellation of tracked technology areas"><i className="portfolio-constellation-ring ring-a" aria-hidden="true" /><i className="portfolio-constellation-ring ring-b" aria-hidden="true" />{trendData.map((trend, index) => { const visible = domain === "All" || trend.domain === domain; return <button type="button" key={trend.id} disabled={!visible} className={`${selected === index ? "is-active" : ""} ${visible ? "is-visible" : "is-muted"}`} style={{ left: `${constellationPositions[index][0]}%`, top: `${constellationPositions[index][1]}%`, "--tone": trend.color, "--size": `${42 + trend.momentum / 2}px` } as CSSProperties} onClick={() => setSelected(index)}><i aria-hidden="true" /><span>{trend.short}</span><small>{trend.name}</small></button>; })}<div className="portfolio-constellation-core"><PortfolioMark light /><span>8 AREAS</span></div></div><aside aria-live="polite"><span>{active.domain} / SELECTED</span><h2>{active.name}</h2><p>{active.status}. The illustrative relationship view highlights three shared measurement systems and two adjacent technology areas.</p><div><b>Momentum {active.momentum}</b><b>Evidence {active.evidence}</b><b>±{active.uncertainty} uncertainty</b></div><button type="button">Trace connections →</button></aside></section>
    <section className="portfolio-constellation-controls"><label><input type="checkbox" checked={connections} onChange={(event) => setConnections(event.target.checked)} /> Show relationship paths</label><DemoNotice /></section>
  </div>;
}

const briefs = [
  { trend: "ai", type: "Portfolio lead", headline: "AI systems show the strongest near-term momentum signal", deck: "Capability gains remain broad, while translation patterns vary substantially by application.", evidence: "88 evidence breadth · ±24 uncertainty" },
  { trend: "materials", type: "Cross-domain", headline: "Advanced materials activity broadens across energy and computing", deck: "Multiple capability frontiers advance at different rates inside the same headline category.", evidence: "82 evidence breadth · 9 point change" },
  { trend: "bio", type: "Emerging branch", headline: "Synthetic biology signals split into distinct development paths", deck: "The portfolio view reveals branching that a single aggregate score would conceal.", evidence: "76 evidence breadth · ±42 uncertainty" },
  { trend: "quantum", type: "Watch closely", headline: "Quantum activity expands while long-horizon uncertainty stays high", deck: "Research momentum and production readiness should be read as separate signals.", evidence: "69 evidence breadth · ±61 uncertainty" },
  { trend: "energy", type: "Translation", headline: "Clean energy systems move from performance toward deployment", deck: "Scaling evidence now sits beside capability measures in the observatory view.", evidence: "84 evidence breadth · 69 maturity" },
  { trend: "structural", type: "Convergence", headline: "Structural biology integrates measurement and computation", deck: "Shared methods connect this area to AI systems, biology, and data infrastructure.", evidence: "82 evidence breadth · 7 point change" },
] as const;

export function Newsroom() {
  const [topic, setTopic] = useState<DomainFilter>("All");
  const [expanded, setExpanded] = useState(0);
  const visible = briefs.filter((brief) => topic === "All" || trendData.find((trend) => trend.id === brief.trend)?.domain === topic);
  return <div className="concept concept-newsroom portfolio-page portfolio-newsroom">
    <PortfolioHeader number="37" title="THE APTO BRIEF"><span>PORTFOLIO EDITION · DESIGN DEMO</span></PortfolioHeader>
    <section className="portfolio-news-masthead"><PortfolioMark /><h1>The Technology<br /><em>Observatory Brief</em></h1><p>Signals, comparisons, and evidence from across the technology portfolio.</p><time>Quarterly view / illustrative</time></section>
    <nav className="portfolio-news-topics" aria-label="Filter brief by technology domain" data-local-arrows="true">{domains.map((domain) => <button type="button" key={domain} aria-pressed={topic === domain} className={topic === domain ? "is-active" : ""} onClick={() => setTopic(domain)}>{domain}</button>)}</nav>
    <section className="portfolio-news-lead"><article><span>THE PORTFOLIO IN ONE NUMBER</span><strong>78</strong><h2>Composite momentum is high, but development conditions remain uneven.</h2><p>Open the boxes below for a fast cross-technology briefing. Every headline is paired with its evidence status.</p></article><div className="portfolio-news-mini-index">{trendData.slice(0, 5).map((trend) => <div key={trend.id}><span>{trend.short}</span><i style={{ "--value": `${trend.momentum}%`, "--tone": trend.color } as CSSProperties} /><strong>{trend.momentum}</strong></div>)}</div></section>
    <section className="portfolio-news-grid" aria-live="polite">{visible.map((brief) => { const trend = trendData.find((item) => item.id === brief.trend) ?? trendData[0]; const open = expanded === briefs.indexOf(brief); return <article key={brief.headline} className={open ? "is-open" : ""} style={{ "--tone": trend.color } as CSSProperties}><span>{brief.type} / {trend.domain}</span><h2>{brief.headline}</h2><p>{brief.deck}</p><small>{brief.evidence}</small><button type="button" aria-expanded={open} onClick={() => setExpanded(open ? -1 : briefs.indexOf(brief))}>{open ? "Close briefing" : "Read briefing"} <b>→</b></button>{open && <div><h3>What APTO would show next</h3><p>A source-linked chart, measurement notes, responsible team, public-access status, and a clear account of what remains unknown.</p><a href="#portfolio-news-method">Follow this signal →</a></div>}</article>; })}</section>
    <footer id="portfolio-news-method"><DemoNotice>All headlines and values are illustrative copy for this homepage concept.</DemoNotice></footer>
  </div>;
}

const matrixMetrics: readonly TrendMetric[] = ["momentum", "maturity", "evidence", "uncertainty"];

export function Matrix() {
  const [domain, setDomain] = useState<DomainFilter>("All");
  const [selected, setSelected] = useState("ai");
  const [mode, setMode] = useState<"numbers" | "patterns">("patterns");
  const visible = filteredTrends(domain);
  const active = trendData.find((trend) => trend.id === selected) ?? visible[0] ?? trendData[0];
  return <div className="concept concept-matrix portfolio-page portfolio-matrix">
    <PortfolioHeader number="38" title="EVIDENCE MATRIX" light><span>8 AREAS × 4 SIGNALS</span></PortfolioHeader>
    <section className="portfolio-matrix-intro"><div><span>THE GENERAL VIEW, WITHOUT THE GENERALIZATION</span><h1>Compare every area<br />across the <em>same questions.</em></h1></div><p>Rows are technology areas. Columns are distinct signals. Select a cell to understand what its color and value mean.</p></section>
    <section className="portfolio-matrix-controls"><DomainButtons value={domain} onChange={setDomain} /><fieldset><legend>Cell display</legend><button type="button" aria-pressed={mode === "patterns"} className={mode === "patterns" ? "is-active" : ""} onClick={() => setMode("patterns")}>Color patterns</button><button type="button" aria-pressed={mode === "numbers"} className={mode === "numbers" ? "is-active" : ""} onClick={() => setMode("numbers")}>Exact values</button></fieldset></section>
    <section className={`portfolio-matrix-table mode-${mode}`} role="table" aria-label="Illustrative technology signal matrix"><div className="portfolio-matrix-row is-head" role="row"><span role="columnheader">Technology area</span>{matrixMetrics.map((metric) => <span role="columnheader" key={metric}>{metricLabels[metric]}</span>)}</div>{visible.map((trend) => <div className={`portfolio-matrix-row ${active.id === trend.id ? "is-active" : ""}`} role="row" key={trend.id}><button type="button" role="rowheader" onClick={() => setSelected(trend.id)}><i style={{ background: trend.color }} /><strong>{trend.name}</strong><small>{trend.domain}</small></button>{matrixMetrics.map((metric) => <button type="button" role="cell" key={metric} aria-label={`${trend.name}, ${metricLabels[metric]}: ${trend[metric]}`} onClick={() => setSelected(trend.id)} style={{ "--value": trend[metric], "--tone": trend.color } as CSSProperties}><i /><strong>{trend[metric]}</strong></button>)}</div>)}</section>
    <section className="portfolio-matrix-detail" aria-live="polite"><div><span>SELECTED ROW</span><h2>{active.name}</h2><p>{active.status} · {active.horizon}</p></div><dl>{matrixMetrics.map((metric) => <div key={metric}><dt>{metricLabels[metric]}</dt><dd>{active[metric]}</dd></div>)}</dl><button type="button">Open evidence profile →</button><DemoNotice /></section>
  </div>;
}

export function Exchange() {
  const [metric, setMetric] = useState<TrendMetric>("change");
  const [selected, setSelected] = useState("ai");
  const [watching, setWatching] = useState<string[]>(["ai", "quantum", "bio"]);
  const [watchOnly, setWatchOnly] = useState(false);
  const sorted = useMemo(() => [...trendData].filter((trend) => !watchOnly || watching.includes(trend.id)).sort((a, b) => b[metric] - a[metric]), [metric, watchOnly, watching]);
  const active = trendData.find((trend) => trend.id === selected) ?? sorted[0] ?? trendData[0];
  const toggleWatch = (id: string) => setWatching((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  return <div className="concept concept-exchange portfolio-page portfolio-exchange">
    <PortfolioHeader number="39" title="SIGNAL EXCHANGE" light><span>RESEARCH SIGNALS · NOT FINANCIAL DATA</span></PortfolioHeader>
    <section className="portfolio-exchange-tape" aria-label="Technology signal tape">{trendData.map((trend) => <span key={trend.id}><b>{trend.short}</b>{trend.momentum}<i>↗{trend.change}</i></span>)}</section>
    <section className="portfolio-exchange-hero"><div><span>A FAST, SERIOUS VIEW OF THE PORTFOLIO</span><h1>Track what is<br /><em>moving now.</em></h1><p>A market-screen visual language repurposed for research momentum, evidence breadth, maturity, and uncertainty.</p></div><article><span>APTO COMPOSITE</span><strong>78.4</strong><small>+8.1 / illustrative quarter</small><SparkBars values={[41, 44, 48, 46, 53, 59, 63, 67, 74, 78]} label="APTO composite" /></article></section>
    <section className="portfolio-exchange-controls"><MetricButtons metric={metric} onChange={setMetric} metrics={["change", "momentum", "evidence", "maturity"]} /><label><input type="checkbox" checked={watchOnly} onChange={(event) => setWatchOnly(event.target.checked)} /> Watchlist only</label></section>
    <section className="portfolio-exchange-board"><div className="portfolio-exchange-list" aria-live="polite">{sorted.map((trend, index) => <article key={trend.id} className={active.id === trend.id ? "is-active" : ""} style={{ "--tone": trend.color } as CSSProperties}><button type="button" className="portfolio-exchange-select" onClick={() => setSelected(trend.id)}><span>{String(index + 1).padStart(2, "0")}</span><i>{trend.short}</i><strong>{trend.name}</strong><small>{trend.status}</small><b>{trend[metric]}</b><em>↗ {trend.change}</em></button><button type="button" className="portfolio-exchange-watch" aria-pressed={watching.includes(trend.id)} aria-label={`${watching.includes(trend.id) ? "Remove" : "Add"} ${trend.name} ${watching.includes(trend.id) ? "from" : "to"} watchlist`} onClick={() => toggleWatch(trend.id)}>{watching.includes(trend.id) ? "★" : "☆"}</button></article>)}</div><aside aria-live="polite"><span>SELECTED SIGNAL / {active.short}</span><h2>{active.name}</h2><SparkBars values={active.pulse} label={active.name} /><dl><dt>Momentum</dt><dd>{active.momentum}</dd><dt>Maturity</dt><dd>{active.maturity}</dd><dt>Evidence</dt><dd>{active.evidence}</dd><dt>Uncertainty</dt><dd>±{active.uncertainty}</dd></dl><button type="button">Open signal dossier →</button><DemoNotice /></aside></section>
  </div>;
}

export function Watchtower() {
  const [threshold, setThreshold] = useState(72);
  const [domain, setDomain] = useState<DomainFilter>("All");
  const [selected, setSelected] = useState("ai");
  const [signal, setSignal] = useState<"momentum" | "uncertainty">("momentum");
  const visible = filteredTrends(domain);
  const alerting = visible.filter((trend) => trend[signal] >= threshold);
  const active = trendData.find((trend) => trend.id === selected) ?? alerting[0] ?? visible[0] ?? trendData[0];
  return <div className="concept concept-watchtower portfolio-page portfolio-watchtower">
    <PortfolioHeader number="40" title="APTO WATCHTOWER"><span className="portfolio-live-tag">● {alerting.length} ACTIVE SIGNALS</span></PortfolioHeader>
    <section className="portfolio-watch-hero"><div><span>MONITOR THE PORTFOLIO, NOT A SINGLE TECHNOLOGY</span><h1>See change<br />before choosing<br /><em>where to look.</em></h1><p>Set a signal threshold. The watchtower foregrounds technology areas that deserve closer evidence review.</p></div><div className="portfolio-watch-radar" aria-hidden="true"><i /><i /><i /><span>{alerting.length}</span></div></section>
    <section className="portfolio-watch-console"><fieldset><legend>Watch signal</legend><button type="button" aria-pressed={signal === "momentum"} className={signal === "momentum" ? "is-active" : ""} onClick={() => setSignal("momentum")}>Momentum</button><button type="button" aria-pressed={signal === "uncertainty"} className={signal === "uncertainty" ? "is-active" : ""} onClick={() => setSignal("uncertainty")}>Uncertainty</button></fieldset><label htmlFor="portfolio-watch-threshold">Alert threshold <strong>{threshold}</strong><input id="portfolio-watch-threshold" type="range" min="25" max="95" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></label><DomainButtons value={domain} onChange={setDomain} /></section>
    <section className="portfolio-watch-layout"><div className="portfolio-watch-list" aria-live="polite"><div><span>STATUS</span><span>TECHNOLOGY AREA</span><span>{metricLabels[signal]}</span><span>EVIDENCE</span></div>{visible.map((trend) => { const alert = trend[signal] >= threshold; return <button type="button" key={trend.id} className={`${alert ? "is-alert" : "is-quiet"} ${active.id === trend.id ? "is-active" : ""}`} onClick={() => setSelected(trend.id)} style={{ "--tone": trend.color, "--value": `${trend[signal]}%` } as CSSProperties}><span><i />{alert ? "Review" : "Normal"}</span><span><b>{trend.short}</b><strong>{trend.name}</strong></span><span><i /><b>{trend[signal]}</b></span><span>{trend.evidence}</span></button>; })}</div><aside aria-live="polite"><span>WATCH DETAIL / {active.domain}</span><h2>{active.name}</h2><strong>{active[signal] >= threshold ? "Threshold crossed" : "Below current threshold"}</strong><p>{active.status}. Review the underlying observations before interpreting this signal as a development change.</p><dl><dt>Momentum</dt><dd>{active.momentum}</dd><dt>Uncertainty</dt><dd>±{active.uncertainty}</dd><dt>Horizon</dt><dd>{active.horizon}</dd></dl><button type="button">Review supporting evidence →</button></aside></section>
    <footer className="portfolio-watch-footer"><DemoNotice>Alerts are illustrative interface states, not real APTO monitoring results.</DemoNotice><span>{alerting.length} of {visible.length} areas meet this threshold</span></footer>
  </div>;
}

export function PortfolioMockup({ id }: { id: PortfolioId }) {
  switch (id) {
    case "pulseboard": return <Pulseboard />;
    case "signalgrid": return <SignalGrid />;
    case "horizon": return <Horizon />;
    case "leaderboard": return <Leaderboard />;
    case "weatherboard": return <Weatherboard />;
    case "constellation": return <Constellation />;
    case "newsroom": return <Newsroom />;
    case "matrix": return <Matrix />;
    case "exchange": return <Exchange />;
    case "watchtower": return <Watchtower />;
  }
}
