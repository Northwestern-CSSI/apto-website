import { aptoProgram, aptoTools } from "./content";

export type PresentationImage = { src: string; alt: string; objectPosition?: string };
type Tool = (typeof aptoTools)[number];

function ownMedia(tool: Tool): PresentationImage[] {
  return [tool.figure, ...tool.galleryImages].map(({ src, alt }) => ({ src, alt }));
}

export const storyHeroMedia: PresentationImage[] = aptoProgram.heroGallery;

export function presentationMediaForTool(tool: Tool): PresentationImage[] {
  return ownMedia(tool);
}
