import type { Metadata } from "next";

import { aptoInterface } from "../content";
import { withDeploymentBase } from "../paths";

const title = "Northwestern tool panel experiments | APTO";
const description =
  "The existing APTO Story tool cards with five experimental ways to organize Northwestern University’s subprojects, milestones, and resources.";
const socialImage = withDeploymentBase(aptoInterface.story.socialImageSrc);

export const toolsLabMetadata: Metadata = {
  title: { absolute: title },
  description,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: socialImage,
        alt: aptoInterface.story.socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};
