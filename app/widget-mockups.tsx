"use client";

import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export type WidgetMockupId =
  | "widgetdock"
  | "widgetcanvas"
  | "widgetrail"
  | "widgetos"
  | "widgetbrief"
  | "widgetglass"
  | "widgetnotebook"
  | "widgetspatial"
  | "widgetcivic"
  | "widgethome";

type WidgetId =
  | "science-map"
  | "emerging"
  | "trajectories"
  | "patents"
  | "techbridge"
  | "forecast"
  | "funding"
  | "open-data"
  | "ventures"
  | "capability";

type WidgetSpec = {
  id: WidgetId;
  icon: string;
  short: string;
  kicker: string;
  title: string;
  summary: string;
  source: string;
  sourceClass: "Open data" | "Restricted aggregate" | "Planned capability";
};

const widgetSpecs: readonly WidgetSpec[] = [
  { id: "science-map", icon: "◎", short: "Map", kicker: "MAP OF SCIENCE", title: "Where knowledge is forming", summary: "Explore an illustrative UMAP-like landscape of connected research areas and emerging clusters.", source: "Publications + field embeddings", sourceClass: "Open data" },
  { id: "emerging", icon: "↗", short: "Signals", kicker: "EMERGING AREAS", title: "Frontiers gaining attention", summary: "Compare candidate topics such as perovskites, quantum computing, and advanced manufacturing; APTO topic validation is pending.", source: "Candidate topics awaiting validation", sourceClass: "Planned capability" },
  { id: "trajectories", icon: "⌁", short: "Trends", kicker: "TECHNOLOGY TRAJECTORIES", title: "Many curves, one comparative view", summary: "Small-multiple timelines reveal how emerging technologies within each domain may be developing.", source: "Illustrative indexed trajectories", sourceClass: "Planned capability" },
  { id: "patents", icon: "◇", short: "IP", kicker: "TRANSLATION POTENTIAL", title: "License propensity, startup pathway + patent signal", summary: "A compact model view for research translation signals, market adjacency, and possible licensing pathways.", source: "Illustrative translation framework", sourceClass: "Restricted aggregate" },
  { id: "techbridge", icon: "⇥", short: "Bridge", kicker: "TECHBRIDGE DATA INFRASTRUCTURE", title: "Linking institutional records to SciSciNet", summary: "See how governance, secure transfer, shared schemas, and institution-scoped access support responsible cross-university analysis.", source: "Program governance + linked-data framework", sourceClass: "Restricted aggregate" },
  { id: "forecast", icon: "◌", short: "Forecast", kicker: "FORECAST ENSEMBLE", title: "What could happen next?", summary: "Compare multiple forecasting approaches, their uncertainty, and the evidence behind each horizon.", source: "Mock model ensemble", sourceClass: "Planned capability" },
  { id: "funding", icon: "$", short: "Funding", kicker: "FUNDING THE FRONTIER", title: "Investment across the frontier", summary: "See how research support may be distributed across fields, institutions, and development stages.", source: "Illustrative award portfolio", sourceClass: "Restricted aggregate" },
  { id: "open-data", icon: "⊞", short: "Data", kicker: "SCISCINET + OPEN DATA", title: "Reusable evidence infrastructure", summary: "Discover confirmed public datasets, documented methods, and open resources for science-of-science research.", source: "Confirmed public APTO resources", sourceClass: "Open data" },
  { id: "ventures", icon: "△", short: "Ventures", kicker: "VENTURE FORMATION", title: "Signals of translation", summary: "Track illustrative pathways from research teams to disclosures, startups, partnerships, and scale.", source: "Mock venture indicators", sourceClass: "Restricted aggregate" },
  { id: "capability", icon: "⇄", short: "Compare", kicker: "CAPABILITY COMPARISON", title: "United States and China", summary: "Preview a planned Year 3 comparison of multidimensional capability signals without collapsing a complex system into one rank.", source: "Year 3 concept — not a current result", sourceClass: "Planned capability" },
] as const;

const emergingAreas = [
  ["Perovskite tandems", 88, "+19%", "Solar"],
  ["Fault-tolerant quantum", 81, "+14%", "Computing"],
  ["AI-designed proteins", 76, "+23%", "Biology"],
  ["Solid-state batteries", 69, "+11%", "Energy"],
  ["Additive manufacturing", 63, "+8%", "Production"],
] as const;

