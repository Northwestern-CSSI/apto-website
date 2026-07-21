import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const nsfBoilerplate =
  "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.";

const expectedPageSlugs = [
  "/",
  "/about",
  "/cohort",
  "/people",
  "/projects",
  "/tools",
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

let workerModule;

async function render(pathname = "/") {
  if (!workerModule) {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
    workerModule = import(workerUrl.href);
  }
  const { default: worker } = await workerModule;

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
  const generated = JSON.parse(
    await readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
  );
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.ok(html.includes(`<title>${generated.interface.study.siteTitle}</title>`));
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
  const generated = JSON.parse(
    await readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
  );
  const response = await render("/apto/projects?concept=nsfledger");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /"pathname":"\/apto\/projects"/);
  assert.match(html, /\[\["concept","nsfledger"\]\]/);
  assert.ok(html.includes(generated.interface.directions.find((direction) => direction.id === "nsfledger").label));
  assert.ok(html.includes(generated.interface.study.barLabel));
  assert.match(html, /\/apto\/tools\?concept=nsfledger/);
  assert.doesNotMatch(html, /Official NSF source/i);
});

test("keeps three core APTO homes and adds three matched widget variants", async () => {
  const generated = JSON.parse(
    await readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
  );
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
      assert.ok(html.includes(generated.interface.widget.title));
      assert.ok(html.includes(generated.interface.widget.disclaimer));
      assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
      assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
      assert.match(html, new RegExp(`/apto/tools\\?concept=${concept}`));
    } else {
      assert.equal(html.includes(generated.interface.widget.title), false);
    }
  }
});

