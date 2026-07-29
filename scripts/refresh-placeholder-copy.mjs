import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(projectRoot, "content", "apto");

const openings = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
  "Aenean lacinia bibendum nulla sed consectetur, praesent commodo cursus magna.",
  "Maecenas faucibus mollis interdum, fusce dapibus tellus ac cursus commodo.",
  "Cras mattis consectetur purus sit amet fermentum, donec sed odio dui.",
  "Nullam quis risus eget urna mollis ornare vel eu leo.",
  "Etiam porta sem malesuada magna mollis euismod, curabitur blandit tempus porttitor.",
  "Morbi leo risus, porta ac consectetur ac, vestibulum at eros.",
  "Donec id elit non mi porta gravida at eget metus.",
  "Vestibulum id ligula porta felis euismod semper, integer posuere erat a ante.",
  "Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
  "Sed posuere consectetur est at lobortis, aenean eu leo quam.",
  "Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
  "Curabitur blandit tempus porttitor, nulla vitae elit libero a pharetra augue.",
  "Pellentesque ornare sem lacinia quam venenatis vestibulum.",
  "Duis mollis, est non commodo luctus, nisi erat porttitor ligula.",
  "Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
];

const continuations = [
  "Donec ullamcorper nulla non metus auctor fringilla, sed posuere consectetur est at lobortis.",
  "Aenean eu leo quam, pellentesque ornare sem lacinia quam venenatis vestibulum.",
  "Nulla vitae elit libero, a pharetra augue, praesent commodo cursus magna.",
  "Maecenas sed diam eget risus varius blandit sit amet non magna.",
  "Etiam porta sem malesuada magna mollis euismod, vivamus sagittis lacus vel augue.",
  "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.",
  "Vestibulum id ligula porta felis euismod semper, donec sed odio dui.",
];

const placeholderPattern = /\b(?:lorem|ipsum|consectetur|adipiscing|vivamus|aenean|maecenas|cras|donec|nullam|etiam|morbi|vestibulum|praesent|curabitur|pellentesque|duis|fusce|aliquam|phasellus|nunc|proin)\b/i;
let copyIndex = 0;
const generatedCopy = new Set();

function nextPlaceholder() {
  const index = copyIndex++;
  const opening = openings[index % openings.length];
  const continuationIndex = (index * 3 + Math.floor(index / openings.length)) % continuations.length;
  const copy = `${opening} ${continuations[continuationIndex]}`;
  if (generatedCopy.has(copy)) throw new Error(`Duplicate placeholder generated at position ${index}`);
  generatedCopy.add(copy);
  return copy;
}

function splitMarkdown(source, filePath) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing JSON front matter in ${filePath}`);
  return { metadata: JSON.parse(match[1]), body: match[2] };
}

function joinMarkdown(metadata, body) {
  return `---\n${JSON.stringify(metadata, null, 2)}\n---\n${body.trimEnd()}\n`;
}

function syncToolBody(body, summaryParagraphs, useCase) {
  let updated = body.replace(
    /(## Description[^\n]*\n)[\s\S]*?(?=\n## Use case[^\n]*\n)/,
    `$1\n${summaryParagraphs.join("\n\n")}\n`,
  );
  updated = updated.replace(/(## Use case[^\n]*\n)[\s\S]*$/, `$1\n${useCase}\n`);
  return updated;
}

async function refreshProgram() {
  const filePath = path.join(contentRoot, "program.md");
  const source = await readFile(filePath, "utf8");
  const { metadata, body } = splitMarkdown(source, filePath);

  for (const group of metadata.impactGroups ?? []) {
    if (group.participantId !== "northwestern") {
      group.entries = group.entries.map(() => nextPlaceholder());
    }
  }

  await writeFile(filePath, joinMarkdown(metadata, body));
}

async function refreshTools() {
  const toolsRoot = path.join(contentRoot, "tools");
  const filenames = (await readdir(toolsRoot)).filter((name) => name.endsWith(".md") && name !== "README.md").sort();

  for (const filename of filenames) {
    const filePath = path.join(toolsRoot, filename);
    const source = await readFile(filePath, "utf8");
    const { metadata, body } = splitMarkdown(source, filePath);
    const hasPlaceholder = (metadata.summaryParagraphs ?? []).some((paragraph) => placeholderPattern.test(paragraph))
      || (metadata.resources ?? []).some((resource) => placeholderPattern.test(resource.description));
    if (!hasPlaceholder) continue;

    metadata.summaryParagraphs = metadata.summaryParagraphs.map((paragraph) => (
      placeholderPattern.test(paragraph) ? nextPlaceholder() : paragraph
    ));
    metadata.resources = metadata.resources.map((resource) => ({
      ...resource,
      description: placeholderPattern.test(resource.description) ? nextPlaceholder() : resource.description,
    }));

    const updatedBody = syncToolBody(body, metadata.summaryParagraphs, nextPlaceholder());
    await writeFile(filePath, joinMarkdown(metadata, updatedBody));
  }
}

await refreshProgram();
await refreshTools();

console.log(`Refreshed ${generatedCopy.size} distinct placeholder passages.`);