const trajectories = [
  { name: "Perovskite PV", domain: "ENERGY", color: "#ff7a59", values: [18, 28, 37, 52, 68, 82] },
  { name: "Quantum computing", domain: "DIGITAL", color: "#7567ff", values: [12, 20, 31, 49, 61, 75] },
  { name: "Advanced manufacturing", domain: "PHYSICAL", color: "#19a783", values: [27, 32, 41, 48, 57, 64] },
  { name: "Synthetic biology", domain: "BIOLOGICAL", color: "#df3d85", values: [20, 29, 43, 54, 70, 79] },
  { name: "AI accelerators", domain: "DIGITAL", color: "#e5a500", values: [32, 42, 55, 69, 84, 93] },
  { name: "Carbon removal", domain: "CLIMATE", color: "#268cbf", values: [10, 15, 24, 39, 52, 67] },
] as const;

const capabilityRows = [
  ["Research breadth", 84, 88],
  ["High-impact knowledge", 91, 83],
  ["Manufacturing depth", 72, 94],
  ["Venture formation", 93, 68],
  ["Talent mobility", 86, 78],
] as const;

function WidgetMark({ inverse = false }: { inverse?: boolean }) {
  return <div className={`widget-mark ${inverse ? "is-inverse" : ""}`}><i aria-hidden="true" /><strong>APTO</strong><span>ASSESSING &amp; PREDICTING<br />TECHNOLOGY OUTCOMES</span></div>;
}

function IllustrativeLabel({ compact = false }: { compact?: boolean }) {
  return <span className={`widget-mock-label ${compact ? "is-compact" : ""}`}><i aria-hidden="true" />Illustrative interface — demo values are not APTO findings.</span>;
}

function ScienceMapWidget() {
  const clusters = ["Quantum", "Materials", "Energy", "AI", "Biology"];
  return <div className="widget-viz widget-viz-science-map">
    <div className="widget-science-map-image">
      <div className="widget-map-plot" role="img" aria-label="Illustrative map of science with five labeled research clusters">
        <div className="widget-map-wash" aria-hidden="true" />
        {clusters.map((cluster, index) => <span key={cluster} className={`widget-map-cluster widget-map-cluster-${index}`}><i />{cluster}</span>)}
      </div>
      <button type="button" className="widget-map-focus"><span>EMERGING CLUSTER</span><strong>Perovskite interfaces</strong><small>1,284 connected papers</small></button>
    </div>
    <footer><span>120K research records</span><span>2,408 clusters</span><button type="button">Explore the full map →</button></footer>
  </div>;
}

function EmergingWidget() {
  const [selected, setSelected] = useState(0);
  return <div className="widget-viz widget-viz-emerging">
    <ol className="widget-emerging-list" data-local-arrows="true">
      {emergingAreas.map(([name, score, change, domain], index) => <li key={name}>
        <button type="button" className={selected === index ? "is-active" : ""} aria-pressed={selected === index} onClick={() => setSelected(index)}>
          <span>{String(index + 1).padStart(2, "0")}</span><div><small>{domain}</small><strong>{name}</strong></div><i style={{ "--widget-value": `${score}%` } as CSSProperties} /><b>{change}</b>
        </button>
      </li>)}
    </ol>
    <aside><small>SELECTED SIGNAL</small><strong>{emergingAreas[selected][0]}</strong><p>Momentum appears across publications, patents, and team formation in this illustrative view.</p></aside>
  </div>;
}

function TrajectoryWidget() {
  const [horizon, setHorizon] = useState<"5" | "10">("5");
  return <div className="widget-viz widget-viz-trajectories">
    <div className="widget-trajectory-toolbar"><span>INDEXED DEVELOPMENT SIGNAL · 2020 = 0</span><fieldset><legend>Forecast horizon</legend>{(["5", "10"] as const).map((year) => <button type="button" key={year} className={horizon === year ? "is-active" : ""} aria-pressed={horizon === year} onClick={() => setHorizon(year)}>{year} years</button>)}</fieldset></div>
    <div className="widget-small-multiples">
      {trajectories.map((trajectory) => <article key={trajectory.name} style={{ "--widget-tone": trajectory.color } as CSSProperties}><header><span>{trajectory.domain}</span><strong>{trajectory.name}</strong></header><div className="widget-mini-curve" role="img" aria-label={`${trajectory.name} illustrative rising trajectory`}>
        {trajectory.values.map((value, index) => <i key={index} style={{ "--widget-point": `${value}%`, "--widget-index": index } as CSSProperties} />)}
        <span className="widget-forecast-zone" style={{ "--widget-horizon": horizon } as CSSProperties} />
      </div><footer><small>2020</small><small>{horizon === "5" ? "2030" : "2035"}</small></footer></article>)}
    </div>
  </div>;
}