test("server-renders every APTO route in every direction without theme drift", async () => {
  const generated = JSON.parse(
    await readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
  );
  const concepts = [
    ["nsfhome", "home", false],
    ["nsfhomewidgets", "home", true],
    ["nsfledger", "ledger", false],
    ["nsfledgerwidgets", "ledger", true],
    ["nsfnetwork", "network", false],
    ["nsfnetworkwidgets", "network", true],
  ];
  const routes = [
    ["", "home"],
    ["/about", "about"],
    ["/cohort", "cohort"],
    ["/people", "people"],
    ["/projects", "projects"],
    ["/tools", "tools"],
  ];

  for (const [concept, theme, widgetVariant] of concepts) {
    for (const [route, section] of routes) {
      const response = await render(`/apto${route}?concept=${concept}`);
      assert.equal(response.status, 200, `${concept} ${section} should render`);
      const html = await response.text();
      assert.match(html, new RegExp(`concept-${concept}\\b`));
      assert.match(html, new RegExp(`nsf-apto-${theme}\\b`));
      assert.equal((html.match(/<main\b/g) ?? []).length, 1);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      assert.match(html, new RegExp(`/apto/tools\\?concept=${concept}`));
      assert.match(html, new RegExp(`/apto\\?concept=${concept}`));
      const slug = route || "/";
      const page = generated.pages.find((candidate) => candidate.slug === slug);
      assert.ok(page, `Expected generated page content for ${slug}`);
      assert.ok(
        html.includes(`<title>${page.metadataTitle} | ${generated.program.acronym}</title>`),
        `${concept} ${section} should use Markdown-derived metadata`,
      );

      const shouldShowWidget = section === "home" && widgetVariant;
      assert.equal(
        /class="nsf-hero-widget\b/.test(html),
        shouldShowWidget,
        `${concept} ${section} widget visibility`,
      );
      if (section === "people") {
        for (const person of generated.program.programTeam) {
          assert.ok(html.includes(person.name), `${concept} people should include ${person.name}`);
          assert.ok(html.includes(person.role), `${concept} people should include ${person.role}`);
        }
      }
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
  const [nsfSource, nsfStyles, generatedJson, routePageSource, rootLayoutSource, aptoLayoutSource, metadataSource] = await Promise.all([
    readFile(new URL("../app/nsf-apto-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-mockups.css", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/_route-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/_metadata.ts", import.meta.url), "utf8"),
  ]);
  const content = JSON.parse(generatedJson);

  const markdownConsumers = `${nsfSource}\n${rootLayoutSource}\n${aptoLayoutSource}\n${metadataSource}`;
  for (const field of [
    "siteTitle", "siteDescription", "socialImageAlt", "galleryLabel", "barLabel",
    "themeChooserLabel", "formatChooserLabel", "formatLabel", "standardLabel",
    "widgetLabel", "selectedFormatLabel", "networkCoreLabel", "networkVisualAlt",
    "networkVisualCaption", "ledgerVisualEyebrow", "ledgerVisualTitle",
    "previewAriaLabel", "chooserAriaLabel", "momentumScaleLabel",
    "momentumListAriaLabel", "mapCaptionPrefix", "mapCaptionSuffix",
    "compositeAriaPrefix", "compositeAriaJoiner", "demoIndexLabel",
    "trajectoryScaleLabel", "trajectoryAriaSuffix", "allToolsLabel", "kicker", "icon",
    "organizationWebsiteLabel", "officialAwardRecordLabel", "nsfAwardRecordLabel",
    "awardApiRecordLabel", "participantWebsiteLabel", "skipLinkLabel",
    "primaryNavigationLabel", "footerNavigationLabel", "homePathwaysLabel",
    "projectInvestigatorsLabel", "outcomeTypesLabel", "linesOfEffortLabel",
    "ledgerTitle", "awardLabel", "personAwardLabel", "legalAwardeeLabel",
    "agreementLabel", "obligatedAmountLabel", "estimatedTotalLabel", "dataAsOfLabel",
    "registerTitle", "allOrganizationsLabel", "filterAriaLabel", "showingAllLabel",
    "showingParticipantPrefix", "conceptByLabel", "demoVideoLabel", "toolLinkLabel",
    "watchWithCaptionsLabel", "captionsForthcomingLabel", "linkForthcomingLabel",
    "openToolLabel", "programTeamTitle", "projectProfileLabel", "portraitForthcomingLabel",
    "viewProfileLabel", "prominentTitle", "markStatusSuffix", "nsfWebsiteUrl",
    "nsfLogoSrc", "nsfWebsiteAriaLabel", "nsfLogoAlt", "metadataTitle", "ariaLabel",
  ]) {
    assert.ok(markdownConsumers.includes(field), `Expected Markdown field ${field} to be consumed by a page`);
  }

  for (const literal of [
    "Design gallery",
    "APTO design directions",
    "Choose a visual direction",
    "Interactive APTO tool widget preview",
    "Illustrative momentum index · 0–100",
    "Illustrative map of science showing connected",
    "Demo index",
    "Independent research teams connected by a shared question about technology outcomes.",
    "APTO evidence folio",
    "shared evidence",
    "The project evidence ledger",
    "A proposed tool register",
    "The organizations behind the APTO cohort",
    "Legal awardee",
    "Current obligated amount",
    "Official award record",
    "Organization website",
    "Portrait forthcoming",
    "Skip to main content",
    "Primary navigation",
    "Footer navigation",
    "U.S. National Science Foundation logo",
  ]) {
    assert.equal(nsfSource.includes(literal), false, `Visible copy must come from Markdown: ${literal}`);
  }

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
    ["page.tsx", "home", "/"],
    ["about/page.tsx", "about", "/about"],
    ["cohort/page.tsx", "cohort", "/cohort"],
    ["people/page.tsx", "people", "/people"],
    ["projects/page.tsx", "projects", "/projects"],
    ["tools/page.tsx", "tools", "/tools"],
  ];
  const routeSources = await Promise.all(
    routeSpecs.map(([file]) =>
      readFile(new URL(`../app/apto/${file}`, import.meta.url), "utf8"),
    ),
  );
  routeSpecs.forEach(([, section, slug], index) => {
    assert.match(
      routeSources[index],
      new RegExp(`<AptoRoutePage section=\\"${section}\\"`),
    );
    assert.match(
      routeSources[index],
      new RegExp(`metadataFor\\(\\"${slug === "/" ? "\\/" : slug.replaceAll("/", "\\/")}\\"\\)`),
    );
    const page = content.pages.find((candidate) => candidate.slug === slug);
    assert.ok(page, `Expected generated page metadata for ${slug}`);
    assert.ok(page.metadataTitle.trim().length > 0);
  });
  await assert.rejects(
    access(new URL("../app/apto/sources/page.tsx", import.meta.url)),
  );

  const pageNavLabels = content.pages.map((page) => page.navLabel);
  assert.ok(pageNavLabels.every((label) => typeof label === "string" && label.trim().length > 0));
  assert.deepEqual(pageNavLabels, sortedAlphabetically(pageNavLabels));
  assert.equal(new Set(pageNavLabels).size, pageNavLabels.length);
  assert.deepEqual(
    content.pages.map((page) => page.slug).sort(),
    expectedPageSlugs,
  );
  assert.equal(new Set(content.pages.map((page) => page.slug)).size, 6);
  for (const page of content.pages) {
    assert.ok(page.metadataTitle.trim().length > 0);
    assert.ok(page.eyebrow.trim().length > 0);
    assert.ok(page.title.trim().length > 0);
    assert.ok(page.introduction.trim().length > 0);
  }

  const participantNames = content.participants.map((participant) => participant.displayName);
  assert.equal(participantNames.length, 5);
  assert.ok(participantNames.every((name) => typeof name === "string" && name.trim().length > 0));
  assert.deepEqual(participantNames, sortedAlphabetically(participantNames));
  assert.equal(new Set(participantNames).size, participantNames.length);
  assert.equal(new Set(content.participants.map((participant) => participant.logo.src)).size, 5);
  for (const participant of content.participants) {
    const { logo } = participant;
    assert.match(logo.src, /^\/[^\s]+$/);
    assert.ok(Number.isFinite(logo.width) && logo.width > 0);
    assert.ok(Number.isFinite(logo.height) && logo.height > 0);
    assert.ok(["light", "dark"].includes(logo.surface));
    assert.ok(["symbol", "wordmark"].includes(logo.kind));
    assert.equal(new URL(logo.sourceUrl).protocol, "https:");
    assert.ok(logo.sourceLabel.trim().length > 0);
    assert.ok(typeof logo.status === "string" && logo.status.trim().length > 0);
    assert.equal(typeof logo.approved, "boolean");
    assert.equal(new URL(participant.website).protocol, "https:");
    await access(new URL(`../public${logo.src}`, import.meta.url));
  }
  assert.equal(content.projects.length, 5);
  assert.equal(new Set(content.projects.map((project) => project.awardId)).size, 5);
  for (const project of content.projects) {
    assert.match(project.awardId, /^\d{7}$/);
    assert.match(project.officialTitle, /^APTO:/);
    assert.ok(project.awardUrl.includes(project.awardId));
    assert.ok(project.apiUrl.includes(project.awardId));
    assert.ok(project.people.length > 0);
  }
  const projectSortKeys = content.projects.map((project) =>
    projectTitleSortKey(project.officialTitle),
  );
  assert.deepEqual(projectSortKeys, sortedAlphabetically(projectSortKeys));

  for (const participant of content.participants) {
    assert.equal(
      content.tools.filter((tool) => tool.organizationUrl === participant.website).length,
      2,
    );
  }

  assert.equal(content.tools.filter((tool) => tool.isConceptOnly === true).length, 10);
  assert.ok(content.tools.every((tool) => typeof tool.status === "string" && tool.status.trim().length > 0));
  for (const participantId of content.participants.map((participant) => participant.id)) {
    assert.equal(
      content.tools.filter((tool) => tool.participantId === participantId).length,
      2,
    );
  }
  const toolNames = content.tools.map((tool) => tool.name);
  assert.ok(toolNames.every((name) => typeof name === "string" && name.trim().length > 0));
  assert.deepEqual(toolNames, sortedAlphabetically(toolNames));
  assert.equal(new Set(toolNames).size, toolNames.length);
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

  assert.ok(content.tools.every((tool) => typeof tool.demoVideoLabel === "string" && tool.demoVideoLabel.trim().length > 0));
  assert.ok(content.tools.every((tool) => typeof tool.toolLinkLabel === "string" && tool.toolLinkLabel.trim().length > 0));
  assert.match(nsfSource, /aptoInterface\.people\.portraitForthcomingLabel/);
  assert.ok(content.interface.people.portraitForthcomingLabel.trim().length > 0);
  assert.ok(content.interface.disclosures.toolsLabel.trim().length > 0);
  assert.equal(content.boilerplate, nsfBoilerplate);
  assert.deepEqual(
    Object.keys(content.program.framework).sort(),
    ["ariaLabel", "effortsNote", "effortsTitle", "outcomesNote", "outcomesTitle"],
  );
  assert.ok(Object.values(content.program.framework).every((value) => typeof value === "string" && value.trim().length > 0));
  assert.deepEqual(
    content.program.linesOfEffort.map((line) => line.title),
    sortedAlphabetically(content.program.linesOfEffort.map((line) => line.title)),
  );

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
  assert.match(nsfSource, /<ParticipantMark participant=\{participant\} size="compact" tone=\{tone\} \/>/);
  assert.match(nsfSource, /tone=\{prominent \? "dark" : "light"\}/);
  assert.equal(
    (nsfSource.match(/const tone = directionFor\(id\) === "network" \? "dark" : "light";/g) ?? []).length,
    3,
  );
  assert.match(nsfSource, /<ProjectCard key=\{project\.awardId\} project=\{project\} tone=\{tone\} \/>/);
  assert.match(nsfSource, /size="compact" tone=\{tone\}/);
  assert.match(nsfSource, /function NsfHeroToolWidget/);
  assert.match(nsfSource, /role="tablist"/);
  assert.match(nsfSource, /role="tabpanel"/);
  assert.match(nsfSource, /aria-selected=\{active === item\.id\}/);
  assert.match(nsfSource, /aptoInterface\.widget\.items/);
  assert.deepEqual(
    content.interface.widget.items.map((item) => item.id),
    ["emerging", "map", "patent", "trajectories"],
  );
  assert.deepEqual(
    content.interface.widget.items.map((item) => item.kicker),
    sortedAlphabetically(content.interface.widget.items.map((item) => item.kicker)),
  );
  assert.match(nsfSource, /hasHeroWidgets\(id\) \? <NsfHeroToolWidget/);
  assert.match(nsfSource, /<dl className="nsf-framework-items">/);
  assert.match(nsfSource, /<dt>\{item\.label\}<\/dt>/);
  assert.match(nsfSource, /<dd>\{item\.description\}<\/dd>/);

  const toolsThemeRule = cssRuleBody(nsfStyles, ".nsf-tools-section");
  assert.match(toolsThemeRule, /--nsf-tools-surface:\s*#f2f7f9/);
  assert.match(toolsThemeRule, /--nsf-tools-ink:\s*var\(--nsf-dark-blue\)/);
  assert.match(nsfStyles, /\.nsf-apto-ledger \.nsf-tools-section[\s\S]*--nsf-tools-surface:\s*#f8f5ee/);
  assert.match(nsfStyles, /\.nsf-apto-network \.nsf-tools-section[\s\S]*--nsf-tools-ink:\s*#fff/);

  const networkThemeRule = cssRuleBody(nsfStyles, ".nsf-apto-network");
  assert.match(networkThemeRule, /--nsf-network-canvas:\s*#010914/);
  assert.match(networkThemeRule, /--nsf-network-surface:\s*#04172a/);
  assert.match(networkThemeRule, /--nsf-network-raised:\s*#09223d/);
  assert.match(networkThemeRule, /--nsf-network-line:\s*#425c73/);
  assert.match(networkThemeRule, /--nsf-paper:\s*var\(--nsf-network-canvas\)/);
  assert.match(networkThemeRule, /color-scheme:\s*dark/);
  assert.match(networkThemeRule, /background:\s*var\(--nsf-network-canvas\)/);
  for (const selector of [
    ".nsf-apto-network .nsf-program-overview",
    ".nsf-apto-network .nsf-projects-section",
    ".nsf-apto-network .nsf-people-section",
  ]) {
    assert.match(nsfStyles, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(nsfStyles, /\.nsf-apto-network \.nsf-overview-framework[\s\S]*var\(--nsf-network-surface\)/);
  assert.match(nsfStyles, /\.nsf-apto-network \.nsf-tool-figure > div\s*\{[\s\S]*var\(--nsf-network-raised\)/);
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
  const logoStart = nsfSource.indexOf("aptoInterface.footer.nsfLogoSrc");
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
  assert.match(nsfSource, /aria-label=\{aptoInterface\.accessibility\.primaryNavigationLabel\}/);
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

  assert.match(nsfSource, /aptoInterface\.footer\.nsfLogoSrc/);
  assert.match(nsfSource, /\/apto\/nsf-network-art\.avif/);
  assert.match(nsfSource, /\/apto\/nsf-network-art-fallback\.jpg/);
  assert.match(nsfSource, /alt=\{aptoInterface\.footer\.nsfLogoAlt\}/);
  assert.match(nsfSource, /width="64" height="64"/);
  assert.match(nsfStyles, /\.nsf-apto :focus-visible/);
  assert.match(nsfStyles, /\.nsf-skip-link:focus/);
  assert.match(nsfStyles, /min-height: 44px/);
  assert.match(nsfStyles, /@media \(max-width: 1120px\)/);
  assert.match(nsfStyles, /@media \(max-width: 860px\)/);
  assert.match(nsfStyles, /@media \(max-width: 640px\)/);
  assert.match(nsfStyles, /@media \(max-width: 360px\)/);
  assert.match(nsfStyles, /grid-template-columns:\s*repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(nsfStyles, /\.nsf-widget-translation-preview[\s\S]*grid-template-columns:\s*1fr/);
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
  await access(new URL("../public/apto/nsf-network-art.avif", import.meta.url));
  await access(new URL("../public/apto/nsf-network-art-fallback.jpg", import.meta.url));
  await access(new URL("../public/apto/science-map-widget.avif", import.meta.url));
  await access(new URL("../public/apto/science-map-widget-fallback.jpg", import.meta.url));
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
  assert.equal(
    markdownFiles(contentEntries).filter((entry) => entry.name === "interface.md").length,
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
    { name: "interface.md", url: new URL("interface.md", contentRoot) },
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
  const frontmatterByName = new Map();
  for (const record of markdownSources) {
    const frontmatter = parseJsonFrontmatter(record.source, record.name);
    frontmatterByName.set(record.name, frontmatter);
    assert.equal(
      Object.hasOwn(frontmatter, "order"),
      false,
      `${record.name} must not contain frontmatter order`,
    );
  }

  const content = JSON.parse(generatedJson);
  const interfaceFrontmatter = frontmatterByName.get("interface.md");
  const { kind: interfaceKind, ...expectedInterface } = interfaceFrontmatter;
  assert.equal(interfaceKind, "interface");
  assert.deepEqual(content.interface, expectedInterface);

  const programFrontmatter = frontmatterByName.get("program.md");
  assert.deepEqual(content.program.framework, programFrontmatter.framework);
  assert.deepEqual(
    content.program.programTeam,
    [...programFrontmatter.programTeam].sort((left, right) => compareAlphabetically(left.name, right.name)),
  );
  assert.equal(content.boilerplate, programFrontmatter.boilerplate);

  for (const [name, frontmatter] of frontmatterByName) {
    if (name.startsWith("pages/")) {
      const generatedPage = content.pages.find((page) => page.slug === frontmatter.slug);
      assert.ok(generatedPage, `Expected generated page for ${name}`);
      for (const field of ["navLabel", "metadataTitle", "eyebrow", "title"]) {
        assert.equal(generatedPage[field], frontmatter[field], `${name} ${field} must flow from Markdown`);
      }
    }

    if (name.startsWith("projects/")) {
      const generatedProject = content.projects.find((project) => project.id === frontmatter.id);
      assert.ok(generatedProject, `Expected generated project for ${name}`);
      for (const field of ["awardId", "shortName", "officialTitle", "agreementType", "startDate", "endDate"]) {
        assert.equal(generatedProject[field], frontmatter[field], `${name} ${field} must flow from Markdown`);
      }
      const generatedParticipant = content.participants.find((participant) => participant.id === frontmatter.participant.id);
      assert.ok(generatedParticipant, `Expected generated participant for ${name}`);
      assert.equal(generatedParticipant.displayName, frontmatter.participant.displayName);
      assert.equal(generatedParticipant.website, frontmatter.participant.website);
      assert.deepEqual(generatedParticipant.logo, frontmatter.participant.logo);
    }

    if (name.startsWith("tools/")) {
      const generatedTool = content.tools.find((tool) => tool.id === frontmatter.id);
      assert.ok(generatedTool, `Expected generated tool for ${name}`);
      for (const field of ["participantId", "name", "status", "demoVideoLabel", "toolLinkLabel"]) {
        assert.equal(generatedTool[field], frontmatter[field], `${name} ${field} must flow from Markdown`);
      }
      assert.deepEqual(generatedTool.figure, frontmatter.figure);
    }
  }
  assert.deepEqual(
    Object.keys(content).sort(),
    [
      "_generated",
      "boilerplate",
      "interface",
      "pages",
      "participants",
      "program",
      "projects",
      "sources",
      "tools",
    ].sort(),
  );
  assert.equal(content._generated.schemaVersion, 5);
  assert.equal(content._generated.generatedFrom.length, 23);
  assert.deepEqual(
    content._generated.generatedFrom,
    sortedAlphabetically(content._generated.generatedFrom),
  );
  for (const filename of content._generated.generatedFrom) {
    assert.doesNotMatch(filename, /\/\d/, `${filename} must not encode rank`);
  }
  assert.equal(content.participants.length, 5);
  assert.ok(content.program.programTeam.length > 0);
  assert.deepEqual(
    content.program.programTeam.map((person) => person.name),
    sortedAlphabetically(content.program.programTeam.map((person) => person.name)),
  );
  assert.equal(content.interface.directions.length, 6);
  assert.equal(content.interface.widget.items.length, 4);
  assert.equal(content.pages.length, 6);
  const generatedNavLabels = content.pages.map((page) => page.navLabel);
  assert.ok(generatedNavLabels.every((label) => typeof label === "string" && label.trim().length > 0));
  assert.deepEqual(generatedNavLabels, sortedAlphabetically(generatedNavLabels));
  assert.deepEqual(
    content.pages.map((page) => page.slug).sort(),
    expectedPageSlugs,
  );
  assert.equal(content.projects.length, 5);
  assert.equal(content.tools.length, 10);
  assert.ok(
    content.participants.reduce((total, participant) => total + participant.people.length, 0) >= 5,
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
  assert.match(nsfData, /export const aptoInterface = aptoContent\.interface;/);
  assert.doesNotMatch(nsfData, /export const apto(?:Projects|Participants|MockTools)\s*=\s*\[/);
  for (const project of content.projects) {
    assert.equal(nsfData.includes(project.awardId), false);
    assert.equal(nsfData.includes(project.officialTitle), false);
  }
  for (const person of content.participants.flatMap((participant) => participant.people)) {
    assert.equal(nsfData.includes(person.name), false);
  }
  for (const person of content.program.programTeam) {
    assert.equal(nsfData.includes(person.name), false);
  }
  for (const tool of content.tools) assert.equal(nsfData.includes(tool.name), false);

  assert.match(generator, /const checkOnly = args\[0\] === "--check"/);
  assert.match(generator, /current === serialized/);
  assert.match(generator, /writeFile\(outputFile, serialized, "utf8"\)/);
  assert.match(generator, /process\.exitCode = 1/);
  assert.match(generator, /projectFiles\.length === 5/);
  assert.match(generator, /toolFiles\.length === 10/);
  assert.match(generator, /pageFiles\.length === expectedPages\.size/);
  assert.match(generator, /function validateParticipantLogo\(/);
  assert.doesNotMatch(generator, /expectedParticipantLogos/);
  assert.doesNotMatch(generator, /expected\.navLabel/);
  assert.doesNotMatch(generator, /metadata\.status\s*===/);
  assert.match(generator, /function validateInterface\(/);
  assert.match(generator, /const interfaceFile = path\.join\(contentDirectory, "interface\.md"\)/);
  assert.match(generator, /requireString\(logo, "status", context\)/);
  assert.match(generator, /typeof logo\.approved === "boolean"/);
  assert.doesNotMatch(generator, /logo\.status === "approval-required\/mockup"/);
  assert.doesNotMatch(generator, /logo\.approved === false/);
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
