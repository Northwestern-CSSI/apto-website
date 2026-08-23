import { aptoProjects } from "./content";
import { orderParticipantMentions } from "./participant-order";

const cohortLinkLabels = new Map([
  ["Northwestern University", "northwestern"],
  ["University of Chicago", "uchicago"],
  ["Apperture.AI", "aperture"],
  ["Insilicom", "insilicom"],
  ["Macrocosm", "macrocosm"],
]);

const cohortLabelPattern = /(Northwestern University|University of Chicago|Apperture\.AI|Insilicom|Macrocosm)/g;

export function ProgramIntroduction({
  introduction,
  participantOrder,
  projectHref,
}: {
  introduction: string;
  participantOrder: readonly string[];
  projectHref: (projectId: string) => string;
}) {
  const orderedIntroduction = orderParticipantMentions(introduction, participantOrder);
  return <p className="apto-program-introduction">{orderedIntroduction.split(cohortLabelPattern).map((part, index) => {
    const participantId = cohortLinkLabels.get(part);
    if (!participantId) return part;
    const project = aptoProjects.find((candidate) => candidate.participantId === participantId);
    return project
      ? <a href={projectHref(project.id)} key={`${participantId}-${index}`}>{part}</a>
      : part;
  })}</p>;
}
