import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the APTO design gallery", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>APTO Website Direction Study<\/title>/i);
  assert.match(html, /Fifty-three possible/);
  assert.match(html, /front doors to/);
  assert.match(html, /Civic Observatory/);
  assert.match(html, /Signal Story/);
  assert.match(html, /Gravity Field/);
  assert.match(html, /Motion and spatial worlds/);
  assert.match(html, /APTO Trendroom/);
  assert.match(html, /Technology portfolio front doors/);
  assert.match(html, /Widget Harbor/);
  assert.match(html, /Composable widget worlds/);
  assert.match(html, /NSF APTO Program Home/);
  assert.match(html, /APTO Evidence Ledger/);
  assert.match(html, /APTO Cohort Network/);
  assert.match(html, /NSF-aligned program directions/);
  assert.equal((html.match(/concept-card card-/g) ?? []).length, 53);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships fifty-three concepts, responsive behavior, and APTO assets", async () => {
  const [source, interactiveSource, kineticSource, portfolioSource, widgetSource, engines, styles, kineticStyles, portfolioStyles, widgetStyles, packageJson] = await Promise.all([
    readFile(new URL("../app/mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/interactive-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/kinetic-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/widget-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/kinetic-engines.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/kinetic-mockups.css", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-mockups.css", import.meta.url), "utf8"),
    readFile(new URL("../app/widget-mockups.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const id of [
    "civic",
    "mission",
    "map",
    "atlas",
    "forecast",
    "archive",
    "beautiful",
    "editorial",
    "commons",
    "story",
    "timefold",
    "lens",
    "builder",
    "weather",
    "whatif",
    "xray",
    "terrain",
    "symphony",
    "passport",
    "loom",
    "gravity",
    "deepzoom",
    "prism",
    "orbit",
    "circuit",
    "magnet",
    "vortex",
    "morph",
    "infinite",
    "liquid",
    "pulseboard",
    "signalgrid",
    "horizon",
    "leaderboard",
    "weatherboard",
    "constellation",
    "newsroom",
    "matrix",
    "exchange",
    "watchtower",
    "widgetdock",
    "widgetcanvas",
    "widgetrail",
    "widgetos",
    "widgetbrief",
    "widgetglass",
    "widgetnotebook",
    "widgetspatial",
    "widgetcivic",
    "widgethome",
    "nsfhome",
    "nsfledger",
    "nsfnetwork",
  ]) {
    assert.match(source, new RegExp(`case \\\"${id}\\\"`));
  }

  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(kineticStyles, /@media \(max-width:\s*760px\)/);
  assert.match(kineticStyles, /prefers-reduced-motion/);
  assert.match(kineticStyles, /kinetic-fallback-list/);
  assert.match(portfolioStyles, /@media \(max-width:\s*760px\)/);
  assert.match(portfolioStyles, /prefers-reduced-motion/);
  assert.match(widgetStyles, /@media \(max-width:\s*760px\)/);
  assert.match(widgetStyles, /@media \(max-width:\s*860px\)/);
  assert.match(widgetStyles, /prefers-reduced-motion/);
  assert.match(source, /Increase forecast horizon/);
  assert.match(source, /Public explorers use verified open resources/);
  assert.match(source, /lazy\(\(\) => import\("\.\/kinetic-mockups"\)/);
  assert.match(source, /lazy\(\(\) => import\("\.\/portfolio-mockups"\)/);
  assert.match(source, /lazy\(\(\) => import\("\.\/widget-mockups"\)/);
  assert.match(source, /lazy\(\(\) => import\("\.\/nsf-apto-mockups"\)/);
  assert.match(interactiveSource, /Hear the data/);
  assert.match(interactiveSource, /Show all evidence/);
  assert.match(interactiveSource, /RUN SCENARIO/);
  assert.match(kineticSource, /Scroll to dive/);
  assert.match(kineticSource, /Pause field/);
  assert.match(kineticSource, /Enter room/);
  assert.match(portfolioSource, /Top technologies we are tracking/i);
  assert.match(portfolioSource, /Illustrative/i);
  assert.match(widgetSource, /MAP OF SCIENCE/);
  assert.match(widgetSource, /TECHNOLOGY TRAJECTORIES/);
  assert.match(widgetSource, /Illustrative model score — not a legal patentability determination\./);
  assert.match(widgetSource, /Illustrative interface — demo values are not APTO findings\./);
  assert.match(widgetSource, /18.*partner universities · Feb 2026/);
  assert.match(widgetSource, /Standardize data-use agreements and governance/);
  assert.match(widgetSource, /Software-use trajectories/);
  assert.doesNotMatch(widgetSource, /20.*partner universities/);
  assert.match(widgetSource, /role="group"/);
  assert.match(widgetSource, /aria-pressed/);
  assert.match(widgetSource, /data-local-arrows="true"/);
  assert.match(widgetSource, /widget-science-map-image/);
  assert.match(widgetStyles, /\/apto\/science-map\.png/);
  assert.match(engines, /webgl2/);
  assert.match(engines, /webgpu/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  for (const asset of [
    "science-map.png",
    "pce-prediction.png",
    "model-scale.png",
    "team.png",
  ]) {
    await access(new URL(`../public/apto/${asset}`, import.meta.url));
  }

  await assert.rejects(access(new URL("../app/_sites-preview", root)));
});

test("ships three source-grounded, accessible NSF APTO directions", async () => {
  const [nsfSource, nsfData, nsfStyles] = await Promise.all([
    readFile(new URL("../app/nsf-apto-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-mockups.css", import.meta.url), "utf8"),
  ]);

  for (const id of ["nsfhome", "nsfledger", "nsfnetwork"]) {
    assert.match(nsfSource, new RegExp(`case \\\"${id}\\\"`));
    assert.match(nsfSource, new RegExp(`id: NsfAptoMockupId = \\\"${id}\\\"`));
  }

  const projectsBlock = nsfData.slice(
    nsfData.indexOf("export const aptoProjects"),
    nsfData.indexOf("export const aptoProgram"),
  );
  assert.equal((projectsBlock.match(/officialTitle:/g) ?? []).length, 5);

  const projects = [
    ["2404035", "APTO: Measuring, Understanding, Predicting, and Accelerating Technology Outcomes"],
    ["2404109", "APTO: Collaborative Research: Global Observatory and Virtual Laboratory for Science and Technology Advance"],
    ["2403999", "APTO: A firm-level model of technological improvement, production and diffusion in the energy sector"],
    ["2403911", "APTO: Constructing causal knowledge graphs for assessing and predicting technology outcomes"],
    ["2404082", "APTO: Problem-Focused Analysis for Predicting Technology Outcomes and Leverage Points"],
  ];
  for (const [awardId, title] of projects) {
    assert.match(projectsBlock, new RegExp(`awardId: \\\"${awardId}\\\"`));
    assert.ok(projectsBlock.includes(title));
  }

  for (const person of [
    "Dashun Wang",
    "Alicia I. Loffler",
    "Jian Cao",
    "Benjamin Jones",
    "Yian Yin",
    "James Evans",
    "Ian Foster",
    "Ufuk Akcigit",
    "James Farmer",
    "Daniel Eichelsdoerfer",
    "Jinfeng Zhang",
    "Jonathan Fegely",
  ]) {
    assert.ok(nsfData.includes(`name: "${person}"`));
  }

  for (const organizationUrl of [
    "https://www.northwestern.edu/",
    "https://www.uchicago.edu/",
    "https://macrocosm.group/",
    "https://insilicom.com/",
    "https://www.aperture.ai/",
  ]) {
    assert.ok(nsfData.includes(`website: "${organizationUrl}"`));
    assert.ok(nsfData.includes(`organizationUrl: "${organizationUrl}"`));
  }

  const toolsBlock = nsfData.slice(
    nsfData.indexOf("export const aptoMockTools"),
    nsfData.indexOf("export const aptoParticipants"),
  );
  assert.equal((toolsBlock.match(/isConceptOnly: true/g) ?? []).length, 10);
  assert.equal((toolsBlock.match(/status: "Concept only · not a released tool"/g) ?? []).length, 10);
  for (const participantId of ["northwestern", "uchicago", "macrocosm", "insilicom", "aperture"]) {
    assert.equal(
      (toolsBlock.match(new RegExp(`participantId: \\\"${participantId}\\\"`, "g")) ?? []).length,
      2,
    );
  }
  for (const toolName of [
    "Research-to-Market Navigator",
    "Technology Trajectory Forecaster",
    "Global S&T Observatory",
    "Virtual Policy Laboratory",
    "Energy System Digital Twin",
    "Policy & Investment Scenario Lab",
    "Causal Technology Knowledge Graph",
    "Evidence Extraction Workbench",
    "Problem Landscape Explorer",
    "Leverage Point Finder",
  ]) {
    assert.ok(toolsBlock.includes(`name: "${toolName}"`));
  }

  assert.match(nsfData, /Demo video placeholder/);
  assert.match(nsfData, /Tool link coming soon/);
  assert.match(nsfSource, /Headshot placeholder/);
  assert.match(nsfSource, /Mock content/);
  assert.match(nsfData, /Concept only/);
  assert.ok(nsfData.includes(
    "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.",
  ));

  assert.match(nsfSource, /className="nsf-skip-link"/);
  assert.match(nsfSource, /<main id=\{`\$\{id\}-main`\} tabIndex=\{-1\}>/);
  assert.match(nsfSource, /<nav aria-label="Primary navigation">/);
  assert.match(nsfSource, /<footer className="nsf-program-footer">/);
  assert.match(nsfSource, /aria-labelledby/);
  assert.match(nsfSource, /aria-controls/);
  assert.match(nsfSource, /aria-pressed/);
  assert.match(nsfSource, /aria-live="polite"/);
  assert.match(nsfSource, /data-local-arrows="true"/);
  assert.match(nsfSource, /role="group"/);
  assert.match(nsfSource, /role="note"/);
  assert.match(nsfSource, /role="img"/);
  assert.match(nsfSource, /<figure/);
  assert.match(nsfSource, /<figcaption>/);
  assert.match(nsfSource, /<details/);
  assert.match(nsfSource, /<summary>/);
  assert.doesNotMatch(nsfSource, /WidgetDeck|WidgetChooser/);

  assert.match(nsfSource, /\/apto\/nsf-logo\.png/);
  assert.match(nsfSource, /\/apto\/nsf-network-art\.png/);
  assert.match(nsfSource, /alt="U\.S\. National Science Foundation logo"/);
  assert.match(nsfSource, /width="82" height="82"/);
  assert.match(nsfStyles, /\.nsf-apto :focus-visible/);
  assert.match(nsfStyles, /\.nsf-skip-link:focus/);
  assert.match(nsfStyles, /min-height: 44px/);
  assert.match(nsfStyles, /@media \(max-width: 1120px\)/);
  assert.match(nsfStyles, /@media \(max-width: 860px\)/);
  assert.match(nsfStyles, /@media \(max-width: 640px\)/);
  assert.match(nsfStyles, /@media \(prefers-reduced-motion: reduce\)/);

  await access(new URL("../public/apto/nsf-logo.png", import.meta.url));
  await access(new URL("../public/apto/nsf-network-art.png", import.meta.url));
});
