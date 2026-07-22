import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage } from "../_route-page";

export const metadata: Metadata = metadataFor("/tools");

export default function AptoToolsPage() {
  return <AptoRoutePage section="tools" />;
}
