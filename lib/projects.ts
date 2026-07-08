import type { Locale } from "@/lib/i18n";
import { mediaUrl, type ApiProject } from "@/lib/api";
import { plainText } from "@/lib/blog";

/** Проект, локализованный под язык и готовый к отрисовке. */
export interface LocalProject {
  id: number;
  slug: string;
  title: string;
  /** HTML-контент. */
  content: string;
  coverImage: string | null;
  images: string[];
  tags: string[];
  /** Ссылка на первоисточник, либо null. */
  sourceUrl: string | null;
  sortOrder: number;
  seo: { title: string; description: string; keywords: string };
}

/** Тексты проектов показываем строго на текущем языке, без подмены en в ru/uz. */
function byLang(lang: Locale, ru: string | null, uz: string | null, en: string | null): string {
  if (lang === "uz") return uz || "";
  if (lang === "en") return en || "";
  return ru || "";
}

export function localizeProject(project: ApiProject, lang: Locale): LocalProject {
  const raw = [
    project.cover_image,
    ...(project.gallery ?? []).map((g) => g.image),
  ].filter(Boolean) as string[];
  const images = [...new Set(raw.map((src) => mediaUrl(src)).filter(Boolean) as string[])];

  return {
    id: project.id,
    slug: project.slug,
    title: byLang(lang, project.title_ru, project.title_uz, project.title_en),
    content: byLang(lang, project.content_ru, project.content_uz, project.content_en),
    coverImage: images[0] ?? null,
    images,
    tags: project.tags ?? [],
    sourceUrl: project.source_url ?? null,
    sortOrder: project.sort_order ?? 0,
    seo: {
      title: project.seo_title ?? "",
      description: project.seo_description ?? "",
      keywords: project.seo_keywords ?? "",
    },
  };
}

export function projectExcerpt(project: LocalProject, max = 160): string {
  const excerpt = plainText(project.content);
  return excerpt.length > max ? `${excerpt.slice(0, max - 3)}...` : excerpt;
}
