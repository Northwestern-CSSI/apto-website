#!/usr/bin/env node

/**
 * Build the six NSF-aligned APTO directions from Markdown.
 *
 * The frontmatter is deliberately JSON, not YAML, so this pipeline can run with
 * Node.js alone. Human-readable descriptions live in the Markdown H2 sections.
 */

import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const contentDirectory = path.join(rootDirectory, "content", "apto");
const interfaceFile = path.join(contentDirectory, "interface.md");
const pageDirectory = path.join(contentDirectory, "pages");
const projectDirectory = path.join(contentDirectory, "projects");
const toolDirectory = path.join(contentDirectory, "tools");
const outputFile = path.join(
  rootDirectory,
  "app",
  "nsf-apto-content.generated.json",
);

const expectedBoilerplate =
  "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.";

const allowedOutcomes = new Set(["Capability", "Production", "Use"]);
const allowedLinesOfEffort = new Set(["models", "data-tools"]);
const allowedFigureKinds = new Set([
  "agent-network",
  "causal-graph",
  "evidence-stream",
  "global-map",
  "knowledge-map",
  "problem-landscape",
  "scenario-curves",
  "signal-matrix",
  "technology-timeline",
  "translation-funnel",
]);
const allowedSourceKinds = new Set([
  "program",
  "award-search",
  "awards-api",
  "award",
  "brand",
  "organization",
]);
const allowedLogoKinds = new Set(["symbol", "wordmark"]);
const allowedLogoSurfaces = new Set(["dark", "light"]);
const allowedHeroWidgetIds = new Set(["emerging", "map", "patent", "trajectories"]);
const allowedHeroWidgetKinds = new Set(["signals", "map", "translation", "trajectories"]);
const allowedHeroWidgetIcons = new Set(["trend-up", "network-map", "shield-check", "trajectory"]);
const allowedTrajectoryTones = new Set(["blue", "gold", "purple"]);
const expectedDirectionIds = new Set([
  "nsfhome",
  "nsfhomewidgets",
  "nsfledger",
  "nsfledgerwidgets",
  "nsfnetwork",
  "nsfnetworkwidgets",
]);
const expectedPages = new Map([
  ["about", { slug: "/about" }],
  ["cohort", { slug: "/cohort" }],
  ["home", { slug: "/" }],
  ["people", { slug: "/people" }],
  ["projects", { slug: "/projects" }],
  ["tools", { slug: "/tools" }],
]);

function relativeFile(file) {
  return path.relative(rootDirectory, file).split(path.sep).join("/");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function requireObject(value, context) {
  assert(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${context} must be an object`,
  );
  return value;
}

function requireString(object, key, context) {
  const value = object[key];
  assert(
    typeof value === "string" && value.trim().length > 0,
    `${context}.${key} must be a non-empty string`,
  );
  return value;
}

function requireArray(object, key, context) {
  const value = object[key];
  assert(Array.isArray(value), `${context}.${key} must be an array`);
  return value;
}

function requirePositiveNumber(object, key, context) {
  const value = object[key];
  assert(
    typeof value === "number" && Number.isFinite(value) && value > 0,
    `${context}.${key} must be a positive finite number`,
  );
  return value;
}

function requireHttpsUrl(value, context) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${context} must be a valid URL`);
  }
  assert(url.protocol === "https:", `${context} must use HTTPS`);
  return value;
}

function requireIsoDate(value, context) {
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
    `${context} must be an ISO date (YYYY-MM-DD)`,
  );
  return value;
}

function assertUnique(values, context) {
  const seen = new Set();
  for (const value of values) {
    assert(!seen.has(value), `${context} contains duplicate value “${value}”`);
    seen.add(value);
  }
}

function assertExactSet(values, expected, context) {
  assertUnique(values, context);
  assert(
    values.length === expected.size &&
      values.every((value) => expected.has(value)),
    `${context} must contain exactly: ${[...expected].join(", ")}`,
  );
}

function assertExactKeys(object, expected, context) {
  assertExactSet(Object.keys(object), new Set(expected), `${context} fields`);
}

function requireExactStringObject(value, keys, context) {
  const object = requireObject(value, context);
  assertExactKeys(object, keys, context);
  for (const key of keys) requireString(object, key, context);
  return object;
}

function normalizeProse(value) {
  return value.replace(/\s+/g, " ").trim();
}

function compareAlphabetically(left, right) {
  return (
    left.localeCompare(right, "en", { sensitivity: "base" }) ||
    left.localeCompare(right, "en")
  );
}

function projectTitleSortKey(title) {
  return title.replace(/^APTO:\s*/i, "");
}

function assertAlphabetical(values, context) {
  const sorted = [...values].sort(compareAlphabetically);
  assert(
    values.every((value, index) => value === sorted[index]),
    `${context} must be alphabetized`,
  );
}

function omitFields(object, fields) {
  const omitted = new Set(fields);
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !omitted.has(key)),
  );
}

