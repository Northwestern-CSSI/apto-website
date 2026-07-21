import type { Metadata } from "next";

import { AptoRoutePage, type AptoRouteSearchParams } from "../_route-page";

export const metadata: Metadata = { title: "About the program" };

export default function AptoAboutPage({
  searchParams,
}: {
  searchParams: AptoRouteSearchParams;
}) {
  return <AptoRoutePage section="about" searchParams={searchParams} />;
}
