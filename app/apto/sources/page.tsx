import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export default function AptoSourcesPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="sources" searchParams={searchParams} />;
}
