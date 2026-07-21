import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export default function AptoPeoplePage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="people" searchParams={searchParams} />;
}
