"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  concepts,
  datasets,
  institutions,
  publications,
  seniorTeam,
  stats,
  technologies,
  thrusts,
  tools,
} from "./apto-data";
import {
  ConstellationBuilder,
  DataLoom,
  EvidenceXRay,
  ForecastWeather,
  FrontierTerrain,
  ResearchPassport,
  SignalLens,
  SignalSymphony,
  Timefold,
  WhatIfMachine,
} from "./interactive-mockups";

const KineticMockup = lazy(() => import("./kinetic-mockups").then((module) => ({ default: module.KineticMockup })));

const mapPoints = [
  [13, 31, "cyan"], [18, 54, "blue"], [24, 22, "gold"], [28, 67, "mint"],
  [34, 38, "coral"], [39, 74, "violet"], [43, 18, "cyan"], [48, 49, "gold"],
  [53, 31, "blue"], [57, 67, "coral"], [62, 42, "mint"], [67, 20, "violet"],
  [71, 57, "cyan"], [76, 35, "gold"], [81, 70, "blue"], [86, 45, "coral"],
] as const;

const networkLines = [
  [17, 34, 25, 40], [26, 25, 42, 28], [31, 62, 46, 50], [42, 34, 54, 43],
  [51, 29, 67, 23], [58, 62, 72, 56], [69, 29, 84, 44], [76, 61, 85, 48],
] as const;

function AptoMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`apto-mark ${inverse ? "is-inverse" : ""}`} aria-label="APTO">
      <span className="apto-mark-dot" />
      <strong>APTO</strong>
      <small>Assessing &amp; Predicting<br />Technology Outcomes</small>
    </div>
  );
}

function Arrow({ left = false }: { left?: boolean }) {
  return <span aria-hidden="true">{left ? "←" : "↗"}</span>;
}

