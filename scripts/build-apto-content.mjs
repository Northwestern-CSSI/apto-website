#!/usr/bin/env node

/**
 * Build the APTO website data from independently editable Markdown records.
 *
 * Frontmatter is JSON so the content pipeline has no runtime dependencies.
 * Organizations, people, projects, and tools are separate records joined here;
 * adding a record only requires adding a Markdown file in the relevant folder.
 */

import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDirectory = path.join(rootDirectory, "content", "apto");
const assetDirectory = path.join(contentDirectory, "assets");
const publicAssetDirectory = path.join(rootDirectory, "public", "apto");
const interfaceFile = path.join(contentDirectory, "interface.md");
const pageDirectory = path.join(contentDirectory, "pages");
const participantDirectory = path.join(contentDirectory, "participants");
const peopleDirectory = path.join(contentDirectory, "people");
const projectDirectory = path.join(contentDirectory, "projects");
const toolDirectory = path.join(contentDirectory, "tools");
const conveningDirectory = path.join(contentDirectory, "convenings");
const outputFile = path.join(rootDirectory, "app", "apto", "content.generated.json");

const expectedBoilerplate =
  "This material is based upon work supported by the National Science Foundation under Grant Number 2404035. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.";

const allowedCategories = new Set(["Capability", "Production", "Use"]);
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
  "award",
  "brand",
  "organization",
]);
const allowedLogoKinds = new Set(["symbol", "wordmark"]);
const allowedParticipantKinds = new Set(["Company", "University"]);
const allowedImageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const allowedPersonRoles = new Set([
  "Program Manager",
  "Principal Investigator",
  "Co-Principal Investigator",
]);
const expectedDirectionIds = new Set(["nsfhome", "nsfnetwork"]);
const expectedPages = new Map([
  ["about", { slug: "/about" }],
  ["cohort", { slug: "/cohort" }],
  ["convening", { slug: "/convening" }],
  ["home", { slug: "/" }],
  ["projects", { slug: "/projects" }],
  ["tools", { slug: "/tools" }],
]);

function relativeFile(file) {
  return path.relative(rootDirectory, file).split(path.sep).join("/");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

function requireStringValue(value, context, { allowEmpty = false } = {}) {
  assert(
    typeof value === "string" && (allowEmpty || value.trim().length > 0),
    `${context} must be ${allowEmpty ? "a string" : "a non-empty string"}`,
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

function requireOptionalHttpsUrl(value, context) {
  assert(value === null || typeof value === "string", `${context} must be null or a string`);
  if (value !== null) requireHttpsUrl(value, context);
  return value;
}

function requireOptionalLocalImage(value, context) {
  assert(value === null || typeof value === "string", `${context} must be null or a string`);
  if (value !== null) {
    assert(value.startsWith("/apto/"), `${context} must reference an image in content/apto/assets using an /apto/ path`);
  }
  return value;
}

function requireIsoDate(value, context) {
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
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
    values.length === expected.size && values.every((value) => expected.has(value)),
    `${context} must contain exactly: ${[...expected].join(", ")}`,
  );
}

function assertExactKeys(object, expected, context) {
  assertExactSet(Object.keys(object), new Set(expected), `${context} fields`);
}

function assertRecordIdMatchesFilename(file, id, context) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id), `${context}.id must use lowercase kebab-case`);
  assert(path.basename(file, ".md") === id, `${context}.id must match its filename`);
}

function requireStringKeys(value, keys, context) {
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

const featuredParticipantOrder = new Map([
  ["northwestern", 0],
  ["uchicago", 1],
]);

function compareParticipantIds(leftId, rightId, leftLabel, rightLabel) {
  const leftPriority = featuredParticipantOrder.get(leftId) ?? 2;
  const rightPriority = featuredParticipantOrder.get(rightId) ?? 2;
  return leftPriority - rightPriority || compareAlphabetically(leftLabel, rightLabel);
}

const investigatorRoleOrder = new Map([
  ["Principal Investigator", 0],
  ["Co-Principal Investigator", 1],
]);

function comparePeopleByRole(left, right) {
  const leftPriority = investigatorRoleOrder.get(left.role) ?? 2;
  const rightPriority = investigatorRoleOrder.get(right.role) ?? 2;
  return leftPriority - rightPriority || compareAlphabetically(left.name, right.name);
}

function omitFields(object, fields) {
  const omitted = new Set(fields);
  return Object.fromEntries(Object.entries(object).filter(([key]) => !omitted.has(key)));
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
    assert(!sections.has(heading), `${relativeFile(file)} contains duplicate H2 “${heading}”`);
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
  assert(match, `${relativeFile(file)} must start with JSON frontmatter between --- lines`);

  let metadata;
  try {
    metadata = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`${relativeFile(file)} has invalid JSON frontmatter: ${error.message}`);
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
    .filter((entry) => (
      entry.isFile()
      && entry.name.endsWith(".md")
      && entry.name.toLowerCase() !== "readme.md"
    ))
    .map((entry) => path.join(directory, entry.name))
    .sort((left, right) => left.localeCompare(right, "en"));
}

async function filesRecursively(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesRecursively(file) : [file];
    }),
  );
  return nested.flat().sort((left, right) => left.localeCompare(right, "en"));
}

async function imageFilesRecursively(directory) {
  return (await filesRecursively(directory)).filter((file) => (
    allowedImageExtensions.has(path.extname(file).toLowerCase())
  ));
}

