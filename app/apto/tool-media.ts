import { aptoTools } from "./content";

export type PresentationImage = { src: string; alt: string };
type Tool = (typeof aptoTools)[number];

function ownMedia(tool: Tool): PresentationImage[] {
  return [tool.figure, ...tool.galleryImages].map(({ src, alt }) => ({ src, alt }));
}

function uniqueMedia(images: PresentationImage[]) {
  return [...new Map(images.map((image) => [image.src, image])).values()];
}

export const storyHeroMedia = uniqueMedia(aptoTools.flatMap(ownMedia));

const northwesternMedia = uniqueMedia(
  aptoTools.filter((tool) => tool.participantId === "northwestern").flatMap(ownMedia),
);
const placeholderTools = aptoTools.filter((tool) => tool.participantId !== "northwestern");
const placeholderSteps = [3, 7, 9, 11, 13, 17, 19] as const;

export function presentationMediaForTool(tool: Tool): PresentationImage[] {
  if (tool.participantId === "northwestern" || northwesternMedia.length < 4) return ownMedia(tool);

  const placeholderIndex = Math.max(0, placeholderTools.findIndex((candidate) => candidate.id === tool.id));
  const start = (placeholderIndex * 7 + 3) % northwesternMedia.length;
  const step = placeholderSteps[placeholderIndex % placeholderSteps.length];

  return Array.from({ length: 4 }, (_, index) => (
    northwesternMedia[(start + index * step) % northwesternMedia.length]
  ));
}
