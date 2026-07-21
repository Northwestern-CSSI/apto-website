import type { Metadata } from "next";

import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = { title: "Participating organizations" };

export default function AptoCohortPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="cohort" searchParams={searchParams} />;
}
