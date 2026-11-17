import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages (served from the root of tank.ahmedwaheed.me, so no basePath)
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
