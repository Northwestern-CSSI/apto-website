import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export default function AptoToolsPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="tools" searchParams={searchParams} />;
}