function assetSourceForPublicPath(publicPath, context) {
  assert(publicPath.startsWith("/apto/"), `${context} must begin with /apto/`);
  const relativeAsset = publicPath.slice("/apto/".length);
  assert(relativeAsset.length > 0, `${context} must reference a file inside content/apto/assets`);
  const assetFile = path.resolve(assetDirectory, relativeAsset);
  const containmentPath = path.relative(assetDirectory, assetFile);
  assert(
    containmentPath.length > 0 && containmentPath !== ".." && !containmentPath.startsWith(`..${path.sep}`) && !path.isAbsolute(containmentPath),
    `${context} must remain inside content/apto/assets`,
  );
  return assetFile;
}

async function validateImageAsset(publicPath, context) {
  const assetFile = assetSourceForPublicPath(publicPath, context);
  assert(allowedImageExtensions.has(path.extname(assetFile).toLowerCase()), `${context} must reference a supported image file`);
  let fileStatus;
  try {
    fileStatus = await stat(assetFile);
  } catch {
    throw new Error(`${context} references missing image asset ${relativeFile(assetFile)}`);
  }
  assert(fileStatus.isFile(), `${context} must reference an image file, not a directory`);
  return assetFile;
}

async function syncAssets(assetFiles, checkOnly) {
  await mkdir(publicAssetDirectory, { recursive: true });

  const publicFiles = await filesRecursively(publicAssetDirectory);
  const expectedFiles = new Set(assetFiles.map((sourceFile) => (
    path.join(publicAssetDirectory, path.relative(assetDirectory, sourceFile))
  )));
  const staleFiles = publicFiles.filter((file) => !expectedFiles.has(file));

  if (!checkOnly) {
    await Promise.all(staleFiles.map((file) => rm(file, { force: true })));
  }

  for (const sourceFile of assetFiles) {
    const relativeAsset = path.relative(assetDirectory, sourceFile);
    const destinationFile = path.join(publicAssetDirectory, relativeAsset);
    if (checkOnly) {
      let source;
      let destination;
      try {
        [source, destination] = await Promise.all([
          readFile(sourceFile),
          readFile(destinationFile),
        ]);
      } catch {
        throw new Error(
          `${relativeFile(destinationFile)} is missing. Run: node scripts/build-apto-content.mjs`,
        );
      }
      assert(
        source.equals(destination),
        `${relativeFile(destinationFile)} is out of date. Run: node scripts/build-apto-content.mjs`,
      );
      continue;
    }

    // Asset libraries are intentionally large. Avoid copying unchanged images
    // on every content or type build; content:check still performs the exact
    // byte comparison used by CI.
    try {
      const [sourceStatus, destinationStatus] = await Promise.all([
        stat(sourceFile),
        stat(destinationFile),
      ]);
      if (sourceStatus.size === destinationStatus.size) continue;
    } catch {
      // A missing destination is created below.
    }

    await mkdir(path.dirname(destinationFile), { recursive: true });
    await copyFile(sourceFile, destinationFile);
  }

  if (checkOnly) {
    assert(
      staleFiles.length === 0,
      `${relativeFile(publicAssetDirectory)} contains stale generated assets. Run: node scripts/build-apto-content.mjs`,
    );
  }
}

function validateParticipantLogoAsset(asset, context) {
  requireObject(asset, context);
  assertExactKeys(asset, ["src", "width", "height"], context);
  const src = requireString(asset, "src", context);
  assert(src.startsWith("/"), `${context}.src must be a root-relative asset path`);
  requirePositiveNumber(asset, "width", context);
  requirePositiveNumber(asset, "height", context);
  return asset;
}

function validateParticipantLogo(logo, context) {
  requireObject(logo, context);
  assertExactKeys(
    logo,
    [
      "kind",
      "variants",
      "sourceUrl",
      "sourceLabel",
      "status",
      "approved",
    ],
    context,
  );
  assert(allowedLogoKinds.has(requireString(logo, "kind", context)), `${context}.kind is not supported`);
  requireObject(logo.variants, `${context}.variants`);
  assertExactKeys(logo.variants, ["light", "dark"], `${context}.variants`);
  validateParticipantLogoAsset(logo.variants.light, `${context}.variants.light`);
  validateParticipantLogoAsset(logo.variants.dark, `${context}.variants.dark`);
  requireHttpsUrl(requireString(logo, "sourceUrl", context), `${context}.sourceUrl`);
  requireString(logo, "sourceLabel", context);
  requireString(logo, "status", context);
  assert(typeof logo.approved === "boolean", `${context}.approved must be a boolean`);
  return logo;
}

function validatePage(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assert(metadata.kind === "page", `${context}.kind must be “page”`);
  assertExactKeys(metadata, ["kind", "slug", "metadataTitle", "eyebrow", "title"], `${context} frontmatter`);
  const id = path.basename(file, ".md");
  const expected = expectedPages.get(id);
  assert(expected, `${context} filename is not a supported routed page`);
  const slug = requireString(metadata, "slug", context);
  const title = requireString(metadata, "title", context);
  assert(slug === expected.slug, `${context}.slug must be “${expected.slug}”`);
  assert(h1 === title, `${context} H1 must match frontmatter title`);
  assert(sections.size === 1 && sections.has("Introduction"), `${context} must contain exactly one “## Introduction” section`);
  const introduction = sections.get("Introduction");
  assert(introduction, `${context} must contain a non-empty “## Introduction” section`);
  return {
    id,
    page: {
      slug,
      metadataTitle: requireString(metadata, "metadataTitle", context),
      eyebrow: requireString(metadata, "eyebrow", context),
      title,
      introduction: normalizeProse(introduction),
    },
  };
}

