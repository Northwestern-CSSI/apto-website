import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/apto-website";
const content = JSON.parse(
  await readFile(new URL("../app/apto/content.generated.json", import.meta.url), "utf8"),
);
const pages = ["index.html", "projects/index.html", "tools/index.html", "cohort/index.html", "convening/index.html"];
const storyPages = ["story/index.html", "apto/story/index.html"];
const atlasPages = [
  "atlas/index.html",
  "atlas/projects/index.html",
  "atlas/tools/index.html",
  "atlas/cohort/index.html",
  "atlas/convening/index.html",
  "apto/atlas/index.html",
  "apto/atlas/projects/index.html",
  "apto/atlas/tools/index.html",
  "apto/atlas/cohort/index.html",
  "apto/atlas/convening/index.html",
];
const escapedBasePath = basePath.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unprefixedPath = new RegExp(`(?:href|src)="\\/(?!${escapedBasePath}(?:\\/|"))`);
const toolMediaPaths = content.tools.flatMap((tool) => {
  const paths = [tool.figure.src, ...tool.galleryImages.map((image) => image.src)];
  assert.equal(paths.length, 4, `${tool.name} needs exactly four Atlas media frames`);
  return paths;
});
assert.equal(new Set(toolMediaPaths).size, toolMediaPaths.length, "Atlas tool media paths must be globally unique");

for (const page of pages) {
  const html = await readFile(new URL(`../out/${page}`, import.meta.url), "utf8");
  assert.match(html, /class="concept concept-apto nsf-apto is-routed"/);
  assert.ok(html.includes(`href="${basePath}/projects"`), `${page} needs a base-path-safe Projects link`);
  assert.ok(html.includes(`href="${basePath}/tools"`), `${page} needs a base-path-safe Tools link`);
  assert.ok(html.includes(`href="${basePath}/cohort"`), `${page} needs a base-path-safe Cohort link`);
  assert.ok(html.includes(`href="${basePath}/convening"`), `${page} needs a base-path-safe Convening link`);
  assert.ok(html.includes(`src="${basePath}/apto/nsf-logo.png"`), `${page} needs a base-path-safe NSF logo`);
  assert.ok(html.includes(`${basePath}/_next/`), `${page} needs base-path-safe framework assets`);
  if (page !== "convening/index.html") {
    for (const participant of content.participants) {
      for (const [theme, asset] of Object.entries(participant.logo.variants)) {
        assert.ok(
          html.includes(`class="nsf-logo-asset is-${theme}" src="${basePath}${asset.src}"`),
          `${page} needs ${participant.displayName}'s base-path-safe ${theme} logo`,
        );
      }
    }
  }
  assert.doesNotMatch(html, unprefixedPath);
}

