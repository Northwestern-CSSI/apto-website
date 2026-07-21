import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = metadataFor("/people");

export default function AptoPeoplePage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="people" searchParams={searchParams} />;
}
