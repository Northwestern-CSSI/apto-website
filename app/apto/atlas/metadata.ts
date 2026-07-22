import type { Metadata } from "next";

import { aptoInterface, aptoPages, type AptoPageSlug } from "../content";
import { withDeploymentBase } from "../paths";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apto-design-study.moondark.chatgpt.site";
const socialImage = new URL(withDeploymentBase(aptoInterface.atlas.socialImageSrc), new URL(siteUrl).origin).toString();

export function atlasMetadataFor(slug: AptoPageSlug): Metadata {
  const page = aptoPages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Missing generated APTO page metadata for “${slug}”`);
  const title = slug === "/" ? aptoInterface.atlas.viewLabel : `${page.metadataTitle} · ${aptoInterface.atlas.viewLabel}`;

  return {
    title,
    description: page.introduction,
    openGraph: {
      title,
      description: page.introduction,
      images: [{
        url: socialImage,
        alt: aptoInterface.atlas.socialImageAlt,
        width: 1200,
        height: 630,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.introduction,
      images: [socialImage],
    },
  };
}
