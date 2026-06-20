import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Полностью статическая сборка (out/) — деплоится на любой статик-хостинг (Netlify).
  // CORS к API решается прокси: на проде — redirect /api/* в netlify.toml,
  // в dev — локальный CORS-прокси из scripts/dev.mjs (NEXT_PUBLIC_API_BASE).
  output: "export",
  // Папка статического экспорта: out -> dist (используется CI-деплоем).
  distDir: "dist",
  images: { unoptimized: true },
};

export default nextConfig;
