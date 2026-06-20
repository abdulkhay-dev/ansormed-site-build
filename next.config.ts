import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Полностью статическая сборка (out/) — деплоится на любой статик-хостинг (Netlify).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
