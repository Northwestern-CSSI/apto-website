import type { Metadata } from "next";

import { aptoPages, type AptoPageSlug } from "../nsf-apto-data";

export function metadataFor(slug: AptoPageSlug): Metadata {
  const page = aptoPages.find((candidate) => candidate.slug === slug);

  if (!page) {
    throw new Error(`Missing generated APTO page metadata for “${slug}”`);
  }

  return { title: page.metadataTitle };
}
