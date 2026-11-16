import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const contentDirectory = path.join(rootDirectory, "content", "apto");
export const teamsDirectory = path.join(contentDirectory, "teams");
export const featuredParticipantOrder = new Map([
  ["northwestern", 0],
  ["uchicago", 1],
]);

export async function teamDirectories() {
  const entries = await readdir(teamsDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(teamsDirectory, entry.name))
    .sort((left, right) => left.localeCompare(right, "en"));
}

export async function markdownFiles(directory) {
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
