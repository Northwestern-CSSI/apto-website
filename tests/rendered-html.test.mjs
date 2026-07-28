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
    for (const suffix of ["", "/projects", "/tools", "/cohort", "/convening"]) {
      const path = `${prefix}${suffix}`;
      const response = await render(path);
      assert.equal(response.status, 200, `${path} should render`);
      assert.match(await response.text(), /class="apto-atlas"/);
    }
  }

  for (const path of ["/projects", "/tools", "/cohort", "/convening", "/tools-lab", "/apto/projects", "/apto/tools-lab"]) {
    assert.equal((await render(path)).status, 404, `${path} should no longer expose a retired presentation`);
  }
});

test("generated content follows the featured-institution order and supplied-image model", async () => {
  const data = await content();
  assert.deepEqual(data.participants.map((participant) => participant.id), ["northwestern", "uchicago", "aperture", "insilicom", "macrocosm"]);
  assert.deepEqual(data.projects.map((project) => project.participantId), ["northwestern", "uchicago", "aperture", "insilicom", "macrocosm"]);
  assert.equal(data.tools.filter((tool) => tool.participantId === "northwestern").length, 5);
  assert.equal(data.tools.filter((tool) => tool.participantId === "uchicago").length, 5);
  assert.deepEqual(data.tools.filter((tool) => tool.participantId === "northwestern").map((tool) => tool.name), [
    "Aggregating Research Pipeline At Scale Tool",
    "Agentic Framework For Technology Outcomes Tool",
    "Multi-Objective Technology Outcomes Tool",
    "Predicting Technological Evolution Tool",
    "Emerging Technology Detection Tool",
  ]);
  for (const tool of data.tools) {
    const media = [tool.figure, ...tool.galleryImages];
    assert.equal(media.length, 4, `${tool.name} should have four Ken Burns frames`);
    assert.equal(new Set(media.map((image) => image.src)).size, 4, `${tool.name} frames should be distinct`);
    assert.ok(media.every((image) => image.src.startsWith("/apto/tools/photography/")), `${tool.name} should use supplied tool photography`);
    assert.ok(tool.resources.length > 0, `${tool.name} should expose supporting pieces`);
    assert.equal(new Set(tool.resources.map((resource) => resource.image.src)).size, tool.resources.length, `${tool.name} supporting pieces should use distinct images`);
    for (const resource of tool.resources) {
      assert.match(resource.image.src, /^\/apto\/tools\/(?:resources|photography)\//);
      if (resource.status === "coming-soon") assert.equal(resource.url, null);
    }
  }
  const agenticTool = data.tools.find((tool) => tool.id === "agentic-framework-for-technology-outcome-mining");
  assert.deepEqual(agenticTool.resources.map((resource) => resource.name), [
    "Perovskite Dataset",
    "Quantum Dataset",
  ]);
  assert.ok(agenticTool.resources.every((resource) => !/slides/i.test(`${resource.name} ${resource.description}`)));
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
    ["dashun-wang", "benjamin-jones", "jian-cao", "mark-hersam", "yian-yin"],
  );
  assert.equal(data.convenings[0].location, "Washington, D.C.");
});

test("Story gives project titles full card width and pairs lead-institution tools", async () => {
  const data = await content();
  const html = await (await render("/story")).text();
  assert.equal((html.match(/class="story-outcome-depth"/g) ?? []).length, 3);
  for (const output of ["Technology Outcome Models", "Data Sets", "Tools"]) assert.ok(html.includes(output));
  assert.match(html, /About the APTO Program/);
  assert.match(html, /What We Are Building/);
  assert.match(html, /Together, the APTO cohort is working to achieve/);
  assert.match(html, /Led by Northwestern University/);
  assert.doesNotMatch(html, /Tools from across the APTO cohort/i);
  assert.doesNotMatch(html, /Agentic outcome-mining workflow/);
  assert.equal((html.match(/class="story-project-chapter"/g) ?? []).length, data.projects.length);
  assert.equal((html.match(/class="story-tool-pair"/g) ?? []).length, 5);
  // React's streamed payload can repeat serialized component markup. Require
  // at least one rendered gallery/resource group per tool without depending
  // on that framework-level transport detail.
  assert.ok((html.match(/class="apto-tool-gallery story-tool-gallery"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-path apto-resource-path-story"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= data.tools.length);
  assert.doesNotMatch(html, /apto-resource-detail/);
  assert.match(html, /class="apto-tool-gallery story-hero-primary"[^>]*data-gallery-count="20"/);
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
  const html = await (await render("/atlas/tools")).text();
  assert.ok((html.match(/class="atlas-tool-card/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-tool-gallery atlas-tool-media"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-path apto-resource-path-atlas"/g) ?? []).length >= data.tools.length);
  assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= data.tools.length);
  assert.doesNotMatch(html, /atlas-tool-toggle|apto-resource-detail/);
  assert.doesNotMatch(html, /Agentic outcome-mining workflow/);
  assert.doesNotMatch(html, /atlas-tool-(?:progress|pagination|dots|indicator)/i);
  const resourceSource = await readFile(new URL("../app/apto/tool-resource-path.tsx", import.meta.url), "utf8");
  assert.match(resourceSource, /onMouseLeave:\s*\(\)\s*=>\s*setActiveIndex/);
  assert.match(resourceSource, /gridColumn:\s*4,\s*gridRow:\s*3/);
  const resourceStyles = await readFile(new URL("../app/apto/tool-resource-path.css", import.meta.url), "utf8");
  assert.match(resourceStyles, /backdrop-filter:\s*blur\(4px\) saturate\(112%\)/);
  assert.match(resourceStyles, /grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
});

test("light and dark logo assets remain available in both presentations", async () => {
  const data = await content();
  for (const path of ["/story", "/atlas/cohort"]) {
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
  assert.match(source, /data-random-start-ready/);
  assert.match(styles, /\.is-current\.is-leaving\s*\{\s*opacity:\s*0/);
  assert.match(styles, /\.is-incoming\s*\{\s*z-index:\s*2;\s*opacity:\s*1/);
});

test("placeholder tools use independently ordered Northwestern media", async () => {
  const source = await readFile(new URL("../app/apto/tool-media.ts", import.meta.url), "utf8");
  assert.match(source, /participantId === "northwestern"/);
  assert.match(source, /placeholderSteps/);
  assert.match(source, /placeholderIndex \* 7 \+ 3/);
  assert.match(source, /Array\.from\(\{ length: 4 \}/);
});
