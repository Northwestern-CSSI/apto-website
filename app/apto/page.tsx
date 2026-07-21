import { AptoRoutePage, type AptoRouteSearchParams } from "./_route-page";

export default function AptoHomePage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="home" searchParams={searchParams} />;
}
