import type { Metadata } from "next";

import { metadataFor } from "../apto/_metadata";
import { AptoRoutePage } from "../apto/_route-page";

export const metadata: Metadata = metadataFor("/convening");

export default function ConveningPage() {
  return <AptoRoutePage section="convening" />;
}
