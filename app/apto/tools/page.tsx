import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = metadataFor("/tools");

export default function AptoToolsPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="tools" searchParams={searchParams} />;
}