function StatusPill({ children, tone = "open" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

function MockNotice({ dark = false }: { dark?: boolean }) {
  return <span className={`mock-notice ${dark ? "is-dark" : ""}`}>Design mockup · illustrative interface</span>;
}

function ToolGlyph({ index, tone }: { index: number; tone?: string }) {
  return (
    <span className={`tool-glyph glyph-${index % 6} tone-${tone || "blue"}`} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function NetworkArt({ labels = false, quiet = false }: { labels?: boolean; quiet?: boolean }) {
  return (
    <div className={`network-art ${quiet ? "is-quiet" : ""}`} aria-hidden="true">
      <div className="network-orbit orbit-a" />
      <div className="network-orbit orbit-b" />
      {networkLines.map(([x, y, width, rotate], index) => (
        <span
          className="network-line"
          key={`line-${index}`}
          style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, transform: `rotate(${rotate - 45}deg)` }}
        />
      ))}
      {mapPoints.map(([x, y, tone], index) => (
        <span
          className={`network-node node-${tone}`}
          key={`node-${index}`}
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${index * -0.32}s` }}
        >
          {labels && index % 5 === 0 ? <b>{["AI", "Quantum", "Materials", "Health"][index % 4]}</b> : null}
        </span>
      ))}
    </div>
  );
}

function MiniTrajectory({ pale = false }: { pale?: boolean }) {
  const values = [18, 26, 25, 39, 48, 53, 72, 68, 84, 92];
  return (
    <div className={`mini-trajectory ${pale ? "is-pale" : ""}`} aria-label="Illustrative rising technology capability trajectory">
      <div className="chart-grid" />
      {values.map((value, index) => (
        <span
          key={index}
          className="trajectory-bar"
          style={{ height: `${value}%`, left: `${index * 10 + 3}%`, animationDelay: `${index * 55}ms` }}
        />
      ))}
      <div className="uncertainty-band" />
      <small>Observed</small><small>Forecast horizon</small>
    </div>
  );
}

function ToolCard({ index, compact = false }: { index: number; compact?: boolean }) {
  const tool = tools[index % tools.length];
  return (
    <article className={`shared-tool-card ${compact ? "is-compact" : ""}`}>
      <div className="shared-tool-top">
        <ToolGlyph index={index} tone={tool.tone} />
        <StatusPill tone={index === 3 ? "open" : "prototype"}>{tool.status}</StatusPill>
      </div>
      <p className="micro-label">{tool.eyebrow}</p>
      <h3>{tool.name}</h3>
      {!compact && <p>{tool.description}</p>}
      <button className="text-link" type="button">Open preview <Arrow /></button>
    </article>
  );
}

function ConceptSwitcher({ current, onSelect }: { current: string; onSelect: (id: string) => void }) {
  const currentIndex = concepts.findIndex((concept) => concept.id === current);
  const previous = concepts[(currentIndex - 1 + concepts.length) % concepts.length];
  const next = concepts[(currentIndex + 1) % concepts.length];
  return (
    <div className="review-bar">
      <button className="review-title" type="button" onClick={() => onSelect("gallery")}>
        <span className="review-dot" />
        APTO website study
      </button>
      <div className="review-current">
        <span>{concepts[currentIndex]?.number}</span>
        <strong>{concepts[currentIndex]?.name}</strong>
        <em>{concepts[currentIndex]?.mood}</em>
      </div>
      <nav className="review-actions" aria-label="Mockup navigation">
        <button type="button" onClick={() => onSelect(previous.id)} aria-label={`Previous mockup: ${previous.name}`}><Arrow left /></button>
        <button type="button" onClick={() => onSelect("gallery")}>All 30</button>
        <button type="button" onClick={() => onSelect(next.id)} aria-label={`Next mockup: ${next.name}`}>Next <span aria-hidden="true">→</span></button>
      </nav>
    </div>
  );
}

function ConceptMiniature({ id }: { id: string }) {
  return (
    <div className={`concept-mini mini-${id}`} aria-hidden="true">
      <div className="mini-nav"><i /><i /><i /></div>
      <div className="mini-type"><b /><b /><span /></div>
      <div className="mini-visual"><i /><i /><i /><i /><i /></div>
      <div className="mini-cards"><span /><span /><span /></div>
    </div>
  );
}

function Gallery({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="gallery-page">
      <header className="gallery-header">
        <div className="gallery-kicker"><span>APTO</span> Website direction study · July 2026</div>
        <h1>Thirty possible<br />front doors to <em>APTO.</em></h1>
        <div className="gallery-intro">
          <p>Each direction puts working tools, open data, major results, publications, teams, and participating institutions at the center of the program—not behind a generic project homepage.</p>
          <div className="gallery-summary">
            <span>30</span><small>distinct<br />directions</small>
            <span>01</span><small>shared content<br />architecture</small>
          </div>
        </div>
      </header>

      <section className="gallery-recommendation">
        <div>
          <span className="gallery-rec-number">Recommendation · 01</span>
          <h2>Civic Observatory</h2>
          <p>The most balanced flagship: useful on arrival, memorable without being theatrical, credible for NSF and researchers, and approachable for the public.</p>
        </div>
        <button type="button" onClick={() => onSelect("civic")}>View recommended direction <Arrow /></button>
      </section>

      <div className="gallery-group-heading"><span>01—10</span><div><h2>Foundational directions</h2><p>Ten complete visual systems for a credible, useful APTO program portal.</p></div></div>
      <section className="concept-grid" aria-label="First ten APTO website mockups">
        {concepts.slice(0, 10).map((concept) => (
          <button className={`concept-card card-${concept.id}`} type="button" key={concept.id} onClick={() => onSelect(concept.id)}>
            <ConceptMiniature id={concept.id} />
            <div className="concept-card-meta">
              <span>{concept.number}</span>
              <div><strong>{concept.name}</strong><small>{concept.mood}</small></div>
              <i style={{ background: concept.color }} />
            </div>
          </button>
        ))}
      </section>

      <div className="gallery-group-heading is-experimental"><span>11—20</span><div><h2>Interactive experiments</h2><p>Ten memorable interaction models: scrub, reveal, build, simulate, listen, collect, and weave.</p></div><i>NEW</i></div>
      <section className="concept-grid" aria-label="Ten interactive APTO website mockups">
        {concepts.slice(10, 20).map((concept) => (
          <button className={`concept-card card-${concept.id}`} type="button" key={concept.id} onClick={() => onSelect(concept.id)}>
            <ConceptMiniature id={concept.id} />
            <div className="concept-card-meta">
              <span>{concept.number}</span>
              <div><strong>{concept.name}</strong><small>{concept.mood}</small></div>
              <i style={{ background: concept.color }} />
            </div>
          </button>
        ))}
      </section>

      <div className="gallery-group-heading is-kinetic"><span>21—30</span><div><h2>Motion and spatial worlds</h2><p>Ten reactive design systems: scroll through depth, bend fields, refract light, orbit content, and steer live GPU scenes.</p></div><i>LIVE</i></div>
      <section className="concept-grid" aria-label="Ten motion-first APTO website mockups">
        {concepts.slice(20, 30).map((concept) => (
          <button className={`concept-card card-${concept.id}`} type="button" key={concept.id} onClick={() => onSelect(concept.id)}>
            <ConceptMiniature id={concept.id} />
            <div className="concept-card-meta">
              <span>{concept.number}</span>
              <div><strong>{concept.name}</strong><small>{concept.mood}</small></div>
              <i style={{ background: concept.color }} />
            </div>
          </button>
        ))}
      </section>

      <footer className="gallery-footer">
        <p>Built from APTO’s 2026 program materials and recent award-winning science, data, and institutional website patterns.</p>
        <span>Current detailed content comes from the Northwestern-led award; the cohort-wide roster and tool catalog still need partner confirmation.</span>
      </footer>
    </div>
  );
}

function CivicObservatory() {
  return (
    <div className="concept concept-civic">
      <header className="civic-nav">
        <AptoMark />
        <nav aria-label="Primary navigation"><a href="#civic-tools">Explore</a><a href="#civic-results">Results</a><a href="#civic-data">Open data</a><a href="#civic-people">People &amp; partners</a><a href="#civic-about">About</a></nav>
        <button className="civic-search" type="button" aria-label="Search APTO">Search <span>⌕</span></button>
      </header>

      <section className="civic-hero">
        <div className="civic-hero-copy">
          <MockNotice />
          <p className="section-kicker">A national technology observatory</p>
          <h1>See where technology is going—and what could move it <em>faster.</em></h1>
          <p className="hero-deck">APTO connects research investment to technology capability, production, and use—then builds models and open tools to explore what comes next.</p>
          <div className="hero-actions"><button className="button-primary" type="button">Explore APTO tools <Arrow /></button><button className="button-quiet" type="button">How the program works</button></div>
          <form className="civic-query" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="civic-search-input">Search technologies, datasets, people, or publications</label>
            <div><span>⌕</span><input id="civic-search-input" placeholder="Try “superconducting qubits”" /><button type="submit">Search</button></div>
          </form>
        </div>
        <div className="civic-map-card">
          <div className="map-card-head"><span>Map of Science · preview</span><StatusPill>Open data view</StatusPill></div>
          <img src="/apto/science-map.png" alt="APTO map of scientific fields including engineering, computer science, materials science, biology, and health" />
          <div className="map-float-card"><small>Research cluster</small><strong>Perovskite photovoltaics</strong><span><i /> Emerging signal · 94th percentile</span></div>
          <div className="map-card-foot"><button type="button">Fields</button><button type="button">Institutions</button><button type="button">Emerging topics</button><span>Drag to explore</span></div>
        </div>
      </section>

      <section className="civic-tool-section" id="civic-tools">
        <div className="section-heading"><div><p className="section-kicker">Start with a question</p><h2>Tools that make the program usable.</h2></div><p>Guided entry points for decision-makers, researchers, technology-transfer teams, and the public.</p></div>
        <div className="civic-tools-grid">{tools.slice(0, 3).map((_, index) => <ToolCard key={index} index={index} />)}</div>
      </section>

      <section className="civic-results" id="civic-results">
        <div className="civic-result-copy"><p className="section-kicker">A main result</p><h2>Technology transitions are learnable. Their context matters.</h2><p>Within an institution, early models predict licensing and startup outcomes. Across held-out institutions, performance drops sharply—evidence that translation is shaped by local systems, not just the underlying idea.</p><button className="text-link" type="button">Read the evidence brief <Arrow /></button></div>
        <div className="civic-result-figure">
          <div className="result-metric"><span>~0.75–0.80</span><small>within-institution AUROC</small></div>
          <div className="result-gap"><i /><b>generalization gap</b><i /></div>
          <div className="result-metric is-muted"><span>~0.55</span><small>cross-institution AUROC</small></div>
          <p>Early APTO result · illustrative summary</p>
        </div>
      </section>

      <section className="civic-stats" id="civic-data">{stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span><small>{stat.note}</small></div>)}</section>

      <section className="civic-partners" id="civic-people">
        <p>Built across a national research network</p>
        <div>{institutions.slice(0, 6).map((institution) => <span key={institution}>{institution.replace(" University", "")}</span>)}</div>
        <button type="button">Meet the network <Arrow /></button>
      </section>
      <footer className="civic-footer" id="civic-about"><AptoMark inverse /><p>Measuring, understanding, predicting, and accelerating technology outcomes.</p><span>Tools · Open data · Publications · Program · Contact</span></footer>
    </div>
  );
}

function MissionControl() {
  return (
    <div className="concept concept-mission">
      <header className="mission-nav"><AptoMark inverse /><div className="mission-status"><i /> Observatory online <span>Updated 10 Jul 2026</span></div><nav><a href="#mission-tools">Tools</a><a href="#mission-signals">Signals</a><a href="#mission-network">Network</a><button type="button">Command menu · ⌘K</button></nav></header>
      <section className="mission-hero">
        <div className="mission-copy"><MockNotice dark /><p className="mission-index">APTO / NATIONAL OBSERVATORY / 001</p><h1>Measure the frontier.<br /><em>Model what’s next.</em></h1><p>One operating surface for science maps, technology trajectories, open datasets, and decision models.</p><div className="mission-actions"><button type="button">Enter observatory <Arrow /></button><span><i /> 6 systems available</span></div></div>
        <div className="mission-console">
          <div className="console-header"><span>APTO · TECHNOLOGY SIGNALS</span><div><i /><i /><i /></div></div>
          <div className="console-grid">
            <div className="console-map"><NetworkArt labels /><span className="console-coord">41.8781° N / 87.6298° W</span></div>
            <div className="console-side">
              <div><small>Active domains</small><strong>10</strong><span>+3 this year</span></div>
              <div><small>Signals tracked</small><strong>2.4K</strong><span>open sources</span></div>
              <div className="console-pulse"><small>Frontier pulse</small>{[72, 48, 83, 60, 92, 69].map((v, i) => <i key={i} style={{ height: `${v}%` }} />)}</div>
            </div>
          </div>
          <div className="console-ticker"><span>PSC efficiency ↗</span><span>Qubit coherence ↗</span><span>GPU capability ↗</span><span>Research-to-market signals ●</span></div>
        </div>
      </section>
      <section className="mission-tools" id="mission-tools">
        <div className="mission-section-head"><span>02 / TOOL SYSTEMS</span><h2>Choose an instrument.</h2><p>Expert interfaces with guided starting states.</p></div>
        <div className="mission-tool-grid">{tools.map((tool, index) => <article key={tool.name}><div className="mission-tool-id">{String(index + 1).padStart(2, "0")}<ToolGlyph index={index} tone={tool.tone} /></div><h3>{tool.name}</h3><p>{tool.description}</p><div><StatusPill tone={index === 3 ? "open" : "prototype"}>{index === 3 ? "OPEN" : "PREVIEW"}</StatusPill><button type="button">LAUNCH <Arrow /></button></div></article>)}</div>
      </section>
      <section className="mission-signals" id="mission-signals"><div><span>03 / MAIN SIGNAL</span><h2>More institutions.<br />Stronger models.</h2><p>Prediction quality rises as the training network captures more institutional and technological variation.</p></div><div className="mission-chart"><img src="/apto/model-scale.png" alt="Early APTO model performance rising as additional universities are included" /><span>Early result · AUROC by number of universities</span></div></section>
      <section className="mission-network" id="mission-network"><span>CONNECTED RESEARCH NETWORK</span>{institutions.map((name, i) => <div key={name}><b>{String(i + 1).padStart(2, "0")}</b>{name}<i /></div>)}</section>
      <footer className="mission-footer"><span>APTO / SYSTEM READY</span><p>Open resources only in public explorers. Partner data remains governed and protected.</p><button type="button">About APTO <Arrow /></button></footer>
    </div>
  );
}

function LivingScienceMap() {
  return (
    <div className="concept concept-map">
      <div className="map-shell">
        <img className="map-background" src="/apto/science-map.png" alt="A colorful map of scientific fields" />
        <div className="map-vignette" />
        <header className="map-nav"><AptoMark inverse /><nav><button type="button" className="is-active">Map</button><button type="button">List</button><button type="button">Stories</button></nav><div><button type="button">Methodology</button><button type="button" className="map-search">⌕ Search the map</button></div></header>
        <aside className="map-filter-panel">
          <MockNotice dark />
          <p className="map-panel-kicker">Living Science Map</p><h1>Find the signals before they become obvious.</h1>
          <label>Technology domain<select defaultValue="all"><option value="all">All technologies</option><option>Quantum computing</option><option>Advanced materials</option><option>Artificial intelligence</option></select></label>
          <label>Lens<select defaultValue="growth"><option value="growth">Emerging growth</option><option>Institutions</option><option>Funding</option><option>Translation</option></select></label>
          <div className="map-toggles"><button type="button" className="is-active">Research</button><button type="button">Patents</button><button type="button">Use</button></div>
          <button className="map-apply" type="button">Apply filters <span>12,480 clusters</span></button>
          <button className="map-reset" type="button">Reset view</button>
        </aside>
        <aside className="map-detail-panel">
          <div className="detail-close">Selected cluster <button type="button" aria-label="Close cluster detail">×</button></div>
          <span className="cluster-id">CLUSTER 04782 · MATERIALS SCIENCE</span>
          <h2>Perovskite tandem architectures</h2><p>Research on multi-junction solar cells combining perovskite absorbers with silicon or related materials.</p>
          <div className="cluster-metrics"><div><strong>94</strong><small>growth percentile</small></div><div><strong>78</strong><small>citation percentile</small></div><div><strong>6.2</strong><small>mean paper age</small></div><div><strong>18%</strong><small>industry affiliated</small></div></div>
          <h3>Related APTO resources</h3><button type="button">Trajectory Lab <Arrow /></button><button type="button">Open solar-cell data <Arrow /></button>
        </aside>
        <div className="map-floating-node"><i />Perovskite tandems<strong>94</strong></div>
        <div className="map-legend"><span><i className="legend-hot" />Emerging</span><span><i className="legend-steady" />Steady</span><span><i className="legend-mature" />Mature</span><button type="button">How to read this map</button></div>
      </div>
      <section className="map-mobile-fallback"><h2>Explore as a list</h2><p>The map becomes a ranked, filterable list on smaller screens so every cluster stays accessible.</p>{technologies.slice(0, 5).map((tech, i) => <button type="button" key={tech}><span>{String(i + 1).padStart(2, "0")}</span>{tech}<b>{95 - i * 4}</b></button>)}</section>
    </div>
  );
}

function BlueAtlas() {
  return (
    <div className="concept concept-atlas">
      <section className="atlas-hero">
        <img src="/apto/science-map.png" alt="APTO science map shown as a deep-blue technology atlas" />
        <div className="atlas-overlay" />
        <header><AptoMark inverse /><nav><a href="#atlas-journey">The atlas</a><a href="#atlas-tools">Explore tools</a><a href="#atlas-stories">Field notes</a><a href="#atlas-program">Program</a></nav><button type="button">Open atlas <Arrow /></button></header>
        <div className="atlas-hero-copy"><MockNotice dark /><span className="atlas-edition">APTO ATLAS · FIELD EDITION 01</span><h1>Map the distance between <em>research</em> and <em>impact.</em></h1><p>A living atlas of technology trajectories, institutions, ideas, and the investments that connect them.</p></div>
        <div className="atlas-coordinate"><span>VIEW 01</span><b>All of science</b><i />Scroll to travel</div>
        <div className="atlas-depth"><span>Science</span><i /><span>Capability</span><i /><span>Use</span></div>
      </section>
      <section className="atlas-journey" id="atlas-journey">
        <div className="atlas-statement"><span>01 / THE TERRAIN</span><h2>Progress is not one curve.<br />It is a landscape of paths.</h2><p>Aggregate frontiers can conceal distinct compositions, architectures, teams, and design choices. APTO makes those subtrajectories visible.</p></div>
        <div className="atlas-contours" aria-hidden="true">{[0,1,2,3,4,5].map(i => <i key={i} style={{ inset: `${i * 7 + 8}%`, borderRadius: `${38 + i * 4}% ${58 - i * 3}% ${46 + i * 2}% ${64 - i * 2}%` }} />)}<span>Design space</span><b>47 pathways</b></div>
      </section>
      <section className="atlas-tools" id="atlas-tools"><div className="atlas-section-head"><span>02 / NAVIGATION TOOLS</span><h2>Choose a way through.</h2></div><div>{tools.slice(0,4).map((tool, i) => <article key={tool.name}><span>0{i+1}</span><ToolGlyph index={i} tone={tool.tone} /><h3>{tool.name}</h3><p>{tool.description}</p><button type="button">Explore <Arrow /></button></article>)}</div></section>
      <section className="atlas-story" id="atlas-stories"><div><span>FIELD NOTE · SOLAR ENERGY</span><h2>A convincing S-curve—or a misleading one?</h2><p>Decomposing the aggregate perovskite frontier reveals a much richer story of competing technical architectures.</p><button type="button">Read the field note <Arrow /></button></div><img src="/apto/pce-prediction.png" alt="Illustrative perovskite efficiency prediction compared with real measurements" /></section>
      <footer className="atlas-footer" id="atlas-program"><AptoMark inverse /><p>One national observatory.<br />Many routes through innovation.</p><span>Supported by the National Science Foundation</span></footer>
    </div>
  );
}

function SpectralForecast() {
  const [horizon, setHorizon] = useState(10);
  const projected = (26.1 + horizon * 0.42).toFixed(1);
  return (
    <div className="concept concept-forecast">
      <header className="forecast-nav"><AptoMark inverse /><nav><a href="#forecast-workbench">Workbench</a><a href="#forecast-models">Models</a><a href="#forecast-evidence">Evidence</a><a href="#forecast-program">Program</a></nav><button type="button">Open forecast lab <Arrow /></button></header>
      <section className="forecast-hero">
        <div><MockNotice dark /><span className="forecast-kicker">PREDICTION AS A PUBLIC INSTRUMENT</span><h1>What could this technology do <em>next?</em></h1><p>Explore scenario-based forecasts with visible assumptions, uncertainty, and evidence.</p></div>
        <div className="forecast-orb" aria-hidden="true"><i /><i /><i /><span>{horizon}<small>YEAR<br />HORIZON</small></span></div>
      </section>
      <section className="forecast-workbench" id="forecast-workbench">
        <div className="workbench-controls"><div className="workbench-title"><span>FORECAST LAB / MOCK MODEL</span><h2>Perovskite solar cells</h2><StatusPill tone="prototype">Illustrative forecast</StatusPill></div><label>Technology<select defaultValue="psc"><option value="psc">Perovskite solar cells</option><option>Superconducting qubits</option><option>Graphics processors</option></select></label><label>Model family<select defaultValue="integrated"><option value="integrated">Integrated ensemble</option><option>Mechanistic</option><option>Transformer-based</option></select></label><label className="horizon-control"><span>Forecast horizon <b>{horizon} years</b></span><div className="horizon-input-row"><button type="button" aria-label="Decrease forecast horizon" onClick={() => setHorizon((value) => Math.max(3, value - 1))}>−</button><input type="range" min="3" max="20" value={horizon} onChange={(event) => setHorizon(Number(event.target.value))} /><button type="button" aria-label="Increase forecast horizon" onClick={() => setHorizon((value) => Math.min(20, value + 1))}>+</button></div></label><div className="assumption-box"><span>Assumptions</span><p>Research activity remains near its recent range. No major manufacturing shock is modeled.</p><button type="button">Edit assumptions</button></div></div>
        <div className="workbench-chart"><div className="forecast-chart-head"><span>POWER CONVERSION EFFICIENCY</span><div><i />Observed <i />Median forecast <i />80% interval</div></div><MiniTrajectory pale /><div className="forecast-callout"><small>Median capability in {2026 + horizon}</small><strong>{projected}%</strong><span>Illustrative model output</span></div><div className="forecast-years"><span>2010</span><span>2020</span><span>Today</span><span>{2026 + horizon}</span></div></div>
      </section>
      <section className="forecast-models" id="forecast-models"><div className="forecast-section-copy"><span>THREE COMPLEMENTARY LENSES</span><h2>Every forecast should show its reasoning.</h2></div><div>{["Mechanistic", "Transformer-based", "Transition & licensing"].map((name, i) => <article key={name}><span>0{i+1}</span><h3>{name}</h3><p>{["Theory-driven models with interpretable bounds and policy levers.", "Models that learn from the text and structure of papers and patents.", "Market-impact measures propagated upstream to ideas and investments."][i]}</p><button type="button">View model card <Arrow /></button></article>)}</div></section>
      <section className="forecast-evidence" id="forecast-evidence"><img src="/apto/model-scale.png" alt="Model performance across growing numbers of universities" /><div><span>EVIDENCE / WHY SCALE MATTERS</span><h2>Forecasts improve when the observatory sees more contexts.</h2><p>Institutional diversity adds technologies, translation pathways, and environments that a single-site model cannot learn.</p><button type="button">Read the validation note <Arrow /></button></div></section>
      <footer className="forecast-footer" id="forecast-program"><p>Forecasts are tools for reasoning—not promises. Every public model includes assumptions, caveats, provenance, and uncertainty.</p><button type="button">APTO methodology <Arrow /></button></footer>
    </div>
  );
}

function LivingArchive() {
  const [query, setQuery] = useState("");
  const archiveItems = useMemo(() => [
    ...tools.slice(0, 4).map((item, i) => ({ title: item.name, type: "Tool", detail: item.description, image: i === 0 ? "/apto/science-map.png" : "" })),
    ...datasets.slice(0, 3).map((item) => ({ title: item.name, type: "Open dataset", detail: `${item.metric} · ${item.coverage}`, image: "" })),
    ...publications.slice(0, 2).map((item) => ({ title: item.title, type: "Publication", detail: item.detail, image: "" })),
    { title: "National partner network", type: "Institutions", detail: "A multi-institution observatory linking research and technology outcomes.", image: "/apto/team.png" },
  ], []);
  const filtered = archiveItems.filter((item) => `${item.title} ${item.type} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="concept concept-archive">
      <header className="archive-nav"><AptoMark /><nav><a href="#archive-index">Index</a><a href="#archive-results">Results</a><a href="#archive-collections">Collections</a><a href="#archive-about">About</a></nav><button type="button">Saved items <span>0</span></button></header>
      <section className="archive-hero"><MockNotice /><span className="archive-kicker">THE CONNECTED APTO ARCHIVE</span><h1>Search the people, data, tools, and ideas moving technology forward.</h1><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search “quantum,” “forecast,” or an institution…" /><kbd>⌘ K</kbd></label><div className="archive-suggestions"><span>Start with</span>{["Emerging technologies", "Open datasets", "Major results", "Partner institutions"].map(text => <button type="button" key={text} onClick={() => setQuery(text.split(" ")[0])}>{text}</button>)}</div></section>
      <section className="archive-index" id="archive-index"><aside><span>FILTER THE ARCHIVE</span>{["All objects", "Tools", "Open data", "Publications", "People", "Institutions"].map((label, i) => <button type="button" className={i === 0 ? "is-active" : ""} key={label}>{label}<b>{[68,6,14,22,58,20][i]}</b></button>)}<div className="archive-color-key"><span>Relationships</span><i />Measures<i />Predicts<i />Uses<i />Produced by</div></aside><div className="archive-results"><div className="archive-results-head"><p><strong>{filtered.length || 0}</strong> objects shown</p><select aria-label="Sort archive"><option>Featured first</option><option>Newest first</option><option>A–Z</option></select></div><div className="archive-grid">{filtered.map((item, index) => <article key={`${item.type}-${item.title}`} className={item.image ? "has-image" : ""}>{item.image && <img src={item.image} alt="" />}<div><span>{item.type} · {String(index + 1).padStart(3, "0")}</span><h2>{item.title}</h2><p>{item.detail}</p><div className="archive-links"><small><i /> related to {index + 4} objects</small><button type="button"><Arrow /></button></div></div></article>)}</div>{filtered.length === 0 && <div className="archive-empty">No matching mock objects. Try a broader term.</div>}</div></section>
      <section className="archive-collections" id="archive-collections"><span>CURATED PATHWAYS</span><h2>Not sure where to begin?</h2><div>{["How does a grant become impact?", "What makes a frontier move?", "Where are emerging signals forming?"].map((title, i) => <button type="button" key={title}><span>0{i+1}</span>{title}<Arrow /></button>)}</div></section>
      <footer className="archive-footer" id="archive-about"><AptoMark /><p>A connected index for the Assessing and Predicting Technology Outcomes program.</p><span>Public objects only · Clear provenance · Accessible exports</span></footer>
    </div>
  );
}

function BeautifulTechnology() {
  const [active, setActive] = useState(0);
  const featureNames = ["Perovskite solar cells", "Superconducting qubits", "Artificial intelligence", "Structural biology"];
  return (
    <div className="concept concept-beautiful">
      <section className="beautiful-hero">
        <img src="/apto/science-map.png" alt="Vivid landscape of scientific fields" />
        <div className="beautiful-scrim" />
        <header><AptoMark inverse /><nav><a href="#beautiful-explore">Explore</a><a href="#beautiful-findings">Discoveries</a><a href="#beautiful-data">Open data</a><a href="#beautiful-team">The program</a></nav><button type="button">Menu <span>↗</span></button></header>
        <div className="beautiful-copy"><MockNotice dark /><p>APTO PRESENTS</p><h1>See technology <em>move.</em></h1><span>From millions of scientific signals to the pathways that become real-world capability.</span><div><button type="button">Scroll &amp; explore ↓</button><button type="button" onClick={() => setActive((active + 1) % featureNames.length)}>Surprise me ✦</button></div></div>
        <aside><span>NOW EXPLORING</span><strong>{featureNames[active]}</strong><small>{active + 1} / {featureNames.length}</small></aside>
      </section>
      <section className="beautiful-intro" id="beautiful-explore"><p className="beautiful-dropcap">Technological progress looks smooth from far away. Up close, it is a world of bursts, stalls, forks, and breakthroughs.</p><div><span>THE QUESTION</span><h2>Can we map those paths—and predict where they lead?</h2><p>APTO brings together new data, models, and tools to understand capability, production, and use across many technology areas.</p></div></section>
      <section className="beautiful-chapters">{featureNames.map((name, i) => <button type="button" key={name} className={active === i ? "is-active" : ""} onClick={() => setActive(i)}><div className={`chapter-art chapter-${i}`}><i /><i /><i /></div><span>CHAPTER 0{i+1}</span><strong>{name}</strong><small>{["Efficiency · 110K records", "Coherence · 57K records", "385 benchmark tasks", "143K structures"][i]}</small></button>)}</section>
      <section className="beautiful-finding" id="beautiful-findings"><div className="beautiful-finding-art"><NetworkArt quiet /><span>BURST</span><span>STASIS</span><span>BREAKTHROUGH</span></div><div><span>ONE UNIVERSAL PATTERN</span><h2>Different technologies share a surprising rhythm.</h2><p>Across nine domains, capability frontiers show bursty advances, long periods of stasis, and temporal correlations that amplify long-run uncertainty.</p><button type="button">Experience the finding <Arrow /></button></div></section>
      <section className="beautiful-data" id="beautiful-data"><div><span>OPEN APTO</span><h2>Wonder is better when the evidence is open.</h2></div><div>{tools.slice(0,4).map((tool, i) => <article key={tool.name}><ToolGlyph index={i} tone={tool.tone} /><span>{tool.eyebrow}</span><h3>{tool.name}</h3><button type="button">Explore <Arrow /></button></article>)}</div></section>
      <section className="beautiful-team" id="beautiful-team"><img src="/apto/team.png" alt="APTO senior personnel, researchers, and staff" /><div><span>A PROGRAM BUILT BY PEOPLE</span><h2>Many disciplines.<br />One shared question.</h2><p>Science of science, economics, engineering, AI, technology transfer, policy, and design come together across a national network.</p><button type="button">Meet the APTO community <Arrow /></button></div></section>
      <footer className="beautiful-footer"><AptoMark inverse /><span>Measuring · Understanding · Predicting · Accelerating</span><button type="button">Return to the map ↑</button></footer>
    </div>
  );
}

function EditorialLab() {
  return (
    <div className="concept concept-editorial">
      <header className="editorial-top"><span>Vol. 03 · July 2026</span><p>Research, evidence, and tools for technology futures</p><button type="button">Search the journal ⌕</button></header>
      <div className="editorial-masthead"><AptoMark /><h1>The Technology<br /><em>Outcomes Review</em></h1><span>Published by the APTO Program</span></div>
      <nav className="editorial-nav"><a href="#editorial-lead">Latest findings</a><a href="#editorial-publications">Publications</a><a href="#editorial-tools">Tools &amp; data</a><a href="#editorial-program">The program</a><a href="#editorial-people">People</a></nav>
      <main className="editorial-main" id="editorial-lead">
        <MockNotice />
        <article className="editorial-lead"><span className="editorial-category">COVER STORY / TECHNOLOGY DYNAMICS</span><h2>The hidden structure inside a smooth-looking frontier</h2><p className="editorial-deck">Why aggregate S-curves can conceal competing trajectories—and what that means for forecasting technological development.</p><div className="editorial-byline"><span>APTO Research Team</span><i />12 min read</div><img src="/apto/science-map.png" alt="Science map spanning multiple research fields" /><p className="editorial-caption">A map of science based on titles and abstracts. Color indicates broad fields; proximity represents related knowledge.</p></article>
        <aside className="editorial-side"><div className="editorial-toolbox"><span>APTO TOOLBOX</span><h3>Don’t just read the result. Explore it.</h3>{tools.slice(0,3).map((tool, i) => <button type="button" key={tool.name}><ToolGlyph index={i} tone={tool.tone} /><span>{tool.eyebrow}</span><strong>{tool.name}</strong><Arrow /></button>)}</div><div className="editorial-number"><span>THE NUMBER</span><strong>20</strong><p>partner universities make it possible to test which signals transfer across contexts.</p></div></aside>
      </main>
      <section className="editorial-briefs" id="editorial-publications"><div className="editorial-section-title"><span>THE RESEARCH BRIEF</span><h2>What APTO is learning now</h2></div>{publications.map((pub, i) => <article key={pub.title}><span>0{i+1}</span><div><small>{pub.type} · {pub.year}</small><h3>{pub.title}</h3><p>{pub.detail}</p></div><button type="button"><Arrow /></button></article>)}</section>
      <section className="editorial-figure" id="editorial-tools"><div><span>FIGURE OF THE MONTH</span><h2>Prediction improves as the institutional network grows.</h2><p>Adding universities introduces meaningful variation in domains, pathways, and organizational practice.</p><button type="button">Download figure data <Arrow /></button></div><img src="/apto/model-scale.png" alt="Chart of prediction quality improving with additional institutions" /></section>
      <section className="editorial-program" id="editorial-program"><span>THE FIVE-THRUST PROGRAM</span><div>{thrusts.map(([number,title,detail]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{detail}</p></article>)}</div></section>
      <footer className="editorial-footer" id="editorial-people"><h2>APTO</h2><p>A five-year research program to measure, understand, predict, and accelerate technology outcomes.</p><span>Publications · Data · Methods · Community · Contact</span></footer>
    </div>
  );
}

function OpenScienceCommons() {
  return (
    <div className="concept concept-commons">
      <header className="commons-nav"><AptoMark /><nav><a href="#commons-gateways">Resources</a><a href="#commons-network">Network</a><a href="#commons-team">Teams</a><a href="#commons-program">Program</a></nav><div><button type="button">Sign up for updates</button><button type="button" className="commons-launch">Launch a tool <Arrow /></button></div></header>
      <section className="commons-hero"><div><MockNotice /><span className="commons-kicker">AN OPEN INFRASTRUCTURE FOR TECHNOLOGY FUTURES</span><h1>A shared place to <em>measure, model,</em> and <em>learn.</em></h1><p>APTO brings institutions, disciplines, and public resources together to understand how research becomes technology—and where intervention could matter.</p><div><button type="button" className="commons-primary">Explore the commons <Arrow /></button><button type="button">About APTO</button></div></div><div className="commons-network-art"><NetworkArt labels /><span>20<small>partner<br />universities</small></span><span>10+<small>technology<br />domains</small></span><span>6<small>featured<br />tools</small></span></div></section>
      <section className="commons-gateways" id="commons-gateways"><div className="commons-heading"><span>THREE WAYS IN</span><h2>Use the program. Understand the evidence. Join the network.</h2></div><div className="gateway-grid"><article className="gateway-tools"><span>01 / TOOLS &amp; DATA</span><h3>Explore technology</h3><p>Start with the public-facing tools and verified open datasets.</p><div>{tools.slice(0,3).map((tool,i)=><button type="button" key={tool.name}><ToolGlyph index={i} tone={tool.tone} />{tool.name}<Arrow /></button>)}</div></article><article className="gateway-results"><span>02 / EVIDENCE</span><h3>Read the results</h3><MiniTrajectory pale /><p>Plain-language briefs connect every finding to its method, data, and publication.</p><button type="button">Browse evidence <Arrow /></button></article><article className="gateway-community"><span>03 / COMMUNITY</span><h3>Find people &amp; partners</h3><div className="avatar-stack">{seniorTeam.slice(0,7).map((name,i)=><i key={name} style={{ zIndex: 8-i }}>{name.split(" ").map(p=>p[0]).join("")}</i>)}</div><p>Research teams across economics, engineering, AI, policy, and technology transfer.</p><button type="button">Meet the community <Arrow /></button></article></div></section>
      <section className="commons-network" id="commons-network"><div><span>THE NATIONAL NETWORK</span><h2>Scale is not decoration.<br />It is part of the method.</h2><p>Technology outcomes are rare, heterogeneous, and slow. A multi-institution network creates the comparisons required to separate universal signals from local context.</p></div><div className="commons-institutions">{institutions.map((name,i)=><button type="button" key={name}><span>{String(i+1).padStart(2,"0")}</span>{name}<i /></button>)}</div></section>
      <section className="commons-team" id="commons-team"><div className="commons-team-image"><img src="/apto/team.png" alt="APTO team members" /><span>Senior personnel · Researchers · Staff</span></div><div><span>THE PEOPLE BEHIND THE INFRASTRUCTURE</span><h2>Built across disciplines, not silos.</h2><p>The APTO program connects science-of-science researchers with domain experts, economists, engineers, data scientists, and institutional partners.</p><button type="button">Browse teams &amp; expertise <Arrow /></button></div></section>
      <section className="commons-program" id="commons-program"><span>HOW APTO WORKS</span>{thrusts.map(([number,title,detail])=><article key={number}><b>{number}</b><h3>{title}</h3><p>{detail}</p></article>)}</section>
      <footer className="commons-footer"><AptoMark /><p>Public explorers use verified open resources. Confidential partner records remain governed, protected, and shown only in aggregate where appropriate.</p><button type="button">Data governance <Arrow /></button></footer>
    </div>
  );
}

function SignalStory() {
  const [stage, setStage] = useState(0);
  const stages = ["Research investment", "Scientific ideas", "Technology transition", "Capability & use", "Societal impact"];
  return (
    <div className="concept concept-story">
      <header className="story-nav"><AptoMark /><nav><a href="#story-path">The journey</a><a href="#story-tools">Play with the data</a><a href="#story-results">What we found</a><a href="#story-community">Who we are</a></nav><button type="button">Start exploring <span>→</span></button></header>
      <section className="story-hero"><div className="story-copy"><MockNotice /><span className="story-kicker">A FRIENDLIER WAY INTO TECHNOLOGY DATA</span><h1>Every breakthrough leaves a trail.</h1><p>APTO follows the trail from research investment to real-world technology—then turns what we learn into open maps, models, and stories.</p><div><button type="button" className="story-primary">Follow one idea <span>↓</span></button><button type="button">Explore all tools <Arrow /></button></div></div><div className="story-illustration" aria-hidden="true"><div className="story-sun"><i /><i /><i /></div><div className="story-path-line" /><span className="story-bubble bubble-one">grant</span><span className="story-bubble bubble-two">paper</span><span className="story-bubble bubble-three">prototype</span><span className="story-bubble bubble-four">use</span><div className="story-star star-one">✦</div><div className="story-star star-two">✦</div><div className="story-star star-three">✦</div></div></section>
      <section className="story-path" id="story-path"><div className="story-section-head"><span>THE RESEARCH-TO-IMPACT JOURNEY</span><h2>Pick up the trail anywhere.</h2><p>Choose a step to see what APTO measures, what data can be public, and which tools help.</p></div><div className="story-stage-tabs">{stages.map((name,i)=><button type="button" key={name} onClick={()=>setStage(i)} className={stage===i?"is-active":""}><span>0{i+1}</span>{name}</button>)}</div><div className="story-stage-panel"><div><span>STEP 0{stage+1}</span><h3>{stages[stage]}</h3><p>{[
        "Who funds which questions—and what kinds of knowledge follow?",
        "How do ideas connect, combine, and open new technological paths?",
        "Which research crosses into patents, licensing, startups, or practice?",
        "How do technical performance, production, and adoption change over time?",
        "Where do technologies create wider economic and public value?",
      ][stage]}</p><button type="button">See related evidence <Arrow /></button></div><div className={`stage-visual stage-visual-${stage}`}><NetworkArt quiet /><span>{["$", "idea", "↗", "use", "impact"][stage]}</span></div><aside><span>RELATED TOOL</span><ToolGlyph index={stage} tone={tools[stage].tone}/><strong>{tools[stage].name}</strong><small>{tools[stage].status}</small></aside></div></section>
      <section className="story-tools" id="story-tools"><div className="story-section-head"><span>PLAY WITH THE DATA</span><h2>Serious tools. Clear starting points.</h2></div><div>{tools.slice(0,4).map((tool,i)=><article key={tool.name} className={`story-tool-${i}`}><ToolGlyph index={i} tone={tool.tone}/><span>{tool.eyebrow}</span><h3>{tool.name}</h3><p>{tool.description}</p><button type="button">Try the mockup <Arrow /></button></article>)}</div></section>
      <section className="story-result" id="story-results"><div className="result-scribble" aria-hidden="true"><span>20</span><i/><i/><i/><i/><b>universities</b></div><div><span>WHAT WE FOUND</span><h2>Context changes what a promising idea can become.</h2><p>Early APTO models work well within an institution but do not automatically transfer to another. That makes the national network essential—not incidental.</p><button type="button">Read the two-minute version <Arrow /></button></div></section>
      <section className="story-community" id="story-community"><div><span>THE APTO COMMUNITY</span><h2>Technology is a team sport.</h2><p>Researchers, engineers, economists, institutional leaders, and domain experts are building the observatory together.</p></div><div className="story-name-cloud">{seniorTeam.map((name,i)=><span key={name} className={`name-tone-${i%5}`}>{name}</span>)}</div></section>
      <footer className="story-footer"><h2>Curious where a technology could go?</h2><button type="button">Start with the map <span>→</span></button><div><AptoMark/><p>Open tools, evidence, and stories from the APTO Program.</p></div></footer>
    </div>
  );
}

function renderConcept(id: string) {
  switch (id) {
    case "civic": return <CivicObservatory />;
    case "mission": return <MissionControl />;
    case "map": return <LivingScienceMap />;
    case "atlas": return <BlueAtlas />;
    case "forecast": return <SpectralForecast />;
    case "archive": return <LivingArchive />;
    case "beautiful": return <BeautifulTechnology />;
    case "editorial": return <EditorialLab />;
    case "commons": return <OpenScienceCommons />;
    case "story": return <SignalStory />;
    case "timefold": return <Timefold />;
    case "lens": return <SignalLens />;
    case "builder": return <ConstellationBuilder />;
    case "weather": return <ForecastWeather />;
    case "whatif": return <WhatIfMachine />;
    case "xray": return <EvidenceXRay />;
    case "terrain": return <FrontierTerrain />;
    case "symphony": return <SignalSymphony />;
    case "passport": return <ResearchPassport />;
    case "loom": return <DataLoom />;
    case "gravity": return <KineticMockup id="gravity" />;
    case "deepzoom": return <KineticMockup id="deepzoom" />;
    case "prism": return <KineticMockup id="prism" />;
    case "orbit": return <KineticMockup id="orbit" />;
    case "circuit": return <KineticMockup id="circuit" />;
    case "magnet": return <KineticMockup id="magnet" />;
    case "vortex": return <KineticMockup id="vortex" />;
    case "morph": return <KineticMockup id="morph" />;
    case "infinite": return <KineticMockup id="infinite" />;
    case "liquid": return <KineticMockup id="liquid" />;
    default: return null;
  }
}

export default function MockupStudio() {
  const [selected, setSelected] = useState("gallery");

  useEffect(() => {
    const syncQuery = () => {
      const id = new URLSearchParams(window.location.search).get("concept") ?? "gallery";
      setSelected(concepts.some((concept) => concept.id === id) ? id : "gallery");
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    };
    syncQuery();
    window.addEventListener("popstate", syncQuery);
    return () => window.removeEventListener("popstate", syncQuery);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
          target.isContentEditable ||
          Boolean(target.closest('[data-local-arrows="true"]')))
      ) {
        return;
      }
      if (selected === "gallery" || !["ArrowLeft", "ArrowRight", "Escape"].includes(event.key)) return;
      if (event.key === "Escape" && (document.fullscreenElement || document.pointerLockElement)) return;
      event.preventDefault();
      if (event.key === "Escape") {
        history.pushState(null, "", window.location.pathname);
        setSelected("gallery");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const index = concepts.findIndex((concept) => concept.id === selected);
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const next = concepts[(index + offset + concepts.length) % concepts.length];
      history.pushState(null, "", `${window.location.pathname}?concept=${next.id}`);
      setSelected(next.id);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected]);

  const choose = (id: string) => {
    if (id === "gallery") {
      history.pushState(null, "", window.location.pathname);
      setSelected("gallery");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    history.pushState(null, "", `${window.location.pathname}?concept=${id}`);
    setSelected(id);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  return (
    <main className={`mockup-studio view-${selected}`}>
      {selected === "gallery" ? <Gallery onSelect={choose} /> : <><ConceptSwitcher current={selected} onSelect={choose} /><Suspense fallback={<div className="kinetic-loading"><span>APTO</span><p>Preparing the live scene…</p></div>}>{renderConcept(selected)}</Suspense></>}
    </main>
  );
}