function validateProgram(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assertExactKeys(
    metadata,
    [
      "kind",
      "id",
      "name",
      "acronym",
      "objectivesTitle",
      "objectives",
      "landingGallery",
      "lastVerified",
      "boilerplate",
      "sources",
    ],
    `${context} frontmatter`,
  );
  assert(metadata.kind === "program", `${context}.kind must be “program”`);
  requireString(metadata, "id", context);
  const name = requireString(metadata, "name", context);
  assert(h1 === name, `${context} H1 must match frontmatter name`);
  assert(metadata.acronym === "APTO", `${context}.acronym must be “APTO”`);
  requireString(metadata, "objectivesTitle", context);
  const objectives = requireArray(metadata, "objectives", context);
  assert(objectives.length > 0, `${context}.objectives must not be empty`);
  objectives.forEach((objective, index) => requireStringValue(objective, `${context}.objectives[${index}]`));
  const landingGallery = requireArray(metadata, "landingGallery", context);
  assert(landingGallery.length === 5, `${context}.landingGallery must contain five equally presented program visuals`);
  landingGallery.forEach((image, index) => {
    const imageContext = `${context}.landingGallery[${index}]`;
    requireObject(image, imageContext);
    assertExactKeys(image, ["src", "alt"], imageContext);
    const imageSrc = requireString(image, "src", imageContext);
    assert(imageSrc.startsWith("/apto/"), `${imageContext}.src must begin with /apto/`);
    requireString(image, "alt", imageContext);
  });
  assertUnique(landingGallery.map((image) => image.src), `${context}.landingGallery sources`);
  assertUnique(landingGallery.map((image) => image.alt), `${context}.landingGallery descriptions`);
  requireIsoDate(requireString(metadata, "lastVerified", context), `${context}.lastVerified`);

  assert(metadata.boilerplate === expectedBoilerplate, `${context}.boilerplate must match the approved NSF language exactly`);
  const sources = requireArray(metadata, "sources", context);
  sources.forEach((source, index) => {
    const sourceContext = `${context}.sources[${index}]`;
    requireObject(source, sourceContext);
    assertExactKeys(source, ["id", "label", "url", "detail", "kind"], sourceContext);
    for (const key of ["id", "label", "detail", "kind"]) requireString(source, key, sourceContext);
    requireHttpsUrl(requireString(source, "url", sourceContext), `${sourceContext}.url`);
    assert(allowedSourceKinds.has(source.kind), `${sourceContext}.kind is not supported`);
  });
  assertUnique(sources.map((source) => source.id), `${context}.sources ids`);

  const description = sections.get("Description");
  assert(description, `${context} must contain a non-empty “## Description” section`);
  const program = omitFields(metadata, ["kind", "id", "boilerplate", "sources"]);
  return {
    program: { ...program, description: normalizeProse(description) },
    boilerplate: metadata.boilerplate,
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
      "story",
      "atlas",
      "common",
      "accessibility",
      "projects",
      "tools",
      "people",
      "footer",
    ],
    `${context} frontmatter`,
  );
  assert(h1 === "APTO website interface content", `${context} H1 must be “APTO website interface content”`);
  assert(sections.size === 1 && sections.has("Editorial guidance"), `${context} must contain exactly one “## Editorial guidance” section`);

  const directions = requireArray(metadata, "directions", context);
  assertExactSet(
    directions.map((direction, index) => {
      const directionContext = `${context}.directions[${index}]`;
      requireObject(direction, directionContext);
      assertExactKeys(direction, ["id", "label"], directionContext);
      requireString(direction, "label", directionContext);
      return requireString(direction, "id", directionContext);
    }),
    expectedDirectionIds,
    `${context}.directions`,
  );

  const study = requireStringKeys(
    metadata.study,
    [
      "siteTitle",
      "siteDescription",
      "socialImageSrc",
      "socialImageAlt",
      "themeChooserLabel",
      "themeSwitchActionPrefix",
    ],
    `${context}.study`,
  );
  assert(study.socialImageSrc.startsWith("/apto/"), `${context}.study.socialImageSrc must begin with /apto/`);

  const primaryNavigation = requireArray(metadata, "primaryNavigation", context);
  assert(primaryNavigation.length === 5, `${context}.primaryNavigation must contain five links`);
  const primaryNavigationSections = primaryNavigation.map((item, index) => {
    const itemContext = `${context}.primaryNavigation[${index}]`;
    requireObject(item, itemContext);
    assertExactKeys(item, ["label", "section"], itemContext);
    requireString(item, "label", itemContext);
    return requireString(item, "section", itemContext);
  });
  assertExactSet(
    primaryNavigationSections,
    new Set(["home", "projects", "tools", "cohort", "convening"]),
    `${context}.primaryNavigation sections`,
  );
  assert(
    primaryNavigationSections.join(",") === "home,projects,tools,cohort,convening",
    `${context}.primaryNavigation must be ordered Program, Projects, Tools, Cohort, Convening`,
  );

  const home = requireObject(metadata.home, `${context}.home`);
  const homeStrings = [
    "primaryActionLabel",
    "secondaryActionLabel",
    "cohortEyebrow",
    "cohortTitle",
    "cohortLinkLabel",
  ];
  assertExactKeys(home, [...homeStrings, "pathways"], `${context}.home`);
  for (const key of homeStrings) requireString(home, key, `${context}.home`);
  const pathways = requireArray(home, "pathways", `${context}.home`);
  assertExactSet(
    pathways.map((pathway, index) => {
      const pathwayContext = `${context}.home.pathways[${index}]`;
      requireObject(pathway, pathwayContext);
      assertExactKeys(pathway, ["section", "title", "description"], pathwayContext);
      for (const key of ["title", "description"]) requireString(pathway, key, pathwayContext);
      return requireString(pathway, "section", pathwayContext);
    }),
    new Set(["cohort", "projects", "tools"]),
    `${context}.home.pathways sections`,
  );

  requireStringKeys(
    metadata.story,
    [
      "viewLabel",
      "socialImageSrc",
      "socialImageAlt",
      "cohortArtSrc",
      "directoryLabel",
      "navigationLabel",
      "programLabel",
      "projectsLabel",
      "toolsLabel",
      "cohortLabel",
      "projectStageTitle",
      "projectStageDescription",
      "toolCollectionLabel",
      "programLeadershipLabel",
      "supportedByLabel",
    ],
    `${context}.story`,
  );
  assert(metadata.story.socialImageSrc.startsWith("/apto/"), `${context}.story.socialImageSrc must begin with /apto/`);
  assert(metadata.story.cohortArtSrc.startsWith("/apto/"), `${context}.story.cohortArtSrc must begin with /apto/`);

  requireStringKeys(
    metadata.atlas,
    [
      "viewLabel",
      "socialImageSrc",
      "socialImageAlt",
      "directoryLabel",
      "continuumLabel",
      "navigationLabel",
      "viewNavigationLabel",
      "programMosaicLabel",
      "objectivesLabel",
      "participantsLabel",
      "projectPortfolioLabel",
      "toolCollectionLabel",
      "toolDetailsLabel",
      "closeDetailsLabel",
      "cohortIndexLabel",
      "programLeadershipLabel",
      "supportedByLabel",
    ],
    `${context}.atlas`,
  );
  assert(metadata.atlas.socialImageSrc.startsWith("/apto/"), `${context}.atlas.socialImageSrc must begin with /apto/`);

  requireStringKeys(metadata.common, ["organizationWebsiteLabel"], `${context}.common`);
  requireStringKeys(
    metadata.accessibility,
    [
      "skipLinkLabel",
      "primaryNavigationLabel",
      "footerNavigationLabel",
      "homePathwaysLabel",
      "projectInvestigatorsLabel",
      "toolFiltersLabel",
    ],
    `${context}.accessibility`,
  );

  const projects = requireObject(metadata.projects, `${context}.projects`);
  const projectStringKeys = [
    "awardLabel",
    "awardedPrefix",
    "dateStatusSeparator",
    "expandLabel",
  ];
  assertExactKeys(projects, projectStringKeys, `${context}.projects`);
  for (const key of projectStringKeys) requireString(projects, key, `${context}.projects`);

  requireStringKeys(
    metadata.tools,
    [
      "allOrganizationsLabel",
      "allCategoriesLabel",
      "organizationFilterLabel",
      "organizationFilterAriaLabel",
      "categoryFilterLabel",
      "categoryFilterAriaLabel",
      "showingPrefix",
      "toolSingular",
      "toolPlural",
      "useCaseLabel",
      "categoriesLabel",
      "emptyTitle",
      "emptyDescription",
      "watchDemoLabel",
      "openToolLabel",
    ],
    `${context}.tools`,
  );
  requireStringKeys(
    metadata.people,
    ["programTeamEyebrow", "programTeamTitle", "viewProfileLabel"],
    `${context}.people`,
  );
  const footer = requireStringKeys(
    metadata.footer,
    [
      "supportTitle",
      "supportDescription",
      "disclaimerTitle",
      "backToTopLabel",
      "nsfWebsiteUrl",
      "nsfLogoSrc",
      "nsfWebsiteAriaLabel",
      "nsfLogoAlt",
    ],
    `${context}.footer`,
  );
  requireHttpsUrl(footer.nsfWebsiteUrl, `${context}.footer.nsfWebsiteUrl`);
  assert(footer.nsfLogoSrc.startsWith("/"), `${context}.footer.nsfLogoSrc must be a root-relative asset path`);
  return omitFields(metadata, ["kind"]);
}

