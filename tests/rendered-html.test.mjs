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

// Tool cards as the pages present them: a collection stands in for its member tools.
function presentationCards(data) {
  const collectionByToolId = new Map(data.toolCollections.flatMap((collection) => collection.toolIds.map((id) => [id, collection])));
  const placed = new Set();
  return data.tools.flatMap((tool) => {
    const collection = collectionByToolId.get(tool.id);
    if (!collection) return [tool];
    if (placed.has(collection.id)) return [];
    placed.add(collection.id);
    return [collection];
  });
}

// The two lead institutions share paired rows, one row per card of the longer list.
function featuredToolRowCount(data) {
  const cards = presentationCards(data);
  return Math.max(...["northwestern", "uchicago"].map((id) => cards.filter((card) => card.participantId === id).length));
}

function programManager(data) {
  return data.program.programTeam.find((person) => person.role === "Program Manager");
}

test("publishes only the Story and Atlas presentation families", async () => {
  for (const path of ["/story", "/apto/story"]) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render`);
    const html = await response.text();
    assert.match(html, /class="apto-story"/);
    assert.doesNotMatch(html, /concept-apto|Scroll to explore|story-map|us-map\.svg/i);
  }

  const home = await render("/");
  assert.equal(home.status, 200, "/ should render");
  assert.match(await home.text(), /class="apto-atlas"/, "/ should open the Atlas presentation");

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
  // Structure only. Each team's copy, names, images, and colors can change
  // inside its own folder without an edit to this file.
  const participantIds = data.participants.map((participant) => participant.id);
  const participantRank = (record) => participantIds.indexOf(record.participantId);
  const inParticipantOrder = (records) => records.map(participantRank).every((rank, index, ranks) => rank >= 0 && (index === 0 || ranks[index - 1] <= rank));
  for (const participant of data.participants) {
    assert.match(participant.accent, /^#[0-9A-F]{6}$/i, `${participant.displayName} needs a six-digit accent color`);
    assert.ok(data.projects.some((project) => project.participantId === participant.id), `${participant.displayName} needs a project`);
    assert.ok(data.tools.some((tool) => tool.participantId === participant.id), `${participant.displayName} needs a tool`);
  }
  assert.ok(inParticipantOrder(data.projects), "projects should follow the participant order");
  assert.ok(inParticipantOrder(data.tools), "tools should be grouped in participant order");
  assert.deepEqual(data.program.impactGroups.map((group) => group.participantId), participantIds);
  for (const group of data.program.impactGroups) {
    assert.ok(group.entries.length > 0 && group.entries.every((entry) => entry.trim().length > 0), `${group.participantId} needs impact statements`);
  }
  assert.equal(new Set(data.tools.map((tool) => tool.id)).size, data.tools.length, "tool ids should be unique");
  for (const tool of data.tools) {
    assert.equal(tool.summaryParagraphs.length, 2, `${tool.name} should expose exactly two compact summary paragraphs`);
    const media = [tool.figure, ...tool.galleryImages];
    assert.equal(media.length, 4, `${tool.name} should have four Ken Burns frames`);
    assert.equal(new Set(media.map((image) => image.src)).size, 4, `${tool.name} frames should be distinct`);
    assert.ok(media.every((image) => image.src.startsWith("/apto/") && image.alt.trim().length > 0), `${tool.name} frames need /apto/ paths and alternative text`);
    assert.ok(tool.resources.length > 0, `${tool.name} should expose supporting pieces`);
    assert.equal(new Set(tool.resources.map((resource) => resource.image.src)).size, tool.resources.length, `${tool.name} supporting pieces should use distinct images`);
    for (const resource of tool.resources) {
      assert.match(resource.image.src, /^\/apto\/tools\/icons\/[a-z0-9-]+\.svg$/);
      if (resource.status === "coming-soon") assert.equal(resource.url, null);
      if (resource.url) assert.ok(resource.actionLabel?.length > 0, `${resource.name} should describe its linked destination`);
    }
  }
  // A named supporting piece keeps one icon across its own team's tools.
  const teamResourceIcons = new Map();
  for (const tool of data.tools) {
    for (const resource of tool.resources) {
      if (/^Piece [A-Z]$/i.test(resource.name)) continue;
      const key = `${tool.participantId}:${resource.name.trim().toLocaleLowerCase("en-US")}`;
      const previous = teamResourceIcons.get(key);
      if (previous) {
        assert.equal(resource.image.src, previous, `${resource.name} should reuse one icon across ${tool.participantId} tools`);
      } else {
        teamResourceIcons.set(key, resource.image.src);
      }
    }
  }
  // Collections group tools of one team, and a tool joins at most one.
  const collectedToolIds = data.toolCollections.flatMap((collection) => collection.toolIds);
  assert.equal(new Set(collectedToolIds).size, collectedToolIds.length, "a tool should belong to at most one collection");
  for (const collection of data.toolCollections) {
    assert.ok(collection.toolIds.length >= 2, `${collection.name} should group at least two tools`);
    for (const toolId of collection.toolIds) {
      const member = data.tools.find((tool) => tool.id === toolId);
      assert.ok(member, `${collection.name} references a missing tool: ${toolId}`);
      assert.equal(member.participantId, collection.participantId, `${collection.name} should group tools from its own team`);
    }
    assert.equal(collection.summaryParagraphs.length, 2, `${collection.name} should expose exactly two summary paragraphs`);
    assert.equal(new Set([collection.figure, ...collection.galleryImages].map((image) => image.src)).size, 4, `${collection.name} frames should be distinct`);
  }
  assert.doesNotMatch(JSON.stringify(data.tools), /—/, "tool copy should use commas, colons, or hyphens instead of em dashes");
  assert.ok(data.convenings.length > 0, "the site needs at least one convening");
  for (const convening of data.convenings) {
    assert.ok(convening.images.length > 0, `${convening.title} needs photography`);
    assert.equal(new Set(convening.images.map((image) => image.src)).size, convening.images.length, `${convening.title} photos should be distinct`);
  }
  const conveningGallerySource = await readFile(new URL("../app/apto/convening-gallery.tsx", import.meta.url), "utf8");
  assert.match(conveningGallerySource, /const tail = Array\.from\(\{ length: imageCount \}[\s\S]*?\.slice\(1\)/);
  assert.match(conveningGallerySource, /Math\.random\(\)/);
  assert.match(conveningGallerySource, /setImageOrder\(\[0, \.\.\.tail\]\)/);
  const conveningGalleryStyles = await readFile(new URL("../app/apto/convening-gallery.css", import.meta.url), "utf8");
  assert.match(conveningGalleryStyles, /\.apto-convening-gallery \.apto-convening-gallery-media > img\s*\{\s*max-width:\s*none/);
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
  assert.ok(programManager(data), "the program needs a Program Manager contact");
  assert.match(programManager(data).email ?? "", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "the Program Manager needs an email address");
});

test("Story gives project titles full card width and pairs lead-institution tools", async () => {
  const data = await content();
  const presentationToolCount = presentationCards(data).length;
  const html = await (await render("/story")).text();
  assert.equal((html.match(/class="story-outcome-depth"/g) ?? []).length, 3);
  for (const output of ["Technology Outcome Models", "Causal, predictive models", "Datasets", "Tools"]) assert.ok(html.includes(output));
  assert.match(html, /reconstruct historical outcomes and forecast future trajectories/);
  assert.doesNotMatch(html, /causal, predictive models to predict/);
  assert.match(html, /About the APTO Program/);
  assert.match(html, /The first APTO cohort includes/);
  for (const organization of ["Northwestern University", "University of Chicago", "Apperture.AI", "Insilicom", "Macrocosm"]) assert.ok(html.includes(organization));
  for (const project of data.projects) assert.ok(html.includes(`href="#story-project-${project.id}"`));
  assert.match(html, /What We Are Building/);
  assert.match(html, /class="story-section story-impact" id="story-impact"/);
  assert.match(html, /class="story-impact-layout"/);
  assert.equal((html.match(/data-story-impact-group="true"/g) ?? []).length, data.program.impactGroups.length);
  assert.equal((html.match(/data-story-impact-logo="true"/g) ?? []).length, data.program.impactGroups.length);
  assert.equal((html.match(/data-story-impact-row="right"/g) ?? []).length, Math.ceil(data.program.impactGroups.length / 2));
  assert.equal((html.match(/data-story-impact-row="left"/g) ?? []).length, Math.floor(data.program.impactGroups.length / 2));
  assert.ok((html.match(/data-story-reveal="right"/g) ?? []).length > 0);
  assert.ok((html.match(/data-story-reveal="left"/g) ?? []).length > 0);
  assert.match(html, /Together, the APTO cohort is working to achieve/);
  for (const participant of data.participants) assert.ok(html.includes(`Led by ${participant.displayName}`), `Story should credit ${participant.displayName} on its tools`);
  assert.doesNotMatch(html, /story-cohort|story-nav-cohort|>Cohort</);
  assert.ok((html.match(/class="story-project-people"/g) ?? []).length >= data.projects.length);
  assert.ok((html.match(/class="story-project-people" data-people-layout="grid"/g) ?? []).length >= 2);
  assert.ok((html.match(/class="story-project-people" data-people-layout="rows"/g) ?? []).length >= 3);
  assert.ok((html.match(/class="story-person"/g) ?? []).length >= data.participants.reduce((sum, participant) => sum + participant.people.length, 0));
  assert.match(html, /Program contacts/);
  assert.match(html, /class="story-footer-contact-primary"/);
  assert.match(html, /Program Manager/);
  assert.match(html, /class="story-footer-team"/);
  assert.match(html, /NSF team/);
  for (const person of data.program.programTeam) assert.ok(html.includes(person.name), `Story footer should list ${person.name}`);
  assert.doesNotMatch(html, /Program Contact/);
  assert.ok(html.includes(`href="mailto:${programManager(data).email}"`));
  assert.match(html, /class="story-footer-disclaimer"/);
  assert.match(html, /This material is based upon work supported by the National Science Foundation under Grant Number 2404035\./);
  assert.doesNotMatch(html, /Tools from across the APTO cohort/i);
  assert.doesNotMatch(html, /Agentic outcome-mining workflow/);
  assert.equal((html.match(/class="story-project-chapter"/g) ?? []).length, data.projects.length);
  assert.equal((html.match(/class="story-tool-pair"/g) ?? []).length, featuredToolRowCount(data));
  for (const collection of data.toolCollections) {
    assert.ok(html.includes(`<h3>${collection.name}</h3>`), `Story should present the ${collection.name} collection as one card`);
    for (const toolId of collection.toolIds) {
      const member = data.tools.find((tool) => tool.id === toolId);
      assert.ok(!html.includes(`<h3>${member.name}</h3>`), `${member.name} should appear inside its collection, not as its own card`);
      assert.ok(html.includes(member.name), `${member.name} should appear as a supporting piece`);
    }
  }
  // React's streamed payload can repeat serialized component markup. Require
  // at least one rendered gallery/resource group per tool without depending
  // on that framework-level transport detail.
  assert.ok((html.match(/class="apto-tool-gallery story-tool-gallery"/g) ?? []).length >= presentationToolCount);
  assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= presentationToolCount);
  assert.ok((html.match(/class="apto-resource-path apto-resource-path-story(?: is-featured)?"/g) ?? []).length >= presentationToolCount);
  assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= presentationToolCount);
  assert.doesNotMatch(html, /apto-resource-detail/);
  const heroImageCount = data.program.heroGallery.length;
  assert.match(html, new RegExp(`class="apto-tool-gallery story-hero-primary"[^>]*data-gallery-count="${heroImageCount}"`));
  assert.doesNotMatch(html, /class="story-hero-detail-anchor"/);
  const programSource = await readFile(new URL("../app/apto/story/program-sections.tsx", import.meta.url), "utf8");
  assert.match(programSource, /const showHeroInset = false/);
  assert.match(programSource, /data-story-parallax="-0\.030"/);
  assert.match(programSource, /data-story-parallax="0\.072"/);
  assert.match(programSource, /\{ speed: "0\.022", limit: "48" \}/);
  assert.match(programSource, /\{ speed: "0\.095", limit: "88" \}/);
  assert.match(programSource, /\{ speed: "0\.160", limit: "92" \}/);
  const styles = await readFile(new URL("../app/apto/story/story-site.css", import.meta.url), "utf8");
  assert.match(styles, /\.story-project-chapter > header\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(styles, /\.story-project-chapter > header :is\(h2,\s*h3\)\s*\{[\s\S]*?max-width:\s*100%/);
  assert.match(styles, /\.story-project-chapter\s*\{[\s\S]*?grid-row:\s*span 4;[\s\S]*?grid-template-rows:\s*subgrid/);
  assert.match(styles, /\.story-project-chapter > p,\s*\.story-project-people\s*\{\s*margin-block:\s*0/);
  assert.match(styles, /--story-parallax-y:\s*var\(--story-shift,0px\)/);
  assert.match(styles, /calc\(var\(--story-reveal-y,0px\) \+ var\(--story-parallax-y,0px\)\)/);
  assert.match(styles, /\.story-hero-image\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(styles, /\.story-impact-stage\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(styles, /translate3d\(var\(--story-impact-logo-x,0px\),0,0\)/);
  assert.match(styles, /@media \(max-width:\s*900px\)[\s\S]*?\.story-tool\s*\{\s*min-height:\s*clamp\(600px,68vw,650px\)/);
  assert.match(styles, /\.story-tool \.apto-resource-path-story\s*\{\s*grid-template-rows:\s*53% 47%/);
  assert.match(styles, /@media \(min-width:\s*921px\) and \(max-width:\s*1500px\)[\s\S]*?min-height:\s*clamp\(600px,\s*calc\(840px - 16vw\),\s*660px\)/);
  assert.match(styles, /@media \(max-width:\s*920px\)[\s\S]*?min-height:\s*clamp\(540px,\s*calc\(800px - 40vw\),\s*640px\)/);
});

test("Atlas exposes supplied-image galleries and supporting pieces", async () => {
  const data = await content();
  const presentationToolCount = presentationCards(data).length;
  const programHtml = await (await render("/atlas")).text();
  assert.match(programHtml, /class="story-section story-impact" id="atlas-impact"/);
  assert.match(programHtml, /class="story-hero-copy" data-story-reveal="heading" data-story-parallax="-0\.030"/);
  assert.deepEqual(
    [...programHtml.matchAll(/class="story-outcome-depth" data-story-parallax="([^"]+)"/g)].map((match) => match[1]),
    ["0.022", "0.095", "0.160"],
  );
  assert.equal((programHtml.match(/data-story-impact-group="true"/g) ?? []).length, data.program.impactGroups.length);
  assert.equal((programHtml.match(/data-story-impact-logo="true"/g) ?? []).length, data.program.impactGroups.length);
  assert.match(programHtml, /data-story-reveal="left" data-story-reveal-order="1"/);
  assert.match(programHtml, /data-story-reveal="right" data-story-reveal-order="1"/);
  const about = programHtml.indexOf('id="atlas-home-title"');
  const building = programHtml.indexOf('id="atlas-building-title"');
  const opening = programHtml.indexOf('class="atlas-opening"');
  const panorama = programHtml.indexOf('class="story-outcome-panorama"');
  const impact = programHtml.indexOf('id="atlas-impact-title"');
  assert.ok(opening >= 0 && opening < about && about < building && building < panorama && panorama < impact);
  assert.match(programHtml, /id="atlas-building" tabindex="-1"><header class="story-section-heading">/);
  assert.match(programHtml, /class="atlas-hero-scroll" href="#atlas-building" aria-label="Continue to What We Are Building"[^>]*>.*?<\/a><\/div><\/div><section class="story-section story-program"/s);
  assert.match(programHtml, /data-testid="atlas-nav-home"><span>Program<\/span><\/a>/);
  assert.match(programHtml, /aria-current="page" data-testid="atlas-nav-home"/);
  assert.match(programHtml, /href="\/apto\/atlas\/projects" data-testid="atlas-nav-projects"/);
  assert.doesNotMatch(programHtml, /class="story-project-chapters"|class="atlas-tool-collection"|class="atlas-convening-list"/);
  const html = await (await render("/atlas/tools")).text();
  assert.ok((html.match(/class="atlas-tool-card/g) ?? []).length >= presentationToolCount);
  assert.ok((html.match(/class="apto-tool-gallery atlas-tool-media"/g) ?? []).length >= presentationToolCount);
  assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= presentationToolCount);
  assert.ok((html.match(/class="apto-resource-path apto-resource-path-atlas(?: is-featured)?"/g) ?? []).length >= presentationToolCount);
  assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= presentationToolCount);
  assert.doesNotMatch(html, /atlas-tool-toggle|apto-resource-detail/);
  assert.doesNotMatch(html, /Agentic outcome-mining workflow/);
  assert.doesNotMatch(html, /atlas-tool-(?:progress|pagination|dots|indicator)/i);
  const styles = await readFile(new URL("../app/apto/atlas/atlas-site.css", import.meta.url), "utf8");
  assert.match(styles, /\.atlas-tool-card\s*\{[^}]*\bwidth:\s*100%;[^}]*min-height:\s*clamp\(612px,\s*calc\(962px\s*-\s*23\.9vw\),\s*662px\)[^}]*aspect-ratio:\s*1\s*\/\s*1\.20/);
  assert.match(styles, /@media \(max-width:\s*1232px\)[\s\S]*?\.atlas-tool-card\s*\{\s*min-height:\s*clamp\(656px,\s*calc\(926px\s*-\s*23\.9vw\),\s*746px\)[^}]*aspect-ratio:\s*1\s*\/\s*1\.16/);
  assert.match(styles, /@media \(max-width:\s*751px\)[\s\S]*?\.atlas-tool-card\s*\{[^}]*min-height:\s*clamp\(650px,\s*calc\(780px\s*-\s*20vw\),\s*710px\)[^}]*max-height:\s*none[^}]*aspect-ratio:\s*auto/);
  assert.match(styles, /@media \(max-width:\s*520px\)[\s\S]*?\.atlas-tool-card\s*\{\s*min-height:\s*clamp\(720px,\s*calc\(1332px\s*-\s*144\.2vw\),\s*900px\)/);
  const resourceSource = await readFile(new URL("../app/apto/tool-resource-path.tsx", import.meta.url), "utf8");
  assert.match(resourceSource, /window\.matchMedia\("\(hover: none\), \(pointer: coarse\)"\)/);
  assert.doesNotMatch(resourceSource, />Available</);
  assert.doesNotMatch(resourceSource, /<p>Coming soon<\/p>/);
  assert.match(resourceSource, /className="apto-resource-status-hint">Coming soon/);
  assert.match(resourceSource, /current === index \? null : index/);
  assert.match(resourceSource, /document\.addEventListener\("pointerdown", dismissOutsidePiece, true\)/);
  assert.match(resourceSource, /\.closest\("\.apto-resource-node, \.apto-resource-touch-action"\)/);
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
  assert.match(resourceStyles, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(resourceStyles, /\.apto-resource-summary-copy > \.apto-resource-touch-action\s*\{\s*display:\s*none/);
  assert.match(resourceStyles, /\.apto-resource-summary-copy > \.apto-resource-pointer-hint/);
  assert.match(resourceStyles, /\.apto-resource-summary-copy > \.apto-resource-status-hint/);
  assert.match(resourceStyles, /color:\s*#9cc8d6/);
  assert.doesNotMatch(resourceStyles, /rgb\(103 224 239/);
  const networkIcon = await readFile(new URL("../content/apto/assets/tools/icons/network.svg", import.meta.url), "utf8");
  const evidenceIcon = await readFile(new URL("../content/apto/assets/tools/icons/evidence.svg", import.meta.url), "utf8");
  const decisionIcon = await readFile(new URL("../content/apto/assets/tools/icons/decision.svg", import.meta.url), "utf8");
  const evolutionIcon = await readFile(new URL("../content/apto/assets/tools/icons/evolution.svg", import.meta.url), "utf8");
  const vividTheme = await readFile(new URL("../content/apto/assets/tools/icons/themes/vivid-gradient.md", import.meta.url), "utf8");
  assert.match(networkIcon, /<g fill="url\(#g\)"[^>]*><circle/);
  assert.match(networkIcon, /<circle[^>]+fill="#10283A"/);
  assert.match(evidenceIcon, /<circle[^>]+fill="url\(#g\)"/);
  assert.match(evidenceIcon, /<path d="m[^>]+stroke="#10283A"[^>]+stroke-width="3\.5"/);
  assert.match(decisionIcon, /<circle cx="47" cy="50\.5" r="7" fill="url\(#g\)" stroke="#E8EEF1" stroke-width="1\.1"/);
  assert.match(decisionIcon, /<path d="m43\.5 50\.5[^>]+stroke="#10283A"[^>]+stroke-width="3\.5"/);
  assert.match(evolutionIcon, /<g fill="url\(#g\)" stroke="#E8EEF1" stroke-width="1\.1">/);
  assert.match(evolutionIcon, /<circle cx="12" cy="50\.5" r="4\.5"/);
  for (const color of ["#67E0EF", "#9C8CF4", "#F3C751"]) assert.match(vividTheme, new RegExp(color));
  const atlasStyles = await readFile(new URL("../app/apto/atlas/atlas-site.css", import.meta.url), "utf8");
  assert.match(atlasStyles, /\.apto-resource-path-atlas\.is-featured \.apto-resource-summary-copy > span\s*\{[\s\S]*?font-size:\s*\.82rem/);
  assert.match(atlasStyles, /\.atlas-tool-card \.apto-resource-path-atlas\s*\{\s*grid-template-rows:\s*50% 50%/);
  assert.doesNotMatch(atlasStyles, /apto-resource-path-atlas \.apto-resource-thumb/);
  assert.doesNotMatch(atlasStyles, /apto-resource-path-atlas \.apto-resource-node strong/);
  const atlasHomeHtml = await (await render("/atlas")).text();
  assert.match(atlasHomeHtml, /The first APTO cohort includes/);
  for (const organization of ["Northwestern University", "University of Chicago", "Apperture.AI", "Insilicom", "Macrocosm"]) assert.ok(atlasHomeHtml.includes(organization));
  for (const project of data.projects) assert.ok(atlasHomeHtml.includes(`/atlas/projects#atlas-project-${project.id}`));
  const atlasProjectsHtml = await (await render("/atlas/projects")).text();
  assert.equal((atlasProjectsHtml.match(/class="story-project-chapter"/g) ?? []).length, data.projects.length);
  assert.match(atlasProjectsHtml, /class="story-project-chapters"/);
  assert.match(atlasProjectsHtml, /<h1 id="atlas-projects-title">/);
  assert.match(atlasProjectsHtml, /aria-current="page" data-testid="atlas-nav-projects"/);
  assert.doesNotMatch(atlasProjectsHtml, /<details/);
  for (const project of data.projects) assert.ok(atlasProjectsHtml.includes(`id="atlas-project-${project.id}"`));
  assert.ok((atlasProjectsHtml.match(/class="story-project-people"/g) ?? []).length >= data.projects.length);
  assert.ok((atlasProjectsHtml.match(/class="story-project-people" data-people-layout="grid"/g) ?? []).length >= 2);
  assert.ok((atlasProjectsHtml.match(/class="story-project-people" data-people-layout="rows"/g) ?? []).length >= 3);
  assert.match(atlasProjectsHtml, /Program contacts/);
  assert.match(atlasProjectsHtml, /class="atlas-footer-contact-primary"/);
  assert.match(atlasProjectsHtml, /class="atlas-footer-team"/);
  assert.doesNotMatch(atlasProjectsHtml, /Program Contact/);
  assert.ok(atlasProjectsHtml.includes(`href="mailto:${programManager(data).email}"`));

  const atlasToolsHtml = await (await render("/atlas/tools")).text();
  for (const collection of data.toolCollections) {
    assert.ok(atlasToolsHtml.includes(`<h2>${collection.name}</h2>`), `Atlas should present the ${collection.name} collection as one card`);
    for (const toolId of collection.toolIds) {
      const member = data.tools.find((tool) => tool.id === toolId);
      assert.ok(!atlasToolsHtml.includes(`<h2>${member.name}</h2>`), `${member.name} should appear inside its collection, not as its own card`);
    }
  }
  assert.ok((atlasToolsHtml.match(/class="atlas-tool-card"/g) ?? []).length >= presentationToolCount);
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
  for (const resource of data.tools.flatMap((tool) => tool.resources).filter((candidate) => candidate.url)) {
    assert.match(resource.url, /^https:\/\//, `${resource.name} should link over HTTPS`);
    assert.ok(resource.actionLabel?.trim().length > 0, `${resource.name} should describe its linked destination`);
  }

  const resourceSource = await readFile(new URL("../app/apto/tool-resource-path.tsx", import.meta.url), "utf8");
  const resourceStyles = await readFile(new URL("../app/apto/tool-resource-path.css", import.meta.url), "utf8");
  assert.match(resourceSource, /target="_blank"\s+rel="noreferrer"/);
  assert.doesNotMatch(resourceSource, /Open this piece/);
  assert.match(resourceStyles, /\.apto-resource-node\.is-available[\s\S]*?cursor:\s*pointer/);
  assert.match(resourceStyles, /\.apto-resource-node\.is-available \.apto-resource-thumb img/);
  assert.match(resourceStyles, /\.apto-resource-node\.is-coming-soon\s*\{\s*cursor:\s*default/);
  assert.doesNotMatch(resourceStyles, /cursor:\s*not-allowed/);
});

test("each tool presentation uses its independently ordered content media", async () => {
  const source = await readFile(new URL("../app/apto/tool-media.ts", import.meta.url), "utf8");
  const orderSource = await readFile(new URL("../app/apto/participant-order.ts", import.meta.url), "utf8");
  assert.match(source, /return ownMedia\(tool\)/);
  assert.doesNotMatch(source, /northwesternMedia|placeholderSteps|placeholderIndex/);
  assert.match(orderSource, /const rowOrder = participantOrder\.slice\(0, 2\)/);
  assert.doesNotMatch(orderSource, /participantOrderForOccurrence\(participantOrder, rowIndex\)/);
});
