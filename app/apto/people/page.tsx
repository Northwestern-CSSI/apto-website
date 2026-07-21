import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = metadataFor("/cohort");

export default function AptoPeoplePage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="cohort" searchParams={searchParams} />;
}
