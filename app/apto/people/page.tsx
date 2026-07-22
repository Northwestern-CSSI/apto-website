import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage } from "../_route-page";

export const metadata: Metadata = metadataFor("/cohort");

export default function AptoPeoplePage() {
  return <AptoRoutePage section="cohort" />;
}