function parseMarkdownBody(body, file) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const h1s = lines
    .filter((line) => /^#\s+/.test(line))
    .map((line) => line.replace(/^#\s+/, "").trim());
  assert(h1s.length === 1, `${relativeFile(file)} must contain exactly one H1`);

  const sections = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^##\s+(.+?)\s*$/);
    if (!match) continue;

    const heading = match[1];
    assert(
      !sections.has(heading),
      `${relativeFile(file)} contains duplicate H2 “${heading}”`,
    );
    const sectionLines = [];
    for (index += 1; index < lines.length; index += 1) {
      if (/^##\s+/.test(lines[index])) {
        index -= 1;
        break;
      }
      sectionLines.push(lines[index]);
    }
    sections.set(heading, sectionLines.join("\n").trim());
  }

  return { h1: h1s[0], sections };
}

async function readMarkdown(file) {
  const raw = (await readFile(file, "utf8"))
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert(
    match,
    `${relativeFile(file)} must start with JSON frontmatter between --- lines`,
  );

  let metadata;
  try {
    metadata = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(
      `${relativeFile(file)} has invalid JSON frontmatter: ${error.message}`,
    );
  }

  return {
    file,
    metadata: requireObject(metadata, `${relativeFile(file)} frontmatter`),
    ...parseMarkdownBody(match[2], file),
  };
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(directory, entry.name))
    .sort((left, right) => left.localeCompare(right, "en"));
}

function validatePerson(person, context) {
  requireObject(person, context);
  requireString(person, "name", context);
  requireString(person, "initials", context);
  const role = requireString(person, "role", context);
  assert(
    role === "Principal Investigator" ||
      role === "Co-Principal Investigator",
    `${context}.role is not supported`,
  );
  assert(
    person.headshotUrl === null || typeof person.headshotUrl === "string",
    `${context}.headshotUrl must be null or a string`,
  );
  requireString(person, "headshotAlt", context);
  assert(
    person.profileUrl === null || typeof person.profileUrl === "string",
    `${context}.profileUrl must be null or a string`,
  );
  if (person.headshotUrl !== null) {
    requireHttpsUrl(person.headshotUrl, `${context}.headshotUrl`);
  }
  if (person.profileUrl !== null) {
    requireHttpsUrl(person.profileUrl, `${context}.profileUrl`);
  }
}

function validateProgramPerson(person, context) {
  requireObject(person, context);
  assertExactKeys(
    person,
    ["name", "initials", "role", "organization", "headshotUrl", "headshotAlt", "profileUrl"],
    context,
  );
  requireString(person, "name", context);
  requireString(person, "initials", context);
  requireString(person, "role", context);
  requireString(person, "organization", context);
  assert(
    person.headshotUrl === null || typeof person.headshotUrl === "string",
    `${context}.headshotUrl must be null or a string`,
  );
  requireString(person, "headshotAlt", context);
  assert(
    person.profileUrl === null || typeof person.profileUrl === "string",
    `${context}.profileUrl must be null or a string`,
  );
  if (person.headshotUrl !== null) {
    requireHttpsUrl(person.headshotUrl, `${context}.headshotUrl`);
  }
  if (person.profileUrl !== null) {
    requireHttpsUrl(person.profileUrl, `${context}.profileUrl`);
  }
}

function validateParticipantLogo(logo, context) {
  requireObject(logo, context);
  assertExactKeys(
    logo,
    [
      "src",
      "width",
      "height",
      "surface",
      "kind",
      "sourceUrl",
      "sourceLabel",
      "status",
      "approved",
    ],
    context,
  );

  const src = requireString(logo, "src", context);
  assert(src.startsWith("/"), `${context}.src must be a root-relative asset path`);
  requirePositiveNumber(logo, "width", context);
  requirePositiveNumber(logo, "height", context);
  const surface = requireString(logo, "surface", context);
  assert(
    allowedLogoSurfaces.has(surface),
    `${context}.surface must be one of: ${[...allowedLogoSurfaces].join(", ")}`,
  );
  const kind = requireString(logo, "kind", context);
  assert(
    allowedLogoKinds.has(kind),
    `${context}.kind must be one of: ${[...allowedLogoKinds].join(", ")}`,
  );
  requireHttpsUrl(
    requireString(logo, "sourceUrl", context),
    `${context}.sourceUrl`,
  );
  requireString(logo, "sourceLabel", context);
  requireString(logo, "status", context);
  assert(typeof logo.approved === "boolean", `${context}.approved must be a boolean`);
  return logo;
}