function PatentWidget() {
  const [mode, setMode] = useState<"patent" | "license">("patent");
  const labels = mode === "patent" ? ["Novelty", "Claim scope", "Prior art", "Enablement"] : ["Market fit", "Partner pool", "Freedom to operate", "Time to license"];
  const values = mode === "patent" ? [84, 72, 61, 78] : [76, 88, 57, 69];
  return <div className="widget-viz widget-viz-patents">
    <fieldset className="widget-binary-tabs"><legend>Assessment view</legend><button type="button" className={mode === "patent" ? "is-active" : ""} aria-pressed={mode === "patent"} onClick={() => setMode("patent")}>Patent signal</button><button type="button" className={mode === "license" ? "is-active" : ""} aria-pressed={mode === "license"} onClick={() => setMode("license")}>License propensity</button></fieldset>
    <div className="widget-ip-score"><small>ILLUSTRATIVE COMPOSITE</small><strong>{mode === "patent" ? "74" : "71"}</strong><span>/ 100</span><i style={{ "--widget-value": mode === "patent" ? "74%" : "71%" } as CSSProperties} /></div>
    <div className="widget-ip-matrix">{labels.map((label, index) => <article key={label}><span>{label}</span><strong>{values[index]}</strong><i style={{ "--widget-value": `${values[index]}%` } as CSSProperties} /></article>)}</div>
    <p>Illustrative model score — not a legal patentability determination.</p>
  </div>;
}

function TechBridgeWidget() {
  const [stage, setStage] = useState(2);
  const stages = [["DUA", "18"], ["Transfer", "12"], ["Link", "70"], ["Analyze", "03"], ["Release", "01"]] as const;
  return <div className="widget-viz widget-viz-techbridge">
    <div className="widget-bridge-path" data-local-arrows="true">{stages.map(([label, count], index) => <button type="button" key={label} className={stage === index ? "is-active" : ""} aria-pressed={stage === index} onClick={() => setStage(index)}><span>0{index + 1}</span><i /><strong>{label}</strong><small>{count} {index === 0 ? "partners" : index === 1 ? "workflows" : index === 2 ? "datasets" : index === 3 ? "analyses" : "public view"}</small></button>)}</div>
    <article><small>ACTIVE STAGE</small><h3>{stages[stage][0]}</h3><p>{["Standardize data-use agreements and governance across participating institutions.", "Move confidential administrative records through secure, repeatable transfer workflows.", "Clean, harmonize, and connect institution data to shared data-lake entities.", "Use institution-scoped access controls for responsible longitudinal analysis.", "Publish only approved aggregate findings and open derivatives."][stage]}</p><button type="button">Open governance detail →</button></article>
  </div>;
}

function ForecastWidget() {
  const [technology, setTechnology] = useState<"Perovskite PV" | "Quantum computing">("Perovskite PV");
  const models = technology === "Perovskite PV" ? [["Bibliometric", 78, 18], ["Expert elicitation", 69, 27], ["Capability curve", 83, 22]] : [["Bibliometric", 64, 24], ["Expert elicitation", 74, 34], ["Capability curve", 58, 29]];
  return <div className="widget-viz widget-viz-forecast">
    <label>Technology<select value={technology} onChange={(event) => setTechnology(event.target.value as typeof technology)}><option>Perovskite PV</option><option>Quantum computing</option></select></label>
    <div className="widget-forecast-models">{models.map(([name, value, spread]) => <article key={String(name)}><header><strong>{name}</strong><small>{value}% median</small></header><div><i style={{ "--widget-start": `${Number(value) - Number(spread) / 2}%`, "--widget-width": `${spread}%` } as CSSProperties} /><b style={{ "--widget-value": `${value}%` } as CSSProperties} /></div><footer><span>Near term</span><span>Long horizon</span></footer></article>)}</div>
    <aside><strong>Ensemble signal</strong><span>{technology === "Perovskite PV" ? "Capability growth likely; adoption remains conditional." : "Wide uncertainty around useful scale and timing."}</span></aside>
  </div>;
}

