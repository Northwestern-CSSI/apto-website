"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { technologies } from "./apto-data";

function InteractiveMark({ light = false }: { light?: boolean }) {
  return <div className={`interactive-mark ${light ? "is-light" : ""}`}><i aria-hidden="true" /><strong>APTO</strong><span>INTERACTIVE STUDY</span></div>;
}

function DemoTag({ children = "Interactive mockup" }: { children?: React.ReactNode }) {
  return <span className="interactive-demo-tag">● {children}</span>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const milestones = [
  { year: 2009, value: "3.8%", title: "A new frontier appears", detail: "The first perovskite solar-cell records enter the observed literature." },
  { year: 2014, value: "14.1%", title: "Architectures diversify", detail: "Research activity branches as measured performance rises." },
  { year: 2020, value: "25.5%", title: "The 25% frontier", detail: "The aggregate trajectory conceals several competing subtrajectories." },
  { year: 2026, value: "27.1%", title: "Today / APTO observes", detail: "Measurement meets model comparison at the edge of observed evidence." },
  { year: 2032, value: "30.8%", title: "Illustrative tandem scenario", detail: "A modeled scenario—not an APTO prediction—shows how assumptions shape a path." },
  { year: 2040, value: "34.2%", title: "Long-range possibility", detail: "Uncertainty expands with horizon; assumptions remain visible." },
];

export function Timefold() {
  const [year, setYear] = useState(2026);
  const [playing, setPlaying] = useState(false);
  const milestone = [...milestones].reverse().find((item) => item.year <= year) ?? milestones[0];
  const fold = ((year - 2009) / 31) * 100;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setYear((value) => value >= 2040 ? 2009 : value + 1), 420);
    return () => window.clearInterval(timer);
  }, [playing]);

  return <div className="concept concept-timefold">
    <header className="tf-nav"><InteractiveMark light /><span>Past evidence <i /> Possible futures</span><button type="button" onClick={() => { if (!playing && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; setPlaying(!playing); }}>{playing ? "Pause time" : "Play time"}</button></header>
    <section className="tf-stage" style={{ "--fold": `${fold}%` } as CSSProperties}>
      <div className="tf-past"><DemoTag /><p>OBSERVED / PEROVSKITE SOLAR CELLS</p><h1>What happened<br />becomes what<br />we can <em>model.</em></h1><div className="tf-ghost-year">{year}</div></div>
      <div className="tf-future"><span>ILLUSTRATIVE SCENARIO</span><strong>{milestone.value}</strong><p>{year <= 2026 ? "Observed capability frontier" : "Scenario capability frontier"}</p><div className="tf-band"><i /><i /><i /><i /><i /><i /></div></div>
      <div className="tf-seam" aria-hidden="true"><span>{year}</span><small>{year <= 2026 ? "OBSERVED" : "SCENARIO"}</small></div>
    </section>
    <section className="tf-controls" data-local-arrows="true">
      <div><button type="button" onClick={() => setYear(clamp(year - 1, 2009, 2040))} aria-label="Previous year">←</button><label htmlFor="tf-year">Scrub the evidence frontier <strong>{year}</strong></label><button type="button" onClick={() => setYear(clamp(year + 1, 2009, 2040))} aria-label="Next year">→</button></div>
      <input id="tf-year" type="range" min="2009" max="2040" value={year} aria-valuetext={`${year}, ${year <= 2026 ? "observed" : "illustrative scenario"}`} onChange={(event) => setYear(Number(event.target.value))} />
      <article aria-live="polite"><span>{milestone.year}</span><div><h2>{milestone.title}</h2><p>{milestone.detail}</p></div><b>{milestone.value}</b></article>
      <div className="tf-milestones" aria-label="Timeline milestones">{milestones.map((item) => <button type="button" key={item.year} className={item.year === milestone.year ? "is-active" : ""} onClick={() => setYear(item.year)}><span>{item.year}</span>{item.title}</button>)}</div>
    </section>
  </div>;
}

const lensLayers = [
  ["Funding", "126 awards", "Public investment signals"], ["Papers", "18K+ articles", "Knowledge production"], ["Patents", "4,218 links", "Translation signals"],
  ["Capability", "27.1% PCE", "Measured performance"], ["Use", "31 pathways", "Downstream evidence"], ["Uncertainty", "± 4.6 pts", "Model disagreement"],
] as const;
const lensClusters = [
  ["Solar", 24, 32], ["Quantum", 68, 25], ["AI", 76, 64], ["Biology", 39, 70],
] as const;

