import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const nsfBoilerplate =
  "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.";

const expectedParticipants = [
  "Aperture",
  "Insilicom",
  "Macrocosm",
  "Northwestern University",
  "University of Chicago",
];

const expectedPageSlugs = [
  "/",
  "/about",
  "/cohort",
  "/people",
  "/projects",
  "/tools",
];

const expectedPageNavLabels = [
  "About",
  "Cohort",
  "Home",
  "People",
  "Projects",
  "Tools",
];

const expectedParticipantLogoSources = [
  "/apto/partners/aperture.svg",
  "/apto/partners/insilicom.png",
  "/apto/partners/macrocosm.svg",
  "/apto/partners/northwestern.png",
  "/apto/partners/uchicago.png",
];

const expectedProjects = [
  ["2403999", "APTO: A firm-level model of technological improvement, production and diffusion in the energy sector"],
  ["2404109", "APTO: Collaborative Research: Global Observatory and Virtual Laboratory for Science and Technology Advance"],
  ["2403911", "APTO: Constructing causal knowledge graphs for assessing and predicting technology outcomes"],
  ["2404035", "APTO: Measuring, Understanding, Predicting, and Accelerating Technology Outcomes"],
  ["2404082", "APTO: Problem-Focused Analysis for Predicting Technology Outcomes and Leverage Points"],
];

const expectedPeople = [
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
];

const expectedTools = [
  "Causal Technology Knowledge Graph",
  "Energy System Digital Twin",
  "Evidence Extraction Workbench",
  "Global S&T Observatory",
  "Leverage Point Finder",
  "Policy & Investment Scenario Lab",
  "Problem Landscape Explorer",
  "Research-to-Market Navigator",
  "Technology Trajectory Forecaster",
  "Virtual Policy Laboratory",
];

function compareAlphabetically(left, right) {
  return (
    left.localeCompare(right, "en", { sensitivity: "base" }) ||
    left.localeCompare(right, "en")
  );
}

function sortedAlphabetically(values) {
  return [...values].sort(compareAlphabetically);
}

function projectTitleSortKey(title) {
  return title.replace(/^APTO:\s*/i, "");
}

function parseJsonFrontmatter(source, filename) {
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  assert.ok(match, `${filename} must begin with JSON frontmatter`);
  return JSON.parse(match[1]);
}

function cssRuleBody(styles, selector, fromIndex = 0) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles
    .slice(fromIndex)
    .match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Expected CSS rule for ${selector}`);
  return match[1];
}

function maxPixelValueFor(styles, property) {
  const match = styles.match(new RegExp(`${property}\\s*:\\s*([^;]+);`));
  assert.ok(match, `Expected ${property} declaration`);
  const values = [...match[1].matchAll(/([\d.]+)px/g)].map((value) => Number(value[1]));
  assert.ok(values.length > 0, `Expected ${property} to include a pixel value`);
  return Math.max(...values);
}

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost"), {
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
  assert.match(html, /Fifty-six possible/);
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
  assert.equal((html.match(/concept-card card-/g) ?? []).length, 56);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders a representative explicit APTO route", async () => {
  const response = await render("/apto/projects?concept=nsfledger");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /"pathname":"\/apto\/projects"/);
  assert.match(html, /\[\["concept","nsfledger"\]\]/);
  assert.match(html, /Evidence ledger/);
  assert.match(html, /APTO design directions/);
  assert.match(html, /\/apto\/tools\?concept=nsfledger/);
  assert.doesNotMatch(html, /Official NSF source/i);
});

test("keeps three core APTO homes and adds three matched widget variants", async () => {
  const directions = [
    ["nsfhome", "home", false],
    ["nsfhomewidgets", "home", true],
    ["nsfledger", "ledger", false],
    ["nsfledgerwidgets", "ledger", true],
    ["nsfnetwork", "network", false],
    ["nsfnetworkwidgets", "network", true],
  ];

  for (const [concept, theme, hasWidget] of directions) {
    const response = await render(`/apto?concept=${concept}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`nsf-apto-${theme}`));
    assert.match(html, new RegExp(`\\[\\[\"concept\",\"${concept}\"\\]\\]`));

    if (hasWidget) {
      assert.match(html, /Choose a tool widget/);
      assert.match(html, /Illustrative interface/);
      assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
      assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
      assert.match(html, new RegExp(`/apto/tools\\?concept=${concept}`));
    } else {
      assert.doesNotMatch(html, /Choose a tool widget/);
    }
  }
});

