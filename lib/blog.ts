import type { Locale } from "@/lib/i18n";
import { mediaUrl, type ApiBlogPost } from "@/lib/api";

/** Пост блога, локализованный под язык и готовый к отрисовке. */
export interface LocalPost {
  id: number;
  slug: string;
  title: string;
  /** HTML-контент. */
  content: string;
  image: string | null;
  /** Доп. картинки галереи (абсолютные URL). */
  images: string[];
  video: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  seo: { title: string; description: string; keywords: string };
}

/** Выбор значения по языку с фолбэком на ru (например, title_en пустой). */
function byLang(lang: Locale, ru: string, uz: string, en: string): string {
  if (lang === "uz") return uz || ru;
  if (lang === "en") return en || ru;
  return ru;
}

/** Виден ли пост (только is_published — display_* больше нет). */
export function isPostVisible(p: ApiBlogPost): boolean {
  return p.is_published !== false;
}

export function localizePost(p: ApiBlogPost, lang: Locale): LocalPost {
  const images = [
    ...new Set(
      (p.gallery ?? []).map((g) => mediaUrl(g.image)).filter(Boolean) as string[],
    ),
  ];
  return {
    id: p.id,
    slug: p.slug,
    title: byLang(lang, p.title_ru, p.title_uz, p.title_en),
    content: byLang(lang, p.content_ru, p.content_uz, p.content_en),
    image: mediaUrl(p.image),
    images,
    video: p.video_url ? mediaUrl(p.video_url) : null,
    tags: p.tags ?? [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    seo: {
      title: p.seo_title ?? "",
      description: p.seo_description ?? "",
      keywords: p.seo_keywords ?? "",
    },
  };
}

/** Убирает HTML-теги и сжимает пробелы — для превью текста поста. */
export function plainText(html: string): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
