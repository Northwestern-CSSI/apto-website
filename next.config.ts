import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const sharedConfig: NextConfig = {
  turbopack: { root: process.cwd() },
};

const nextConfig: NextConfig = isGitHubPages
  ? {
      ...sharedConfig,
      output: "export",
      basePath,
      assetPrefix: basePath,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : sharedConfig;

export default nextConfig;
