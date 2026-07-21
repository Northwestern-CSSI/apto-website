import {
  NsfAptoPage,
  type NsfAptoMockupId,
  type NsfAptoSection,
} from "../nsf-apto-mockups";

type SearchParamValue = string | string[] | undefined;

export type AptoRouteSearchParams = Promise<
  Record<string, SearchParamValue>
>;

const aptoConceptIds = new Set<NsfAptoMockupId>([
  "nsfhome",
  "nsfhomewidgets",
  "nsfledger",
  "nsfledgerwidgets",
  "nsfnetwork",
  "nsfnetworkwidgets",
]);

function firstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function conceptFromSearchParams(
  searchParams: Record<string, SearchParamValue>,
): NsfAptoMockupId {
  const concept = firstValue(searchParams.concept);

  if (!concept || !aptoConceptIds.has(concept as NsfAptoMockupId)) {
    return "nsfhome";
  }

  // Preserve every published study URL while folding the former first and
  // second options into the curved light design. The network option remains
  // the coordinated dark theme.
  return concept.startsWith("nsfnetwork") ? "nsfnetwork" : "nsfhome";
}

export async function AptoRoutePage({
  section,
  searchParams,
}: {
  section: NsfAptoSection;
  searchParams: AptoRouteSearchParams;
}) {
  const conceptId = conceptFromSearchParams(await searchParams);

  return <NsfAptoPage id={conceptId} section={section} />;
}
