import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const contentRoot = new URL("../content/apto/", import.meta.url);
const canonicalPages = [
  ["", "/", "home"],
  ["/about", "/about", "about"],
  ["/cohort", "/cohort", "cohort"],
  ["/projects", "/projects", "projects"],
  ["/tools", "/tools", "tools"],
];
const legacyConceptAliases = [
  ["nsfhome", "home", "nsfhome"],
  ["nsfhomewidgets", "home", "nsfhome"],
  ["nsfledger", "home", "nsfhome"],
  ["nsfledgerwidgets", "home", "nsfhome"],
  ["nsfnetwork", "network", "nsfnetwork"],
  ["nsfnetworkwidgets", "network", "nsfnetwork"],
];
const baseline = {
  assets: 16,
  participants: 5,
  people: 13,
  projects: 5,
  tools: 10,
};
const nsfBoilerplate =
  "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.";

function compareAlphabetically(left, right) {
  return (
    left.localeCompare(right, "en", { sensitivity: "base" }) ||
    left.localeCompare(right, "en")
  );
}

function sortedAlphabetically(values) {
  return [...values].sort(compareAlphabetically);
}

function parseJsonFrontmatter(source, filename) {
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  assert.ok(match, `${filename} must begin with JSON frontmatter`);
  return JSON.parse(match[1]);
}

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function visibleText(html) {
  return decodeHtml(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ").trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(value, pattern) {
  return (value.match(pattern) ?? []).length;
}

function maxPixelValueFor(styles, property) {
  const match = styles.match(new RegExp(`${property}\\s*:\\s*([^;]+);`));
  assert.ok(match, `Expected ${property} declaration`);
  const values = [...match[1].matchAll(/([\d.]+)px/g)].map((value) => Number(value[1]));
  assert.ok(values.length > 0, `Expected ${property} to include a pixel value`);
  return Math.max(...values);
}

async function markdownFileNames(directory) {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort(compareAlphabetically);
}

async function filesRecursively(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    return entry.isDirectory() ? filesRecursively(child) : [child];
  }));
  return nested.flat().sort((left, right) => left.href.localeCompare(right.href, "en"));
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
      redirect: "manual",
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

async function generatedContent() {
  return JSON.parse(
    await readFile(new URL("../app/nsf-apto-content.generated.json", import.meta.url), "utf8"),
  );
}

test("redirects the repository root to the first-version APTO website", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /redirect\("\/apto"\)/);

  const response = await render("/");
  assert.ok([307, 308].includes(response.status), `Expected a redirect, received ${response.status}`);
  const location = response.headers.get("location");
  assert.ok(location, "Root redirect must include a Location header");
  assert.equal(new URL(location, "http://localhost").pathname, "/apto");
});

test("preserves the dormant homepage widget without exposing it on public routes", async () => {
  const [futureConfig, futureComponent, liveHome] = await Promise.all([
    readFile(new URL("future/home-tool-widget.md", contentRoot), "utf8"),
    readFile(new URL("../app/apto/_future/home-tool-widget.tsx", import.meta.url), "utf8"),
    render("/apto?concept=nsfhome"),
  ]);
  const metadata = parseJsonFrontmatter(futureConfig, "future/home-tool-widget.md");
  assert.equal(metadata.enabled, false);
  assert.equal(metadata.component, "app/apto/_future/home-tool-widget.tsx");
  assert.match(futureComponent, /export function FutureAptoHomeToolWidget/);
  assert.match(futureComponent, /Dormant by design/);
  const html = await liveHome.text();
  assert.equal(countMatches(html, /class="nsf-hero-widget(?:\s|")/g), 0);
  assert.equal(countMatches(html, /role="tab"/g), 0);
});

