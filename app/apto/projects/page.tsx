import type { Metadata } from "next";

import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = { title: "Projects" };

export default function AptoProjectsPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="projects" searchParams={searchParams} />;
}
