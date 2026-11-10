import type { NextConfig } from "next";

// برای انتشار ایستا روی GitHub Pages: PAGES=1 و NEXT_PUBLIC_BASE_PATH=/Investment_Advisor
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(process.env.PAGES ? { output: "export" as const, trailingSlash: true } : {}),
  basePath: basePath || undefined,
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
};

export default nextConfig;