export function SignalLens() {
  const [layer, setLayer] = useState(0);
  const [cluster, setCluster] = useState(0);
  const [full, setFull] = useState(false);
  const current = lensLayers[layer];
  const point = lensClusters[cluster];
  return <div className="concept concept-lens">
    <header className="lens-nav"><InteractiveMark /><nav><a href="#lens-field">Explore</a><a href="#lens-evidence">Layers</a><a href="#lens-about">About</a></nav><DemoTag>Move the lens</DemoTag></header>
    <section className="lens-hero" id="lens-field">
      <div className="lens-copy"><span>ONE LANDSCAPE. SIX WAYS OF SEEING.</span><h1>Science changes<br />when you change<br />the <em>lens.</em></h1><p>Reveal how funding, papers, patents, capability, use, and uncertainty overlap across the same knowledge landscape.</p></div>
      <div className={`lens-field ${full ? "is-full" : ""}`} style={{ "--lens-x": `${point[1]}%`, "--lens-y": `${point[2]}%` } as CSSProperties}>
        <img src="/apto/science-map.png" alt="Monochrome map of scientific fields" />
        <div className={`lens-reveal lens-layer-${layer}`}><img src="/apto/science-map.png" alt="" /></div>
        <div className="lens-ring" aria-hidden="true"><span>{current[0]}</span><b>{current[1]}</b></div>
        <div className="lens-clusters">{lensClusters.map((item, index) => <button type="button" key={item[0]} className={cluster === index ? "is-active" : ""} style={{ left: `${item[1]}%`, top: `${item[2]}%` }} onClick={() => setCluster(index)} aria-label={`Move lens to ${item[0]}`}>{item[0]}</button>)}</div>
      </div>
    </section>
    <section className="lens-console" id="lens-evidence"><div><span>CHOOSE A DATA LAYER</span>{lensLayers.map((item, index) => <button type="button" key={item[0]} className={layer === index ? "is-active" : ""} aria-pressed={layer === index} onClick={() => setLayer(index)}>{String(index + 1).padStart(2, "0")} · {item[0]}</button>)}</div><article><small>{point[0]} / {current[0]}</small><strong>{current[1]}</strong><p>{current[2]}. Mock values illustrate the interaction; public status would be marked record by record.</p><button type="button" onClick={() => setFull(!full)}>{full ? "Return to lens" : "Show full layer"}</button></article></section>
  </div>;
}

const builderNodes = ["NSF grant", "Perovskite paper", "Patent family", "License", "Solar startup", "Public use"];
const builderRelations = ["funded", "informed", "cited by", "licensed as", "contributed to"];

