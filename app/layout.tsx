import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { aptoThemeBootstrap } from "./apto/theme";
import { withDeploymentBase } from "./apto/paths";
import { aptoInterface } from "./apto/content";
import "./globals.css";
import "./apto/site.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apto-design-study.moondark.chatgpt.site";
  const baseUrl = new URL(siteUrl);
  const {
    siteTitle: title,
    siteDescription: description,
    socialImageSrc,
    socialImageAlt,
  } = aptoInterface.study;
  const socialImage = new URL(withDeploymentBase(socialImageSrc), baseUrl.origin).toString();

  return {
    metadataBase: baseUrl,
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: socialImage, alt: socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="apto-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: aptoThemeBootstrap }}
        />
      </head>
      <body
        className={`${openSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
