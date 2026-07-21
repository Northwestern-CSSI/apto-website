import type { Metadata } from "next";

import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = { title: "People" };

export default function AptoPeoplePage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="people" searchParams={searchParams} />;
}