test("ships fifty-six concepts, responsive behavior, and APTO assets", async () => {
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
    "nsfhomewidgets",
    "nsfledger",
    "nsfledgerwidgets",
    "nsfnetwork",
    "nsfnetworkwidgets",
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
  const [nsfSource, nsfStyles, generatedJson, routePageSource] = await Promise.all([
    readFile(new URL("../app/nsf-apto-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-mockups.css", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/_route-page.tsx", import.meta.url), "utf8"),
  ]);
  const content = JSON.parse(generatedJson);

  assert.match(nsfSource, /export function NsfAptoPage\(/);
  assert.match(nsfSource, /return <NsfAptoPage id=\{id\} section="home" embedded \/>/);
  assert.match(nsfSource, /\/apto\$\{path/);
  assert.match(nsfSource, /\?concept=\$\{id\}/);
  assert.match(routePageSource, /return <NsfAptoPage id=\{conceptId\} section=\{section\} \/>/);
  assert.match(routePageSource, /: "nsfhome"/);
  for (const id of ["nsfhome", "nsfhomewidgets", "nsfledger", "nsfledgerwidgets", "nsfnetwork", "nsfnetworkwidgets"]) {
    assert.match(routePageSource, new RegExp(`\\"${id}\\"`));
  }

  const routeSpecs = [
    ["page.tsx", "home", "Program home"],
    ["about/page.tsx", "about", "About the program"],
    ["cohort/page.tsx", "cohort", "Participating organizations"],
    ["people/page.tsx", "people", "People"],
    ["projects/page.tsx", "projects", "Projects"],
    ["tools/page.tsx", "tools", "Tools"],
  ];
  const routeSources = await Promise.all(
    routeSpecs.map(([file]) =>
      readFile(new URL(`../app/apto/${file}`, import.meta.url), "utf8"),
    ),
  );
  routeSpecs.forEach(([, section, title], index) => {
    assert.match(
      routeSources[index],
      new RegExp(`<AptoRoutePage section=\\"${section}\\"`),
    );
    assert.match(routeSources[index], new RegExp(`title: \\"${title}\\"`));
  });
  await assert.rejects(
    access(new URL("../app/apto/sources/page.tsx", import.meta.url)),
  );

  assert.deepEqual(
    content.pages.map((page) => page.navLabel),
    expectedPageNavLabels,
  );
  assert.deepEqual(
    content.pages.map((page) => page.slug).sort(),
    expectedPageSlugs,
  );
  assert.equal(new Set(content.pages.map((page) => page.slug)).size, 6);
  for (const page of content.pages) {
    assert.ok(page.eyebrow.trim().length > 0);
    assert.ok(page.title.trim().length > 0);
    assert.ok(page.introduction.trim().length > 0);
  }

  assert.deepEqual(
    content.participants.map((participant) => participant.displayName),
    expectedParticipants,
  );
  assert.deepEqual(
    content.participants.map((participant) => participant.logo.src),
    expectedParticipantLogoSources,
  );
  assert.equal(new Set(content.participants.map((participant) => participant.logo.src)).size, 5);
  for (const participant of content.participants) {
    const { logo } = participant;
    assert.ok(Number.isFinite(logo.width) && logo.width > 0);
    assert.ok(Number.isFinite(logo.height) && logo.height > 0);
    assert.ok(["light", "dark"].includes(logo.surface));
    assert.ok(["symbol", "wordmark"].includes(logo.kind));
    assert.equal(new URL(logo.sourceUrl).protocol, "https:");
    assert.ok(logo.sourceLabel.trim().length > 0);
    assert.equal(logo.status, "approval-required/mockup");
    assert.equal(logo.approved, false);
    await access(new URL(`../public${logo.src}`, import.meta.url));
  }
  assert.equal(content.projects.length, 5);
  for (const [awardId, title] of expectedProjects) {
    const project = content.projects.find((item) => item.awardId === awardId);
    assert.ok(project, `Expected NSF award ${awardId}`);
    assert.equal(project.officialTitle, title);
  }
  assert.deepEqual(
    content.projects.map((project) => project.officialTitle),
    expectedProjects.map(([, title]) => title),
  );
  const projectSortKeys = content.projects.map((project) =>
    projectTitleSortKey(project.officialTitle),
  );
  assert.deepEqual(projectSortKeys, sortedAlphabetically(projectSortKeys));

  const people = content.participants.flatMap((participant) =>
    participant.people.map((person) => person.name),
  );
  for (const person of expectedPeople) {
    assert.ok(people.includes(person), `Expected APTO team member ${person}`);
  }

  for (const organizationUrl of [
    "https://www.northwestern.edu/",
    "https://www.uchicago.edu/",
    "https://macrocosm.group/",
    "https://insilicom.com/",
    "https://www.aperture.ai/",
  ]) {
    assert.ok(content.participants.some((participant) => participant.website === organizationUrl));
    assert.equal(
      content.tools.filter((tool) => tool.organizationUrl === organizationUrl).length,
      2,
    );
  }

  assert.equal(content.tools.filter((tool) => tool.isConceptOnly === true).length, 10);
  assert.equal(
    content.tools.filter((tool) => tool.status === "Concept only · not a released tool").length,
    10,
  );
  for (const participantId of ["northwestern", "uchicago", "macrocosm", "insilicom", "aperture"]) {
    assert.equal(
      content.tools.filter((tool) => tool.participantId === participantId).length,
      2,
    );
  }
  for (const toolName of expectedTools) {
    assert.ok(content.tools.some((tool) => tool.name === toolName));
  }
  assert.deepEqual(
    content.tools.map((tool) => tool.name),
    expectedTools,
  );
  const sourceLabels = content.sources.map((source) => source.label);
  assert.deepEqual(sourceLabels, sortedAlphabetically(sourceLabels));
  for (const participant of content.participants) {
    const participantPeople = participant.people.map((person) => person.name);
    assert.deepEqual(
      participantPeople,
      sortedAlphabetically(participantPeople),
      `${participant.displayName} people must be alphabetic`,
    );
    const embeddedToolNames = participant.tools.map((tool) => tool.name);
    assert.deepEqual(
      embeddedToolNames,
      sortedAlphabetically(embeddedToolNames),
      `${participant.displayName} tools must be alphabetic`,
    );
  }

  assert.equal(content.tools.filter((tool) => tool.demoVideoLabel === "Demo video placeholder").length, 10);
  assert.equal(content.tools.filter((tool) => tool.toolLinkLabel === "Tool link coming soon").length, 10);
  assert.match(nsfSource, /Portrait forthcoming/);
  assert.match(nsfSource, /Mock content/);
  assert.ok(content.tools.every((tool) => tool.status.includes("Concept only")));
  assert.equal(content.boilerplate, nsfBoilerplate);

  assert.doesNotMatch(nsfSource, /Official NSF source/i);
  assert.doesNotMatch(nsfSource, /Prototype accessibility approach|NSF brand policy|Brand application draft/);
  assert.doesNotMatch(nsfSource, /Technology areas named by NSF|<h2>Open access<\/h2>/);
  assert.doesNotMatch(nsfSource, /Filter projects by participant|Showing all APTO projects/);
  assert.doesNotMatch(nsfStyles, /\.nsf-program-notes/);
  assert.doesNotMatch(nsfSource, /Design concept/i);
  assert.doesNotMatch(nsfSource, /nsf-project-orbit|nsf-participant-node/);
  assert.doesNotMatch(nsfSource, /aptoParticipants\.map\(\s*\(participant,\s*index\)/);
  assert.doesNotMatch(nsfSource, /\baptoSources\b/);
  assert.doesNotMatch(nsfSource, /String\(index \+ 1\)\.padStart/);
  assert.doesNotMatch(nsfSource, /nsf-logo-link|nsf-header-source/);
  for (const className of [
    "nsf-participant-directory",
    "nsf-participant-entry",
    "nsf-funder-mark",
    "nsf-funder-copy",
  ]) {
    assert.match(nsfSource, new RegExp(`className=\"${className}\"`));
  }
  assert.match(nsfSource, /nsf-participant-mark is-\$\{size\}/);
  assert.match(nsfSource, /tone: "light" \| "dark"/);
  assert.match(nsfSource, /tone=\{direction === "network" \? "dark" : "light"\}/);
  assert.match(nsfSource, /size="compact" tone="dark"/);
  assert.match(nsfSource, /tone=\{prominent \? "dark" : "light"\}/);
  assert.equal(
    (nsfSource.match(/const tone = directionFor\(id\) === "network" \? "dark" : "light";/g) ?? []).length,
    2,
  );
  assert.match(nsfSource, /<ProjectCard key=\{project\.awardId\} project=\{project\} tone=\{tone\} \/>/);
  assert.match(nsfSource, /size="compact" tone=\{tone\}/);
  assert.match(nsfSource, /function NsfHeroToolWidget/);
  assert.match(nsfSource, /role="tablist"/);
  assert.match(nsfSource, /role="tabpanel"/);
  assert.match(nsfSource, /aria-selected=\{active === item\.id\}/);
  assert.match(nsfSource, /id: "emerging"[\s\S]*id: "map"[\s\S]*id: "patent"[\s\S]*id: "trajectories"/);
  assert.match(nsfSource, /hasHeroWidgets\(id\) \? <NsfHeroToolWidget/);

  const networkThemeRule = cssRuleBody(nsfStyles, ".nsf-apto-network");
  assert.match(networkThemeRule, /--nsf-network-canvas:\s*#031138/);
  assert.match(networkThemeRule, /--nsf-network-line:\s*#667b98/);
  assert.match(networkThemeRule, /--nsf-paper:\s*var\(--nsf-network-canvas\)/);
  assert.match(networkThemeRule, /background:\s*var\(--nsf-network-canvas\)/);
  for (const selector of [
    ".nsf-apto-network .nsf-program-overview",
    ".nsf-apto-network .nsf-projects-section",
    ".nsf-apto-network .nsf-people-section",
  ]) {
    assert.match(nsfStyles, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(nsfStyles, /\.nsf-apto-network \.nsf-overview-framework[\s\S]*#241840/);
  assert.match(nsfStyles, /\.nsf-participant-mark\.tone-dark\.is-fallback\s*\{\s*color:\s*#fff/);
  for (const selector of [
    ".nsf-hero-widget",
    ".nsf-hero-widget-tabs",
    ".nsf-hero-widget-panel",
    ".nsf-widget-science-map",
    ".nsf-widget-trajectory-grid",
  ]) {
    cssRuleBody(nsfStyles, selector);
  }

  const headerStart = nsfSource.indexOf("function NsfProgramHeader");
  const heroStart = nsfSource.indexOf("function CompactProgramHero");
  const footerStart = nsfSource.indexOf("function NsfAcknowledgementFooter");
  const logoStart = nsfSource.indexOf("/apto/nsf-logo.png");
  assert.ok(headerStart >= 0 && heroStart > headerStart);
  assert.doesNotMatch(nsfSource.slice(headerStart, heroStart), /nsf-logo\.png/);
  assert.ok(footerStart >= 0 && logoStart > footerStart, "NSF logo must live in the funder footer");

  assert.match(nsfSource, /className="nsf-skip-link"/);
  const pageComponent = nsfSource.slice(
    nsfSource.indexOf("export function NsfAptoPage"),
    nsfSource.indexOf("export function NsfAptoMockup"),
  );
  assert.ok(
    pageComponent.indexOf("nsf-skip-link") < pageComponent.indexOf("NsfDirectionStudyBar"),
    "the skip link must precede the routed design-direction controls",
  );
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
  assert.match(nsfSource, /width="64" height="64"/);
  assert.match(nsfStyles, /\.nsf-apto :focus-visible/);
  assert.match(nsfStyles, /\.nsf-skip-link:focus/);
  assert.match(nsfStyles, /min-height: 44px/);
  assert.match(nsfStyles, /@media \(max-width: 1120px\)/);
  assert.match(nsfStyles, /@media \(max-width: 860px\)/);
  assert.match(nsfStyles, /@media \(max-width: 640px\)/);
  assert.match(nsfStyles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(nsfStyles, /\.nsf-participant-mark\.tone-light/);
  assert.match(nsfStyles, /\.nsf-participant-mark\.tone-dark/);
  assert.match(nsfStyles, /\.tone-light\.logo-macrocosm img/);
  assert.match(nsfStyles, /\.tone-light\.logo-aperture img/);
  assert.match(nsfStyles, /\.tone-dark\.logo-uchicago img/);
  assert.match(nsfStyles, /\.tone-dark\.logo-northwestern img/);
  assert.doesNotMatch(nsfStyles, /\.nsf-participant-mark\.on-dark\s*\{/);

  assert.doesNotMatch(nsfStyles, /\.(?:nsf-)?participant-[1-9]\b/);
  assert.doesNotMatch(nsfStyles, /\.nsf-project-orbit|\.nsf-participant-node/);
  assert.doesNotMatch(nsfStyles, /\.nsf-project-card:nth-child/);
  assert.doesNotMatch(nsfStyles, /border-top:\s*(?:6|7|8|12)px\b/i);
  assert.doesNotMatch(nsfStyles, /\.nsf-logo-link|\.nsf-header-source/);

  // These selector groups implement the open editorial rows, visual tool
  // workbench, and program/participant constellation language.
  for (const selector of [
    ".nsf-project-grid",
    ".nsf-project-heading",
    ".nsf-project-body",
    ".nsf-tool-grid",
    ".nsf-tool-copy",
    ".nsf-tool-figure",
    ".nsf-outcome-lens",
    ".nsf-participant-directory",
    ".nsf-participant-mark",
  ]) {
    cssRuleBody(nsfStyles, selector);
  }
  const projectRowRule = cssRuleBody(nsfStyles, ".nsf-project-card");
  assert.match(projectRowRule, /display:\s*grid/);
  assert.match(projectRowRule, /border-bottom:\s*1px/);
  assert.doesNotMatch(projectRowRule, /border-top/);
  const toolWorkbenchRule = cssRuleBody(nsfStyles, ".nsf-tool-card");
  assert.match(toolWorkbenchRule, /display:\s*grid/);
  assert.match(toolWorkbenchRule, /border-top:\s*1px/);

  const heroRule = cssRuleBody(nsfStyles, ".nsf-program-hero");
  assert.match(heroRule, /min-height:\s*400px/);
  const desktopHeadingRule = cssRuleBody(nsfStyles, ".nsf-hero-copy h1");
  assert.ok(maxPixelValueFor(desktopHeadingRule, "font-size") <= 44);
  const mobileBreakpoint = nsfStyles.indexOf("@media (max-width: 640px)");
  assert.notEqual(mobileBreakpoint, -1);
  const mobileHeadingRule = cssRuleBody(nsfStyles, ".nsf-hero-copy h1", mobileBreakpoint);
  assert.ok(maxPixelValueFor(mobileHeadingRule, "font-size") <= 34);

  await access(new URL("../public/apto/nsf-logo.png", import.meta.url));
  await access(new URL("../public/apto/nsf-network-art.png", import.meta.url));
});

test("builds the NSF APTO content artifact from the Markdown source of truth", async () => {
  const contentRoot = new URL("../content/apto/", import.meta.url);
  const [contentEntries, pageEntries, projectEntries, toolEntries, generatedJson, nsfData, generator, packageJson] =
    await Promise.all([
      readdir(contentRoot, { withFileTypes: true }),
      readdir(new URL("pages/", contentRoot), { withFileTypes: true }),
      readdir(new URL("projects/", contentRoot), { withFileTypes: true }),
      readdir(new URL("tools/", contentRoot), { withFileTypes: true }),
      readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
      readFile(new URL("../app/nsf-apto-data.ts", import.meta.url), "utf8"),
      readFile(new URL("../scripts/build-apto-content.mjs", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
    ]);

  const markdownFiles = (entries) =>
    entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  const pageMarkdownFiles = markdownFiles(pageEntries);
  const projectMarkdownFiles = markdownFiles(projectEntries);
  const toolMarkdownFiles = markdownFiles(toolEntries);
  assert.equal(
    markdownFiles(contentEntries).filter((entry) => entry.name === "program.md").length,
    1,
  );
  assert.deepEqual(
    sortedAlphabetically(pageMarkdownFiles.map((entry) => entry.name)),
    [
      "about.md",
      "cohort.md",
      "home.md",
      "people.md",
      "projects.md",
      "tools.md",
    ],
  );
  assert.equal(projectMarkdownFiles.length, 5);
  assert.equal(toolMarkdownFiles.length, 10);

  for (const entry of [...pageMarkdownFiles, ...projectMarkdownFiles, ...toolMarkdownFiles]) {
    assert.doesNotMatch(entry.name, /^\d/, `${entry.name} must not have a numeric prefix`);
  }

  const markdownRecords = [
    { name: "program.md", url: new URL("program.md", contentRoot) },
    ...pageMarkdownFiles.map((entry) => ({
      name: `pages/${entry.name}`,
      url: new URL(`pages/${entry.name}`, contentRoot),
    })),
    ...projectMarkdownFiles.map((entry) => ({
      name: `projects/${entry.name}`,
      url: new URL(`projects/${entry.name}`, contentRoot),
    })),
    ...toolMarkdownFiles.map((entry) => ({
      name: `tools/${entry.name}`,
      url: new URL(`tools/${entry.name}`, contentRoot),
    })),
  ];
  const markdownSources = await Promise.all(
    markdownRecords.map(async (record) => ({
      ...record,
      source: await readFile(record.url, "utf8"),
    })),
  );
  for (const record of markdownSources) {
    const frontmatter = parseJsonFrontmatter(record.source, record.name);
    assert.equal(
      Object.hasOwn(frontmatter, "order"),
      false,
      `${record.name} must not contain frontmatter order`,
    );
  }

  const content = JSON.parse(generatedJson);
  assert.deepEqual(
    Object.keys(content).sort(),
    [
      "_generated",
      "boilerplate",
      "pages",
      "participants",
      "program",
      "projects",
      "sources",
      "tools",
    ].sort(),
  );
  assert.equal(content._generated.schemaVersion, 2);
  assert.equal(content._generated.generatedFrom.length, 22);
  assert.deepEqual(
    content._generated.generatedFrom,
    sortedAlphabetically(content._generated.generatedFrom),
  );
  for (const filename of content._generated.generatedFrom) {
    assert.doesNotMatch(filename, /\/\d/, `${filename} must not encode rank`);
  }
  assert.equal(content.participants.length, 5);
  assert.equal(content.pages.length, 6);
  assert.deepEqual(
    content.pages.map((page) => page.navLabel),
    expectedPageNavLabels,
  );
  assert.deepEqual(
    content.pages.map((page) => page.slug).sort(),
    expectedPageSlugs,
  );
  assert.equal(content.projects.length, 5);
  assert.equal(content.tools.length, 10);
  assert.equal(
    content.participants.reduce((total, participant) => total + participant.people.length, 0),
    12,
  );
  assert.ok(content.projects.every((project) => project.officialTitle.startsWith("APTO:")));
  assert.equal(content.boilerplate, nsfBoilerplate);

  for (const participant of content.participants) {
    const participantTools = content.tools.filter(
      (tool) => tool.participantId === participant.id,
    );
    assert.equal(participantTools.length, 2, `${participant.id} must have exactly two tools`);
    assert.equal(participant.tools.length, 2, `${participant.id} must embed exactly two tools`);
    assert.deepEqual(
      participant.tools.map((tool) => tool.id),
      participantTools.map((tool) => tool.id),
    );
  }

  assert.match(nsfData, /import generatedContent from "\.\/nsf-apto-content\.generated\.json";/);
  assert.match(nsfData, /export const aptoPages = aptoContent\.pages;/);
  assert.doesNotMatch(nsfData, /export const apto(?:Projects|Participants|MockTools)\s*=\s*\[/);
  for (const [awardId, title] of expectedProjects) {
    assert.equal(nsfData.includes(awardId), false);
    assert.equal(nsfData.includes(title), false);
  }
  for (const person of expectedPeople) assert.equal(nsfData.includes(person), false);
  for (const tool of expectedTools) assert.equal(nsfData.includes(tool), false);

  assert.match(generator, /const checkOnly = args\[0\] === "--check"/);
  assert.match(generator, /current === serialized/);
  assert.match(generator, /writeFile\(outputFile, serialized, "utf8"\)/);
  assert.match(generator, /process\.exitCode = 1/);
  assert.match(generator, /projectFiles\.length === 5/);
  assert.match(generator, /toolFiles\.length === 10/);
  assert.match(generator, /pageFiles\.length === expectedPages\.size/);
  assert.match(generator, /function validateParticipantLogo\(/);
  assert.match(generator, /logo\.status === "approval-required\/mockup"/);
  assert.match(generator, /logo\.approved === false/);
  assert.match(
    generator,
    /compareAlphabetically\(left\.navLabel,\s*right\.navLabel\)/,
  );
  assert.match(generator, /function compareAlphabetically\(left, right\)/);
  assert.match(generator, /function projectTitleSortKey\(title\)/);
  assert.match(
    generator,
    /compareAlphabetically\(left\.tool\.name,\s*right\.tool\.name\)/,
  );
  assert.match(
    generator,
    /compareAlphabetically\(left\.displayName,\s*right\.displayName\)/,
  );
  assert.match(
    generator,
    /compareAlphabetically\(left\.name,\s*right\.name\)/,
  );
  assert.match(
    generator,
    /projectTitleSortKey\(left\.officialTitle\)[\s\S]*projectTitleSortKey\(right\.officialTitle\)/,
  );
  assert.match(
    generator,
    /compareAlphabetically\(left\.label,\s*right\.label\)/,
  );
  assert.doesNotMatch(generator, /requireInteger\([^)]*"order"/);
  assert.doesNotMatch(generator, /["']order["']/);
  assert.doesNotMatch(generator, /\brecord\.order\b|\bleft\.order\b|\bright\.order\b/);
  assert.doesNotMatch(generator, /Project orders|Tool orders|frontmatter order/i);

  const scripts = JSON.parse(packageJson).scripts;
  assert.equal(scripts["content:build"], "node scripts/build-apto-content.mjs");
  assert.equal(scripts["content:check"], "node scripts/build-apto-content.mjs --check");
  assert.equal(scripts.predev, "npm run content:build");
  assert.equal(scripts.prebuild, "npm run content:build");
});
