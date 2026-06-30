import type { Locale } from "@/lib/i18n";
import { mediaUrl, type ApiBlogPost } from "@/lib/api";

/** Пост блога, локализованный под язык и готовый к отрисовке. */
export interface LocalPost {
  id: number;
  title: string;
  /** HTML-контент. */
  content: string;
  image: string | null;
  video: string | null;
  createdAt: string;
}

/** Выбор значения по языку с фолбэком на ru (например, title_en пустой). */
function byLang(lang: Locale, ru: string, uz: string, en: string): string {
  if (lang === "uz") return uz || ru;
  if (lang === "en") return en || ru;
  return ru;
}

/** Виден ли пост для языка (is_published + display_<lang>). */
export function isPostVisible(p: ApiBlogPost, lang: Locale): boolean {
  if (p.is_published === false) return false;
  if (lang === "uz") return p.display_uz !== false;
  if (lang === "en") return p.display_en !== false;
  return p.display_ru !== false;
}

export function localizePost(p: ApiBlogPost, lang: Locale): LocalPost {
  return {
    id: p.id,
    title: byLang(lang, p.title_ru, p.title_uz, p.title_en),
    content: byLang(lang, p.content_ru, p.content_uz, p.content_en),
    image: mediaUrl(p.image),
    video: p.video_url ? mediaUrl(p.video_url) : null,
    createdAt: p.created_at,
  };
}

/** Убирает HTML-теги и сжимает пробелы — для превью текста поста. */
export function plainText(html: string): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
