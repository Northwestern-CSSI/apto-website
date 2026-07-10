"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { WebGLField, WebGPUPrism } from "./kinetic-engines";

type KineticId = "gravity" | "deepzoom" | "prism" | "orbit" | "circuit" | "magnet" | "vortex" | "morph" | "infinite" | "liquid";

const evidenceStages = ["Research investment", "Scientific knowledge", "Technology transition", "Capability", "Use & impact"];

function KineticMark({ dark = false }: { dark?: boolean }) {
  return <div className={`kinetic-mark ${dark ? "is-dark" : ""}`}><i aria-hidden="true" /><strong>APTO</strong><span>MOTION STUDY</span></div>;
}

function MotionTag({ children }: { children: React.ReactNode }) {
  return <span className="motion-tag">LIVE · {children}</span>;
}

function useKineticMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let pointerX = .5;
    let pointerY = .5;
    const render = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const range = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - top) / range));
      const x = reduced.matches ? .5 : pointerX;
      const y = reduced.matches ? .5 : pointerY;
      root.style.setProperty("--scroll", progress.toFixed(4));
      root.style.setProperty("--scroll-px", `${progress * 700}px`);
      root.style.setProperty("--scroll-x", `${progress * Math.max(1500, window.innerWidth * 2.7)}px`);
      root.style.setProperty("--scroll-width", `${progress * 100}%`);
      root.style.setProperty("--scroll-percent", `${progress * 84}%`);
      root.style.setProperty("--scroll-deg", `${progress * 210}deg`);
      root.style.setProperty("--pointer-x", x.toFixed(4));
      root.style.setProperty("--pointer-y", y.toFixed(4));
      root.style.setProperty("--pointer-px", `${x * 100}%`);
      root.style.setProperty("--pointer-py", `${y * 100}%`);
      root.style.setProperty("--pointer-rx", `${(y - .5) * -14}deg`);
      root.style.setProperty("--pointer-ry", `${(x - .5) * 18}deg`);
      root.style.setProperty("--pointer-angle", `${(y - .5) * 9}deg`);
      const stage = progress * 4;
      for (let index = 0; index < 5; index += 1) {
        const distance = index - stage;
        const scale = Math.min(16, Math.max(.035, 2 ** (-distance * 1.45)));
        root.style.setProperty(`--zoom-${index}`, scale.toFixed(4));
        root.style.setProperty(`--zoom-opacity-${index}`, String(Math.max(.08, 1 - Math.abs(distance) * .38)));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const pointer = (event: PointerEvent) => { pointerX = event.clientX / Math.max(1, innerWidth); pointerY = event.clientY / Math.max(1, innerHeight); schedule(); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pointermove", pointer, { passive: true });
    reduced.addEventListener("change", schedule);
    render();
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.removeEventListener("pointermove", pointer); reduced.removeEventListener("change", schedule); };
  }, []);
  return ref;
}

