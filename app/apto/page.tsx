import type { Metadata } from "next";

import { AptoRoutePage, type AptoRouteSearchParams } from "./_route-page";

export const metadata: Metadata = { title: "Program home" };

export default function AptoHomePage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="home" searchParams={searchParams} />;
}
