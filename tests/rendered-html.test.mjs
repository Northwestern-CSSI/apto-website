import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>APTO Website Direction Study<\/title>/i);
  assert.match(html, /Thirty possible/);
  assert.match(html, /front doors to/);
  assert.match(html, /Civic Observatory/);
  assert.match(html, /Signal Story/);
  assert.match(html, /Gravity Field/);
  assert.match(html, /Motion and spatial worlds/);
  assert.equal((html.match(/concept-card card-/g) ?? []).length, 30);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships thirty concepts, responsive behavior, and APTO assets", async () => {
  const [source, interactiveSource, kineticSource, engines, styles, kineticStyles, packageJson] = await Promise.all([
    readFile(new URL("../app/mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/interactive-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/kinetic-mockups.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/kinetic-engines.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/kinetic-mockups.css", import.meta.url), "utf8"),
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
  ]) {
    assert.match(source, new RegExp(`case \\\"${id}\\\"`));
  }

  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(kineticStyles, /@media \(max-width:\s*760px\)/);
  assert.match(kineticStyles, /prefers-reduced-motion/);
  assert.match(kineticStyles, /kinetic-fallback-list/);
  assert.match(source, /Increase forecast horizon/);
  assert.match(source, /Public explorers use verified open resources/);
  assert.match(source, /lazy\(\(\) => import\("\.\/kinetic-mockups"\)/);
  assert.match(interactiveSource, /Hear the data/);
  assert.match(interactiveSource, /Show all evidence/);
  assert.match(interactiveSource, /RUN SCENARIO/);
  assert.match(kineticSource, /Scroll to dive/);
  assert.match(kineticSource, /Pause field/);
  assert.match(kineticSource, /Enter room/);
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
