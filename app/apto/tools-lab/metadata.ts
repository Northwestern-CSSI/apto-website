import type { Metadata } from "next";

import { withDeploymentBase } from "../paths";

const title = "Northwestern tool storytelling lab | APTO";
const description =
  "A design study comparing milestone, puzzle, checklist, and resource-led stories for Northwestern University’s five APTO research tools.";
const socialImage = withDeploymentBase("/northwestern-tools-lab.png");

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
        width: 1732,
        height: 908,
        alt: "APTO Northwestern Tool Storytelling Lab: five numbered modular cards representing four storytelling formats.",
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