function FundingWidget() {
  const [view, setView] = useState<"field" | "stage">("field");
  const field = [["AI + computing", 31], ["Energy + climate", 24], ["Biotechnology", 19], ["Materials", 15], ["Manufacturing", 11]] as const;
  const stage = [["Foundational", 36], ["Emerging", 29], ["Translational", 21], ["Capability testing", 14]] as const;
  const rows = view === "field" ? field : stage;
  return <div className="widget-viz widget-viz-funding">
    <header><div><small>ILLUSTRATIVE PORTFOLIO</small><strong>$1.24B</strong><span>research support in view</span></div><fieldset><legend>Group funding</legend><button type="button" className={view === "field" ? "is-active" : ""} aria-pressed={view === "field"} onClick={() => setView("field")}>By field</button><button type="button" className={view === "stage" ? "is-active" : ""} aria-pressed={view === "stage"} onClick={() => setView("stage")}>By stage</button></fieldset></header>
    <div className="widget-funding-bars">{rows.map(([label, value], index) => <article key={label}><span>{label}</span><div><i style={{ "--widget-value": `${value * 2.7}%`, "--widget-index": index } as CSSProperties} /></div><strong>{value}%</strong></article>)}</div>
  </div>;
}

function OpenDataWidget() {
  const [filter, setFilter] = useState<"All" | "Data" | "Methods">("All");
  const resources = [["SciSciNet-v2", "Data", "~250M papers", "Open"], ["Software-use trajectories", "Data", "3M repositories", "Open"], ["arXiv-use trajectories", "Data", "2.3M preprints", "Open"], ["SciSciGPT source", "Methods", "Auditable workflows", "Open source"]] as const;
  const visible = filter === "All" ? resources : resources.filter((resource) => resource[1] === filter);
  return <div className="widget-viz widget-viz-open-data">
    <div className="widget-data-toolbar"><span>CONFIRMED PUBLIC RESOURCES</span><fieldset><legend>Filter resources</legend>{(["All", "Data", "Methods"] as const).map((item) => <button type="button" key={item} className={filter === item ? "is-active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</fieldset></div>
    <div className="widget-resource-list" aria-live="polite">{visible.map(([name, type, detail, status]) => <button type="button" key={name}><i aria-hidden="true">{type === "Data" ? "⊞" : "⌘"}</i><div><small>{type}</small><strong>{name}</strong></div><span>{detail}</span><b>{status}</b><em>↗</em></button>)}</div>
  </div>;
}

function VenturesWidget() {
  const [cohort, setCohort] = useState<"2025" | "2026">("2026");
  const counts = cohort === "2026" ? [64, 38, 19, 11, 6] : [52, 29, 16, 8, 4];
  const labels = ["Research teams", "Disclosures", "Partner matches", "New ventures", "Scaled pilots"];
  return <div className="widget-viz widget-viz-ventures">
    <header><div><small>TRANSLATION PATHWAYS</small><strong>{counts[3]}</strong><span>illustrative new ventures</span></div><label>Cohort<select value={cohort} onChange={(event) => setCohort(event.target.value as typeof cohort)}><option>2026</option><option>2025</option></select></label></header>
    <div className="widget-venture-funnel">{labels.map((label, index) => <article key={label} style={{ "--widget-value": `${100 - index * 13}%` } as CSSProperties}><span>0{index + 1}</span><strong>{counts[index]}</strong><small>{label}</small></article>)}</div>
    <p>Counts demonstrate an interface pattern, not reported APTO outcomes.</p>
  </div>;
}

function CapabilityWidget() {
  const [focus, setFocus] = useState(0);
  return <div className="widget-viz widget-viz-capability">
    <header><span>CAPABILITY DIMENSIONS</span><div><i className="is-us" />United States<i className="is-cn" />China</div></header>
    <div className="widget-capability-table" data-local-arrows="true">{capabilityRows.map(([label, us, china], index) => <button type="button" key={label} className={focus === index ? "is-active" : ""} aria-pressed={focus === index} onClick={() => setFocus(index)}><span>{label}</span><div><i className="is-us" style={{ "--widget-value": `${us}%` } as CSSProperties} /><i className="is-cn" style={{ "--widget-value": `${china}%` } as CSSProperties} /></div><strong>{us}</strong><strong>{china}</strong></button>)}</div>
    <aside><small>PLANNED YEAR 3 CAPABILITY</small><strong>{capabilityRows[focus][0]}</strong><p>This is not a current APTO result. Context, definitions, sources, and uncertainty would accompany every comparison.</p></aside>
  </div>;
}

function WidgetVisual({ id }: { id: WidgetId }) {
  switch (id) {
    case "science-map": return <ScienceMapWidget />;
    case "emerging": return <EmergingWidget />;
    case "trajectories": return <TrajectoryWidget />;
    case "patents": return <PatentWidget />;
    case "techbridge": return <TechBridgeWidget />;
    case "forecast": return <ForecastWidget />;
    case "funding": return <FundingWidget />;
    case "open-data": return <OpenDataWidget />;
    case "ventures": return <VenturesWidget />;
    case "capability": return <CapabilityWidget />;
  }
}

function WidgetChooser({ active, onChange, mode }: { active: WidgetId; onChange: (id: WidgetId) => void; mode: string }) {
  const chooseFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = widgetSpecs.findIndex((widget) => widget.id === active);
    const next = event.key === "Home" ? 0 : event.key === "End" ? widgetSpecs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + widgetSpecs.length) % widgetSpecs.length;
    onChange(widgetSpecs[next].id);
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };
  return <div className={`widget-chooser widget-chooser-${mode}`} role="group" aria-label="Choose an APTO widget" data-local-arrows="true" onKeyDown={chooseFromKeyboard}>
    {widgetSpecs.map((widget) => <button type="button" aria-pressed={active === widget.id} className={active === widget.id ? "is-active" : ""} key={widget.id} onClick={() => onChange(widget.id)}><i aria-hidden="true">{widget.icon}</i><span>{widget.short}</span><small>{widget.kicker}</small></button>)}
  </div>;
}

function WidgetDeck({ initial, mode }: { initial: WidgetId; mode: string }) {
  const [active, setActive] = useState<WidgetId>(initial);
  const [added, setAdded] = useState<WidgetId[]>([initial]);
  const widget = widgetSpecs.find((item) => item.id === active) ?? widgetSpecs[0];
  const isAdded = added.includes(active);
  const toggleWidget = () => setAdded((current) => current.includes(active) ? current.filter((item) => item !== active) : [...current, active]);
  return <section className={`widget-deck widget-deck-${mode}`} aria-label="Interactive APTO widget preview">
    <header className="widget-deck-header"><div><span>YOUR APTO VIEW</span><strong>Choose a live module</strong></div><p><b>{String(added.length).padStart(2, "0")}</b> widgets on this page</p></header>
    <WidgetChooser active={active} onChange={setActive} mode={mode} />
    <div className="widget-panel" aria-live="polite" key={active}>
      <header className="widget-panel-title"><div><span>{widget.kicker}</span><h2>{widget.title}</h2><p>{widget.summary}</p></div><IllustrativeLabel compact /></header>
      <WidgetVisual id={active} />
      <footer className="widget-panel-actions"><span><b className={`widget-source-chip is-${widget.sourceClass.toLowerCase().replaceAll(" ", "-")}`}>{widget.sourceClass}</b>Source concept · {widget.source}</span><div><button type="button">Open full tool ↗</button><button type="button" aria-pressed={isAdded} className={isAdded ? "is-added" : ""} onClick={toggleWidget}>{isAdded ? "✓ Added to page" : "+ Add to page"}</button></div></footer>
    </div>
  </section>;
}

type LandingProps = {
  id: WidgetMockupId;
  number: string;
  title: string;
  eyebrow: string;
  headline: ReactNode;
  summary: string;
  initial: WidgetId;
  mode: string;
  accent: string;
  secondary: string;
  nav: readonly string[];
  note: string;
  meta: readonly [string, string][];
  inverse?: boolean;
};

function WidgetLanding({ id, number, title, eyebrow, headline, summary, initial, mode, accent, secondary, nav, note, meta, inverse = false }: LandingProps) {
  return <div className={`concept concept-${id} concept-widget concept-widget-${mode} ${inverse ? "is-inverse" : ""}`} style={{ "--widget-accent": accent, "--widget-secondary": secondary } as CSSProperties}>
    <header className="widget-site-nav"><WidgetMark inverse={inverse} /><nav aria-label="Primary navigation">{nav.map((item) => <a href={`#${id}-widgets`} key={item}>{item}</a>)}</nav><button type="button" className="widget-nav-action">Build a view</button></header>
    <main className="widget-landing" id={`${id}-widgets`}>
      <section className="widget-hero"><IllustrativeLabel /><span className="widget-hero-eyebrow">{number} / {eyebrow}</span><h1>{headline}</h1><p>{summary}</p><div className="widget-hero-actions"><button type="button">Explore APTO <span>↗</span></button><a href={`#${id}-widgets`}>Build your view ↓</a></div><dl>{meta.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl></section>
      <WidgetDeck initial={initial} mode={mode} />
    </main>
    <section className="widget-page-strip"><span>{title}</span><p>{note}</p><div>{widgetSpecs.slice(0, 4).map((widget) => <span key={widget.id}><i aria-hidden="true">{widget.icon}</i>{widget.short}</span>)}</div></section>
  </div>;
}

export function WidgetDock() {
  return <WidgetLanding id="widgetdock" number="41" title="WIDGET DOCK" eyebrow="A MODULAR TECHNOLOGY OBSERVATORY" headline={<>Build your own<br /><em>window into progress.</em></>} summary="APTO connects science, technology, and outcomes. Start with a live module, then dock the tools and evidence that matter to you." initial="science-map" mode="dock" accent="#6cffc6" secondary="#645cff" inverse nav={["Tools", "Results", "Open data", "Program"]} note="A dark, instrument-like landing page with a luminous widget dock always within reach." meta={[["10", "modular tools"], ["18", "partner universities · Feb 2026"], ["OPEN", "selected resources"]]} />;
}

export function WidgetCanvas() {
  return <WidgetLanding id="widgetcanvas" number="42" title="LIVING CANVAS" eyebrow="MAKE THE OBSERVATORY YOURS" headline={<>A homepage that<br /><em>changes with the question.</em></>} summary="Choose a module on the right. Map research, compare trajectories, inspect translation potential, or assemble a personal APTO canvas." initial="emerging" mode="canvas" accent="#ff563f" secondary="#ffd15c" nav={["Observe", "Forecast", "Translate", "About"]} note="Editorial type and a generous canvas make every selected widget feel like the lead story." meta={[["08", "frontier domains"], ["01", "shared evidence layer"], ["LIVE", "custom workspace"]]} />;
}

export function WidgetRail() {
  return <WidgetLanding id="widgetrail" number="43" title="SIGNAL RAIL" eyebrow="THE APTO SIGNAL NETWORK" headline={<>Follow the signals.<br /><em>Pin the useful ones.</em></>} summary="An immediate stream of APTO modules turns the program homepage into a personal monitoring station for technological change." initial="trajectories" mode="rail" accent="#ffb800" secondary="#0046ff" inverse nav={["Signals", "Dossiers", "Methods", "Teams"]} note="A high-tempo rail of icon tabs makes switching tools fast, legible, and memorable." meta={[["120K", "records mapped"], ["06", "trajectory families"], ["10", "widget types"]]} />;
}

export function WidgetOS() {
  return <WidgetLanding id="widgetos" number="44" title="APTO OS" eyebrow="AN OPERATING SYSTEM FOR TECHNOLOGY EVIDENCE" headline={<>One program.<br /><em>Many instruments.</em></>} summary="Open APTO as a toolkit: add modules to the homepage, carry them into technology dossiers, and keep the same evidence in view." initial="techbridge" mode="os" accent="#93ff53" secondary="#7b65ff" inverse nav={["Workspace", "Library", "Network", "APTO"]} note="A precise systems interface treats widgets as portable applications across the whole portal." meta={[["10", "installed modules"], ["04", "active workflows"], ["SYNC", "across pages"]]} />;
}

export function WidgetBrief() {
  return <WidgetLanding id="widgetbrief" number="45" title="THE APTO BRIEF" eyebrow="TODAY IN TECHNOLOGICAL CHANGE" headline={<>The signals worth<br /><em>seeing today.</em></>} summary="A calm daily briefing for policymakers, researchers, and the public—with any chart or tool available as a reusable widget." initial="funding" mode="brief" accent="#d92f24" secondary="#f1b949" nav={["Today", "Technologies", "Publications", "Program"]} note="A newsroom-inspired front page pairs concise program context with a selectable evidence brief." meta={[["JUL 16", "briefing date"], ["05", "signals updated"], ["03", "new resources"]]} />;
}

export function WidgetGlass() {
  return <WidgetLanding id="widgetglass" number="46" title="GLASS LAB" eyebrow="SEE THROUGH THE TECHNOLOGY SYSTEM" headline={<>Evidence, layered.<br /><em>Tools, within reach.</em></>} summary="Transparent modules float beside APTO's mission, letting visitors change views without losing the larger program story." initial="forecast" mode="glass" accent="#72f6ff" secondary="#b692ff" inverse nav={["Lens", "Forecasts", "Evidence", "People"]} note="Soft glass layers and restrained color turn complex analytical widgets into inviting objects." meta={[["03", "forecast models"], ["05–10Y", "horizons"], ["±", "uncertainty shown"]]} />;
}

export function WidgetNotebook() {
  return <WidgetLanding id="widgetnotebook" number="47" title="FIELD NOTEBOOK" eyebrow="A WORKING NOTEBOOK FOR TECHNOLOGY QUESTIONS" headline={<>Start with a question.<br /><em>Keep the evidence close.</em></>} summary="A research-minded homepage where APTO tools can be clipped into notes, methods pages, technology dossiers, and teaching materials." initial="open-data" mode="notebook" accent="#ea5f35" secondary="#3567b7" nav={["Notebook", "Data", "Methods", "Citations"]} note="A warm, scholarly direction makes widget composition feel like building a transparent research record." meta={[["42", "linked tables"], ["18", "method notebooks"], ["CITE", "every module"]]} />;
}

export function WidgetSpatial() {
  return <WidgetLanding id="widgetspatial" number="48" title="SPATIAL CABINET" eyebrow="AN EXHIBITION OF TECHNOLOGY EVIDENCE" headline={<>Open a drawer.<br /><em>Reveal a system.</em></>} summary="Each APTO widget behaves like an exhibit: select it from the spatial index, inspect it immediately, then carry it elsewhere." initial="capability" mode="spatial" accent="#ff6b9c" secondary="#62dfbf" inverse nav={["Cabinet", "Collections", "Comparisons", "About"]} note="A spatial, exhibition-like system makes analytical modules tactile without sacrificing semantic structure." meta={[["10", "evidence objects"], ["05", "dimensions compared"], ["01", "shared provenance"]]} />;
}

export function WidgetCivic() {
  return <WidgetLanding id="widgetcivic" number="49" title="CIVIC MODULES" eyebrow="PUBLIC TOOLS FOR UNDERSTANDING TECHNOLOGY" headline={<>A clearer view of<br /><em>what comes next.</em></>} summary="APTO brings methods, data, and forecasts into public view. Choose a module to explore the program without first learning its organization chart." initial="patents" mode="civic" accent="#1747cc" secondary="#f05b42" nav={["Explore", "Results", "Open resources", "Partners"]} note="A trustworthy civic palette and direct language make advanced tools useful beyond specialist audiences." meta={[["PUBLIC", "first design"], ["18", "partner universities · Feb 2026"], ["OPEN", "methods + data"]]} />;
}

export function WidgetHome() {
  return <WidgetLanding id="widgethome" number="50" title="APTO HOME" eyebrow="YOUR FRONT DOOR TO THE PROGRAM" headline={<>Understand technology.<br /><em>Choose how.</em></>} summary="A balanced flagship homepage: meet APTO on the left, explore a beautiful working widget on the right, and add it wherever you need it." initial="ventures" mode="home" accent="#ff4f35" secondary="#5254ce" nav={["Tools", "Technologies", "Findings", "About APTO"]} note="The most adaptable direction combines a welcoming institutional landing page with a polished widget marketplace." meta={[["10", "widgets available"], ["08", "technology areas"], ["01", "personal APTO view"]]} />;
}

export function WidgetMockup({ id }: { id: WidgetMockupId }) {
  switch (id) {
    case "widgetdock": return <WidgetDock />;
    case "widgetcanvas": return <WidgetCanvas />;
    case "widgetrail": return <WidgetRail />;
    case "widgetos": return <WidgetOS />;
    case "widgetbrief": return <WidgetBrief />;
    case "widgetglass": return <WidgetGlass />;
    case "widgetnotebook": return <WidgetNotebook />;
    case "widgetspatial": return <WidgetSpatial />;
    case "widgetcivic": return <WidgetCivic />;
    case "widgethome": return <WidgetHome />;
  }
}

export default WidgetMockup;
