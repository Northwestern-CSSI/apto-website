import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = metadataFor("/projects");

export default function AptoProjectsPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="projects" searchParams={searchParams} />;
}