export function ConstellationBuilder() {
  const [source, setSource] = useState(0);
  const [relation, setRelation] = useState(0);
  const [destination, setDestination] = useState(1);
  const [links, setLinks] = useState<Array<[number, number, number]>>([]);
  const add = () => setLinks((items) => items.some((item) => item[0] === source && item[2] === destination) ? items : [...items.slice(-3), [source, relation, destination]]);
  const autoBuild = () => setLinks([[0, 0, 1], [1, 2, 2], [2, 3, 3], [3, 4, 4]]);
  return <div className="concept concept-builder">
    <header className="builder-nav"><InteractiveMark light /><span>RESEARCH → IMPACT CONSTRUCTION SPACE</span><DemoTag>Build a pathway</DemoTag></header>
    <section className="builder-hero"><div><span>CONSTELLATION BUILDER / 13</span><h1>Don’t just view<br />the network.<br /><em>Make one.</em></h1><p>Connect evidence objects to see how APTO traces public investment toward technological outcomes.</p><div><button type="button" onClick={autoBuild}>Auto-build an example</button><button type="button" onClick={() => setLinks([])}>Reset space</button></div></div><div className="builder-space" aria-label="Visual representation of the constructed pathway">{builderNodes.map((node, index) => <div key={node} className={`builder-node node-shape-${index} ${links.flatMap((link) => [link[0], link[2]]).includes(index) ? "is-linked" : ""}`}><span>0{index + 1}</span><strong>{node}</strong></div>)}<div className="builder-thread" style={{ "--built": links.length } as CSSProperties} /></div></section>
    <section className="builder-form"><div><label>Source<select value={source} onChange={(event) => setSource(Number(event.target.value))}>{builderNodes.map((node, index) => <option value={index} key={node}>{node}</option>)}</select></label><label>Relationship<select value={relation} onChange={(event) => setRelation(Number(event.target.value))}>{builderRelations.map((item, index) => <option value={index} key={item}>{item}</option>)}</select></label><label>Destination<select value={destination} onChange={(event) => setDestination(Number(event.target.value))}>{builderNodes.map((node, index) => <option value={index} key={node}>{node}</option>)}</select></label><button type="button" onClick={add}>Add link +</button></div><ol aria-live="polite">{links.length ? links.map((link, index) => <li key={`${link.join("-")}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{builderNodes[link[0]]}</strong> {builderRelations[link[1]]} <strong>{builderNodes[link[2]]}</strong></li>) : <li className="builder-empty">No links yet. Choose three fields or auto-build an example.</li>}</ol></section>
  </div>;
}

export function ForecastWeather() {
  const [technology, setTechnology] = useState(0);
  const [horizon, setHorizon] = useState(8);
  const [assumption, setAssumption] = useState(1);
  const [table, setTable] = useState(false);
  const momentum = clamp(41 + technology * 3 + assumption * 12 - horizon, 18, 92);
  const uncertainty = clamp(14 + horizon * 4 - assumption * 3, 12, 78);
  const regime = horizon > 12 ? "Changing front" : assumption === 2 ? "Strong tailwind" : "Variable flow";
  return <div className="concept concept-weather" style={{ "--cloud": `${uncertainty}%`, "--wind": `${momentum}deg` } as CSSProperties}>
    <header className="weather-nav"><InteractiveMark /><span>APTO FORECAST SERVICE</span><button type="button" onClick={() => setTable(!table)}>{table ? "Return to atmosphere" : "Switch to chart / table"}</button></header>
    <section className="weather-hero"><div className="weather-copy"><DemoTag>Forecast metaphor</DemoTag><span>TECHNOLOGY OUTLOOK / +{horizon} YEARS</span><h1>{regime}</h1><p>{technologies[technology]} carries <strong>{momentum > 65 ? "high" : "moderate"} modeled momentum</strong> into an increasingly uncertain horizon.</p><small>Weather is a metaphor, not a literal forecast. Exact model values remain available below.</small></div>{table ? <div className="weather-table"><h2>Exact outlook</h2><dl><div><dt>Momentum index</dt><dd>{momentum}/100</dd></div><div><dt>Uncertainty band</dt><dd>±{uncertainty}%</dd></div><div><dt>Regime signal</dt><dd>{regime}</dd></div><div><dt>Horizon</dt><dd>{horizon} years</dd></div></dl></div> : <div className="weather-sky" aria-hidden="true"><div className="weather-sun">{momentum}</div><div className="weather-cloud cloud-a" /><div className="weather-cloud cloud-b" /><div className="weather-wind">→ → →</div><span>UNCERTAINTY<br />{uncertainty}%</span></div>}</section>
    <section className="weather-console"><label>Technology<select value={technology} onChange={(event) => setTechnology(Number(event.target.value))}>{technologies.slice(0, 6).map((item, index) => <option value={index} key={item}>{item}</option>)}</select></label><label>Forecast horizon <strong>+{horizon} years</strong><input type="range" min="2" max="20" value={horizon} onChange={(event) => setHorizon(Number(event.target.value))} /></label><fieldset><legend>Assumption set</legend>{["Constrained", "Baseline", "Accelerated"].map((item, index) => <button type="button" key={item} onClick={() => setAssumption(index)} className={assumption === index ? "is-active" : ""}>{item}</button>)}</fieldset></section>
  </div>;
}

function MachineDial({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="whatif-dial"><span>{label}</span><div style={{ "--dial": `${value * 2.7}deg` } as CSSProperties}><i /><strong>{value}</strong></div><input aria-label={label} type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export function WhatIfMachine() {
  const [investment, setInvestment] = useState(55);
  const [collaboration, setCollaboration] = useState(64);
  const [translation, setTranslation] = useState(42);
  const [run, setRun] = useState(0);
  const score = Math.round(investment * .3 + collaboration * .3 + translation * .4);
  const preset = () => { setInvestment(72); setCollaboration(82); setTranslation(68); setRun(0); };
  return <div className="concept concept-whatif">
    <header className="whatif-nav"><InteractiveMark /><span>APTO POLICY LAB / MACHINE 15</span><DemoTag /></header>
    <section className="whatif-title"><div><span>AN ILLUSTRATIVE SCENARIO CONSOLE</span><h1>THE<br />WHAT-IF<br /><em>MACHINE</em></h1></div><p>Turn three levers. Run the pathway. See where an intervention might propagate—and where the evidence runs out.</p></section>
    <section className="whatif-console"><div className="whatif-controls"><MachineDial label="Research investment" value={investment} onChange={(value) => { setInvestment(value); setRun(0); }} /><MachineDial label="Collaboration breadth" value={collaboration} onChange={(value) => { setCollaboration(value); setRun(0); }} /><MachineDial label="Translation capacity" value={translation} onChange={(value) => { setTranslation(value); setRun(0); }} /><div className="whatif-buttons"><button type="button" onClick={() => setRun((value) => value + 1)}>RUN SCENARIO <b>▶</b></button><button type="button" onClick={preset}>Load high-network preset</button><button type="button" onClick={() => { setInvestment(55); setCollaboration(64); setTranslation(42); setRun(0); }}>Reset</button></div></div><div className={`whatif-chain ${run ? "is-running" : ""}`} key={run}><span>01<small>RESEARCH</small></span><i>→</i><span>02<small>KNOWLEDGE</small></span><i>→</i><span>03<small>TRANSITION</small></span><i>→</i><span>04<small>CAPABILITY</small></span><i>→</i><span>05<small>USE</small></span></div><article aria-live="polite"><span>{run ? `RUN ${String(run).padStart(2, "0")} COMPLETE` : "AWAITING RUN"}</span><strong>{run ? `${score}/100` : "—"}</strong><div><h2>{run ? (score > 70 ? "Broad pathway support" : score > 50 ? "Uneven pathway support" : "Translation bottleneck") : "Adjust the machine"}</h2><p>{run ? `In this illustrative scenario, collaboration and translation jointly shape the modeled outcome. This is interface copy, not a policy estimate.` : "Values change only this mock scenario. Press Run to propagate them through the pathway."}</p></div></article></section>
  </div>;
}

const claims = [
  { claim: "Prediction improves as the institutional network grows.", source: "Cross-institution model study", method: "Held-out institution evaluation", status: "Aggregated result", caveat: "Performance depends on outcome and domain." },
  { claim: "Technology frontiers move in bursts and periods of stasis.", source: "Nine capability datasets", method: "Frontier trajectory analysis", status: "Public summary", caveat: "Domain-specific measurement choices remain." },
  { claim: "Local context changes translation outcomes.", source: "86K disclosures · 27K licenses", method: "Longitudinal prediction study", status: "Restricted microdata", caveat: "Only aggregate evidence can be public." },
];

export function EvidenceXRay() {
  const [scanner, setScanner] = useState(48);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  return <div className={`concept concept-xray ${showAll ? "is-revealed" : ""}`} style={{ "--scan": `${scanner}%` } as CSSProperties}>
    <header className="xray-nav"><InteractiveMark /><span>EVIDENCE MODE / PROVENANCE ALWAYS NEARBY</span><label><input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} /> Show all evidence</label></header>
    <section className="xray-hero"><div className="xray-copy"><DemoTag>Scan any claim</DemoTag><span>TRUST IS AN INTERFACE</span><h1>Put every<br />claim under<br />the <em>X-ray.</em></h1><p>Slide the scanner to expose sources, methods, caveats, responsible teams, and public-access status.</p></div><div className="xray-poster"><div className="xray-claim"><small>APTO RESULT 03 / TECHNOLOGY TRANSITION</small><strong>Context changes what a promising idea can become.</strong><p>Early models predict outcomes within an institution but do not automatically transfer to another.</p></div><div className="xray-evidence"><small>PROVENANCE LAYER</small><strong>86K DISCLOSURES<br />27K LICENSES</strong><p>Held-out-institution evaluation<br />Responsible team: Thrusts 2 + 4<br />Access: aggregate result only</p><b>⚠ Generalization varies by context</b></div><div className="xray-scanner" aria-hidden="true"><span>X-RAY</span></div></div></section>
    <section className="xray-controls"><label htmlFor="xray-range">Scanner position <strong>{scanner}%</strong></label><input id="xray-range" type="range" min="5" max="95" value={scanner} onChange={(event) => setScanner(Number(event.target.value))} /><button type="button" onClick={() => setScanner(clamp(scanner - 10, 5, 95))}>← Move left</button><button type="button" onClick={() => setScanner(clamp(scanner + 10, 5, 95))}>Move right →</button></section>
    <section className="xray-cards" aria-label="Claims with evidence disclosures">{claims.map((item, index) => <article key={item.claim} className={expanded === index || showAll ? "is-open" : ""}><span>CLAIM 0{index + 1}</span><h2>{item.claim}</h2><button type="button" aria-expanded={expanded === index || showAll} onClick={() => setExpanded(expanded === index ? null : index)}>Evidence and limitations <b>+</b></button><div><dl><dt>Source</dt><dd>{item.source}</dd><dt>Method</dt><dd>{item.method}</dd><dt>Access</dt><dd>{item.status}</dd><dt>Caveat</dt><dd>{item.caveat}</dd></dl></div></article>)}</section>
  </div>;
}

const peaks = [
  ["AI benchmarks", 88, "High momentum", "±18"], ["Perovskite", 76, "Broad activity", "±11"], ["Qubits", 63, "Narrow frontier", "±24"], ["Structural biology", 71, "Steady advance", "±9"], ["Manufacturing", 54, "Mixed signals", "±20"],
] as const;

export function FrontierTerrain() {
  const [rotation, setRotation] = useState(-12);
  const [sea, setSea] = useState(38);
  const [flat, setFlat] = useState(false);
  const [selected, setSelected] = useState(0);
  const visible = peaks.filter((peak) => peak[1] >= sea);
  return <div className="concept concept-terrain">
    <header className="terrain-nav"><InteractiveMark light /><span>APTO FRONTIER TOPOGRAPHY / 2026</span><DemoTag>Tilt the terrain</DemoTag></header>
    <section className="terrain-hero"><div className="terrain-copy"><span>CAPABILITY BECOMES LANDSCAPE</span><h1>Find the peaks.<br /><em>Read the fog.</em></h1><p>Height represents capability, ridge width represents breadth of activity, and haze represents uncertainty.</p><div><button type="button" onClick={() => setFlat(!flat)}>{flat ? "Return to terrain" : "Flatten terrain"}</button><button type="button" onClick={() => { setRotation(-12); setSea(38); }}>Reset view</button></div></div>{flat ? <div className="terrain-flat"><span>RANKED FRONTIER VIEW</span>{visible.map((peak, index) => <button type="button" key={peak[0]} onClick={() => setSelected(peaks.indexOf(peak))}><b>{index + 1}</b><strong>{peak[0]}</strong><i style={{ width: `${peak[1]}%` }} /><span>{peak[1]}</span></button>)}</div> : <div className="terrain-viewport"><div className="terrain-world" style={{ transform: `rotateX(58deg) rotateZ(${rotation}deg)` }}>{peaks.map((peak, index) => <button type="button" key={peak[0]} className={`terrain-peak peak-${index} ${selected === index ? "is-active" : ""}`} style={{ "--height": peak[1] } as CSSProperties} onClick={() => setSelected(index)}><i /><span>{peak[0]}</span></button>)}<div className="terrain-sea" style={{ opacity: sea / 100 }} /></div></div>}</section>
    <section className="terrain-console" data-local-arrows="true"><div><button type="button" onClick={() => setRotation(rotation - 12)}>↶ Rotate left</button><button type="button" onClick={() => setRotation(rotation + 12)}>Rotate right ↷</button></div><label>Capability threshold <strong>{sea}</strong><input type="range" min="20" max="80" value={sea} onChange={(event) => setSea(Number(event.target.value))} /></label><article><span>SELECTED PEAK</span><h2>{peaks[selected][0]}</h2><dl><div><dt>Capability index</dt><dd>{peaks[selected][1]}</dd></div><div><dt>Pattern</dt><dd>{peaks[selected][2]}</dd></div><div><dt>Uncertainty</dt><dd>{peaks[selected][3]}</dd></div></dl></article></section>
  </div>;
}

const notes = [42, 58, 44, 72, 70, 38, 41, 83, 55, 91, 65, 76];

export function SignalSymphony() {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [volume, setVolume] = useState(28);
  const audioRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const stop = () => { timersRef.current.forEach(window.clearTimeout); timersRef.current = []; void audioRef.current?.close(); audioRef.current = null; setPlaying(false); setStep(-1); };
  const play = (single?: number) => {
    stop();
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const context = new AudioCtor(); audioRef.current = context; setPlaying(true);
    const sequence = single === undefined ? notes.map((_, index) => index) : [single];
    sequence.forEach((noteIndex, order) => {
      const timer = window.setTimeout(() => {
        if (context.state === "closed") return;
        setStep(noteIndex); const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = noteIndex % 4 === 0 ? "triangle" : "sine"; oscillator.frequency.value = 150 + notes[noteIndex] * 4.4; gain.gain.value = volume / 900;
        oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .38); oscillator.stop(context.currentTime + .4);
        if (order === sequence.length - 1) timersRef.current.push(window.setTimeout(stop, 520));
      }, order * 310); timersRef.current.push(timer);
    });
  };
  useEffect(() => () => { timersRef.current.forEach(window.clearTimeout); void audioRef.current?.close(); }, []);
  return <div className="concept concept-symphony">
    <header className="symphony-nav"><InteractiveMark light /><span>APTO DATA PERFORMANCE / SCORE 18</span><DemoTag>Audio is opt-in</DemoTag></header>
    <section className="symphony-hero"><div><span>BURST · STASIS · BREAKTHROUGH</span><h1>Hear the<br /><em>shape</em> of<br />progress.</h1><p>Capability advances become pitch. Stasis becomes a held note. Uncertainty adds texture.</p><div><button type="button" onClick={() => playing ? stop() : play()}>{playing ? "■ Stop" : "▶ Hear the data"}</button><small>No audio plays until you choose it.</small></div></div><div className="symphony-score"><div className="score-lines" />{notes.map((note, index) => <button type="button" key={index} aria-label={`Play point ${index + 1}, capability ${note}`} className={step === index ? "is-playing" : ""} style={{ height: `${note}%` }} onClick={() => play(index)}><i /><span>{index + 1}</span></button>)}<div className="symphony-playhead" style={{ left: `${step < 0 ? 0 : (step / (notes.length - 1)) * 100}%` }} /></div></section>
    <section className="symphony-console"><label>Volume <strong>{volume}%</strong><input type="range" min="0" max="80" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label><article aria-live="polite"><span>WRITTEN PATTERN SUMMARY</span><h2>{step < 0 ? "The score is ready." : step < 4 ? "Early gains alternate with pauses." : step < 8 ? "A long stasis precedes a burst." : "Late advances arrive unevenly."}</h2><p>The same information remains visible: twelve illustrative time points rise from 42 to 91 with two pronounced bursts and multiple reversals.</p></article><table><caption>Accessible data table</caption><thead><tr><th>Point</th><th>Capability</th><th>Pattern</th></tr></thead><tbody>{notes.slice(0, 4).map((note, index) => <tr key={index}><td>{index + 1}</td><td>{note}</td><td>{note > 65 ? "advance" : "stasis"}</td></tr>)}</tbody></table></section>
  </div>;
}

const passportStops = [
  ["MAP", "Explore the science map", "Find a cluster outside your home field."], ["MODEL", "Test a forecast", "Change a horizon and inspect uncertainty."], ["DATA", "Open a dataset", "Check access, coverage, and provenance."], ["PAPER", "Read one result", "Follow a claim to its method."], ["PEOPLE", "Meet the network", "Find a team with complementary expertise."],
] as const;
const roles = ["Researcher", "Policymaker", "Student", "Tech transfer"];

export function ResearchPassport() {
  const [role, setRole] = useState(0);
  const [visited, setVisited] = useState<boolean[]>(Array(5).fill(false));
  const count = visited.filter(Boolean).length;
  const toggle = (index: number) => setVisited((items) => items.map((item, itemIndex) => itemIndex === index ? !item : item));
  return <div className="concept concept-passport">
    <header className="passport-nav"><InteractiveMark /><span>FIELD GUIDE NO. 19 / THIS VISIT ONLY</span><DemoTag>Collect five stamps</DemoTag></header>
    <section className="passport-cover"><div className="passport-binding"><span>APTO</span><small>RESEARCH PASSPORT</small></div><div className="passport-intro"><span>PROPERTY OF A CURIOUS VISITOR</span><h1>Your route<br />through the<br /><em>frontier.</em></h1><p>Choose a role. Visit five useful parts of APTO. Leave with a personal path instead of a generic homepage.</p><fieldset><legend>I am visiting as a…</legend>{roles.map((item, index) => <button type="button" key={item} className={role === index ? "is-active" : ""} onClick={() => setRole(index)}>{item}</button>)}</fieldset></div><aside><span>TRAVELER</span><strong>{roles[role]}</strong><i>APTO<br />2026</i><small>Progress is not saved in this design mockup.</small></aside></section>
    <section className="passport-progress"><div><span>{count}/5 STAMPS</span><div><i style={{ width: `${count * 20}%` }} /></div><button type="button" onClick={() => setVisited(Array(5).fill(false))}>Reset passport</button></div>{count === 5 && <p role="status">Passport complete — your APTO route is ready.</p>}</section>
    <section className="passport-pages">{passportStops.map((stop, index) => <article key={stop[0]} className={visited[index] ? "is-stamped" : ""}><div><span>STOP {String(index + 1).padStart(2, "0")}</span><b>{stop[0]}</b></div><h2>{stop[1]}</h2><p>{stop[2]}</p><button type="button" aria-pressed={visited[index]} onClick={() => toggle(index)}>{visited[index] ? "✓ Stamp collected" : "Visit & collect stamp"}</button><i aria-hidden="true">APTO<br />{index + 1}</i></article>)}</section>
  </div>;
}

const loomStages = ["Funding", "Knowledge", "Translation", "Capability", "Use"];
const loomColors = ["gold", "teal", "coral", "violet", "cream"];
const loomDetails = [
  "Public awards connect to research teams and questions.", "Papers and datasets make knowledge visible.", "Patents, licenses, and startups mark possible transitions.", "Domain measures follow technical performance.", "Adoption and public outcomes complete the pathway.",
];

export function DataLoom() {
  const [technology, setTechnology] = useState(0);
  const [lens, setLens] = useState(0);
  const [selected, setSelected] = useState(2);
  const [paused, setPaused] = useState(false);
  const intersections = useMemo(() => loomStages.map((stage, index) => ({ stage, strength: clamp(48 + ((technology + index * 3 + lens) % 5) * 11, 40, 94) })), [technology, lens]);
  return <div className={`concept concept-loom ${paused ? "is-paused" : ""}`}>
    <header className="loom-nav"><InteractiveMark light /><span>APTO RELATIONSHIP LOOM / 20</span><DemoTag>Weave the evidence</DemoTag></header>
    <section className="loom-hero"><div className="loom-copy"><span>MANY DATASETS. ONE PROGRAM.</span><h1>See how the<br />evidence <em>weaves.</em></h1><p>Follow one technology through funding, knowledge, translation, capability, and use.</p><div><label>Technology<select value={technology} onChange={(event) => setTechnology(Number(event.target.value))}>{technologies.slice(0, 6).map((item, index) => <option value={index} key={item}>{item}</option>)}</select></label><label>Outcome lens<select value={lens} onChange={(event) => setLens(Number(event.target.value))}><option value="0">Research activity</option><option value="1">Translation</option><option value="2">Public use</option></select></label><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume motion" : "Pause motion"}</button></div></div><div className="loom-art" aria-label="Woven stages of the APTO research-to-impact pathway"><div className="loom-warp">{Array.from({ length: 11 }, (_, index) => <i key={index} />)}</div><div className="loom-weft">{intersections.map((item, index) => <button type="button" key={item.stage} className={`strand-${loomColors[index]} ${selected === index ? "is-active" : ""}`} style={{ "--strength": item.strength } as CSSProperties} onClick={() => setSelected(index)}><span>{item.stage}</span>{Array.from({ length: 6 }, (_, dot) => <i key={dot} />)}</button>)}</div><div className="loom-shuttle">APTO</div></div></section>
    <section className="loom-detail"><div><span>SELECTED INTERSECTION / 0{selected + 1}</span><h2>{loomStages[selected]}</h2><p>{loomDetails[selected]}</p><strong>{intersections[selected].strength}% <small>illustrative connection strength</small></strong></div><table><caption>Relationship table for {technologies[technology]}</caption><thead><tr><th>Stage</th><th>Example object</th><th>Signal</th></tr></thead><tbody>{intersections.map((item, index) => <tr key={item.stage} className={selected === index ? "is-active" : ""}><td>{item.stage}</td><td>{["NSF award", "OpenAlex paper", "Patent family", "PCE record", "Deployment evidence"][index]}</td><td>{item.strength}%</td></tr>)}</tbody></table></section>
  </div>;
}
