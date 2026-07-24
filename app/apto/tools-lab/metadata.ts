import type { Metadata } from "next";

import { withDeploymentBase } from "../paths";

const title = "APTO tool story systems | Northwestern experiments";
const description =
  "Five complete storytelling systems—from editorial dossier to signal constellation—for Northwestern University’s APTO research tools.";
const socialImage = withDeploymentBase("/apto-tools-story-systems.png");

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
        width: 1568,
        height: 1003,
        alt: "APTO Tool Story Systems: an editorial dossier, milestone journey, evidence blueprint, assembly mosaic, and signal constellation.",
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
