import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "APTO",
    template: "%s | APTO",
  },
  description:
    "Program, projects, people, participating organizations, sources, and proposed tools for Assessing and Predicting Technology Outcomes.",
};

export default function AptoLayout({ children }: { children: ReactNode }) {
  return children;
}
