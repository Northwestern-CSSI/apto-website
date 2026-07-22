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
  "nsfhome",
  "nsfhomewidgets",
  "nsfledger",
  "nsfledgerwidgets",
  "nsfnetwork",
  "nsfnetworkwidgets",
];
const atlasPages = [
  ["", "home", "/"],
  ["/projects", "projects", "/projects"],
  ["/tools", "tools", "/tools"],
  ["/cohort", "cohort", "/cohort"],
];
const baseline = {
  assets: 12,
  participants: 5,
  people: 13,
  projects: 5,
  tools: 10,
};
const nsfBoilerplate =
  "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.";
const imageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

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

function routedAptoMarkup(html) {
  const marker = '<div class="concept concept-apto nsf-apto is-routed">';
  const start = html.indexOf(marker);
  assert.ok(start >= 0, "Expected the shared routed APTO root");
  const divTags = /<\/?div\b[^>]*>/gi;
  divTags.lastIndex = start;
  let depth = 0;
  for (let match = divTags.exec(html); match; match = divTags.exec(html)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, divTags.lastIndex);
  }
  assert.fail("Shared routed APTO root did not close");
}

function storyAptoMarkup(html) {
  const marker = '<div class="apto-story"';
  const start = html.indexOf(marker);
  assert.ok(start >= 0, "Expected the shared long-scroll APTO root");
  const divTags = /<\/?div\b[^>]*>/gi;
  divTags.lastIndex = start;
  let depth = 0;
  for (let match = divTags.exec(html); match; match = divTags.exec(html)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, divTags.lastIndex);
  }
  assert.fail("Shared long-scroll APTO root did not close");
}

function atlasAptoMarkup(html) {
  const marker = '<div class="apto-atlas"';
  const start = html.indexOf(marker);
  assert.ok(start >= 0, "Expected the shared APTO Atlas root");
  const divTags = /<\/?div\b[^>]*>/gi;
  divTags.lastIndex = start;
  let depth = 0;
  for (let match = divTags.exec(html); match; match = divTags.exec(html)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, divTags.lastIndex);
  }
  assert.fail("Shared APTO Atlas root did not close");
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
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name.toLowerCase() !== "readme.md")
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

async function imageFilesRecursively(directory) {
  return (await filesRecursively(directory)).filter((file) => {
    const pathname = file.pathname.toLowerCase();
    return [...imageExtensions].some((extension) => pathname.endsWith(extension));
  });
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
    await readFile(new URL("../app/apto/content.generated.json", import.meta.url), "utf8"),
  );
}

test("renders the selected APTO design at the repository root", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /<AptoRoutePage section="home" \/>/);
  assert.doesNotMatch(source, /redirect\(/);

  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /class="concept concept-apto nsf-apto is-routed"/);
  assert.match(html, /class="nsf-program-hero has-partner-grid"/);
});

