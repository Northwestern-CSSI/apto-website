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
  "nsfledger",
  "nsfnetwork",
]);

function firstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function conceptFromSearchParams(
  searchParams: Record<string, SearchParamValue>,
): NsfAptoMockupId {
  const concept = firstValue(searchParams.concept);

  return concept && aptoConceptIds.has(concept as NsfAptoMockupId)
    ? (concept as NsfAptoMockupId)
    : "nsfhome";
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
