import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { localeUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** Индексируемые маршруты (без локали). Параметрические /post, /product
 *  опущены — это клиентские оболочки без per-item URL. */
const ROUTES = ["", "products", "about", "blog", "contacts"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.flatMap((route) => {
    const languages = Object.fromEntries(
      locales.map((l) => [l, localeUrl(l, route)]),
    );
    return locales.map((lang) => ({
      url: localeUrl(lang, route),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
