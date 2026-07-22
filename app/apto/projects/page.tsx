import type { Metadata } from "next";

import { metadataFor } from "../_metadata";
import { AptoRoutePage } from "../_route-page";

export const metadata: Metadata = metadataFor("/projects");

export default function AptoProjectsPage() {
  return <AptoRoutePage section="projects" />;
}