function validatePage(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assert(metadata.kind === "page", `${context}.kind must be “page”`);
  assertExactKeys(
    metadata,
    ["kind", "slug", "navLabel", "metadataTitle", "eyebrow", "title"],
    `${context} frontmatter`,
  );

  const id = path.basename(file, ".md");
  const expected = expectedPages.get(id);
  assert(expected, `${context} filename is not a supported routed page`);
  const slug = requireString(metadata, "slug", context);
  const navLabel = requireString(metadata, "navLabel", context);
  const metadataTitle = requireString(metadata, "metadataTitle", context);
  const eyebrow = requireString(metadata, "eyebrow", context);
  const title = requireString(metadata, "title", context);
  assert(slug === expected.slug, `${context}.slug must be “${expected.slug}”`);
  assert(h1 === title, `${context} H1 must match frontmatter title`);
  assert(
    sections.size === 1 && sections.has("Introduction"),
    `${context} must contain exactly one “## Introduction” section`,
  );
  const introduction = sections.get("Introduction");
  assert(
    introduction,
    `${context} must contain a non-empty “## Introduction” section`,
  );

  return {
    id,
    sourceFile: file,
    page: {
      slug,
      navLabel,
      metadataTitle,
      eyebrow,
      title,
      introduction: normalizeProse(introduction),
    },
  };
}

function validateProgram(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assert(metadata.kind === "program", `${context}.kind must be “program”`);
  requireString(metadata, "id", context);
  requireString(metadata, "eyebrow", context);
  const name = requireString(metadata, "name", context);
  assert(h1 === name, `${context} H1 must match frontmatter name`);
  assert(metadata.acronym === "APTO", `${context}.acronym must be “APTO”`);
  requireString(metadata, "title", context);
  requireString(metadata, "shortSummary", context);
  requireString(metadata, "cohortDescription", context);
  requireIsoDate(requireString(metadata, "lastVerified", context), `${context}.lastVerified`);

  const stats = requireArray(metadata, "stats", context);
  assert(stats.length === 4, `${context}.stats must contain four records`);
  stats.forEach((stat, index) => {
    const statContext = `${context}.stats[${index}]`;
    requireObject(stat, statContext);
    requireString(stat, "value", statContext);
    requireString(stat, "label", statContext);
    requireString(stat, "detail", statContext);
  });

  const programTeamInput = requireArray(metadata, "programTeam", context);
  assert(programTeamInput.length > 0, `${context}.programTeam must not be empty`);
  programTeamInput.forEach((person, index) =>
    validateProgramPerson(person, `${context}.programTeam[${index}]`),
  );
  const programTeam = [...programTeamInput].sort((left, right) =>
    compareAlphabetically(left.name, right.name),
  );
  assertUnique(programTeam.map((person) => person.name), `${context}.programTeam names`);

  const framework = requireObject(metadata.framework, `${context}.framework`);
  assertExactKeys(
    framework,
    ["ariaLabel", "outcomesTitle", "outcomesNote", "effortsTitle", "effortsNote"],
    `${context}.framework`,
  );
  requireString(framework, "ariaLabel", `${context}.framework`);
  requireString(framework, "outcomesTitle", `${context}.framework`);
  requireString(framework, "outcomesNote", `${context}.framework`);
  requireString(framework, "effortsTitle", `${context}.framework`);
  requireString(framework, "effortsNote", `${context}.framework`);

  const outcomes = requireArray(metadata, "outcomes", context);
  assert(outcomes.length === 3, `${context}.outcomes must contain three records`);
  assertExactSet(
    outcomes.map((outcome) => requireString(outcome, "name", `${context}.outcomes`)),
    allowedOutcomes,
    `${context}.outcomes`,
  );
  outcomes.forEach((outcome, index) =>
    requireString(outcome, "description", `${context}.outcomes[${index}]`),
  );

  const linesOfEffort = requireArray(metadata, "linesOfEffort", context);
  assert(
    linesOfEffort.length === 2,
    `${context}.linesOfEffort must contain two records`,
  );
  assertExactSet(
    linesOfEffort.map((line) =>
      requireString(line, "id", `${context}.linesOfEffort`),
    ),
    allowedLinesOfEffort,
    `${context}.linesOfEffort`,
  );
  linesOfEffort.forEach((line, index) => {
    requireString(line, "title", `${context}.linesOfEffort[${index}]`);
    requireString(line, "description", `${context}.linesOfEffort[${index}]`);
  });

  const technologyAreas = requireArray(metadata, "technologyAreas", context);
  assert(
    technologyAreas.length === 10 &&
      technologyAreas.every((area) => typeof area === "string" && area.length > 0),
    `${context}.technologyAreas must contain ten non-empty strings`,
  );
  assertUnique(technologyAreas, `${context}.technologyAreas`);
  requireString(metadata, "openAccessNote", context);
  assert(
    metadata.boilerplate === expectedBoilerplate,
    `${context}.boilerplate must match the approved NSF language exactly`,
  );

  const sources = requireArray(metadata, "sources", context);
  sources.forEach((source, index) => {
    const sourceContext = `${context}.sources[${index}]`;
    requireObject(source, sourceContext);
    requireString(source, "id", sourceContext);
    requireString(source, "label", sourceContext);
    requireHttpsUrl(requireString(source, "url", sourceContext), `${sourceContext}.url`);
    requireString(source, "detail", sourceContext);
    assert(
      allowedSourceKinds.has(source.kind),
      `${sourceContext}.kind is not supported`,
    );
  });
  assertUnique(sources.map((source) => source.id), `${context}.sources ids`);

  const description = sections.get("Description");
  assert(description, `${context} must contain a non-empty “## Description” section`);

  const program = omitFields(metadata, ["kind", "id", "boilerplate", "sources"]);
  return {
    program: { ...program, programTeam, description: normalizeProse(description) },
    boilerplate: metadata.boilerplate,
    sources: metadata.sources,
  };
}

