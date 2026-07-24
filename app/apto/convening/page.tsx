import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage } from "../_route-page";

export const metadata: Metadata = metadataFor("/convening");

export default function AptoConveningPage() {
  return <AptoRoutePage section="convening" />;
}
