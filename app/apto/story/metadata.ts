import type { Metadata } from "next";

import { aptoInterface } from "../content";
import { withDeploymentBase } from "../paths";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apto-design-study.moondark.chatgpt.site";
const socialImage = new URL(withDeploymentBase(aptoInterface.story.socialImageSrc), new URL(siteUrl).origin).toString();

export const aptoStoryMetadata: Metadata = {
  title: aptoInterface.story.viewLabel,
  description: aptoInterface.study.siteDescription,
  openGraph: {
    title: aptoInterface.story.viewLabel,
    description: aptoInterface.study.siteDescription,
    images: [{
      url: socialImage,
      alt: aptoInterface.story.socialImageAlt,
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: aptoInterface.story.viewLabel,
    description: aptoInterface.study.siteDescription,
    images: [socialImage],
  },
};
