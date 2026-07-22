import type { Metadata } from "next";

import { metadataFor } from "./apto/_metadata";
import { AptoRoutePage } from "./apto/_route-page";

export const metadata: Metadata = {
  ...metadataFor("/"),
  title: { absolute: "Program home | APTO" },
};

export default function Home() {
  return <AptoRoutePage section="home" />;
}
