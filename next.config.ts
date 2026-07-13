import type { NextConfig } from "next";

// В dev сервер живой — можем редиректить корень / на язык по умолчанию.
// В проде статический экспорт игнорирует redirects(), поэтому корень / уводит
// на /ru/ статический public/index.html (там же есть и определение языка браузера).
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Полностью статическая сборка (dist/) — деплоится на nginx-сервер.
  // Экспорт включаем ТОЛЬКО в проде: детальные маршруты (product/post/project)
  // собираются одной оболочкой-заглушкой на язык (slug = "_"), а реальный slug
  // читается из URL на клиенте + nginx-фолбэком отдаёт эту оболочку на любой
  // путь. В dev экспорт выключен, поэтому `next dev` рендерит любой slug как
  // обычно (иначе export ругается на отсутствующий param в generateStaticParams).
  ...(isDev ? {} : { output: "export" as const }),
  // Папка статического экспорта: используется CI-деплоем.
  distDir: "dist",
  // Каждый маршрут — это папка с index.html (contacts/index.html), чтобы nginx
  // отдавал URL со слэшем (/contacts/) при прямой загрузке/перезагрузке без 403.
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isDev
    ? {
        async redirects() {
          return [{ source: "/", destination: "/ru", permanent: false }];
        },
      }
    : {}),
};

export default nextConfig;