function validateInterface(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assert(metadata.kind === "interface", `${context}.kind must be “interface”`);
  assertExactKeys(
    metadata,
    [
      "kind",
      "directions",
      "study",
      "primaryNavigation",
      "home",
      "widget",
      "common",
      "accessibility",
      "projects",
      "tools",
      "people",
      "cohort",
      "disclosures",
      "footer",
    ],
    `${context} frontmatter`,
  );
  assert(
    h1 === "APTO website interface content",
    `${context} H1 must be “APTO website interface content”`,
  );
  assert(
    sections.size === 1 && sections.has("Editorial guidance"),
    `${context} must contain exactly one “## Editorial guidance” section`,
  );

  const directions = requireArray(metadata, "directions", context);
  assertExactSet(
    directions.map((direction, index) => {
      const directionContext = `${context}.directions[${index}]`;
      requireObject(direction, directionContext);
      const id = requireString(direction, "id", directionContext);
      requireString(direction, "label", directionContext);
      requireString(direction, "note", directionContext);
      return id;
    }),
    expectedDirectionIds,
    `${context}.directions`,
  );

  const study = requireObject(metadata.study, `${context}.study`);
  assertExactKeys(
    study,
    [
      "siteTitle",
      "siteDescription",
      "socialImageAlt",
      "galleryLabel",
      "barLabel",
      "themeChooserLabel",
      "formatChooserLabel",
      "formatLabel",
      "standardLabel",
      "widgetLabel",
      "selectedFormatLabel",
    ],
    `${context}.study`,
  );
  for (const key of [
    "siteTitle",
    "siteDescription",
    "socialImageAlt",
    "galleryLabel",
    "barLabel",
    "themeChooserLabel",
    "formatChooserLabel",
    "formatLabel",
    "standardLabel",
    "widgetLabel",
    "selectedFormatLabel",
  ]) requireString(study, key, `${context}.study`);
  const primaryNavigation = requireArray(metadata, "primaryNavigation", context);
  assert(primaryNavigation.length === 5, `${context}.primaryNavigation must contain five links`);
  assertExactSet(
    primaryNavigation.map((item, index) => {
      const itemContext = `${context}.primaryNavigation[${index}]`;
      requireObject(item, itemContext);
      requireString(item, "label", itemContext);
      return requireString(item, "section", itemContext);
    }),
    new Set(["about", "cohort", "people", "projects", "tools"]),
    `${context}.primaryNavigation sections`,
  );

  const home = requireObject(metadata.home, `${context}.home`);
  assertExactKeys(
    home,
    [
      "primaryActionLabel",
      "secondaryActionLabel",
      "outcomeVisualNote",
      "cohortEyebrow",
      "cohortTitle",
      "cohortLinkLabel",
      "logoDisclosure",
      "networkCoreLabel",
      "networkVisualAlt",
      "networkVisualCaption",
      "ledgerVisualEyebrow",
      "ledgerVisualTitle",
      "pathways",
    ],
    `${context}.home`,
  );
  for (const key of [
    "primaryActionLabel",
    "secondaryActionLabel",
    "outcomeVisualNote",
    "cohortEyebrow",
    "cohortTitle",
    "cohortLinkLabel",
    "logoDisclosure",
    "networkCoreLabel",
    "networkVisualAlt",
    "networkVisualCaption",
    "ledgerVisualEyebrow",
    "ledgerVisualTitle",
  ]) requireString(home, key, `${context}.home`);
  const pathways = requireArray(home, "pathways", `${context}.home`);
  assertExactSet(
    pathways.map((pathway, index) => {
      const pathwayContext = `${context}.home.pathways[${index}]`;
      requireObject(pathway, pathwayContext);
      requireString(pathway, "title", pathwayContext);
      requireString(pathway, "description", pathwayContext);
      return requireString(pathway, "section", pathwayContext);
    }),
    new Set(["about", "cohort", "people", "projects", "tools"]),
    `${context}.home.pathways sections`,
  );

  const widget = requireObject(metadata.widget, `${context}.widget`);
  assertExactKeys(
    widget,
    [
      "eyebrow",
      "title",
      "allToolsLabel",
      "disclaimer",
      "exploreLabel",
      "previewAriaLabel",
      "chooserAriaLabel",
      "momentumScaleLabel",
      "momentumListAriaLabel",
      "mapCaptionPrefix",
      "mapCaptionSuffix",
      "compositeAriaPrefix",
      "compositeAriaJoiner",
      "demoIndexLabel",
      "trajectoryScaleLabel",
      "trajectoryAriaSuffix",
      "items",
    ],
    `${context}.widget`,
  );
  for (const key of [
    "eyebrow",
    "title",
    "allToolsLabel",
    "disclaimer",
    "exploreLabel",
    "previewAriaLabel",
    "chooserAriaLabel",
    "momentumScaleLabel",
    "momentumListAriaLabel",
    "mapCaptionPrefix",
    "mapCaptionSuffix",
    "compositeAriaPrefix",
    "compositeAriaJoiner",
    "demoIndexLabel",
    "trajectoryScaleLabel",
    "trajectoryAriaSuffix",
  ]) {
    requireString(widget, key, `${context}.widget`);
  }
  const widgetItems = requireArray(widget, "items", `${context}.widget`);
  assert(widgetItems.length === 4, `${context}.widget.items must contain four records`);
  assertExactSet(
    widgetItems.map((item, index) => requireString(item, "id", `${context}.widget.items[${index}]`)),
    allowedHeroWidgetIds,
    `${context}.widget item ids`,
  );
  assertAlphabetical(
    widgetItems.map((item, index) => requireString(item, "tabLabel", `${context}.widget.items[${index}]`)),
    `${context}.widget.items tab labels`,
  );

  widgetItems.forEach((item, index) => {
    const itemContext = `${context}.widget.items[${index}]`;
    requireObject(item, itemContext);
    for (const key of ["icon", "tabLabel", "kicker", "title", "summary"]) {
      requireString(item, key, itemContext);
    }
    assert(
      allowedHeroWidgetIcons.has(item.icon),
      `${itemContext}.icon is not supported`,
    );
    const preview = requireObject(item.preview, `${itemContext}.preview`);
    const kind = requireString(preview, "kind", `${itemContext}.preview`);
    assert(allowedHeroWidgetKinds.has(kind), `${itemContext}.preview.kind is not supported`);

    if (kind === "map") {
      const clusters = requireArray(preview, "clusters", `${itemContext}.preview`);
      assert(clusters.length === 5, `${itemContext}.preview.clusters must contain five labels`);
      clusters.forEach((cluster, clusterIndex) => assert(
        typeof cluster === "string" && cluster.length > 0,
        `${itemContext}.preview.clusters[${clusterIndex}] must be a non-empty string`,
      ));
      assertAlphabetical(clusters, `${itemContext}.preview.clusters`);
      requireString(preview, "focusLabel", `${itemContext}.preview`);
      requireString(preview, "focusTitle", `${itemContext}.preview`);
      return;
    }

    const rows = requireArray(preview, "rows", `${itemContext}.preview`);
    assert(rows.length >= 3, `${itemContext}.preview.rows must contain at least three records`);
    rows.forEach((row, rowIndex) => {
      const rowContext = `${itemContext}.preview.rows[${rowIndex}]`;
      requireObject(row, rowContext);
      requireString(row, "label", rowContext);
      if (kind === "signals" || kind === "trajectories") requireString(row, "category", rowContext);
      if (kind === "signals" || kind === "translation") {
        const value = requirePositiveNumber(row, "value", rowContext);
        assert(value <= 100, `${rowContext}.value must be no greater than 100`);
      }
      if (kind === "trajectories") {
        const tone = requireString(row, "tone", rowContext);
        assert(allowedTrajectoryTones.has(tone), `${rowContext}.tone is not supported`);
      }
    });
    assertAlphabetical(rows.map((row) => row.label), `${itemContext}.preview.rows`);
    if (kind === "translation") {
      const composite = requirePositiveNumber(preview, "composite", `${itemContext}.preview`);
      const maximum = requirePositiveNumber(preview, "maximum", `${itemContext}.preview`);
      assert(composite <= maximum, `${itemContext}.preview.composite must not exceed maximum`);
    }
    if (kind === "trajectories") {
      requireString(preview, "observedLabel", `${itemContext}.preview`);
      requireString(preview, "forecastLabel", `${itemContext}.preview`);
    }
  });

  requireExactStringObject(
    metadata.common,
    [
      "organizationWebsiteLabel",
      "officialAwardRecordLabel",
      "nsfAwardRecordLabel",
      "awardApiRecordLabel",
      "participantWebsiteLabel",
    ],
    `${context}.common`,
  );
  requireExactStringObject(
    metadata.accessibility,
    [
      "skipLinkLabel",
      "primaryNavigationLabel",
      "footerNavigationLabel",
      "homePathwaysLabel",
      "projectInvestigatorsLabel",
      "outcomeTypesLabel",
      "linesOfEffortLabel",
    ],
    `${context}.accessibility`,
  );
  requireExactStringObject(
    metadata.projects,
    [
      "ledgerTitle",
      "awardLabel",
      "personAwardLabel",
      "legalAwardeeLabel",
      "agreementLabel",
      "obligatedAmountLabel",
      "estimatedTotalLabel",
      "dataAsOfLabel",
    ],
    `${context}.projects`,
  );
  requireExactStringObject(
    metadata.tools,
    [
      "registerTitle",
      "allOrganizationsLabel",
      "filterAriaLabel",
      "showingAllLabel",
      "showingParticipantPrefix",
      "conceptByLabel",
      "demoVideoLabel",
      "toolLinkLabel",
      "watchWithCaptionsLabel",
      "captionsForthcomingLabel",
      "linkForthcomingLabel",
      "openToolLabel",
    ],
    `${context}.tools`,
  );
  requireExactStringObject(
    metadata.people,
    ["programTeamTitle", "projectProfileLabel", "portraitForthcomingLabel", "viewProfileLabel"],
    `${context}.people`,
  );
  requireExactStringObject(
    metadata.cohort,
    ["prominentTitle", "markStatusSuffix"],
    `${context}.cohort`,
  );

  const disclosures = requireObject(metadata.disclosures, `${context}.disclosures`);
  for (const key of ["cohort", "toolsLabel", "toolsNote"]) {
    requireString(disclosures, key, `${context}.disclosures`);
  }
  const footer = requireObject(metadata.footer, `${context}.footer`);
  assertExactKeys(
    footer,
    [
      "supportTitle",
      "supportDescription",
      "disclaimerTitle",
      "backToTopLabel",
      "homeLinkLabel",
      "programLinkLabel",
      "nsfWebsiteUrl",
      "nsfLogoSrc",
      "nsfWebsiteAriaLabel",
      "nsfLogoAlt",
    ],
    `${context}.footer`,
  );
  for (const key of [
    "supportTitle",
    "supportDescription",
    "disclaimerTitle",
    "backToTopLabel",
    "homeLinkLabel",
    "programLinkLabel",
    "nsfWebsiteUrl",
    "nsfLogoSrc",
    "nsfWebsiteAriaLabel",
    "nsfLogoAlt",
  ]) {
    requireString(footer, key, `${context}.footer`);
  }
  requireHttpsUrl(footer.nsfWebsiteUrl, `${context}.footer.nsfWebsiteUrl`);
  assert(
    footer.nsfLogoSrc.startsWith("/"),
    `${context}.footer.nsfLogoSrc must be a root-relative asset path`,
  );

  return omitFields(metadata, ["kind"]);
}