test("renders five canonical pages in two themes and preserves every published concept alias", async () => {
  const content = await generatedContent();
  assert.equal(content.interface.primaryNavigation.length, 4);
  assert.deepEqual(
    content.interface.primaryNavigation.map((item) => [item.label, item.section]),
    [["Program", "home"], ["Projects", "projects"], ["Tools", "tools"], ["Cohort", "cohort"]],
  );
  assert.equal(content.interface.directions.length, 2);
  const generatedSlugs = new Set(content.pages.map((page) => page.slug));
  for (const [, slug] of canonicalPages) assert.ok(generatedSlugs.has(slug));
  assert.equal(generatedSlugs.has("/people"), false, "/people is a route alias, not a sixth content page");

  for (const [concept, theme, canonicalConcept] of legacyConceptAliases) {
    const response = await render(`/apto?concept=${concept}`);
    assert.equal(response.status, 200, `${concept} should render`);
    const html = await response.text();
    assert.match(html, new RegExp(`concept-${canonicalConcept}\\b`));
    assert.match(html, new RegExp(`nsf-apto-${theme}\\b`));
    assert.equal(countMatches(html, /class="nsf-hero-widget(?:\s|")/g), 0, `${concept} home should not show a tool widget`);
    assert.equal(countMatches(html, /role="tab"/g), 0);
  }

  for (const [route, slug, section] of canonicalPages) {
    for (const [concept, theme] of [["nsfhome", "home"], ["nsfnetwork", "network"]]) {
      const response = await render(`/apto${route}?concept=${concept}`);
      assert.equal(response.status, 200, `${section} ${theme} should render`);
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
      const html = await response.text();
      const text = visibleText(html);
      const page = content.pages.find((candidate) => candidate.slug === slug);
      assert.ok(page, `Missing generated page for ${slug}`);
      assert.ok(html.includes(`<title>${page.metadataTitle} | ${content.program.acronym}</title>`));
      assert.equal(countMatches(html, /<main\b/g), 1);
      assert.equal(countMatches(html, /<h1\b/g), 1);
      assert.match(html, /class="nsf-skip-link"/);
      assert.match(html, new RegExp(`nsf-apto-${theme}\\b`));

      const primaryNav = html.match(new RegExp(
        `<nav[^>]*aria-label="${escapeRegex(content.interface.accessibility.primaryNavigationLabel)}"[^>]*>([\\s\\S]*?)<\\/nav>`,
      ));
      assert.ok(primaryNav, `${section} should expose its primary navigation label`);
      assert.equal(countMatches(primaryNav[1], /<a\b/g), content.interface.primaryNavigation.length);
      for (const item of content.interface.primaryNavigation) assert.ok(text.includes(item.label));
      assert.equal(text.includes("Cohort & People"), false);

      assert.equal(
        countMatches(html, /class="nsf-hero-widget(?:\s|")/g),
        0,
        `${section} widget visibility`,
      );

      for (const forbidden of [
        "Legal awardee",
        "Cooperative Agreement",
        "Current obligated amount",
        "Estimated total",
        "Award API record",
        "Official award record",
        "Mock content",
        "Prototype accessibility approach",
        "Project taxonomy",
      ]) {
        assert.equal(text.includes(forbidden), false, `${section} must not render legacy content: ${forbidden}`);
      }
    }
  }

  const peopleAlias = await render("/apto/people?concept=nsfnetworkwidgets");
  assert.equal(peopleAlias.status, 200);
  const peopleHtml = await peopleAlias.text();
  assert.match(peopleHtml, /concept-nsfnetwork\b/);
  assert.match(peopleHtml, /class="nsf-cohort-people\b/);
});

