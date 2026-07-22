import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import { aptoThemeBootstrap } from "./apto/theme";
import { withDeploymentBase } from "./apto/paths";
import { aptoInterface } from "./nsf-apto-data";
import "./globals.css";
import "./nsf-apto-mockups.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
