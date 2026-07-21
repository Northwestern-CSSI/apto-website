import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export default function AptoProjectsPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="projects" searchParams={searchParams} />;
}
