import { aptoTools, type AptoTool } from "./content";

const aiToolIds = [
  "uchicago-global-innovation-signals",
  "uchicago-innovation-ecosystem-dynamics",
  "uchicago-ai-infrastructure",
] as const;
const aiToolIdSet = new Set<string>(aiToolIds);
const uchicagoAiTools = aiToolIds.map((id) => {
  const tool = aptoTools.find((candidate) => candidate.id === id);
  if (!tool) throw new Error(`Missing UChicago AI tool: ${id}`);
  return tool;
});

const [aiSkills, aiBenchmarks, aiInfrastructure] = uchicagoAiTools;

export const uchicagoAiToolsCollection: AptoTool = {
  id: "uchicago-ai-tools",
  participantId: "uchicago",
  name: "AI Tools",
  summaryParagraphs: [
    "AI Skills, AI Benchmarks, and AI Infrastructure are presented together as one UChicago AI Tools collection.",
    "Explore the three supporting areas to see how the collection connects people, measurement, and technical capacity.",
  ],
  categories: [...new Set(uchicagoAiTools.flatMap((tool) => tool.categories))],
  description: uchicagoAiTools.map((tool) => tool.description).join(" "),
  useCase: uchicagoAiTools.map((tool) => tool.useCase).join(" "),
  figure: aiSkills.figure,
  galleryImages: [
    aiBenchmarks.figure,
    aiInfrastructure.galleryImages[1],
    aiInfrastructure.galleryImages[2],
  ],
  resources: uchicagoAiTools.map((tool) => ({
    name: tool.name,
    description: tool.summaryParagraphs.join(" "),
    status: tool.toolUrl ? "available" as const : "coming-soon" as const,
    url: tool.toolUrl,
    ...(tool.toolUrl ? { actionLabel: `Open ${tool.name}` } : {}),
    image: tool.resources[0].image,
  })),
  statusLabel: aiSkills.statusLabel,
  demoVideoUrl: uchicagoAiTools.find((tool) => tool.demoVideoUrl)?.demoVideoUrl ?? null,
  toolUrl: null,
};

const firstAiToolIndex = aptoTools.findIndex((tool) => aiToolIdSet.has(tool.id));

export const aptoPresentationTools: AptoTool[] = aptoTools.flatMap((tool, index) => {
  if (index === firstAiToolIndex) return [uchicagoAiToolsCollection];
  return aiToolIdSet.has(tool.id) ? [] : [tool];
});
