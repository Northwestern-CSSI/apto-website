import {
  NsfAptoPage,
  type NsfAptoSection,
} from "../nsf-apto-mockups";

type SearchParamValue = string | string[] | undefined;

export type AptoRouteSearchParams = Promise<
  Record<string, SearchParamValue>
>;

export function AptoRoutePage({
  section,
}: {
  section: NsfAptoSection;
  searchParams: AptoRouteSearchParams;
}) {
  // The legacy `concept` query is intentionally handled only by the bootstrap
  // theme script. Page content and structure are now identical in both modes.
  return <NsfAptoPage section={section} />;
}
