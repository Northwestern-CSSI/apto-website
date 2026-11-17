import { aptoToolCollections, aptoTools, type AptoTool, type AptoToolCollection } from "./content";

// A collection card stands in for its member tools, which appear on the card
// as its supporting pieces. Collections are defined in each team's
// tool-collections/ content folder.
function collectionCard(collection: AptoToolCollection): AptoTool {
  const members = collection.toolIds.map((id) => {
    const tool = aptoTools.find((candidate) => candidate.id === id);
    if (!tool) throw new Error(`Tool collection ${collection.id} references a missing tool: ${id}`);
    return tool;
  });

  return {
    id: collection.id,
    participantId: collection.participantId,
    name: collection.name,
    summaryParagraphs: collection.summaryParagraphs,
    categories: [...new Set(members.flatMap((tool) => tool.categories))],
    description: members.map((tool) => tool.description).join(" "),
    useCase: members.map((tool) => tool.useCase).join(" "),
    figure: collection.figure,
    galleryImages: collection.galleryImages,
    resources: members.map((tool) => ({
      name: tool.name,
      description: tool.summaryParagraphs.join(" "),
      status: tool.toolUrl ? "available" as const : "coming-soon" as const,
      url: tool.toolUrl,
      ...(tool.toolUrl ? { actionLabel: `Open ${tool.name}` } : {}),
      image: tool.resources[0].image,
    })),
    statusLabel: collection.statusLabel,
    demoVideoUrl: members.find((tool) => tool.demoVideoUrl)?.demoVideoUrl ?? null,
    toolUrl: null,
  };
}

const collectionByToolId = new Map(
  aptoToolCollections.flatMap((collection) => collection.toolIds.map((id) => [id, collection] as const)),
);
const placedCollections = new Set<string>();

// Each collection takes the place of its first member in the tool order.
export const aptoPresentationTools: AptoTool[] = aptoTools.flatMap((tool) => {
  const collection = collectionByToolId.get(tool.id);
  if (!collection) return [tool];
  if (placedCollections.has(collection.id)) return [];
  placedCollections.add(collection.id);
  return [collectionCard(collection)];
});