function scrollToStage(stage: number, total = 5) {
  const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  window.scrollTo({ top: (stage / Math.max(1, total - 1)) * range, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

function KineticHeader({ title, number, dark = false, tag }: { title: string; number: string; dark?: boolean; tag: string }) {
  return <header className="kinetic-nav"><KineticMark dark={dark} /><span>{number} / {title}</span><MotionTag>{tag}</MotionTag></header>;
}

export function GravityField() {
  const root = useKineticMotion();
  const [paused, setPaused] = useState(false);
  const [mass, setMass] = useState(0);
  return <div ref={root} className={`concept concept-gravity kinetic-page ${paused ? "is-paused" : ""}`}>
    <KineticHeader number="21" title="GRAVITY FIELD" tag="Pointer gravity + scroll forces" />
    <section className="gravity-scroll"><div className="gravity-stage kinetic-sticky">
      <WebGLField mode="gravity" paused={paused} colors={["#79ffc2", "#716cff", "#ff6250"]} intensity={1.35} showBadge />
      <div className="gravity-copy"><span>DISTRIBUTED SIGNALS BECOME A SYSTEM</span><h1>What pulls<br />technology<br /><em>forward?</em></h1><p>Move your pointer to bend the field. Scroll to watch isolated signals gather into capability and impact.</p><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume field" : "Pause field"}</button></div>
      <div className="gravity-masses" data-local-arrows="true">{["Research", "Capability", "Impact"].map((item, index) => <button type="button" key={item} className={mass === index ? "is-active" : ""} onClick={() => setMass(index)}><i /><span>0{index + 1}</span><strong>{item}</strong><small>{["Questions and investment", "Measured performance", "Production and use"][index]}</small></button>)}</div>
      <aside><span>ACTIVE MASS</span><strong>{["Research activity", "Technical capability", "Public impact"][mass]}</strong><p>Illustrative physics—not a causal model.</p></aside>
    </div></section>
    <section className="kinetic-fallback-list"><span>STATIC FIELD GUIDE</span>{evidenceStages.slice(0, 3).map((item, index) => <article key={item}><b>0{index + 1}</b><h2>{item}</h2><p>{["Many small research signals begin dispersed.", "Patterns form as evidence and measures accumulate.", "Translation and use remain shaped by context."][index]}</p></article>)}</section>
  </div>;
}

const zoomObjects = [
  ["THE SYSTEM", "A national technology landscape", "20 partner universities"], ["THE FIELD", "Materials science", "Connected knowledge"], ["THE CLUSTER", "Perovskite photovoltaics", "18K+ articles"], ["THE RECORD", "One capability measurement", "Method + context"], ["THE CLAIM", "Why this result is credible", "Source + caveat"],
] as const;

export function DeepZoom() {
  const root = useKineticMotion();
  const [target, setTarget] = useState(0);
  return <div ref={root} className="concept concept-deepzoom kinetic-page">
    <KineticHeader number="22" title="DEEP ZOOM" dark tag="Scroll-driven camera" />
    <section className="deepzoom-scroll"><div className="deepzoom-stage kinetic-sticky">
      <div className="deepzoom-intro"><MotionTag>Scroll to dive</MotionTag><h1>One system.<br /><em>Every scale.</em></h1><p>From the national technology landscape to the evidence behind a single claim.</p></div>
      <div className="deepzoom-space" aria-hidden="true">{zoomObjects.map((item, index) => <div key={item[0]} className={`zoom-plane zoom-plane-${index}`} style={{ "--zoom": `var(--zoom-${index})`, "--zoom-alpha": `var(--zoom-opacity-${index})` } as CSSProperties}><span>{item[0]}</span><strong>{item[1]}</strong><small>{item[2]}</small><i /></div>)}</div>
      <nav className="deepzoom-nav" aria-label="Zoom levels" data-local-arrows="true">{zoomObjects.map((item, index) => <button type="button" key={item[0]} className={target === index ? "is-active" : ""} onClick={() => { setTarget(index); scrollToStage(index); }}><span>0{index + 1}</span>{item[0]}</button>)}</nav>
      <div className="deepzoom-cursor" aria-hidden="true" />
    </div></section>
    <section className="deepzoom-outline"><span>SEMANTIC ZOOM PATH</span>{zoomObjects.map((item, index) => <button type="button" key={item[0]} onClick={() => { setTarget(index); scrollToStage(index); }}><b>0{index + 1}</b><strong>{item[1]}</strong><small>{item[2]}</small><i>Zoom in →</i></button>)}</section>
  </div>;
}

const prismBands = ["Papers", "Patents", "Capability", "Adoption", "Uncertainty"];
export function PrismEngine() {
  const root = useKineticMotion();
  const [paused, setPaused] = useState(false);
  const [question, setQuestion] = useState(0);
  const [band, setBand] = useState(2);
  return <div ref={root} className={`concept concept-prism kinetic-page ${paused ? "is-paused" : ""}`}>
    <KineticHeader number="23" title="PRISM ENGINE" tag="WebGPU with WebGL fallback" />
    <section className="prism-scroll"><div className="prism-stage kinetic-sticky">
      <WebGPUPrism paused={paused} intensity={1.3 + question * .2} colors={["#61ffe0", "#8a63ff", "#ff526b"]} showBadge />
      <div className="prism-beam" aria-hidden="true"><span>SCIENTIFIC INVESTMENT</span><i /></div>
      <div className="prism-copy"><span>ONE INPUT / MANY OUTCOMES</span><h1>Refract the<br /><em>question.</em></h1><p>Move across the prism. Scroll to alter the incoming question. Select a band to isolate what APTO might measure.</p></div>
      <div className="prism-spectrum" data-local-arrows="true">{prismBands.map((item, index) => <button type="button" key={item} className={band === index ? "is-active" : ""} onClick={() => setBand(index)}><i />{item}</button>)}</div>
      <div className="prism-controls"><fieldset><legend>Incoming question</legend>{["Funding", "Collaboration", "Translation"].map((item, index) => <button type="button" key={item} className={question === index ? "is-active" : ""} onClick={() => setQuestion(index)}>{item}</button>)}</fieldset><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume refraction" : "Freeze refraction"}</button><article><span>ISOLATED BAND</span><strong>{prismBands[band]}</strong><p>Mock visual layer · no causal estimate implied.</p></article></div>
    </div></section>
  </div>;
}

const orbitalObjects = ["Map of Science", "Forecast Lab", "SciSciNet", "Publications", "Partner network", "Open datasets", "Methods", "Technology dossiers"];
export function OrbitalIndex() {
  const root = useKineticMotion();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  return <div ref={root} className={`concept concept-orbit kinetic-page ${paused ? "is-paused" : ""}`}>
    <KineticHeader number="24" title="ORBITAL INDEX" tag="Spatial directory" />
    <section className="orbit-scroll"><div className="orbit-stage kinetic-sticky">
      <div className="orbit-copy"><span>AN INDEX WITH GRAVITY</span><h1>Everything<br />APTO,<br /><em>in orbit.</em></h1><p>Move to rotate the system. Scroll inward through tools, evidence, institutions, and technologies.</p><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume orbit" : "Pause orbit"}</button></div>
      <div className="orbit-system" aria-label="Spatial APTO directory" data-local-arrows="true"><div className="orbit-core"><KineticMark /><small>SELECTED</small><strong>{orbitalObjects[selected]}</strong></div>{orbitalObjects.map((item, index) => <button type="button" key={item} className={`orbit-object orbit-object-${index} ${selected === index ? "is-active" : ""}`} onClick={() => setSelected(index)}><span>0{index + 1}</span>{item}</button>)}<i className="orbit-ring ring-one" /><i className="orbit-ring ring-two" /><i className="orbit-ring ring-three" /></div>
      <aside><span>CENTERED OBJECT</span><h2>{orbitalObjects[selected]}</h2><p>{["Explore connected scientific fields and emerging clusters.", "Compare trajectories, horizons, assumptions, and uncertainty.", "Open linked science-of-science resources.", "Read findings with methods and provenance."][selected % 4]}</p><button type="button">Open this object →</button></aside>
    </div></section>
    <section className="orbit-list-fallback">{orbitalObjects.map((item, index) => <button type="button" key={item} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item}<i>↗</i></button>)}</section>
  </div>;
}

export function ScrollCircuit() {
  const root = useKineticMotion();
  const [branch, setBranch] = useState(0);
  const [paused, setPaused] = useState(false);
  return <div ref={root} className={`concept concept-circuit kinetic-page ${paused ? "is-paused" : ""}`}>
    <KineticHeader number="25" title="SCROLL CIRCUIT" tag="Scroll powers the pathway" />
    <section className="circuit-scroll"><div className="circuit-stage kinetic-sticky">
      <div className="circuit-copy"><span>APTO OPERATING SYSTEM</span><h1>Power the<br /><em>pathway.</em></h1><p>Scroll to send a signal from raw data through measurement, models, tools, and decisions.</p><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume pulse" : "Pause pulse"}</button></div>
      <div className="circuit-board" aria-label="Five-stage APTO pathway"><div className="circuit-trace"><i /></div>{evidenceStages.map((item, index) => <button type="button" key={item} className={`circuit-node circuit-node-${index}`} onClick={() => scrollToStage(index)}><span>0{index + 1}</span><strong>{item}</strong><small>{["Aggregate", "Link", "Measure", "Predict", "Act"][index]}</small></button>)}<div className="circuit-pulse" /></div>
      <div className="circuit-branches" data-local-arrows="true"><span>CHOOSE A BRANCH</span>{["Researcher", "Policymaker", "Public"].map((item, index) => <button type="button" key={item} className={branch === index ? "is-active" : ""} onClick={() => setBranch(index)}>{item}</button>)}</div>
      <aside><span>ACTIVE ROUTE</span><strong>{["Methods → open data", "Forecasts → decisions", "Stories → exploration"][branch]}</strong></aside>
    </div></section>
  </div>;
}

const mosaicCards = [
  ["Forecast", "What could this technology do next?", "#ff554a"], ["Map", "Where are signals forming?", "#2847d8"], ["Evidence", "What supports this claim?", "#f5c53d"], ["Data", "Which resources are open?", "#63d5b5"], ["People", "Who is building the observatory?", "#a783ff"], ["Results", "What is APTO learning?", "#f08b4f"],
] as const;

function MagneticCard({ item, index, selected, onSelect }: { item: readonly [string, string, string]; index: number; selected: boolean; onSelect: () => void }) {
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    event.currentTarget.style.setProperty("--card-rx", `${y * -9}deg`);
    event.currentTarget.style.setProperty("--card-ry", `${x * 12}deg`);
    event.currentTarget.style.setProperty("--card-x", `${x * 13}px`);
    event.currentTarget.style.setProperty("--card-y", `${y * 13}px`);
  };
  const reset = (event: ReactPointerEvent<HTMLButtonElement>) => { event.currentTarget.style.removeProperty("--card-rx"); event.currentTarget.style.removeProperty("--card-ry"); event.currentTarget.style.removeProperty("--card-x"); event.currentTarget.style.removeProperty("--card-y"); };
  return <button type="button" className={`magnet-card magnet-card-${index} ${selected ? "is-active" : ""}`} style={{ "--card-color": item[2] } as CSSProperties} onPointerMove={move} onPointerLeave={reset} onClick={onSelect}><span>0{index + 1} / {item[0]}</span><h2>{item[1]}</h2><div><i>Related edges appear near the pointer</i><b>Open ↗</b></div></button>;
}

export function MagneticMosaic() {
  const root = useKineticMotion();
  const [group, setGroup] = useState(0);
  const [selected, setSelected] = useState(0);
  return <div ref={root} className={`concept concept-magnet kinetic-page magnet-group-${group}`}>
    <KineticHeader number="26" title="MAGNETIC MOSAIC" dark tag="Pointer-reactive DOM" />
    <section className="magnet-intro"><div><MotionTag>Move across the grid</MotionTag><h1>Find what<br /><em>connects.</em></h1></div><p>Every tile is useful navigation. Nearby relationships surface as the grid leans toward your pointer.</p><fieldset><legend>Arrange by</legend>{["Question", "Institution", "Maturity", "Evidence"].map((item, index) => <button type="button" key={item} className={group === index ? "is-active" : ""} onClick={() => setGroup(index)}>{item}</button>)}</fieldset></section>
    <section className="magnet-grid" data-local-arrows="true">{mosaicCards.map((item, index) => <MagneticCard key={item[0]} item={item} index={index} selected={selected === index} onSelect={() => setSelected(index)} />)}</section>
    <section className="magnet-relationship"><span>SELECTED TILE</span><strong>{mosaicCards[selected][0]}</strong><p>{mosaicCards[selected][1]} It connects to {selected % 2 ? "three tools and two methods" : "two datasets and four teams"} in this illustrative interface.</p></section>
  </div>;
}

export function DataVortex() {
  const root = useKineticMotion();
  const [paused, setPaused] = useState(false);
  const [layer, setLayer] = useState(0);
  return <div ref={root} className={`concept concept-vortex kinetic-page ${paused ? "is-paused" : ""}`}>
    <KineticHeader number="27" title="DATA VORTEX" tag="WebGL signal tunnel" />
    <section className="vortex-scroll"><div className="vortex-stage kinetic-sticky">
      <WebGLField mode="vortex" paused={paused} colors={["#ff6a35", "#8c52ff", "#50e4ff"]} intensity={1.55} showBadge />
      <div className="vortex-copy"><span>FOLLOW A TECHNOLOGY THROUGH THE EVIDENCE</span><h1>Enter the<br /><em>signal stream.</em></h1><p>Move to steer the turbulence. Scroll through observations, patterns, forecasts, and decisions.</p><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume flight" : "Freeze time slice"}</button></div>
      <div className="vortex-crosshair" aria-hidden="true"><i /><i /><span>{String(layer + 1).padStart(2, "0")}</span></div>
      <nav className="vortex-layers" aria-label="Evidence layers" data-local-arrows="true">{["Observations", "Patterns", "Forecasts", "Decisions"].map((item, index) => <button type="button" key={item} className={layer === index ? "is-active" : ""} onClick={() => { setLayer(index); scrollToStage(index, 4); }}><span>0{index + 1}</span>{item}</button>)}</nav>
      <aside><span>TIME SLICE</span><strong>{["Raw signals", "Structured dynamics", "Model comparison", "Decision context"][layer]}</strong><p>Space freezes into a readable chapter on request.</p></aside>
    </div></section>
  </div>;
}

const morphStates = ["Emerging field", "Competing ridges", "Branching system", "Mature network"];
export function MorphicFrontier() {
  const root = useKineticMotion();
  const [paused, setPaused] = useState(false);
  const [shape, setShape] = useState(0);
  return <div ref={root} className={`concept concept-morph kinetic-page morph-state-${shape} ${paused ? "is-paused" : ""}`}>
    <KineticHeader number="28" title="MORPHIC FRONTIER" dark tag="Live WebGL surface" />
    <section className="morph-scroll"><div className="morph-stage kinetic-sticky">
      <WebGLField mode="morph" paused={paused} colors={["#eaf1ff", "#5365d8", "#ff4f2f"]} intensity={1.25 + shape * .18} showBadge />
      <div className="morph-copy"><span>DEVELOPMENT IS A CHANGING STRUCTURE</span><h1>Shape the<br /><em>frontier.</em></h1><p>Scroll to transform an emerging field into a mature technology system. Move to pull the surface.</p><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume morph" : "Hold this form"}</button></div>
      <div className="morph-labels" aria-hidden="true"><span>knowledge</span><span>capability</span><span>translation</span><span>use</span></div>
      <nav className="morph-controls" aria-label="Frontier forms" data-local-arrows="true">{morphStates.map((item, index) => <button type="button" key={item} className={shape === index ? "is-active" : ""} onClick={() => { setShape(index); scrollToStage(index, 4); }}><span>0{index + 1}</span>{item}</button>)}</nav>
      <aside><span>CURRENT FORM</span><strong>{morphStates[shape]}</strong><p>Illustrative structural metaphor · labels remain available in the DOM.</p></aside>
    </div></section>
  </div>;
}

const rooms = [
  ["ENTRANCE", "The APTO program"], ["MAP ROOM", "Fields and emerging clusters"], ["FORECAST THEATER", "Models and scenarios"], ["EVIDENCE GALLERY", "Results and methods"], ["OPEN STACKS", "Datasets and publications"], ["NETWORK HALL", "People and institutions"],
] as const;
export function InfiniteObservatory() {
  const root = useKineticMotion();
  const [room, setRoom] = useState(0);
  return <div ref={root} className="concept concept-infinite kinetic-page">
    <KineticHeader number="29" title="INFINITE OBSERVATORY" tag="Spatial scroll architecture" />
    <section className="infinite-scroll"><div className="infinite-stage kinetic-sticky">
      <div className="infinite-sky" aria-hidden="true"><i /><i /><i /></div>
      <div className="infinite-copy"><span>A VIRTUAL INSTITUTION FOR TECHNOLOGY FUTURES</span><h1>Enter the<br /><em>observatory.</em></h1><p>Scroll forward through rooms for tools, evidence, data, and the national network.</p><button type="button" onClick={() => { setRoom(Math.min(rooms.length - 1, room + 1)); scrollToStage(Math.min(rooms.length - 1, room + 1), rooms.length); }}>Enter room →</button></div>
      <div className="infinite-corridor" style={{ "--active-room": room } as CSSProperties}>{rooms.map((item, index) => <button type="button" key={item[0]} className={`infinite-room room-${index} ${room === index ? "is-active" : ""}`} onClick={() => { setRoom(index); scrollToStage(index, rooms.length); }}><span>ROOM {String(index + 1).padStart(2, "0")}</span><strong>{item[0]}</strong><small>{item[1]}</small><i>Enter ↗</i></button>)}</div>
      <nav className="infinite-minimap" aria-label="Observatory rooms" data-local-arrows="true"><span>{String(room + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}</span>{rooms.map((item, index) => <button type="button" key={item[0]} className={room === index ? "is-active" : ""} onClick={() => { setRoom(index); scrollToStage(index, rooms.length); }} aria-label={`Go to ${item[0]}`} />)}<button type="button" onClick={() => { setRoom(0); scrollToStage(0, rooms.length); }}>Return to entrance</button></nav>
    </div></section>
    <section className="infinite-directory"><span>COMPLETE ROOM DIRECTORY</span>{rooms.map((item, index) => <button type="button" key={item[0]} onClick={() => { setRoom(index); scrollToStage(index, rooms.length); }}><b>0{index + 1}</b><strong>{item[0]}</strong><small>{item[1]}</small><i>→</i></button>)}</section>
  </div>;
}

const droplets = ["Funding", "Papers", "Patents", "Models", "Outcomes"];
export function LiquidEvidence() {
  const root = useKineticMotion();
  const [paused, setPaused] = useState(false);
  const [viscosity, setViscosity] = useState(48);
  const [selected, setSelected] = useState(0);
  return <div ref={root} className={`concept concept-liquid kinetic-page ${paused ? "is-paused" : ""}`}>
    <KineticHeader number="30" title="LIQUID EVIDENCE" dark tag="GPU fluid metaphor" />
    <section className="liquid-scroll"><div className="liquid-stage kinetic-sticky">
      <WebGLField mode="liquid" paused={paused} intensity={.7 + viscosity / 55} colors={["#9eff38", "#3471ff", "#ff6253"]} showBadge />
      <div className="liquid-copy"><span>RAW SIGNALS BECOME SYNTHESIZED EVIDENCE</span><h1>Stir the<br /><em>evidence.</em></h1><p>Move to disturb the reservoir. Scroll to change how separate streams combine while provenance stays visible.</p></div>
      <div className="liquid-drops" data-local-arrows="true">{droplets.map((item, index) => <button type="button" key={item} className={`drop-${index} ${selected === index ? "is-active" : ""}`} onClick={() => setSelected(index)}><i /><span>{item}</span></button>)}</div>
      <div className="liquid-controls"><label>Viscosity <strong>{viscosity}%</strong><input type="range" min="10" max="90" value={viscosity} onChange={(event) => setViscosity(Number(event.target.value))} /></label><button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume fluid" : "Pause fluid"}</button><article><span>SELECTED SOURCE</span><strong>{droplets[selected]}</strong><p>{["Public awards and institutional investment", "Linked scientific knowledge", "Possible translation signals", "Forecast assumptions and disagreement", "Capability, production, and use"][selected]}</p></article></div>
    </div></section>
    <section className="liquid-fallback">{droplets.map((item, index) => <article key={item}><span>0{index + 1}</span><i className={`pattern-${index}`} /><strong>{item}</strong><p>Provenance and access status travel with this stream.</p></article>)}</section>
  </div>;
}

export function KineticMockup({ id }: { id: KineticId }) {
  switch (id) {
    case "gravity": return <GravityField />;
    case "deepzoom": return <DeepZoom />;
    case "prism": return <PrismEngine />;
    case "orbit": return <OrbitalIndex />;
    case "circuit": return <ScrollCircuit />;
    case "magnet": return <MagneticMosaic />;
    case "vortex": return <DataVortex />;
    case "morph": return <MorphicFrontier />;
    case "infinite": return <InfiniteObservatory />;
    case "liquid": return <LiquidEvidence />;
  }
}