function validateProject(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assert(metadata.kind === "project", `${context}.kind must be “project”`);
  const id = requireString(metadata, "id", context);
  const awardId = requireString(metadata, "awardId", context);
  assert(/^\d{7}$/.test(awardId), `${context}.awardId must contain seven digits`);
  requireString(metadata, "shortName", context);
  const officialTitle = requireString(metadata, "officialTitle", context);
  assert(
    officialTitle.startsWith("APTO:"),
    `${context}.officialTitle must begin with “APTO:”`,
  );
  assert(h1 === officialTitle, `${context} H1 must match officialTitle`);
  assert(
    metadata.agreementType === "Cooperative Agreement",
    `${context}.agreementType must be “Cooperative Agreement”`,
  );
  requireIsoDate(requireString(metadata, "startDate", context), `${context}.startDate`);
  requireIsoDate(requireString(metadata, "endDate", context), `${context}.endDate`);
  assert(metadata.startDate < metadata.endDate, `${context} endDate must follow startDate`);

  const funding = requireObject(metadata.funding, `${context}.funding`);
  for (const key of ["obligatedAmount", "estimatedTotalAmount"]) {
    assert(
      Number.isInteger(funding[key]) && funding[key] > 0,
      `${context}.funding.${key} must be a positive integer`,
    );
  }
  assert(funding.currency === "USD", `${context}.funding.currency must be “USD”`);
  requireIsoDate(
    requireString(funding, "dataAsOf", `${context}.funding`),
    `${context}.funding.dataAsOf`,
  );
  requireString(funding, "dataAsOfLabel", `${context}.funding`);
  if (funding.caveat !== undefined) {
    requireString(funding, "caveat", `${context}.funding`);
  }

  const outcomes = requireArray(metadata, "outcomes", context);
  assertExactSet(outcomes, allowedOutcomes, `${context}.outcomes`);
  const linesOfEffort = requireArray(metadata, "linesOfEffort", context);
  assertExactSet(linesOfEffort, allowedLinesOfEffort, `${context}.linesOfEffort`);
  const awardUrl = requireHttpsUrl(
    requireString(metadata, "awardUrl", context),
    `${context}.awardUrl`,
  );
  const apiUrl = requireHttpsUrl(
    requireString(metadata, "apiUrl", context),
    `${context}.apiUrl`,
  );
  assert(awardUrl.includes(awardId), `${context}.awardUrl must contain awardId`);
  assert(apiUrl.includes(awardId), `${context}.apiUrl must contain awardId`);

  const participant = requireObject(metadata.participant, `${context}.participant`);
  const participantId = requireString(participant, "id", `${context}.participant`);
  requireString(participant, "displayName", `${context}.participant`);
  requireString(participant, "name", `${context}.participant`);
  requireString(participant, "legalName", `${context}.participant`);
  assert(
    participant.kind === "University" || participant.kind === "Company",
    `${context}.participant.kind must be “University” or “Company”`,
  );
  requireString(participant, "location", `${context}.participant`);
  requireHttpsUrl(
    requireString(participant, "website", `${context}.participant`),
    `${context}.participant.website`,
  );
  validateParticipantLogo(
    participant.logo,
    `${context}.participant.logo`,
  );
  assert(
    /^#[0-9A-F]{6}$/i.test(requireString(participant, "accent", `${context}.participant`)),
    `${context}.participant.accent must be a six-digit hex color`,
  );

  const peopleInput = requireArray(metadata, "people", context);
  assert(peopleInput.length > 0, `${context}.people must not be empty`);
  peopleInput.forEach((person, index) =>
    validatePerson(person, `${context}.people[${index}]`),
  );
  const people = [...peopleInput].sort((left, right) =>
    compareAlphabetically(left.name, right.name),
  );
  assertUnique(people.map((person) => person.name), `${context}.people names`);
  const principalInvestigators = people.filter(
    (person) => person.role === "Principal Investigator",
  );
  assert(
    principalInvestigators.length === 1,
    `${context}.people must contain exactly one Principal Investigator`,
  );

  const summary = sections.get("Summary");
  assert(summary, `${context} must contain a non-empty “## Summary” section`);

  const projectMetadata = omitFields(metadata, [
    "kind",
    "participant",
    "people",
  ]);
  return {
    participant: {
      ...participant,
      awardId,
      people,
    },
    project: {
      ...projectMetadata,
      participantId,
      organization: participant.displayName,
      legalAwardeeName: participant.legalName,
      location: participant.location,
      people,
      pi: principalInvestigators[0].name,
      coPIs: people
        .filter((person) => person.role === "Co-Principal Investigator")
        .map((person) => person.name),
      summary: normalizeProse(summary),
    },
    sourceFile: file,
    id,
    awardId,
  };
}

