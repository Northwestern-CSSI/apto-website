import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = metadataFor("/about");

export default function AptoAboutPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="about" searchParams={searchParams} />;
}