function validateParticipant(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assertExactKeys(
    metadata,
    [
      "kind",
      "id",
      "displayName",
      "organizationType",
      "location",
      "website",
      "logo",
      "accent",
    ],
    `${context} frontmatter`,
  );
  assert(metadata.kind === "participant", `${context}.kind must be “participant”`);
  const id = requireString(metadata, "id", context);
  assertRecordIdMatchesFilename(file, id, context);
  const displayName = requireString(metadata, "displayName", context);
  assert(h1 === displayName, `${context} H1 must match displayName`);
  const organizationType = requireString(metadata, "organizationType", context);
  assert(allowedParticipantKinds.has(organizationType), `${context}.organizationType is not supported`);
  requireString(metadata, "location", context);
  requireHttpsUrl(requireString(metadata, "website", context), `${context}.website`);
  const logo = validateParticipantLogo(metadata.logo, `${context}.logo`);
  assert(/^#[0-9A-F]{6}$/i.test(requireString(metadata, "accent", context)), `${context}.accent must be a six-digit hex color`);
  assert(sections.size === 0, `${context} does not support H2 sections`);
  return {
    sourceFile: file,
    participant: {
      id,
      displayName,
      location: metadata.location,
      website: metadata.website,
      logo: omitFields(logo, ["sourceUrl", "sourceLabel", "status", "approved"]),
      accent: metadata.accent,
    },
  };
}

function validatePerson(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assertExactKeys(
    metadata,
    [
      "kind",
      "id",
      "participantId",
      "name",
      "initials",
      "role",
      "organization",
      "headshotUrl",
      "headshotAlt",
      "profileUrl",
    ],
    `${context} frontmatter`,
  );
  assert(metadata.kind === "person", `${context}.kind must be “person”`);
  const id = requireString(metadata, "id", context);
  assertRecordIdMatchesFilename(file, id, context);
  const name = requireString(metadata, "name", context);
  assert(h1 === name, `${context} H1 must match name`);
  assert(sections.size === 0, `${context} does not support H2 sections`);
  assert(metadata.participantId === null || typeof metadata.participantId === "string", `${context}.participantId must be null or a string`);
  if (metadata.participantId !== null) requireString(metadata, "participantId", context);
  const role = requireString(metadata, "role", context);
  assert(allowedPersonRoles.has(role), `${context}.role is not supported`);
  assert(
    (role === "Program Manager" && metadata.participantId === null) ||
      (role !== "Program Manager" && metadata.participantId !== null),
    `${context}.participantId must be null only for program leadership`,
  );
  assert(metadata.organization === null || typeof metadata.organization === "string", `${context}.organization must be null or a string`);
  if (role === "Program Manager") requireString(metadata, "organization", context);
  else assert(metadata.organization === null, `${context}.organization must be null for investigators`);
  requireString(metadata, "initials", context);
  requireString(metadata, "headshotAlt", context);
  requireOptionalLocalImage(metadata.headshotUrl, `${context}.headshotUrl`);
  requireOptionalHttpsUrl(metadata.profileUrl, `${context}.profileUrl`);
  return { sourceFile: file, person: omitFields(metadata, ["kind"]) };
}

function validateProject(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assertExactKeys(
    metadata,
    [
      "kind",
      "id",
      "participantId",
      "awardId",
      "shortName",
      "officialTitle",
      "awardedYear",
      "statusLabel",
      "awardUrl",
    ],
    `${context} frontmatter`,
  );
  assert(metadata.kind === "project", `${context}.kind must be “project”`);
  const id = requireString(metadata, "id", context);
  assertRecordIdMatchesFilename(file, id, context);
  const participantId = requireString(metadata, "participantId", context);
  const awardId = requireString(metadata, "awardId", context);
  assert(/^\d{7}$/.test(awardId), `${context}.awardId must contain seven digits`);
  requireString(metadata, "shortName", context);
  const officialTitle = requireString(metadata, "officialTitle", context);
  assert(officialTitle.startsWith("APTO:"), `${context}.officialTitle must begin with “APTO:”`);
  assert(h1 === officialTitle, `${context} H1 must match officialTitle`);
  assert(Number.isInteger(metadata.awardedYear) && metadata.awardedYear >= 2000 && metadata.awardedYear <= 2100, `${context}.awardedYear must be a four-digit year`);
  requireString(metadata, "statusLabel", context);
  const awardUrl = requireHttpsUrl(requireString(metadata, "awardUrl", context), `${context}.awardUrl`);
  assert(awardUrl.includes(awardId), `${context}.awardUrl must contain awardId`);
  const summary = sections.get("Summary");
  assert(summary, `${context} must contain a non-empty “## Summary” section`);
  return {
    sourceFile: file,
    project: {
      ...omitFields(metadata, ["kind"]),
      summary: normalizeProse(summary),
    },
    id,
    participantId,
    awardId,
  };
}

function validateTool(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assertExactKeys(
    metadata,
    [
      "kind",
      "id",
      "participantId",
      "name",
      "categories",
      "figure",
      "galleryImages",
      "resources",
      "statusLabel",
      "demoVideoUrl",
      "toolUrl",
    ],
    `${context} frontmatter`,
  );
  assert(metadata.kind === "tool", `${context}.kind must be “tool”`);
  const id = requireString(metadata, "id", context);
  assertRecordIdMatchesFilename(file, id, context);
  const participantId = requireString(metadata, "participantId", context);
  const name = requireString(metadata, "name", context);
  assert(h1 === name, `${context} H1 must match name`);
  const categories = requireArray(metadata, "categories", context);
  assert(categories.length > 0, `${context}.categories must not be empty`);
  assertUnique(categories, `${context}.categories`);
  categories.forEach((category, index) => {
    requireStringValue(category, `${context}.categories[${index}]`);
    assert(allowedCategories.has(category), `${context}.categories[${index}] is not supported`);
  });
  const figure = requireObject(metadata.figure, `${context}.figure`);
  assertExactKeys(figure, ["kind", "src", "label", "alt"], `${context}.figure`);
  assert(allowedFigureKinds.has(requireString(figure, "kind", `${context}.figure`)), `${context}.figure.kind is not supported`);
  const figureSrc = requireString(figure, "src", `${context}.figure`);
  assert(figureSrc.startsWith("/apto/"), `${context}.figure.src must begin with /apto/`);
  requireString(figure, "label", `${context}.figure`);
  requireString(figure, "alt", `${context}.figure`);
  const galleryImages = requireArray(metadata, "galleryImages", context);
  assert(galleryImages.length === 3, `${context}.galleryImages must contain exactly three images so every Atlas tool has four cycling frames`);
  galleryImages.forEach((image, index) => {
    const imageContext = `${context}.galleryImages[${index}]`;
    requireObject(image, imageContext);
    assertExactKeys(image, ["src", "alt"], imageContext);
    const imageSrc = requireString(image, "src", imageContext);
    assert(imageSrc.startsWith("/apto/"), `${imageContext}.src must begin with /apto/`);
    requireString(image, "alt", imageContext);
  });
  assert(new Set(galleryImages.map((image) => image.src)).size === galleryImages.length, `${context}.galleryImages sources must be unique`);
  assert(new Set(galleryImages.map((image) => image.alt)).size === galleryImages.length, `${context}.galleryImages descriptions must be unique`);
  assert(!galleryImages.some((image) => image.src === figureSrc), `${context}.galleryImages must not repeat figure.src`);
  const resources = requireArray(metadata, "resources", context);
  assert(resources.length > 0, `${context}.resources must contain at least one resource`);
  resources.forEach((resource, index) => {
    const resourceContext = `${context}.resources[${index}]`;
    requireObject(resource, resourceContext);
    assertExactKeys(resource, ["name", "description", "status", "url", "image"], resourceContext);
    requireString(resource, "name", resourceContext);
    requireString(resource, "description", resourceContext);
    const status = requireString(resource, "status", resourceContext);
    assert(new Set(["available", "coming-soon"]).has(status), `${resourceContext}.status must be “available” or “coming-soon”`);
    requireOptionalHttpsUrl(resource.url, `${resourceContext}.url`);
    assert(status !== "coming-soon" || resource.url === null, `${resourceContext}.url must be null while status is “coming-soon”`);
    const image = requireObject(resource.image, `${resourceContext}.image`);
    assertExactKeys(image, ["src", "alt"], `${resourceContext}.image`);
    const imageSrc = requireString(image, "src", `${resourceContext}.image`);
    assert(imageSrc.startsWith("/apto/"), `${resourceContext}.image.src must begin with /apto/`);
    requireString(image, "alt", `${resourceContext}.image`);
  });
  assertUnique(resources.map((resource) => resource.name), `${context}.resources names`);
  assertUnique(resources.map((resource) => resource.image.src), `${context}.resources image sources`);
  assertUnique(resources.map((resource) => resource.image.alt), `${context}.resources image descriptions`);
  requireString(metadata, "statusLabel", context);
  requireOptionalHttpsUrl(metadata.demoVideoUrl, `${context}.demoVideoUrl`);
  requireOptionalHttpsUrl(metadata.toolUrl, `${context}.toolUrl`);
  assert(sections.size === 2 && sections.has("Description") && sections.has("Use case"), `${context} must contain exactly “## Description” and “## Use case” sections`);
  const description = sections.get("Description");
  const useCase = sections.get("Use case");
  assert(description, `${context} must contain a non-empty “## Description” section`);
  assert(useCase, `${context} must contain a non-empty “## Use case” section`);
  return {
    sourceFile: file,
    tool: {
      ...omitFields(metadata, ["kind"]),
      description: normalizeProse(description),
      useCase: normalizeProse(useCase),
    },
    id,
    participantId,
  };
}

function validateConvening(document) {
  const { metadata, h1, sections, file } = document;
  const context = relativeFile(file);
  assertExactKeys(
    metadata,
    ["kind", "id", "year", "location", "title", "images"],
    `${context} frontmatter`,
  );
  assert(metadata.kind === "convening", `${context}.kind must be “convening”`);
  const id = requireString(metadata, "id", context);
  assertRecordIdMatchesFilename(file, id, context);
  assert(Number.isInteger(metadata.year) && metadata.year >= 2000 && metadata.year <= 2100, `${context}.year must be a four-digit year`);
  assert(id === String(metadata.year), `${context}.id must match year`);
  requireString(metadata, "location", context);
  const title = requireString(metadata, "title", context);
  assert(h1 === title, `${context} H1 must match title`);
  const images = requireArray(metadata, "images", context);
  assert(images.length === 4, `${context}.images must contain exactly four images`);
  images.forEach((image, index) => {
    const imageContext = `${context}.images[${index}]`;
    requireObject(image, imageContext);
    assertExactKeys(image, ["src", "alt"], imageContext);
    const src = requireString(image, "src", imageContext);
    assert(src.startsWith("/apto/"), `${imageContext}.src must begin with /apto/`);
    requireString(image, "alt", imageContext);
  });
  assertUnique(images.map((image) => image.src), `${context}.images sources`);
  assertUnique(images.map((image) => image.alt), `${context}.images descriptions`);
  assert(
    sections.size === 2 && sections.has("Summary") && sections.has("Discussion"),
    `${context} must contain exactly “## Summary” and “## Discussion” sections`,
  );
  const summary = sections.get("Summary");
  const discussion = sections.get("Discussion");
  assert(summary, `${context} must contain a non-empty “## Summary” section`);
  assert(discussion, `${context} must contain a non-empty “## Discussion” section`);
  return {
    sourceFile: file,
    convening: {
      ...omitFields(metadata, ["kind"]),
      summary: normalizeProse(summary),
      discussion: normalizeProse(discussion),
    },
  };
}

async function validateParticipantLogoFiles(participantRecords) {
  await Promise.all(
    participantRecords.flatMap((record) => ["light", "dark"].map((theme) => validateImageAsset(
      record.participant.logo.variants[theme].src,
      `${relativeFile(record.sourceFile)}.logo.variants.${theme}.src`,
    ))),
  );
}

async function validateToolFigureFiles(toolRecords) {
  await Promise.all(
    toolRecords.flatMap((record) => [
      validateImageAsset(
        record.tool.figure.src,
        `${relativeFile(record.sourceFile)}.figure.src`,
      ),
      ...record.tool.galleryImages.map((image, index) => validateImageAsset(
        image.src,
        `${relativeFile(record.sourceFile)}.galleryImages[${index}].src`,
      )),
      ...record.tool.resources.map((resource, index) => validateImageAsset(
        resource.image.src,
        `${relativeFile(record.sourceFile)}.resources[${index}].image.src`,
      )),
    ]),
  );
}

function validateToolMediaInventory(toolRecords) {
  toolRecords.forEach((record) => {
    const paths = [
      record.tool.figure.src,
      ...record.tool.galleryImages.map((image) => image.src),
    ];
    assert(
      paths.length === 4,
      `${relativeFile(record.sourceFile)} must provide exactly four Atlas media frames (figure.src plus three galleryImages)`,
    );
    assertUnique(paths, `${relativeFile(record.sourceFile)} tool media paths`);
  });
}

async function validatePersonHeadshotFiles(personRecords) {
  await Promise.all(
    personRecords
      .filter((record) => record.person.headshotUrl !== null)
      .map((record) => validateImageAsset(
        record.person.headshotUrl,
        `${relativeFile(record.sourceFile)}.headshotUrl`,
      )),
  );
}

function assertEveryAssetIsReferenced(assetFiles, publicPaths) {
  const referencedFiles = new Set(publicPaths.map((publicPath) => assetSourceForPublicPath(
    publicPath,
    `asset reference ${publicPath}`,
  )));
  for (const assetFile of assetFiles) {
    assert(
      referencedFiles.has(assetFile),
      `${relativeFile(assetFile)} is not referenced by live APTO content; remove it or add a content reference`,
    );
  }
}

async function buildContent() {
  const programFile = path.join(contentDirectory, "program.md");
  const [pageFiles, participantFiles, peopleFiles, projectFiles, toolFiles, conveningFiles, assetFiles] = await Promise.all([
    markdownFiles(pageDirectory),
    markdownFiles(participantDirectory),
    markdownFiles(peopleDirectory),
    markdownFiles(projectDirectory),
    markdownFiles(toolDirectory),
    markdownFiles(conveningDirectory),
    imageFilesRecursively(assetDirectory),
  ]);
  assert(pageFiles.length === expectedPages.size, `Expected exactly ${expectedPages.size} routed page Markdown files; found ${pageFiles.length}`);
  assert(participantFiles.length > 0, "At least one participant Markdown file is required");
  assert(peopleFiles.length > 0, "At least one person Markdown file is required");
  assert(projectFiles.length > 0, "At least one project Markdown file is required");
  assert(toolFiles.length > 0, "At least one tool Markdown file is required");
  assert(conveningFiles.length > 0, "At least one annual convening Markdown file is required");
  assert(assetFiles.length > 0, "At least one content asset is required");

  const [
    programDocument,
    interfaceDocument,
    pageDocuments,
    participantDocuments,
    peopleDocuments,
    projectDocuments,
    toolDocuments,
    conveningDocuments,
  ] = await Promise.all([
    readMarkdown(programFile),
    readMarkdown(interfaceFile),
    Promise.all(pageFiles.map(readMarkdown)),
    Promise.all(participantFiles.map(readMarkdown)),
    Promise.all(peopleFiles.map(readMarkdown)),
    Promise.all(projectFiles.map(readMarkdown)),
    Promise.all(toolFiles.map(readMarkdown)),
    Promise.all(conveningFiles.map(readMarkdown)),
  ]);

  const programRecord = validateProgram(programDocument);
  await Promise.all(programRecord.program.landingGallery.map((image, index) => validateImageAsset(
    image.src,
    `${relativeFile(programFile)}.landingGallery[${index}].src`,
  )));
  const interfaceRecord = validateInterface(interfaceDocument);
  for (const [publicPath, field] of [
    [interfaceRecord.study.socialImageSrc, "study.socialImageSrc"],
    [interfaceRecord.story.socialImageSrc, "story.socialImageSrc"],
    [interfaceRecord.story.cohortArtSrc, "story.cohortArtSrc"],
    [interfaceRecord.atlas.socialImageSrc, "atlas.socialImageSrc"],
    [interfaceRecord.footer.nsfLogoSrc, "footer.nsfLogoSrc"],
  ]) {
    await validateImageAsset(
      publicPath,
      `${relativeFile(interfaceFile)}.${field}`,
    );
  }
  const pageRecords = pageDocuments.map(validatePage);
  assertExactSet(pageRecords.map((record) => record.id), new Set(expectedPages.keys()), "routed page ids");
  assertUnique(pageRecords.map((record) => record.page.slug), "routed page slugs");
  const pages = pageRecords
    .map((record) => record.page)
    .sort((left, right) => compareAlphabetically(left.slug, right.slug));

  const participantRecords = participantDocuments.map(validateParticipant);
  await validateParticipantLogoFiles(participantRecords);
  assertUnique(participantRecords.map((record) => record.participant.id), "participant ids");
  const participantById = new Map(participantRecords.map((record) => [record.participant.id, record]));

  const personRecords = peopleDocuments.map(validatePerson);
  await validatePersonHeadshotFiles(personRecords);
  assertUnique(personRecords.map((record) => record.person.id), "person ids");
  assertUnique(personRecords.map((record) => record.person.name), "person names");
  personRecords.forEach((record) => {
    if (record.person.participantId !== null) {
      assert(participantById.has(record.person.participantId), `${relativeFile(record.sourceFile)}.participantId does not join to a participant`);
    }
  });

  const projectRecords = projectDocuments.map(validateProject);
  assertUnique(projectRecords.map((record) => record.id), "project ids");
  assertUnique(projectRecords.map((record) => record.awardId), "award ids");
  projectRecords.forEach((record) => {
    assert(participantById.has(record.participantId), `${relativeFile(record.sourceFile)}.participantId does not join to a participant`);
  });

  const toolRecords = toolDocuments.map(validateTool);
  validateToolMediaInventory(toolRecords);
  await validateToolFigureFiles(toolRecords);
  assertUnique(toolRecords.map((record) => record.id), "tool ids");
  toolRecords.forEach((record) => {
    assert(participantById.has(record.participantId), `${relativeFile(record.sourceFile)}.participantId does not join to a participant`);
  });

  const conveningRecords = conveningDocuments.map(validateConvening);
  assertUnique(conveningRecords.map((record) => record.convening.id), "convening ids");
  await Promise.all(conveningRecords.flatMap((record) => record.convening.images.map((image, index) => validateImageAsset(
    image.src,
    `${relativeFile(record.sourceFile)}.images[${index}].src`,
  ))));

  assertEveryAssetIsReferenced(assetFiles, [
    interfaceRecord.study.socialImageSrc,
    interfaceRecord.story.socialImageSrc,
    interfaceRecord.story.cohortArtSrc,
    interfaceRecord.atlas.socialImageSrc,
    interfaceRecord.footer.nsfLogoSrc,
    ...programRecord.program.landingGallery.map((image) => image.src),
    ...participantRecords.flatMap((record) => [
      record.participant.logo.variants.light.src,
      record.participant.logo.variants.dark.src,
    ]),
    ...personRecords
      .map((record) => record.person.headshotUrl)
      .filter((headshotUrl) => headshotUrl !== null),
    ...toolRecords.map((record) => record.tool.figure.src),
    ...toolRecords.flatMap((record) => record.tool.galleryImages.map((image) => image.src)),
    ...toolRecords.flatMap((record) => record.tool.resources.map((resource) => resource.image.src)),
    ...conveningRecords.flatMap((record) => record.convening.images.map((image) => image.src)),
  ]);

  for (const [participantId, record] of participantById.entries()) {
    const investigators = personRecords.filter((personRecord) => personRecord.person.participantId === participantId);
    assert(investigators.length > 0, `Participant “${participantId}” must have at least one person Markdown record`);
    assert(
      investigators.filter((personRecord) => personRecord.person.role === "Principal Investigator").length === 1,
      `Participant “${participantId}” must have exactly one Principal Investigator`,
    );
    assert(projectRecords.some((projectRecord) => projectRecord.participantId === participantId), `Participant “${participantId}” must have at least one project Markdown record`);
    assert(toolRecords.some((toolRecord) => toolRecord.participantId === participantId), `Participant “${participantId}” must have at least one tool Markdown record`);
    assert(record.participant.displayName.length > 0, `Participant “${participantId}” must have a display name`);
  }

  const programTeam = personRecords
    .filter((record) => record.person.participantId === null)
    .map((record) => record.person)
    .sort((left, right) => compareAlphabetically(left.name, right.name));
  assert(programTeam.length > 0, "At least one program leadership person Markdown record is required");

  const tools = toolRecords
    .map((record) => record.tool)
    .sort((left, right) => (
      compareParticipantIds(
        left.participantId,
        right.participantId,
        participantById.get(left.participantId).participant.displayName,
        participantById.get(right.participantId).participant.displayName,
      ) || compareAlphabetically(left.name, right.name)
    ));

  const participants = participantRecords
    .map((record) => {
      const people = personRecords
        .filter((personRecord) => personRecord.person.participantId === record.participant.id)
        .map((personRecord) => ({
          ...personRecord.person,
          organization: record.participant.displayName,
        }))
        .sort(comparePeopleByRole);
      return {
        ...record.participant,
        people,
      };
    })
    .sort((left, right) => compareParticipantIds(
      left.id,
      right.id,
      left.displayName,
      right.displayName,
    ));

  const projects = projectRecords
    .map((record) => {
      const participant = participantById.get(record.participantId).participant;
      const people = personRecords
        .filter((personRecord) => personRecord.person.participantId === record.participantId)
        .map((personRecord) => ({
          ...personRecord.person,
          organization: participant.displayName,
        }))
        .sort(comparePeopleByRole);
      return {
        ...record.project,
        organization: participant.displayName,
        location: participant.location,
        people,
      };
    })
    .sort((left, right) => (
      compareParticipantIds(
        left.participantId,
        right.participantId,
        left.organization,
        right.organization,
      ) || compareAlphabetically(left.shortName, right.shortName)
    ));

  const convenings = conveningRecords
    .map((record) => record.convening)
    .sort((left, right) => right.year - left.year);

  const sourceFiles = [
    programFile,
    interfaceFile,
    ...pageFiles,
    ...participantFiles,
    ...peopleFiles,
    ...projectFiles,
    ...toolFiles,
    ...conveningFiles,
    ...assetFiles,
  ]
    .map(relativeFile)
    .sort(compareAlphabetically);

  return {
    _generated: {
      warning: "AUTO-GENERATED FILE. Edit Markdown in content/apto/ and run node scripts/build-apto-content.mjs.",
      schemaVersion: 17,
      generator: "scripts/build-apto-content.mjs",
      sourceDirectory: "content/apto",
      generatedFrom: sourceFiles,
      dataAsOf: programRecord.program.lastVerified,
    },
    program: { ...omitFields(programRecord.program, ["lastVerified"]), programTeam },
    interface: interfaceRecord,
    pages,
    boilerplate: programRecord.boilerplate,
    participants,
    projects,
    tools,
    convenings,
    assetFiles,
  };
}

async function main() {
  const args = process.argv.slice(2);
  assert(args.length === 0 || (args.length === 1 && args[0] === "--check"), "Usage: node scripts/build-apto-content.mjs [--check]");
  const checkOnly = args[0] === "--check";
  const content = await buildContent();
  await syncAssets(content.assetFiles, checkOnly);
  delete content.assetFiles;
  const serialized = `${JSON.stringify(content, null, 2)}\n`;
  const inventory = `${content.pages.length} routed pages, ${content.participants.length} participants, ${content.program.programTeam.length + content.participants.reduce((sum, participant) => sum + participant.people.length, 0)} people, ${content.projects.length} projects, ${content.tools.length} tools, and ${content.convenings.length} convenings`;

  if (checkOnly) {
    let current;
    try {
      current = await readFile(outputFile, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      current = null;
    }
    assert(current === serialized, `${relativeFile(outputFile)} is out of date. Run: node scripts/build-apto-content.mjs`);
    console.log(`Validated ${relativeFile(outputFile)} from ${inventory}.`);
    return;
  }

  await writeFile(outputFile, serialized, "utf8");
  console.log(`Generated ${relativeFile(outputFile)} from ${inventory}.`);
}

main().catch((error) => {
  console.error(`APTO content build failed: ${error.message}`);
  process.exitCode = 1;
});