function validateTool(document, projectByParticipant) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assert(metadata.kind === "tool", `${context}.kind must be “tool”`);
  requireString(metadata, "id", context);
  const participantId = requireString(metadata, "participantId", context);
  const awardId = requireString(metadata, "awardId", context);
  const projectRecord = projectByParticipant.get(participantId);
  assert(projectRecord, `${context}.participantId does not join to a project`);
  assert(
    awardId === projectRecord.awardId,
    `${context}.awardId does not match participant “${participantId}”`,
  );
  const name = requireString(metadata, "name", context);
  assert(h1 === name, `${context} H1 must match frontmatter name`);

  const figure = requireObject(metadata.figure, `${context}.figure`);
  assert(
    allowedFigureKinds.has(figure.kind),
    `${context}.figure.kind is not supported`,
  );
  requireString(figure, "label", `${context}.figure`);
  requireString(figure, "alt", `${context}.figure`);
  requireString(metadata, "status", context);
  assert(metadata.isConceptOnly === true, `${context}.isConceptOnly must be true`);
  assert(metadata.demoVideoUrl === null, `${context}.demoVideoUrl must be null for mockups`);
  assert(metadata.toolUrl === null, `${context}.toolUrl must be null for mockups`);
  requireString(metadata, "demoVideoLabel", context);
  requireString(metadata, "toolLinkLabel", context);

  const description = sections.get("Description");
  assert(description, `${context} must contain a non-empty “## Description” section`);

  const toolMetadata = omitFields(metadata, ["kind", "awardId"]);
  return {
    sourceFile: file,
    tool: {
      ...toolMetadata,
      organizationId: participantId,
      description: normalizeProse(description),
      figureLabel: figure.label,
      organizationUrl: projectRecord.participant.website,
      awardUrl: projectRecord.project.awardUrl,
    },
  };
}

