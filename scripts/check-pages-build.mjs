import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/apto-website";
const content = JSON.parse(
  await readFile(new URL("../app/apto/content.generated.json", import.meta.url), "utf8"),
);
const pages = ["index.html", "projects/index.html", "tools/index.html", "cohort/index.html"];
const storyPages = ["story/index.html", "apto/story/index.html"];
const atlasPages = [
  "atlas/index.html",
  "atlas/projects/index.html",
  "atlas/tools/index.html",
  "atlas/cohort/index.html",
  "apto/atlas/index.html",
  "apto/atlas/projects/index.html",
  "apto/atlas/tools/index.html",
  "apto/atlas/cohort/index.html",
];
const escapedBasePath = basePath.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unprefixedPath = new RegExp(`(?:href|src)="\\/(?!${escapedBasePath}(?:\\/|"))`);

for (const page of pages) {
  const html = await readFile(new URL(`../out/${page}`, import.meta.url), "utf8");
  assert.match(html, /class="concept concept-apto nsf-apto is-routed"/);
  assert.ok(html.includes(`href="${basePath}/projects"`), `${page} needs a base-path-safe Projects link`);
  assert.ok(html.includes(`href="${basePath}/tools"`), `${page} needs a base-path-safe Tools link`);
  assert.ok(html.includes(`href="${basePath}/cohort"`), `${page} needs a base-path-safe Cohort link`);
  assert.ok(html.includes(`src="${basePath}/apto/nsf-logo.png"`), `${page} needs a base-path-safe NSF logo`);
  assert.ok(html.includes(`${basePath}/_next/`), `${page} needs base-path-safe framework assets`);
  assert.doesNotMatch(html, unprefixedPath);
}

for (const page of storyPages) {
  const html = await readFile(new URL(`../out/${page}`, import.meta.url), "utf8");
  assert.match(html, /class="apto-story"/);
  assert.match(html, /class="story-header"/);
  assert.ok(html.includes(`href="${basePath}/"`), `${page} needs a base-path-safe directory link`);
  for (const section of ["program", "projects", "tools", "cohort"]) {
    assert.ok(html.includes(`href="#story-${section}"`), `${page} needs its ${section} anchor link`);
    assert.ok(html.includes(`id="story-${section}"`), `${page} needs its ${section} section`);
  }
  assert.ok(html.includes(`src="${basePath}/apto/nsf-logo.png"`), `${page} needs a base-path-safe NSF logo`);
  assert.ok(html.includes(`src="${basePath}/apto/us-map.svg"`), `${page} needs its base-path-safe project map`);
  assert.ok(html.includes(`src="${basePath}/apto/`), `${page} needs base-path-safe content-managed images`);
  assert.ok(html.includes(`${basePath}/apto/og-apto-continuum.png`), `${page} needs the Continuum social image`);
  assert.equal((html.match(/class="story-map-location(?:\s|\")/g) ?? []).length, 4, `${page} needs four distinct map locations`);
  assert.equal((html.match(/class="story-map-pin(?:\s|\")/g) ?? []).length, 5, `${page} needs one map link for every project`);
  assert.equal((html.match(/href="#story-project-/g) ?? []).length, 5, `${page} needs five map destinations`);
  const expectedLogoCount = content.projects.length + content.participants.length + 1;
  assert.equal((html.match(/class="story-participant-logo\b/g) ?? []).length, expectedLogoCount, `${page} needs every project and cohort logo`);
  assert.equal((html.match(/class="story-logo-canvas"/g) ?? []).length, expectedLogoCount, `${page} needs a contained canvas for every logo`);
  for (const participant of content.participants) {
    assert.ok(
      html.includes(`story-participant-logo logo-${participant.id} logo-kind-${participant.logo.kind} asset-on-${participant.logo.surface}`),
      `${page} needs ${participant.displayName}'s logo geometry and surface metadata`,
    );
    assert.ok(
      html.includes(`src="${basePath}${participant.logo.src}"`),
      `${page} needs ${participant.displayName}'s base-path-safe logo`,
    );
  }
  assert.match(html, /class="story-map-location is-cluster"[^>]*role="group"[^>]*aria-label="2 nearby APTO project locations:/);
  assert.match(html, /<img[^>]*src="[^"]*\/apto\/us-map\.svg"[^>]*width="959"[^>]*height="593"/);
  const parallaxSpeeds = [...html.matchAll(/data-story-parallax="(-?[\d.]+)"/g)].map((match) => Number(match[1]));
  assert.ok(parallaxSpeeds.length >= 8, `${page} needs layered scroll visuals`);
  assert.ok(new Set(parallaxSpeeds).size >= 6, `${page} needs varied parallax depths`);
  assert.ok(parallaxSpeeds.some((speed) => speed < 0), `${page} needs a counter-moving parallax layer`);
  assert.ok(!html.includes(`${basePath}${basePath}`), `${page} must not duplicate the deployment base path`);
  assert.ok(html.includes(`${basePath}/_next/`), `${page} needs base-path-safe framework assets`);
  assert.doesNotMatch(html, unprefixedPath);
}

for (const page of atlasPages) {
  const html = await readFile(new URL(`../out/${page}`, import.meta.url), "utf8");
  assert.match(html, /class="apto-atlas"/);
  assert.match(html, /class="atlas-header"/);
  assert.match(html, /class="atlas-skip-link" href="#atlas-main"/);
  assert.ok(html.includes(`href="${basePath}/atlas"`), `${page} needs a base-path-safe Atlas Program link`);
  assert.ok(html.includes(`href="${basePath}/atlas/projects"`), `${page} needs a base-path-safe Atlas Projects link`);
  assert.ok(html.includes(`href="${basePath}/atlas/tools"`), `${page} needs a base-path-safe Atlas Tools link`);
  assert.ok(html.includes(`href="${basePath}/atlas/cohort"`), `${page} needs a base-path-safe Atlas Cohort link`);
  assert.ok(html.includes(`src="${basePath}/apto/nsf-logo.png"`), `${page} needs a base-path-safe NSF logo`);
  assert.ok(html.includes(`src="${basePath}/apto/`), `${page} needs base-path-safe Markdown-managed images`);
  assert.ok(html.includes(`${basePath}/apto/social/apto-atlas-social.png`), `${page} needs the Atlas social image`);
  if (page.endsWith("tools/index.html")) {
    assert.equal((html.match(/data-gallery-count="4"/g) ?? []).length, 10, `${page} needs four cycling frames for every tool`);
    assert.equal((html.match(/class="atlas-tool-panel"/g) ?? []).length, 10, `${page} needs a bottom information panel for every tool`);
    assert.equal((html.match(/class="atlas-tool-panel-footer"/g) ?? []).length, 10, `${page} needs View details inside every bottom panel`);
  }
  assert.ok(!html.includes(`${basePath}${basePath}`), `${page} must not duplicate the deployment base path`);
  assert.ok(html.includes(`${basePath}/_next/`), `${page} needs base-path-safe framework assets`);
  assert.doesNotMatch(html, unprefixedPath);
}

console.log(`Verified the directory, long-scroll, and Atlas APTO sites under ${basePath}.`);
