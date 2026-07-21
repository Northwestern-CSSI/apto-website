import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export default function AptoAboutPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="about" searchParams={searchParams} />;
}
