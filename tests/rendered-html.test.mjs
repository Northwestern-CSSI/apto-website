import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

let workerModule;

async function render(pathname = "/") {
  if (!workerModule) {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
    workerModule = import(workerUrl.href);
  }
  const { default: worker } = await workerModule;
  return worker.fetch(new Request(new URL(pathname, "http://localhost"), { headers: { accept: "text/html" }, redirect: "manual" }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

async function content() {
  return JSON.parse(await readFile(new URL("../app/apto/content.generated.json", import.meta.url), "utf8"));
}

test("publishes only the Story and Atlas presentation families", async () => {
  for (const path of ["/", "/story", "/apto/story"]) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render`);
    const html = await response.text();
    assert.match(html, /class="apto-story"/);
    assert.doesNotMatch(html, /concept-apto|Scroll to explore|story-map|us-map\.svg/i);
  }

  for (const prefix of ["/atlas", "/apto/atlas"]) {
    for (const suffix of ["", "/projects", "/tools", "/convening"]) {
      const path = `${prefix}${suffix}`;
      const response = await render(path);
      assert.equal(response.status, 200, `${path} should render`);
      assert.match(await response.text(), /class="apto-atlas"/);
    }
  }

  for (const path of ["/projects", "/tools", "/cohort", "/convening", "/tools-lab", "/apto/projects", "/apto/cohort", "/apto/tools-lab", "/atlas/cohort", "/apto/atlas/cohort"]) {
    assert.equal((await render(path)).status, 404, `${path} should no longer expose a retired presentation`);
  }
});

test("generated content follows the featured-institution order and supplied-image model", async () => {
  const data = await content();
  assert.deepEqual(data.participants.map((participant) => participant.id), ["northwestern", "uchicago", "aperture", "insilicom", "macrocosm"]);
  assert.deepEqual(Object.fromEntries(data.participants.map((participant) => [participant.id, participant.accent])), {
    northwestern: "#4E2A84",
    uchicago: "#800000",
    aperture: "#7B7BE2",
    insilicom: "#78B52A",
    macrocosm: "#0D5C8F",
  });
  assert.deepEqual(data.projects.map((project) => project.participantId), ["northwestern", "uchicago", "aperture", "insilicom", "macrocosm"]);
  assert.equal(data.tools.filter((tool) => tool.participantId === "northwestern").length, 6);
  assert.equal(data.tools.filter((tool) => tool.participantId === "uchicago").length, 6);
  assert.deepEqual(data.tools.filter((tool) => tool.participantId === "northwestern").map((tool) => tool.name), [
    "Aggregating Research Pipeline At Scale Tool",
    "Agentic Framework For Technology Outcomes Tool",
    "Multi-Objective Technology Outcomes Tool",
    "Predicting Technological Evolution Tool",
    "Emerging Technology Detection Tool",
    "Tool A",
  ]);
  assert.deepEqual(data.tools.filter((tool) => tool.participantId === "uchicago").map((tool) => tool.name), [
    "Data",
    "AI Skills",
    "AI Benchmarks",
    "The Parable Tool",
    "Dashboards",
    "AI Infrastructure",
  ]);
  for (const tool of data.tools.filter((candidate) => candidate.participantId === "uchicago")) {
    assert.ok(tool.summaryParagraphs.every((paragraph) => /^(?:Lorem ipsum|Sed posuere)/.test(paragraph)));
    assert.ok(tool.resources.every((resource) => /^(?:Lorem ipsum|Cras mattis|Maecenas sed diam)/.test(resource.description)));
  }
  for (const participantId of ["aperture", "insilicom", "macrocosm"]) {
    const placeholderTools = data.tools.filter((tool) => tool.participantId === participantId);
    assert.deepEqual(placeholderTools.map((tool) => tool.name), ["Tool A", "Tool B"]);
    assert.ok(placeholderTools.every((tool) => tool.summaryParagraphs.every((paragraph) => /^Lorem ipsum|^Aliquam|^Curabitur|^Vestibulum|^Nullam|^Cras|^Nunc/.test(paragraph))));
    assert.ok(placeholderTools.every((tool) => tool.resources.map((resource) => resource.name).join(",") === "Piece A,Piece B"));
  }
  for (const tool of data.tools) {
    assert.equal(tool.summaryParagraphs.length, 2, `${tool.name} should expose exactly two compact summary paragraphs`);
    const media = [tool.figure, ...tool.galleryImages];
    assert.equal(media.length, 4, `${tool.name} should have four Ken Burns frames`);
    assert.equal(new Set(media.map((image) => image.src)).size, 4, `${tool.name} frames should be distinct`);
    const mediaRoot = tool.participantId === "northwestern" ? "/apto/tools/photography/" : "/apto/tools/placeholders/";
    assert.ok(media.every((image) => image.src.startsWith(mediaRoot)), `${tool.name} should use its designated photography collection`);
    assert.ok(tool.resources.length > 0, `${tool.name} should expose supporting pieces`);
    assert.equal(new Set(tool.resources.map((resource) => resource.image.src)).size, tool.resources.length, `${tool.name} supporting pieces should use distinct images`);
    for (const resource of tool.resources) {
      assert.match(resource.image.src, /^\/apto\/tools\/icons\/[a-z0-9-]+\.svg$/);
      if (resource.status === "coming-soon") assert.equal(resource.url, null);
    }
  }
  const nonNorthwesternTools = data.tools.filter((tool) => tool.participantId !== "northwestern");
  const placeholderImages = new Set(nonNorthwesternTools.flatMap((tool) => [tool.figure, ...tool.galleryImages].map((image) => image.src)));
  assert.equal(placeholderImages.size, 10);
  assert.equal(new Set(nonNorthwesternTools.map((tool) => [tool.figure, ...tool.galleryImages].map((image) => image.src).join("|"))).size, nonNorthwesternTools.length);
  const agenticTool = data.tools.find((tool) => tool.id === "agentic-framework-for-technology-outcome-mining");
  assert.deepEqual(agenticTool.resources.map((resource) => resource.name), [
    "Perovskite Dataset",
    "Quantum Dataset",
  ]);
  assert.ok(agenticTool.resources.every((resource) => !/slides/i.test(`${resource.name} ${resource.description}`)));
  const emergingTool = data.tools.find((tool) => tool.id === "emerging-technology-detection");
  assert.ok(emergingTool.resources.some((resource) => resource.name === "Science Maps"));
  assert.doesNotMatch(JSON.stringify(data.tools), /—/);
  assert.equal(data.convenings[0].images.length, 4);
  assert.ok(data.convenings[0].images.some((image) => image.src.endsWith("cohort-portrait.jpg")));
  const investigatorRank = new Map([["Principal Investigator", 0], ["Co-Principal Investigator", 1]]);
  for (const participant of data.participants) {
    assert.deepEqual(
      participant.people.map((person) => investigatorRank.get(person.role) ?? 2),
      participant.people.map((person) => investigatorRank.get(person.role) ?? 2).toSorted((left, right) => left - right),
      `${participant.displayName} should list principal investigators before co-principal investigators`,
    );
  }
  for (const project of data.projects) {
    assert.deepEqual(
      project.people.map((person) => person.id),
      data.participants.find((participant) => participant.id === project.participantId).people.map((person) => person.id),
    );
  }
  const northwesternPeople = data.participants.find((participant) => participant.id === "northwestern").people;
  assert.deepEqual(
    northwesternPeople.filter((person) => person.headshotUrl).map((person) => person.id),
    ["dashun-wang", "alicia-loffler", "benjamin-jones", "jian-cao", "yian-yin"],
  );
  assert.deepEqual(data.program.programTeam.map((person) => [person.name, person.role]), [
    ["Rebecca Chmiel", "Program Manager"],
    ["Chaitanya Baru", "Program Contact"],
    ["Megan Catterton", "Program Contact"],
  ]);
  assert.equal(data.program.programTeam.find((person) => person.id === "rebecca-chmiel").email, "rjchmiel@nsf.gov");
  assert.equal(data.convenings[0].location, "Washington, D.C.");
});

test("Story gives project titles full card width and pairs lead-institution tools", async () => {
  const data = await content();
  const html = await (await render("/story")).text();
  assert.equal((html.match(/class="story-outcome-depth"/g) ?? []).length, 3);
  for (const output of ["Technology Outcome Models", "Causal, predictive models", "Datasets", "Tools"]) assert.ok(html.includes(output));
  assert.match(html, /About the APTO Program/);
  assert.match(html, /The first APTO cohort includes/);
  for (const organization of ["Northwestern University", "University of Chicago", "Apperture.AI", "Insilicom", "Macrocosm"]) assert.ok(html.includes(organization));
  for (const project of data.projects) assert.ok(html.includes(`href="#story-project-${project.id}"`));
  assert.match(html, /What We Are Building/);
  assert.match(html, /class="story-section story-impact" id="story-impact"/);
  assert.match(html, /class="story-impact-layout"/);
  assert.ok((html.match(/data-story-reveal="right"/g) ?? []).length >= data.program.objectives.length);
  assert.match(html, /Together, the APTO cohort is working to achieve/);
  assert.match(html, /Led by Northwestern University/);
  assert.doesNotMatch(html, /story-cohort|story-nav-cohort|>Cohort</);
  assert.ok((html.match(/class="story-project-people"/g) ?? []).length >= data.projects.length);
  assert.ok((html.match(/class="story-person"/g) ?? []).length >= data.participants.reduce((sum, participant) => sum + participant.people.length, 0));
  assert.match(html, /Program contacts/);
  assert.match(html, /Rebecca Chmiel<!-- -->, <!-- -->Program Manager/);
  assert.match(html, /Chaitanya Baru<!-- -->, <!-- -->Program Contact/);
  assert.match(html, /Megan Catterton<!-- -->, <!-- -->Program Contact/);
  assert.match(html, /href="mailto:rjchmiel@nsf.gov"/);
  assert.doesNotMatch(html, /Tools from across the APTO cohort/i);
  assert.doesNotMatch(html, /Agentic outcome-mining workflow/);
  assert.equal((html.match(/class="story-project-chapter"/g) ?? []).length, data.projects.length);
  assert.equal((html.match(/class="story-tool-pair"/g) ?? []).length, 6);
  // React's streamed payload can repeat serialized component markup. Require
  // at least one rendered gallery/resource group per tool without depending
  // on that framework-level transport detail.
  assert.ok((html.match(/class="apto-tool-gallery story-tool-gallery"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-path apto-resource-path-story(?: is-featured)?"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= data.tools.length);
  assert.doesNotMatch(html, /apto-resource-detail/);
  const heroImageCount = data.program.heroGallery.length;
  assert.match(html, new RegExp(`class="apto-tool-gallery story-hero-primary"[^>]*data-gallery-count="${heroImageCount}"`));
  assert.doesNotMatch(html, /class="story-hero-detail-anchor"/);
  const storySource = await readFile(new URL("../app/apto/story/story-site.tsx", import.meta.url), "utf8");
  assert.match(storySource, /const showHeroInset = false/);
  assert.match(storySource, /data-story-parallax="-0\.030"/);
  assert.match(storySource, /data-story-parallax="0\.072"/);
  assert.match(storySource, /\{ speed: "0\.022", limit: "48" \}/);
  assert.match(storySource, /\{ speed: "0\.095", limit: "88" \}/);
  assert.match(storySource, /\{ speed: "0\.160", limit: "92" \}/);
  const styles = await readFile(new URL("../app/apto/story/story-site.css", import.meta.url), "utf8");
  assert.match(styles, /\.story-project-chapter > header\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(styles, /\.story-project-chapter h3\s*\{[\s\S]*?max-width:\s*100%/);
  assert.match(styles, /--story-parallax-y:\s*var\(--story-shift,0px\)/);
  assert.match(styles, /calc\(var\(--story-reveal-y,0px\) \+ var\(--story-parallax-y,0px\)\)/);
});

test("Atlas exposes supplied-image galleries and supporting pieces", async () => {
  const data = await content();
  const programHtml = await (await render("/atlas")).text();
  assert.match(programHtml, /class="atlas-objective-field" id="atlas-impact"/);
  const html = await (await render("/atlas/tools")).text();
  assert.ok((html.match(/class="atlas-tool-card/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-tool-gallery atlas-tool-media"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-path apto-resource-path-atlas(?: is-featured)?"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= data.tools.length);
  assert.doesNotMatch(html, /atlas-tool-toggle|apto-resource-detail/);
  assert.doesNotMatch(html, /Agentic outcome-mining workflow/);
  assert.doesNotMatch(html, /atlas-tool-(?:progress|pagination|dots|indicator)/i);
  const resourceSource = await readFile(new URL("../app/apto/tool-resource-path.tsx", import.meta.url), "utf8");
  assert.match(resourceSource, /onMouseLeave=\{\(\) => setActiveIndex\(null\)\}/);
  assert.match(resourceSource, /onMouseLeave:\s*resetAfterPointerExit/);
  assert.match(resourceSource, /nextTarget\.closest\("\.apto-resource-node"\)/);
  assert.match(resourceSource, /apto-resource-summary-inset/);
  assert.doesNotMatch(resourceSource, /routePosition|gridColumn|gridRow/);
  const resourceStyles = await readFile(new URL("../app/apto/tool-resource-path.css", import.meta.url), "utf8");
  assert.match(resourceStyles, /backdrop-filter:\s*blur\(4px\) saturate\(112%\)/);
  assert.match(resourceStyles, /grid-template-rows:\s*58% 42%/);
  assert.match(resourceStyles, /\.apto-resource-path:not\(\.is-featured\)\s*\{[\s\S]*?grid-template-rows:\s*54% 46%/);
  assert.match(resourceStyles, /flex-flow:\s*row wrap-reverse/);
  assert.match(resourceStyles, /width:\s*min\(100%, 82px\)/);
  assert.match(resourceStyles, /\.apto-resource-node strong\s*\{[\s\S]*?width:\s*min\(100%, 18ch\)/);
  assert.match(resourceStyles, /min-height:\s*2\.32em/);
  assert.match(resourceStyles, /grid-template-columns:\s*minmax\(0, 70%\) minmax\(0, 30%\)/);
  assert.match(resourceStyles, /\.apto-resource-route\s*>\s*li\s*\{[\s\S]*?flex:\s*0 1 25%/);
  assert.match(resourceStyles, /\.apto-resource-node\s*\{[\s\S]*?padding:\s*calc\(var\(--resource-gap\) \/ 2\)/);
  assert.match(resourceStyles, /\.apto-resource-path\.is-featured \.apto-resource-summary-copy > span\s*\{[\s\S]*?font-size:\s*\.82rem/);
  assert.match(resourceStyles, /\.apto-resource-thumb img\[src\$="\.svg"\]/);
  assert.doesNotMatch(resourceStyles, /rgb\(103 224 239/);
  const networkIcon = await readFile(new URL("../content/apto/assets/tools/icons/network.svg", import.meta.url), "utf8");
  const evidenceIcon = await readFile(new URL("../content/apto/assets/tools/icons/evidence.svg", import.meta.url), "utf8");
  const vividTheme = await readFile(new URL("../content/apto/assets/tools/icons/themes/vivid-gradient.md", import.meta.url), "utf8");
  assert.match(networkIcon, /<g fill="url\(#g\)"[^>]*><circle/);
  assert.match(networkIcon, /<circle[^>]+fill="#10283A"/);
  assert.match(evidenceIcon, /<circle[^>]+fill="url\(#g\)"/);
  assert.match(evidenceIcon, /<path d="m[^>]+stroke="#10283A"[^>]+stroke-width="3\.5"/);
  for (const color of ["#67E0EF", "#9C8CF4", "#F3C751"]) assert.match(vividTheme, new RegExp(color));
  const atlasStyles = await readFile(new URL("../app/apto/atlas/atlas-site.css", import.meta.url), "utf8");
  assert.match(atlasStyles, /\.apto-resource-path-atlas\.is-featured \.apto-resource-summary-copy > span\s*\{[\s\S]*?font-size:\s*\.82rem/);
  assert.doesNotMatch(atlasStyles, /apto-resource-path-atlas \.apto-resource-thumb/);
  assert.doesNotMatch(atlasStyles, /apto-resource-path-atlas \.apto-resource-node strong/);
  const atlasHomeHtml = await (await render("/atlas")).text();
  assert.match(atlasHomeHtml, /The first APTO cohort includes/);
  for (const organization of ["Northwestern University", "University of Chicago", "Apperture.AI", "Insilicom", "Macrocosm"]) assert.ok(atlasHomeHtml.includes(organization));
  for (const project of data.projects) assert.ok(atlasHomeHtml.includes(`/atlas/projects#atlas-project-${project.id}`));
  const atlasProjectsHtml = await (await render("/atlas/projects")).text();
  assert.ok((atlasProjectsHtml.match(/class="atlas-project-people"/g) ?? []).length >= data.projects.length);
  assert.match(atlasProjectsHtml, /Program contacts/);
  assert.match(atlasProjectsHtml, /href="mailto:rjchmiel@nsf.gov"/);
});

test("light and dark logo assets remain available in both presentations", async () => {
  const data = await content();
  for (const path of ["/story", "/atlas/projects"]) {
    const html = await (await render(path)).text();
    for (const participant of data.participants) {
      for (const [theme, asset] of Object.entries(participant.logo.variants)) {
        assert.ok(html.includes(`is-${theme}`), `${path} needs a ${theme} logo layer`);
        assert.ok(html.includes(asset.src), `${path} needs ${participant.displayName}'s ${theme} logo`);
      }
    }
  }
});

test("the shared gallery preserves reduced-motion support and true crossfades", async () => {
  const source = await readFile(new URL("../app/apto/tool-gallery.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/apto/tool-gallery.css", import.meta.url), "utf8");
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /\.decode\(\)/);
  assert.match(source, /Math\.random\(\)/);
  assert.match(source, /randomOrder/);
  assert.match(source, /objectPosition/);
  assert.match(source, /data-random-start-ready/);
  assert.match(styles, /\.is-current\.is-leaving\s*\{\s*opacity:\s*0/);
  assert.match(styles, /\.is-incoming\s*\{\s*z-index:\s*2;\s*opacity:\s*1/);
});

test("available tool pieces open externally without a blocked cursor for unavailable pieces", async () => {
  const data = await content();
  const expectedUrls = [
    "https://niinstitute.kellogg.northwestern.edu/bridge",
    "https://www.innovationinsights.org",
    "https://northwestern-cssi.github.io/sciscinet/",
    "https://sciscigpt.com",
    "https://arxiv.org/abs/2605.16719",
    "https://fundingthefrontier.com",
  ];
  const northwesternUrls = new Set(data.tools
    .filter((tool) => tool.participantId === "northwestern")
    .flatMap((tool) => tool.resources.map((resource) => resource.url).filter(Boolean)));
  expectedUrls.forEach((url) => assert.ok(northwesternUrls.has(url), `missing Northwestern resource URL: ${url}`));

  const resourceSource = await readFile(new URL("../app/apto/tool-resource-path.tsx", import.meta.url), "utf8");
  const resourceStyles = await readFile(new URL("../app/apto/tool-resource-path.css", import.meta.url), "utf8");
  assert.match(resourceSource, /target="_blank"\s+rel="noreferrer"/);
  assert.match(resourceStyles, /\.apto-resource-node\.is-coming-soon\s*\{\s*cursor:\s*default/);
  assert.doesNotMatch(resourceStyles, /cursor:\s*not-allowed/);
});

test("each tool presentation uses its independently ordered content media", async () => {
  const source = await readFile(new URL("../app/apto/tool-media.ts", import.meta.url), "utf8");
  assert.match(source, /return ownMedia\(tool\)/);
  assert.doesNotMatch(source, /northwesternMedia|placeholderSteps|placeholderIndex/);
});
