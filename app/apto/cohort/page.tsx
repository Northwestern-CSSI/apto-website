import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export default function AptoCohortPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="cohort" searchParams={searchParams} />;
}
