import type { Metadata } from "next";
import type { ReactNode } from "react";
import { aptoProgram } from "../nsf-apto-data";
import { aptoThemeBootstrap } from "./theme";

export const metadata: Metadata = {
  title: {
    default: aptoProgram.acronym,
    template: `%s | ${aptoProgram.acronym}`,
  },
  description: aptoProgram.shortSummary,
};

export default function AptoLayout({ children }: { children: ReactNode }) {
  return <>
    <script
      id="apto-theme-bootstrap"
      dangerouslySetInnerHTML={{ __html: aptoThemeBootstrap }}
    />
    {children}
  </>;
}