for (const page of storyPages) {
  const html = await readFile(new URL(`../out/${page}`, import.meta.url), "utf8");
  assert.match(html, /class="apto-story"/);
  assert.match(html, /class="story-header"/);
  assert.ok(html.includes(`href="${basePath}/"`), `${page} needs a base-path-safe directory link`);
  for (const section of ["program", "projects", "tools", "cohort", "convening"]) {
    assert.ok(html.includes(`href="#story-${section}"`), `${page} needs its ${section} anchor link`);
    assert.ok(html.includes(`id="story-${section}"`), `${page} needs its ${section} section`);
  }
  assert.ok(html.includes(`src="${basePath}/apto/nsf-logo.png"`), `${page} needs a base-path-safe NSF logo`);
  assert.ok(html.includes(`src="${basePath}/apto/`), `${page} needs base-path-safe content-managed images`);
  assert.ok(html.includes(`${basePath}/apto/og-apto-continuum.png`), `${page} needs the Continuum social image`);
  assert.equal((html.match(/class="story-tool-pair"/g) ?? []).length, 5, `${page} needs five paired lead-institution tool rows`);
  assert.doesNotMatch(html, /story-map|us-map\.svg/i);
  const expectedLogoCount = content.projects.length + content.participants.length;
  assert.equal((html.match(/class="story-participant-logo\b/g) ?? []).length, expectedLogoCount, `${page} needs every project and cohort logo`);
  assert.equal((html.match(/class="story-logo-canvas"/g) ?? []).length, expectedLogoCount, `${page} needs a contained canvas for every logo`);
  assert.equal((html.match(/class="story-logo-asset is-(?:light|dark)"/g) ?? []).length, expectedLogoCount * 2, `${page} needs paired light and dark assets for every logo`);
  for (const participant of content.participants) {
    assert.ok(
      html.includes(`story-participant-logo logo-${participant.id} logo-kind-${participant.logo.kind}`),
      `${page} needs ${participant.displayName}'s logo geometry metadata`,
    );
    for (const [theme, asset] of Object.entries(participant.logo.variants)) {
      assert.ok(
        html.includes(`class="story-logo-asset is-${theme}" src="${basePath}${asset.src}"`),
        `${page} needs ${participant.displayName}'s base-path-safe ${theme} logo`,
      );
    }
  }
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
  assert.ok(html.includes(`href="${basePath}/atlas/convening"`), `${page} needs a base-path-safe Atlas Convening link`);
  assert.ok(html.includes(`src="${basePath}/apto/nsf-logo.png"`), `${page} needs a base-path-safe NSF logo`);
  assert.ok(html.includes(`src="${basePath}/apto/`), `${page} needs base-path-safe Markdown-managed images`);
  assert.ok(html.includes(`${basePath}/apto/social/apto-atlas-social.png`), `${page} needs the Atlas social image`);
  const atlasLogoCount = (html.match(/class="atlas-logo(?:\s|")/g) ?? []).length;
  assert.equal((html.match(/class="atlas-logo-canvas"/g) ?? []).length, atlasLogoCount, `${page} needs a normalized canvas inside every Atlas logo`);
  assert.equal((html.match(/class="atlas-logo-asset is-(?:light|dark)"/g) ?? []).length, atlasLogoCount * 2, `${page} needs paired light and dark assets inside every Atlas logo`);
  for (const participant of content.participants) {
    if (!html.includes(`atlas-logo logo-${participant.id}`)) continue;
    for (const [theme, asset] of Object.entries(participant.logo.variants)) {
      assert.ok(
        html.includes(`class="atlas-logo-asset is-${theme}" src="${basePath}${asset.src}"`),
        `${page} needs ${participant.displayName}'s base-path-safe ${theme} logo`,
      );
    }
  }
  if (page.endsWith("tools/index.html")) {
    assert.equal((html.match(/data-gallery-count="4"/g) ?? []).length, content.tools.length, `${page} needs four cycling frames for every tool`);
    assert.equal((html.match(/class="atlas-tool-panel"/g) ?? []).length, content.tools.length, `${page} needs a bottom information panel for every tool`);
    assert.equal((html.match(/class="atlas-tool-panel-footer"/g) ?? []).length, content.tools.length, `${page} needs View details inside every bottom panel`);
    assert.doesNotMatch(html, /<progress\b|role="progressbar"|atlas-tool-(?:progress|pagination|dots|indicator)/i);
  }
  if (page === "atlas/index.html" || page === "apto/atlas/index.html") {
    const mosaic = html.match(/<section class="atlas-program-mosaic"[\s\S]*?<\/section>/)?.[0];
    assert.ok(mosaic, `${page} needs the Atlas program visual gallery`);
    assert.equal((mosaic.match(/data-program-visual="true"/g) ?? []).length, content.program.landingGallery.length, `${page} needs every equal-weight program visual`);
    assert.equal((mosaic.match(/<figcaption\b/g) ?? []).length, 0, `${page} must not label organizations in the program gallery`);
    for (const participant of content.participants) {
      assert.ok(!mosaic.includes(participant.displayName), `${page} must not give ${participant.displayName} a labeled landing-page position`);
    }
    for (const image of content.program.landingGallery) {
      assert.ok(mosaic.includes(`src="${basePath}${image.src}"`), `${page} needs base-path-safe program visual ${image.src}`);
    }
  }
  assert.ok(!html.includes(`${basePath}${basePath}`), `${page} must not duplicate the deployment base path`);
  assert.ok(html.includes(`${basePath}/_next/`), `${page} needs base-path-safe framework assets`);
  assert.doesNotMatch(html, unprefixedPath);
}

console.log(`Verified the directory, long-scroll, and Atlas APTO sites under ${basePath}.`);
