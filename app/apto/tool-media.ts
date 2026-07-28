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

export function presentationMediaForTool(tool: Tool): PresentationImage[] {
  return ownMedia(tool);
}
