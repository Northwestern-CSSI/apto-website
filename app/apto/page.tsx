import type { Metadata } from "next";

import { metadataFor } from "./_metadata";
import { AptoRoutePage } from "./_route-page";

export const metadata: Metadata = metadataFor("/");

export default function AptoHomePage() {
  return <AptoRoutePage section="home" />;
}
