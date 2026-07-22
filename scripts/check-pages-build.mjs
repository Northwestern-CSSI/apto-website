import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/apto-website";
const pages = ["index.html", "projects/index.html", "tools/index.html", "cohort/index.html"];
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

console.log(`Verified the static APTO site under ${basePath}.`);
