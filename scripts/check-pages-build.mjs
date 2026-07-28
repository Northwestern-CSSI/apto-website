import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/apto-website";
const content = JSON.parse(await readFile(new URL("../app/apto/content.generated.json", import.meta.url), "utf8"));
const storyPages = ["index.html", "story/index.html", "apto/story/index.html"];
const atlasPages = ["", "projects/", "tools/", "cohort/", "convening/"].flatMap((suffix) => [
  `atlas/${suffix}index.html`,
  `apto/atlas/${suffix}index.html`,
]);
const escapedBasePath = basePath.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unprefixedPath = new RegExp(`(?:href|src)="\\/(?!${escapedBasePath}(?:\\/|"))`);

for (const page of storyPages) {
  const html = await readFile(new URL(`../out/${page}`, import.meta.url), "utf8");
  assert.match(html, /class="apto-story"/);
  assert.doesNotMatch(html, /concept-apto|Scroll to explore|story-map|us-map\.svg/i);
  assert.ok(html.includes(`href="${basePath}/atlas"`), `${page} needs the Atlas presentation link`);
  for (const section of ["program", "projects", "tools", "cohort", "convening"]) {
    assert.ok(html.includes(`href="#story-${section}"`), `${page} needs its ${section} anchor link`);
  }
  assert.equal((html.match(/class="story-tool-pair"/g) ?? []).length, 6);
  assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= content.tools.length);
  assert.ok((html.match(/class="apto-resource-path apto-resource-path-story"/g) ?? []).length >= content.tools.length);
  assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= content.tools.length);
  assert.doesNotMatch(html, /apto-resource-detail/);
  assert.ok(html.includes(`${basePath}/_next/`));
  assert.doesNotMatch(html, unprefixedPath);
}

for (const page of atlasPages) {
  const html = await readFile(new URL(`../out/${page}`, import.meta.url), "utf8");
  assert.match(html, /class="apto-atlas"/);
  assert.ok(html.includes(`href="${basePath}/atlas"`));
  assert.ok(html.includes(`href="${basePath}/atlas/projects"`));
  assert.ok(html.includes(`href="${basePath}/atlas/tools"`));
  assert.ok(html.includes(`href="${basePath}/atlas/cohort"`));
  assert.ok(html.includes(`href="${basePath}/atlas/convening"`));
  assert.ok(html.includes(`href="${basePath}/story"`));
  if (page.endsWith("tools/index.html")) {
    assert.ok((html.match(/data-gallery-count="4"/g) ?? []).length >= content.tools.length);
    assert.ok((html.match(/class="apto-resource-path apto-resource-path-atlas"/g) ?? []).length >= content.tools.length);
    assert.ok((html.match(/class="apto-resource-summary"/g) ?? []).length >= content.tools.length);
    assert.doesNotMatch(html, /atlas-tool-toggle|apto-resource-detail/);
  }
  assert.ok(html.includes(`${basePath}/_next/`));
  assert.doesNotMatch(html, unprefixedPath);
}

for (const tool of content.tools) {
  assert.equal([tool.figure, ...tool.galleryImages].length, 4);
  assert.ok(tool.resources.length > 0);
}

console.log(`Verified APTO Continuum and APTO Atlas under ${basePath}.`);
