// ساخت یک فایل HTML تکی و مستقل از کل سایت (بدون نیاز به سرور): npm run build:single
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

const r = (p: string) => path.resolve(__dirname, p);
export default defineConfig({
  root: __dirname,
  publicDir: false,
  css: { postcss: { plugins: [] } },
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: [
      { find: "@/lib/engine-src", replacement: r("shims/engine-src.ts") },
      { find: "@/lib/image-loader", replacement: r("shims/assets.ts") },
      { find: "next/link", replacement: r("shims/link.tsx") },
      { find: "next/image", replacement: r("shims/image.tsx") },
      { find: "next/navigation", replacement: r("shims/navigation.ts") },
      { find: "@", replacement: r("../src") },
    ],
  },
  build: { outDir: r("dist"), emptyOutDir: true, assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 100_000, cssCodeSplit: false },
});
