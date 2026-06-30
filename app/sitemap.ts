import type { MetadataRoute } from "next";
import { getCatalog, listPosts } from "@/lib/api";
import { locales } from "@/lib/i18n";
import { localeUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** Статические разделы (без локали). */
const ROUTES = ["", "products", "about", "blog", "contacts"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Per-item URL: товары (активные) и посты (опубликованные).
  const products = (await getCatalog().catch(() => []))
    .filter((p) => p.is_active !== false)
    .map((p) => `product/${p.id}`);
  const posts = (await listPosts().then((r) => r ?? []).catch(() => []))
    .filter((p) => p.is_published !== false)
    .map((p) => `post/${p.id}`);

  const routes = [...ROUTES, ...products, ...posts];

  return routes.flatMap((route) => {
    const languages = Object.fromEntries(
      locales.map((l) => [l, localeUrl(l, route)]),
    );
    return locales.map((lang) => ({
      url: localeUrl(lang, route),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : route.includes("/") ? 0.7 : 0.8,
      alternates: { languages },
    }));
  });
}
