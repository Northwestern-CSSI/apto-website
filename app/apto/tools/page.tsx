import type { Metadata } from "next";

import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = { title: "Tools" };

export default function AptoToolsPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="tools" searchParams={searchParams} />;
}