test("renders one shared, content-complete long-scroll story at both public routes", async () => {
  const content = await generatedContent();
  const expectedSections = ["program", "projects", "tools", "cohort"];
  let sharedMarkup;

  for (const path of ["/story", "/apto/story"]) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    const markup = storyAptoMarkup(html);
    const text = visibleText(markup);

    sharedMarkup ??= markup;
    assert.equal(markup, sharedMarkup, `${path} must use the same long-scroll component tree`);
    assert.equal(countMatches(markup, /<main\b/g), 1);
    assert.equal(countMatches(markup, /<h1\b/g), 1);
    assert.equal(countMatches(markup, /role="switch"/g), 1);
    assert.match(markup, /class="story-skip-link" href="#story-main"/);
    assert.match(markup, /<header class="story-header"/);
    assert.match(markup, /<main id="story-main" tabindex="-1">/i);

    const primaryNav = markup.match(new RegExp(
      `<nav[^>]*aria-label="${escapeRegex(content.interface.story.navigationLabel)}"[^>]*>([\\s\\S]*?)<\\/nav>`,
    ));
    assert.ok(primaryNav, `${path} should label the sticky story navigation`);
    assert.deepEqual(
      [...primaryNav[1].matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
      expectedSections.map((section) => `#story-${section}`),
    );
    assert.equal(countMatches(primaryNav[1], /aria-current="location"/g), 1);
    assert.match(primaryNav[1], /href="#story-program" aria-current="location"/);

    for (const section of expectedSections) {
      assert.equal(countMatches(markup, new RegExp(`id="story-${section}"`, "g")), 1);
      assert.match(markup, new RegExp(`id="story-${section}"[^>]*data-story-section="${section}"`));
    }

    assert.ok(text.includes(content.program.description));
    assert.ok(text.includes(content.program.objectivesTitle));
    for (const objective of content.program.objectives) assert.ok(text.includes(objective));

    assert.equal(countMatches(markup, /class="story-project-chapter"/g), content.projects.length);
    assert.equal(countMatches(markup, /class="story-tool"/g), content.tools.length);
    assert.equal(countMatches(markup, /class="story-cohort-group"/g), content.participants.length);
    const projectMap = markup.match(/<div class="story-map">([\s\S]*?)<\/div>/);
    assert.ok(projectMap, "The story should include the keyboard-operable project map");
    assert.equal(countMatches(projectMap[1], /href="#story-project-/g), content.projects.length);
    assert.doesNotMatch(projectMap[1], /tabindex="-1"/i);
    for (const project of content.projects) {
      assert.ok(text.includes(project.shortName));
      assert.ok(text.includes(project.summary));
      assert.ok(markup.includes(`id="story-project-${project.id}"`));
      assert.ok(projectMap[1].includes(`aria-label="${project.organization}: ${project.shortName}"`));
    }

    const toolArticles = markup.match(/<article class="story-tool"[\s\S]*?<\/article>/g) ?? [];
    assert.equal(toolArticles.length, content.tools.length);
    for (const tool of content.tools) {
      const article = toolArticles.find((candidate) => visibleText(candidate).includes(tool.name));
      assert.ok(article, `${tool.name} should render in the story tool collection`);
      assert.ok(visibleText(article).includes(tool.description));
      assert.ok(visibleText(article).includes(tool.useCase));
      const figure = article.match(new RegExp(`<img[^>]*src="${escapeRegex(tool.figure.src)}"[^>]*>`));
      assert.ok(figure, `${tool.name} should render its Markdown-managed figure`);
      assert.match(figure[0], /loading="lazy"/);
      assert.match(figure[0], /decoding="async"/);
      assert.ok(figure[0].includes(`alt="${tool.figure.alt}"`));
    }

    for (const participant of content.participants) {
      assert.ok(text.includes(participant.displayName));
      assert.ok(text.includes(participant.location));
      assert.ok(markup.includes(`href="${participant.website}"`));
      for (const person of participant.people) {
        assert.ok(text.includes(person.name));
        assert.ok(text.includes(person.role));
      }
    }
    for (const person of content.program.programTeam) {
      assert.ok(text.includes(person.name));
      assert.ok(text.includes(person.role));
    }
    assert.ok(text.includes("Rebecca Chmiel"));
    assert.ok(text.includes(content.boilerplate));
    assert.ok(markup.includes(`src="${content.interface.footer.nsfLogoSrc}"`));

    const heroImage = markup.match(/<div class="story-hero-image"[^>]*>[\s\S]*?<img\b[^>]*>/);
    assert.ok(heroImage, "The story hero should render its featured Markdown-managed figure");
    assert.match(heroImage[0], /fetch[Pp]riority="high"/);
    assert.doesNotMatch(heroImage[0], /loading="lazy"/);
  }
});

test("implements the story as an accessible, theme-aware progressive scroll experience", async () => {
  const [source, styles, layout, storyRoute, nestedStoryRoute] = await Promise.all([
    readFile(new URL("../app/apto/story/story-site.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/story/story-site.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/story/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/story/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(storyRoute, /<AptoStoryPage \/>/);
  assert.match(nestedStoryRoute, /<AptoStoryPage \/>/);
  assert.match(layout, /import "\.\/apto\/story\/story-site\.css"/);
  assert.match(source, /useAptoTheme\("light"\)/);
  assert.match(source, /role="switch"/);
  assert.match(source, /aria-current=\{activeSection === section \? "location" : undefined\}/);
  assert.match(source, /new IntersectionObserver/);
  assert.match(source, /requestAnimationFrame\(updateScrollState\)/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /withDeploymentBase\(tool\.figure\.src\)/);
  assert.match(source, /withDeploymentBase\(aptoInterface\.story\.cohortArtSrc\)/);
  assert.match(source, /loading="lazy"/);
  assert.match(source, /fetchPriority="high"/);
  assert.doesNotMatch(source, /(?:wheel|touchmove)[\s\S]{0,100}preventDefault/);

  assert.match(styles, /\.story-header\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(styles, /\.story-project-stage\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(styles, /scroll-margin-top:/);
  assert.doesNotMatch(styles, /content-visibility:\s*auto/, "Anchor positions should not depend on estimated off-screen layout");
  assert.match(styles, /\[data-apto-theme="dark"\] \.apto-story/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(forced-colors: active\)/);
  assert.match(styles, /\.story-skip-link:focus/);
  assert.match(styles, /min-height:\s*44px/);
  assert.doesNotMatch(styles, /scroll-snap-type/);
  assert.doesNotMatch(styles, /animation:[^;]*infinite/);
});

test("renders one shared, content-complete APTO Atlas page tree at both route families", async () => {
  const content = await generatedContent();
  const routeBase = process.env.NEXT_PUBLIC_APTO_ROUTE_BASE ?? "/apto";
  const expectedNavigation = ["/atlas", "/atlas/projects", "/atlas/tools", "/atlas/cohort"]
    .map((path) => `${routeBase}${path}` || "/");

  for (const [suffix, section, slug] of atlasPages) {
    let sharedMarkup;
    for (const prefix of ["/atlas", "/apto/atlas"]) {
      const path = `${prefix}${suffix}`;
      const response = await render(path);
      assert.equal(response.status, 200, `${path} should render`);
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
      const html = await response.text();
      const markup = atlasAptoMarkup(html);
      const text = visibleText(markup);
      const page = content.pages.find((candidate) => candidate.slug === slug);

      assert.ok(page, `Missing generated page for ${slug}`);
      sharedMarkup ??= markup;
      assert.equal(markup, sharedMarkup, `${path} must use the shared Atlas component tree`);
      assert.equal(countMatches(markup, /<main\b/g), 1);
      assert.equal(countMatches(markup, /<h1\b/g), 1);
      assert.equal(countMatches(markup, /role="switch"/g), 1);
      assert.match(markup, /class="atlas-skip-link" href="#atlas-main"/);
      assert.match(markup, /<header class="atlas-header"/);
      assert.match(markup, /<main[^>]*id="atlas-main"[^>]*tabindex="-1"/i);
      assert.ok(text.includes(page.eyebrow));
      assert.ok(text.includes(page.title));
      assert.ok(text.includes(page.introduction));
      assert.ok(text.includes(content.boilerplate));
      assert.ok(markup.includes(`src="${content.interface.footer.nsfLogoSrc}"`));

      const primaryNav = markup.match(new RegExp(
        `<nav[^>]*aria-label="${escapeRegex(content.interface.atlas.navigationLabel)}"[^>]*>([\\s\\S]*?)<\\/nav>`,
      ));
      assert.ok(primaryNav, `${path} should label the Atlas primary navigation`);
      assert.deepEqual(
        [...primaryNav[1].matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
        expectedNavigation,
      );
      assert.equal(countMatches(primaryNav[1], /aria-current="page"/g), 1);
      assert.match(primaryNav[1], new RegExp(
        `href="${escapeRegex(expectedNavigation[atlasPages.findIndex((candidate) => candidate[1] === section)])}" aria-current="page"`,
      ));

      if (section === "home") {
        assert.ok(text.includes(content.program.description));
        for (const objective of content.program.objectives) assert.ok(text.includes(objective));
        assert.equal(countMatches(markup, /class="atlas-organization-index"/g), 1);
      } else if (section === "projects") {
        assert.equal(countMatches(markup, /<details class="atlas-project-folio"/g), content.projects.length);
        assert.equal(countMatches(markup, /class="atlas-map-pin"/g), content.projects.length);
        for (const project of content.projects) {
          assert.ok(text.includes(project.shortName));
          assert.ok(text.includes(project.summary));
          assert.ok(markup.includes(`id="atlas-project-${project.id}"`));
        }
      } else if (section === "tools") {
        assert.equal(countMatches(markup, /<article class="atlas-tool-card/g), content.tools.length);
        assert.equal(countMatches(markup, /<select\b/g), 2);
        for (const tool of content.tools) {
          assert.ok(text.includes(tool.name));
          assert.ok(text.includes(tool.description));
          assert.ok(text.includes(tool.useCase));
        }
      } else {
        assert.equal(countMatches(markup, /<article class="atlas-team-chapter/g), content.participants.length);
        assert.ok(text.includes("Rebecca Chmiel"));
        for (const participant of content.participants) {
          assert.ok(text.includes(participant.displayName));
          for (const person of participant.people) assert.ok(text.includes(person.name));
        }
      }
    }
  }
});

test("renders the Atlas tool gallery as ten accessible, Markdown-backed image posters", async () => {
  const content = await generatedContent();
  const response = await render("/atlas/tools");
  assert.equal(response.status, 200);
  const markup = atlasAptoMarkup(await response.text());
  const articles = markup.match(/<article class="atlas-tool-card[\s\S]*?<\/article>/g) ?? [];

  assert.equal(content.tools.length, 10, "The current APTO release should expose ten tools");
  assert.equal(articles.length, content.tools.length);
  assert.equal(countMatches(markup, /class="atlas-tool-toggle"/g), content.tools.length);
  assert.equal(countMatches(markup, /aria-expanded="false"/g), content.tools.length);
  assert.equal(countMatches(markup, /aria-live="polite"/g), 1);
  assert.match(markup, /<fieldset[^>]*aria-label="[^"]+"/);

  for (const tool of content.tools) {
    assert.ok(tool.galleryImages.length >= 1, `${tool.name} needs at least one gallery image`);
    const article = articles.find((candidate) => visibleText(candidate).includes(tool.name));
    assert.ok(article, `${tool.name} should render as an Atlas poster`);
    const detailsId = `atlas-tool-details-${tool.id}`;
    assert.ok(article.includes(`id="${detailsId}"`));
    assert.ok(article.includes(`aria-controls="${detailsId}"`));
    assert.ok(article.includes("loading=\"lazy\""));
    assert.ok(article.includes("decoding=\"async\""));

    for (const [index, image] of tool.galleryImages.entries()) {
      const renderedImage = article.match(new RegExp(`<img[^>]*src="${escapeRegex(image.src)}"[^>]*>`));
      assert.ok(renderedImage, `${tool.name} should render gallery image ${image.src}`);
      assert.match(renderedImage[0], /loading="lazy"/);
      assert.match(renderedImage[0], /decoding="async"/);
      if (index === 0) assert.ok(renderedImage[0].includes(`alt="${image.alt}"`));
    }

    const supportingFigure = article.match(new RegExp(`<img[^>]*src="${escapeRegex(tool.figure.src)}"[^>]*>`));
    assert.ok(supportingFigure, `${tool.name} should include its supporting tool figure`);
    assert.match(supportingFigure[0], /aria-hidden="true"/);
    assert.match(supportingFigure[0], /alt=""/);
  }
});

test("keeps the Atlas poster grid responsive, stable, motion-safe, and deeply dark", async () => {
  const [source, styles, layout, route, nestedRoute] = await Promise.all([
    readFile(new URL("../app/apto/atlas/atlas-site.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/atlas/atlas-site.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/atlas/tools/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/atlas/tools/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(route, /<AtlasSitePage section="tools" \/>/);
  assert.match(nestedRoute, /<AtlasSitePage section="tools" \/>/);
  assert.match(layout, /import "\.\/apto\/atlas\/atlas-site\.css"/);
  assert.match(source, /useAptoTheme\("light"\)/);
  assert.match(source, /role="switch"/);
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /aria-controls=\{detailId\}/);
  assert.match(source, /withDeploymentBase\(image\.src\)/);
  assert.match(source, /loading="lazy"/);

  assert.match(styles, /\.atlas-tool-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /@media \(max-width:\s*1180px\)[\s\S]*?\.atlas-tool-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /@media \(max-width:\s*719px\)[\s\S]*?\.atlas-tool-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(styles, /\.atlas-tool-card\s*\{[^}]*aspect-ratio:\s*5\s*\/\s*6/);
  assert.match(styles, /\.atlas-tool-media img\s*\{[^}]*transition:[^;}]*transform\s+6\.8s/);
  assert.doesNotMatch(styles, /animation(?:-name)?:\s*[^;]*infinite/i);
  assert.doesNotMatch(styles, /animation-iteration-count:\s*infinite/i);
  assert.doesNotMatch(styles, /\.atlas-tool-card(?::hover|:focus-within|\.is-expanded)\s*\{[^}]*(?:transform|scale|width|height)\s*:/);
  assert.match(styles, /\[data-apto-theme="dark"\] \.apto-atlas\s*\{[^}]*--atlas-canvas:\s*#020c16/);
  assert.match(styles, /\[data-apto-theme="dark"\] \.apto-atlas\s*\{[^}]*color-scheme:\s*dark/);
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /animation-iteration-count:\s*1\s*!important/);
  assert.match(styles, /\.atlas-tool-media img,[\s\S]*?transform:\s*none\s*!important/);
  assert.match(styles, /@media \(forced-colors:\s*active\)/);
  assert.match(styles, /\.atlas-tool-card::after\s*\{[^}]*border:\s*2px solid CanvasText/);
  assert.match(styles, /\.atlas-header\s*\{[^}]*position:\s*sticky/);
  assert.match(styles, /\.atlas-skip-link:focus/);
  assert.match(styles, /min-height:\s*44px/);
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

test("renders one shared page structure, supports both themes, and preserves every published concept alias", async () => {
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

  let aliasMarkup;
  for (const concept of legacyConceptAliases) {
    const response = await render(`/apto?concept=${concept}`);
    assert.equal(response.status, 200, `${concept} should render`);
    const html = await response.text();
    const markup = routedAptoMarkup(html);
    assert.match(markup, /concept-apto\b/);
    assert.doesNotMatch(markup, /nsf-apto-(?:home|network)\b/);
    assert.doesNotMatch(markup, /tone-(?:light|dark)\b/);
    assert.doesNotMatch(markup, /href="[^"]*\?concept=/);
    assert.equal(countMatches(markup, /role="switch"/g), 1);
    assert.equal(countMatches(markup, /class="nsf-theme-switch"/g), 1);
    assert.match(markup, /id="apto-main"/);
    aliasMarkup ??= markup;
    assert.equal(markup, aliasMarkup, `${concept} must use the identical routed component tree`);
    assert.equal(countMatches(html, /class="nsf-hero-widget(?:\s|")/g), 0, `${concept} home should not show a tool widget`);
    assert.equal(countMatches(html, /role="tab"/g), 0);
  }

  for (const [route, slug, section] of canonicalPages) {
    let sharedMarkup;
    for (const concept of ["nsfhome", "nsfnetwork"]) {
      const response = await render(`/apto${route}?concept=${concept}`);
      assert.equal(response.status, 200, `${section} ${concept} should render`);
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
      const html = await response.text();
      const markup = routedAptoMarkup(html);
      const text = visibleText(html);
      const page = content.pages.find((candidate) => candidate.slug === slug);
      assert.ok(page, `Missing generated page for ${slug}`);
      assert.ok(html.includes(`<title>${page.metadataTitle} | ${content.program.acronym}</title>`));
      assert.equal(countMatches(html, /<main\b/g), 1);
      assert.equal(countMatches(html, /<h1\b/g), 1);
      assert.match(html, /class="nsf-skip-link"/);
      assert.equal(countMatches(markup, /role="switch"/g), 1);
      assert.doesNotMatch(markup, /href="[^"]*\?concept=/);
      sharedMarkup ??= markup;
      assert.equal(markup, sharedMarkup, `${section} light and dark URLs must share exact markup`);

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
  assert.match(peopleHtml, /concept-apto\b/);
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
    readFile(new URL("../app/apto/site.tsx", import.meta.url), "utf8"),
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
  assert.equal(countMatches(html, /class="nsf-tool-image-frame"/g), content.tools.length);

  const figureSources = content.tools.map((tool) => tool.figure.src);
  assert.equal(new Set(figureSources).size, content.tools.length, "Every tool needs a distinct original-design figure");

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
    assert.match(tool.figure.src, new RegExp(`/tools/previews/${tool.id}\\.(?:avif|jpe?g|png|webp)$`));
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
    assert.doesNotMatch(html, /--cohort-accent/, "Cohort hierarchy must not depend on decorative participant edge colors");

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
  const [content, generator, dataSource, siteSource, routeSource, themeSource, themeHookSource, styles, rootLayout] = await Promise.all([
    generatedContent(),
    readFile(new URL("../scripts/build-apto-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/site.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/_route-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/theme.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/use-apto-theme.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/apto/site.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  const directories = {
    pages: await markdownFileNames(new URL("pages/", contentRoot)),
    participants: await markdownFileNames(new URL("participants/", contentRoot)),
    people: await markdownFileNames(new URL("people/", contentRoot)),
    projects: await markdownFileNames(new URL("projects/", contentRoot)),
    tools: await markdownFileNames(new URL("tools/", contentRoot)),
  };
  const allAssetFiles = await filesRecursively(new URL("assets/", contentRoot));
  const assets = await imageFilesRecursively(new URL("assets/", contentRoot));

  assert.deepEqual(directories.pages, ["about.md", "cohort.md", "home.md", "projects.md", "tools.md"]);
  assert.ok(allAssetFiles.some((file) => file.pathname.endsWith("/README.md")));
  for (const directory of Object.keys(directories)) {
    const entries = await readdir(new URL(`${directory}/`, contentRoot));
    assert.ok(entries.includes("README.md"), `${directory} needs an authoring guide`);
  }
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
  assert.equal(content._generated.generatedFrom.some((filename) => filename.endsWith("/README.md")), false);

  const referencedAssetPaths = new Set([
    content.interface.study.socialImageSrc,
    content.interface.story.socialImageSrc,
    content.interface.story.cohortArtSrc,
    content.interface.atlas.socialImageSrc,
    content.interface.footer.nsfLogoSrc,
    content.interface.projects.map.imageUrl,
    ...content.participants.map((participant) => participant.logo.src),
    ...content.program.programTeam.map((person) => person.headshotUrl).filter(Boolean),
    ...content.participants.flatMap((participant) => (
      participant.people.map((person) => person.headshotUrl).filter(Boolean)
    )),
    ...content.tools.map((tool) => tool.figure.src),
    ...content.tools.flatMap((tool) => tool.galleryImages.map((image) => image.src)),
  ].map((publicPath) => publicPath.replace(/^\/apto\//, "")));
  const sourceAssetPaths = new Set(assets.map((file) => (
    decodeURIComponent(file.pathname.slice(new URL("assets/", contentRoot).pathname.length))
  )));
  assert.deepEqual(sourceAssetPaths, referencedAssetPaths, "Every source image must be referenced by live content");

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
  const publicAssets = await filesRecursively(new URL("../public/apto/", import.meta.url));
  assert.equal(publicAssets.length, assets.length, "Generated public assets must not retain deleted source images");
  assert.equal(publicAssets.some((file) => file.pathname.endsWith("/README.md")), false);

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
  for (const record of records) {
    assert.equal(record.name, `${record.metadata.id}.md`, `${record.directory}/${record.name} must match its record id`);
  }

  for (const participant of content.participants) {
    assert.ok(participant.people.length > 0);
    assert.ok(content.projects.some((project) => project.participantId === participant.id));
    assert.ok(content.tools.some((tool) => tool.participantId === participant.id));
    assert.deepEqual(
      participant.people.map((person) => person.name),
      sortedAlphabetically(participant.people.map((person) => person.name)),
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
  assert.deepEqual(
    content.projects.map((project) => project.shortName),
    sortedAlphabetically(content.projects.map((project) => project.shortName)),
  );

  assert.match(generator, /const participantDirectory = path\.join\(contentDirectory, "participants"\)/);
  assert.match(generator, /const peopleDirectory = path\.join\(contentDirectory, "people"\)/);
  assert.match(generator, /const assetDirectory = path\.join\(contentDirectory, "assets"\)/);
  assert.match(generator, /path\.relative\(assetDirectory, assetFile\)/);
  assert.match(generator, /fileStatus\.isFile\(\)/);
  assert.match(generator, /allowedImageExtensions/);
  assert.match(generator, /entry\.name\.toLowerCase\(\) !== "readme\.md"/);
  assert.match(generator, /assertEveryAssetIsReferenced/);
  assert.match(generator, /requireOptionalLocalImage/);
  assert.match(generator, /participantFiles\.length > 0/);
  assert.match(generator, /peopleFiles\.length > 0/);
  assert.match(generator, /projectFiles\.length > 0/);
  assert.match(generator, /toolFiles\.length > 0/);
  assert.match(generator, /syncAssets\(content\.assetFiles, checkOnly\)/);
  assert.doesNotMatch(generator, /toolFiles\.length === \d+/);
  assert.doesNotMatch(generator, /must have exactly 2 tools|count === 2/);
  assert.match(dataSource, /import generatedContent from "\.\/content\.generated\.json"/);
  assert.doesNotMatch(dataSource, /export const apto(?:Projects|Participants|MockTools)\s*=\s*\[/);

  assert.match(routeSource, /<AptoSitePage section=\{section\} \/>/);
  assert.doesNotMatch(routeSource, /conceptFromSearchParams|directionFor/);
  assert.match(themeSource, /window\.localStorage\.getItem\(storageKey\)/);
  assert.match(themeSource, /window\.sessionStorage\.getItem\(sessionKey\)/);
  assert.match(themeSource, /nsfnetwork\(\?:widgets\)\?/);
  assert.match(themeSource, /nsfhome\|nsfledger/);
  assert.match(themeSource, /prefers-color-scheme: dark/);
  assert.match(themeSource, /storedTheme \|\| queryTheme \|\| sessionTheme/);
  assert.match(rootLayout, /aptoInterface\.study/);
  assert.match(rootLayout, /<html lang="en" suppressHydrationWarning>/);
  assert.match(rootLayout, /template: `%s \| \$\{title\}`/);
  assert.match(rootLayout, /id="apto-theme-bootstrap"/);
  assert.match(siteSource, /role="switch"/);
  assert.match(siteSource, /aria-checked=\{theme === "dark"\}/);
  assert.match(siteSource, /useAptoTheme\("light"\)/);
  assert.match(themeHookSource, /preference\.addEventListener\("change", handlePreferenceChange\)/);
  assert.match(themeHookSource, /preference\.removeEventListener\("change", handlePreferenceChange\)/);
  assert.match(themeHookSource, /window\.addEventListener\("storage", handleStorage\)/);
  assert.match(themeHookSource, /window\.removeEventListener\("storage", handleStorage\)/);
  assert.match(themeHookSource, /window\.history\.replaceState/);
  assert.match(siteSource, /withDeploymentBase\(person\.headshotUrl\)/);
  assert.doesNotMatch(siteSource, /tone-\$\{tone\}/);

  assert.match(styles, /\.nsf-apto :focus-visible/);
  assert.match(styles, /\.nsf-skip-link:focus/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(forced-colors: active\)/);
  assert.match(styles, /forced-color-adjust/);
  assert.match(styles, /color-scheme:\s*dark/);
  assert.match(styles, /\.nsf-apto-network,\s*\.nsf-apto-network \.nsf-apto\s*\{[^}]*--nsf-paper:/);
  assert.match(styles, /\.nsf-apto-home,\s*\.nsf-apto-home \.nsf-apto\s*\{[^}]*--nsf-paper:/);
  assert.match(styles, /\.nsf-theme-switch-track\s*\{[^}]*width:\s*38px[^}]*height:\s*22px/);
  assert.match(styles, /\.nsf-theme-switch button\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/);
  assert.match(styles, /data-apto-theme="dark"[^\n]*\.nsf-theme-switch-thumb[^\n]*translateX\(16px\)/);
  assert.match(styles, /\.nsf-awardee-map-plot\s*\{[^}]*aspect-ratio:\s*959\s*\/\s*593/);
  assert.match(styles, /\.nsf-tool-image-frame\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*10[^}]*overflow:\s*hidden/);
  assert.match(styles, /\.nsf-tool-image-frame > img,[\s\S]*?padding:\s*0[^}]*object-fit:\s*cover[^}]*object-position:\s*center/);
  assert.match(styles, /\.nsf-tool-figure\s*\{[^}]*align-self:\s*start/);
  assert.doesNotMatch(styles, /\.nsf-tool-image-frame > img,[^}]*object-fit:\s*contain/);
  assert.match(styles, /\.nsf-section-intro \.nsf-section-intro-description\s*\{[^}]*text-align:\s*left/);
  assert.doesNotMatch(styles, /\.nsf-(?:program-leadership|cohort-group)::before/);
  assert.match(styles, /Cohort chapters use common regions and whitespace, never decorative edge bars/);
  assert.match(styles, /\.nsf-cohort-directory\s*\{[^}]*gap:\s*clamp\(34px,\s*5vw,\s*64px\)/);
  assert.match(styles, /\.nsf-cohort-group-header \.nsf-participant-mark\.is-feature img\s*\{[^}]*max-height:\s*62px/);
  assert.match(styles, /\.nsf-participant-mark\.logo-aperture\.is-directory img\s*\{[^}]*max-width:\s*48px/);
  assert.match(styles, /\.nsf-awardee-map-pin:hover::before,[\s\S]*?transform:\s*none/);
  assert.match(siteSource, /document\.addEventListener\("pointerdown", handlePointerDown\)/);
  assert.match(siteSource, /!rootRef\.current\?\.contains\(target\)/);
  assert.match(siteSource, /document\.removeEventListener\("pointerdown", handlePointerDown\)/);
  assert.match(siteSource, /event\.key !== "Escape"/);
  assert.match(siteSource, /triggerRef\.current\?\.focus\(\)/);
  const headingRule = styles.match(/\.nsf-hero-copy h1\s*\{([^}]*)\}/);
  assert.ok(headingRule, "Expected a compact homepage heading rule");
  assert.ok(maxPixelValueFor(headingRule[1], "font-size") <= 44);
});
