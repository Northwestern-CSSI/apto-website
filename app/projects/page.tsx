import type { Metadata } from "next";

import { metadataFor } from "../apto/_metadata";
import { AptoRoutePage } from "../apto/_route-page";

export const metadata: Metadata = metadataFor("/projects");

export default function ProjectsPage() {
  return <AptoRoutePage section="projects" />;
}

