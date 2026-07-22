import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage } from "../_route-page";

export const metadata: Metadata = metadataFor("/about");

export default function AptoAboutPage() {
  return <AptoRoutePage section="about" />;
}