async function validateParticipantLogoFiles(projectRecords) {
  await Promise.all(
    projectRecords.map(async (record) => {
      const logoFile = path.join(
        rootDirectory,
        "public",
        record.participant.logo.src.slice(1),
      );
      try {
        await access(logoFile);
      } catch {
        throw new Error(
          `${relativeFile(record.sourceFile)} references missing logo asset ${relativeFile(logoFile)}`,
        );
      }
    }),
  );
}

async function buildContent() {
  const programFile = path.join(contentDirectory, "program.md");
  const pageFiles = await markdownFiles(pageDirectory);
  const projectFiles = await markdownFiles(projectDirectory);
  const toolFiles = await markdownFiles(toolDirectory);
  assert(
    pageFiles.length === expectedPages.size,
    `Expected exactly ${expectedPages.size} routed page Markdown files; found ${pageFiles.length}`,
  );
  assert(
    projectFiles.length === 5,
    `Expected exactly 5 project Markdown files; found ${projectFiles.length}`,
  );
  assert(
    toolFiles.length === 10,
    `Expected exactly 10 tool Markdown files; found ${toolFiles.length}`,
  );

  const [programDocument, interfaceDocument, pageDocuments, projectDocuments, toolDocuments] =
    await Promise.all([
      readMarkdown(programFile),
      readMarkdown(interfaceFile),
      Promise.all(pageFiles.map(readMarkdown)),
      Promise.all(projectFiles.map(readMarkdown)),
      Promise.all(toolFiles.map(readMarkdown)),
    ]);
  const programRecord = validateProgram(programDocument);
  const interfaceRecord = validateInterface(interfaceDocument);
  const pageRecords = pageDocuments.map(validatePage);
  assertExactSet(
    pageRecords.map((record) => record.id),
    new Set(expectedPages.keys()),
    "routed page ids",
  );
  assertUnique(
    pageRecords.map((record) => record.page.slug),
    "routed page slugs",
  );
  assertUnique(
    pageRecords.map((record) => record.page.navLabel),
    "routed page navigation labels",
  );
  const pages = pageRecords
    .map((record) => record.page)
    .sort((left, right) =>
      compareAlphabetically(left.navLabel, right.navLabel),
    );
  const projectRecords = projectDocuments.map(validateProject);
  await validateParticipantLogoFiles(projectRecords);

  assertUnique(projectRecords.map((record) => record.id), "project ids");
  assertUnique(projectRecords.map((record) => record.awardId), "award ids");
  assertUnique(
    projectRecords.map((record) => record.participant.id),
    "participant ids",
  );
  const projectByParticipant = new Map(
    projectRecords.map((record) => [record.participant.id, record]),
  );
  const toolRecords = toolDocuments
    .map((document) => validateTool(document, projectByParticipant))
    .sort((left, right) =>
      compareAlphabetically(left.tool.name, right.tool.name),
    );
  assertUnique(toolRecords.map((record) => record.tool.id), "tool ids");

  for (const participantId of projectByParticipant.keys()) {
    const count = toolRecords.filter(
      (record) => record.tool.participantId === participantId,
    ).length;
    assert(
      count === 2,
      `Participant “${participantId}” must have exactly 2 tools; found ${count}`,
    );
  }

  const tools = toolRecords.map((record) => record.tool);
  const participants = projectRecords
    .map((record) => ({
      ...record.participant,
      tools: tools.filter(
        (tool) => tool.participantId === record.participant.id,
      ),
    }))
    .sort((left, right) =>
      compareAlphabetically(left.displayName, right.displayName),
    );
  const projects = projectRecords
    .map((record) => record.project)
    .sort((left, right) =>
      compareAlphabetically(
        projectTitleSortKey(left.officialTitle),
        projectTitleSortKey(right.officialTitle),
      ),
    );
  const awardSources = projects.map((project) => ({
    id: `nsf-award-${project.awardId}`,
    label: `NSF Award ${project.awardId}`,
    url: project.awardUrl,
    detail: `${project.officialTitle} · official NSF award record.`,
    kind: "award",
  }));
  const organizationSources = participants.map((participant) => ({
    id: `organization-${participant.id}`,
    label: `${participant.displayName} website`,
    url: participant.website,
    detail: `Official website for ${participant.displayName}.`,
    kind: "organization",
  }));
  const sources = [
    ...programRecord.sources,
    ...awardSources,
    ...organizationSources,
  ].sort((left, right) => compareAlphabetically(left.label, right.label));
  assertUnique(sources.map((source) => source.id), "generated source ids");

  const sourceFiles = [programFile, interfaceFile, ...pageFiles, ...projectFiles, ...toolFiles]
    .map(relativeFile)
    .sort(compareAlphabetically);

  return {
    _generated: {
      warning:
        "AUTO-GENERATED FILE. Edit Markdown in content/apto/ and run node scripts/build-apto-content.mjs.",
      schemaVersion: 5,
      generator: "scripts/build-apto-content.mjs",
      sourceDirectory: "content/apto",
      generatedFrom: sourceFiles,
      dataAsOf: programRecord.program.lastVerified,
    },
    program: programRecord.program,
    interface: interfaceRecord,
    pages,
    boilerplate: programRecord.boilerplate,
    participants,
    projects,
    tools,
    sources,
  };
}

async function main() {
  const args = process.argv.slice(2);
  assert(
    args.length === 0 || (args.length === 1 && args[0] === "--check"),
    "Usage: node scripts/build-apto-content.mjs [--check]",
  );
  const checkOnly = args[0] === "--check";
  const content = await buildContent();
  const serialized = `${JSON.stringify(content, null, 2)}\n`;

  if (checkOnly) {
    let current;
    try {
      current = await readFile(outputFile, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      current = null;
    }
    assert(
      current === serialized,
      `${relativeFile(outputFile)} is out of date. Run: node scripts/build-apto-content.mjs`,
    );
    console.log(
      `Validated ${relativeFile(outputFile)} from 1 program, 1 interface, 6 routed pages, 5 projects, and 10 tools.`,
    );
    return;
  }

  await writeFile(outputFile, serialized, "utf8");
  console.log(
    `Generated ${relativeFile(outputFile)} from 1 program, 1 interface, 6 routed pages, 5 projects, and 10 tools.`,
  );
}

main().catch((error) => {
  console.error(`APTO content build failed: ${error.message}`);
  process.exitCode = 1;
});