test("merges the program overview into home and replaces statistics with an integrated partner roster", async () => {
  const content = await generatedContent();
  for (const concept of ["nsfhome", "nsfnetwork"]) {
    const response = await render(`/apto?concept=${concept}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    const text = visibleText(html);
    assert.equal(countMatches(html, /class="nsf-hero-facts"/g), 0);
    assert.equal(countMatches(html, /class="nsf-hero-partners"/g), 1);
    assert.match(html, /class="nsf-program-hero has-partner-grid"/);
    assert.ok(text.includes(content.program.description));
    assert.ok(text.includes(content.program.objectivesTitle));
    for (const objective of content.program.objectives) assert.ok(text.includes(objective));

    const roster = html.match(/<aside class="nsf-hero-partners"[\s\S]*?<\/aside>/);
    assert.ok(roster);
    assert.equal(countMatches(roster[0], /class="nsf-participant-mark/g), content.participants.length);
    for (const participant of content.participants) {
      assert.ok(roster[0].includes(participant.displayName));
      assert.ok(roster[0].includes(`src="${participant.logo.src}"`));
      const project = content.projects.find((candidate) => candidate.participantId === participant.id);
      assert.ok(project);
      assert.equal(roster[0].includes(project.shortName), false, "The home logo roster must not repeat project subtitles");
    }
  }
});

test("renders five alphabetical native project accordions and a labelled awardee map", async () => {
  const content = await generatedContent();
  assert.ok(content.projects.length >= baseline.projects);
  const response = await render("/apto/projects?concept=nsfhome");
  assert.equal(response.status, 200);
  const html = await response.text();
  const text = visibleText(html);

  assert.equal(
    countMatches(html, /<details class="nsf-project-accordion"/g),
    content.projects.length,
  );
  assert.equal(countMatches(html, /<summary class="nsf-project-summary"/g), content.projects.length);
  assert.ok(content.projects.length >= 5, "The first release must include the five APTO projects");

  const alphabeticProjects = [...content.projects].sort((left, right) =>
    compareAlphabetically(left.shortName, right.shortName),
  );
  const projectPositions = alphabeticProjects.map((project) => text.indexOf(project.shortName));
  assert.ok(projectPositions.every((position) => position >= 0));
  assert.deepEqual(projectPositions, [...projectPositions].sort((left, right) => left - right));

  for (const project of alphabeticProjects) {
    assert.ok(text.includes(`Awarded in ${project.awardedYear} – ${project.statusLabel}`));
    assert.ok(html.includes(`id="nsf-award-${project.awardId}"`));
    assert.ok(html.includes(`href="${project.awardUrl}"`));
  }
  assert.equal(countMatches(text, /Awarded in 2024 – Ongoing/g), content.projects.length);

  assert.match(html, /<aside class="nsf-awardee-map" aria-labelledby="[^"]+"/);
  assert.match(html, /<img class="nsf-awardee-map-base"[^>]*alt=""/);
  assert.match(html, /<img class="nsf-awardee-map-base"[^>]*width="959"[^>]*height="593"/);
  assert.equal(countMatches(html, /<div class="nsf-awardee-map-cluster"/g), 1);
  assert.equal(countMatches(html, /class="nsf-awardee-map-pin"/g), 3);
  assert.match(html, /<button[^>]*aria-expanded="false"[^>]*aria-controls="[^"]+"[^>]*aria-label="2 nearby APTO project locations:/);
  assert.match(html, /<div id="[^"]*awardee-cluster-[^"]+" hidden="" aria-labelledby="[^"]+">/);
  assert.ok(text.includes(content.interface.projects.map.title));
  for (const participant of content.participants) {
    const project = content.projects.find((candidate) => candidate.participantId === participant.id);
    assert.ok(project, `${participant.displayName} must join to a project`);
    assert.ok(html.includes(`href="#nsf-award-${project.awardId}"`));
    assert.ok(html.includes(`${participant.displayName}, ${participant.location}`));
    assert.ok(html.includes(`href="${participant.website}"`));
  }
});

test("renders Markdown-sourced tools with two AND-able filter groups and useful copy", async () => {
  const [content, source, toolFiles] = await Promise.all([
    generatedContent(),
    readFile(new URL("../app/nsf-apto-mockups.tsx", import.meta.url), "utf8"),
    markdownFileNames(new URL("tools/", contentRoot)),
  ]);
  assert.ok(content.tools.length >= baseline.tools);
  assert.equal(toolFiles.length, content.tools.length, "Each generated tool must have one Markdown file");

  const response = await render("/apto/tools?concept=nsfnetwork");
  assert.equal(response.status, 200);
  const html = await response.text();
  const text = visibleText(html);
  assert.equal(countMatches(html, /class="nsf-filter-group"/g), 2);
  assert.equal(countMatches(html, /<select\b/g), 2);
  assert.equal(countMatches(html, /<select[^>]*aria-controls="[^"]+"/g), 2);
  assert.equal(countMatches(html, /class="nsf-tool-card"/g), content.tools.length);

  for (const category of ["Capability", "Production", "Use"]) assert.ok(text.includes(category));
  for (const tool of content.tools) {
    assert.ok(tool.description.trim().length >= 40, `${tool.name} needs a useful description`);
    assert.ok(tool.useCase.trim().length >= 30, `${tool.name} needs a useful use case`);
    assert.ok(tool.categories.length > 0, `${tool.name} needs at least one outcome category`);
    assert.ok(tool.categories.every((category) => ["Capability", "Production", "Use"].includes(category)));
    assert.ok(text.includes(tool.name));
    assert.ok(text.includes(tool.description));
    assert.ok(text.includes(tool.useCase));
    assert.ok(html.includes(`src="${tool.figure.src}"`));
    assert.ok(html.includes(`alt="${tool.figure.alt}"`));
  }

  assert.match(
    source,
    /participant === "all"[\s\S]*tool\.participantId === participant[\s\S]*&&[\s\S]*category === "all"[\s\S]*tool\.categories\.includes/,
  );
  assert.match(source, /<FilterSelect title=\{aptoInterface\.tools\.organizationFilterLabel\} value=\{participant\}/);
  assert.match(source, /<FilterSelect title=\{aptoInterface\.tools\.categoryFilterLabel\} value=\{category\}/);
  assert.match(source, /<select value=\{value\}/);
  assert.doesNotMatch(source, /must have exactly two tools|\.length === 2[^\n]*tools/i);
});

test("combines program leadership, organizations, and project teams on the cohort page", async () => {
  const content = await generatedContent();
  assert.ok(content.participants.length >= baseline.participants);
  assert.ok(content.program.programTeam.some((person) => person.name === "Rebecca Chmiel"));

  for (const path of ["/apto/cohort?concept=nsfhome", "/apto/people?concept=nsfnetwork"]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    const text = visibleText(html);
    assert.equal(countMatches(html, /<h1\b/g), 1);
    assert.ok(text.includes("Rebecca Chmiel"));
    assert.match(html, /class="nsf-program-leadership"/);
    assert.match(html, /class="nsf-cohort-directory"/);

    for (const person of content.program.programTeam) {
      assert.ok(text.includes(person.name));
      assert.ok(text.includes(person.role));
    }
    for (const participant of content.participants) {
      assert.ok(text.includes(participant.displayName));
      assert.ok(text.includes(participant.location));
      assert.ok(participant.people.length > 0, `${participant.displayName} must have a project team`);
      for (const person of participant.people) {
        assert.ok(text.includes(person.name), `${participant.displayName} should include ${person.name}`);
        assert.ok(text.includes(person.role), `${participant.displayName} should include ${person.role}`);
      }
    }
  }
});

test("builds a flexible Markdown inventory, copies content assets, and preserves accessibility essentials", async () => {
  const [content, generator, dataSource, mockupSource, routeSource, styles, rootLayout, aptoLayout] = await Promise.all([
    generatedContent(),
    readFile(new URL("../scripts/build-apto-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/_route-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/nsf-apto-mockups.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/layout.tsx", import.meta.url), "utf8"),
  ]);
  const directories = {
    pages: await markdownFileNames(new URL("pages/", contentRoot)),
    participants: await markdownFileNames(new URL("participants/", contentRoot)),
    people: await markdownFileNames(new URL("people/", contentRoot)),
    projects: await markdownFileNames(new URL("projects/", contentRoot)),
    tools: await markdownFileNames(new URL("tools/", contentRoot)),
  };
  const assets = await filesRecursively(new URL("assets/", contentRoot));

  assert.deepEqual(directories.pages, ["about.md", "cohort.md", "home.md", "projects.md", "tools.md"]);
  assert.ok(directories.participants.length >= baseline.participants);
  assert.ok(directories.people.length >= baseline.people);
  assert.ok(directories.projects.length >= baseline.projects);
  assert.ok(directories.tools.length >= baseline.tools);
  assert.ok(assets.length >= baseline.assets);
  assert.equal(content.participants.length, directories.participants.length);
  assert.equal(content.projects.length, directories.projects.length);
  assert.equal(content.tools.length, directories.tools.length);
  assert.equal(
    content.program.programTeam.length + content.participants.reduce((sum, participant) => sum + participant.people.length, 0),
    directories.people.length,
  );
  assert.ok(content._generated.schemaVersion >= 7);
  assert.equal(content.boilerplate, nsfBoilerplate);

  const allPeople = [
    ...content.program.programTeam,
    ...content.participants.flatMap((participant) => participant.people),
  ];
  for (const directory of ["participants", "people", "projects", "tools"]) {
    assert.ok(
      content._generated.generatedFrom.some((filename) => filename.startsWith(`content/apto/${directory}/`)),
      `${directory} must be represented in generatedFrom`,
    );
  }
  for (const file of assets) {
    const relative = decodeURIComponent(file.pathname.slice(new URL("assets/", contentRoot).pathname.length));
    const generatedName = `content/apto/assets/${relative}`;
    assert.ok(content._generated.generatedFrom.includes(generatedName), `${generatedName} must be tracked`);
    const [sourceBytes, publicBytes] = await Promise.all([
      readFile(file),
      readFile(new URL(`../public/apto/${relative}`, import.meta.url)),
    ]);
    assert.deepEqual(publicBytes, sourceBytes, `${relative} must be copied from content assets`);
  }

  const records = [];
  for (const [directory, names] of Object.entries(directories)) {
    if (directory === "pages") continue;
    for (const name of names) {
      const source = await readFile(new URL(`${directory}/${name}`, contentRoot), "utf8");
      records.push({ directory, name, metadata: parseJsonFrontmatter(source, `${directory}/${name}`) });
    }
  }
  for (const record of records.filter((item) => item.directory === "participants")) {
    assert.ok(content.participants.some((participant) => participant.id === record.metadata.id));
  }
  for (const record of records.filter((item) => item.directory === "people")) {
    assert.ok(allPeople.some((person) => person.id === record.metadata.id));
  }
  for (const record of records.filter((item) => item.directory === "projects")) {
    assert.ok(content.projects.some((project) => project.id === record.metadata.id));
  }
  for (const record of records.filter((item) => item.directory === "tools")) {
    assert.ok(content.tools.some((tool) => tool.id === record.metadata.id));
  }

  for (const participant of content.participants) {
    assert.ok(participant.people.length > 0);
    assert.ok(participant.tools.length > 0);
    assert.ok(participant.projectIds.length > 0);
    assert.deepEqual(
      participant.people.map((person) => person.name),
      sortedAlphabetically(participant.people.map((person) => person.name)),
    );
    assert.deepEqual(
      participant.tools.map((tool) => tool.name),
      sortedAlphabetically(participant.tools.map((tool) => tool.name)),
    );
  }
  assert.deepEqual(
    content.participants.map((participant) => participant.displayName),
    sortedAlphabetically(content.participants.map((participant) => participant.displayName)),
  );
  assert.deepEqual(
    content.tools.map((tool) => tool.name),
    sortedAlphabetically(content.tools.map((tool) => tool.name)),
  );

  assert.match(generator, /const participantDirectory = path\.join\(contentDirectory, "participants"\)/);
  assert.match(generator, /const peopleDirectory = path\.join\(contentDirectory, "people"\)/);
  assert.match(generator, /const assetDirectory = path\.join\(contentDirectory, "assets"\)/);
  assert.match(generator, /path\.relative\(assetDirectory, assetFile\)/);
  assert.match(generator, /fileStatus\.isFile\(\)/);
  assert.match(generator, /allowedImageExtensions/);
  assert.match(generator, /participantFiles\.length > 0/);
  assert.match(generator, /peopleFiles\.length > 0/);
  assert.match(generator, /projectFiles\.length > 0/);
  assert.match(generator, /toolFiles\.length > 0/);
  assert.match(generator, /syncAssets\(content\.assetFiles, checkOnly\)/);
  assert.doesNotMatch(generator, /toolFiles\.length === \d+/);
  assert.doesNotMatch(generator, /must have exactly 2 tools|count === 2/);
  assert.match(dataSource, /import generatedContent from "\.\/nsf-apto-content\.generated\.json"/);
  assert.doesNotMatch(dataSource, /export const apto(?:Projects|Participants|MockTools)\s*=\s*\[/);

  assert.match(routeSource, /concept\.startsWith\("nsfnetwork"\) \? "nsfnetwork" : "nsfhome"/);
  assert.match(routeSource, /"nsfledger"/);
  assert.match(routeSource, /"nsfhomewidgets"/);
  assert.match(rootLayout, /aptoInterface\.study/);
  assert.match(aptoLayout, /template: `%s \| \$\{aptoProgram\.acronym\}`/);

  assert.match(styles, /\.nsf-apto :focus-visible/);
  assert.match(styles, /\.nsf-skip-link:focus/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(forced-colors: active\)/);
  assert.match(styles, /forced-color-adjust/);
  assert.match(styles, /color-scheme:\s*dark/);
  assert.match(styles, /\.nsf-awardee-map-plot\s*\{[^}]*aspect-ratio:\s*959\s*\/\s*593/);
  assert.match(styles, /\.nsf-cohort-identity > span:last-child small\s*\{[^}]*max-height:\s*none/);
  assert.match(styles, /\.nsf-tool-figure > img\s*\{[^}]*object-fit:\s*cover/);
  assert.match(styles, /\.nsf-awardee-map-pin:hover::before,[\s\S]*?transform:\s*none/);
  assert.match(mockupSource, /document\.addEventListener\("pointerdown", handlePointerDown\)/);
  assert.match(mockupSource, /!rootRef\.current\?\.contains\(target\)/);
  assert.match(mockupSource, /document\.removeEventListener\("pointerdown", handlePointerDown\)/);
  assert.match(mockupSource, /event\.key !== "Escape"/);
  assert.match(mockupSource, /triggerRef\.current\?\.focus\(\)/);
  const headingRule = styles.match(/\.nsf-hero-copy h1\s*\{([^}]*)\}/);
  assert.ok(headingRule, "Expected a compact homepage heading rule");
  assert.ok(maxPixelValueFor(headingRule[1], "font-size") <= 44);
});
