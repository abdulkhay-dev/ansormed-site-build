import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata, byLang, metaText } from "@/lib/seo";
import { listProjects, mediaUrl } from "@/lib/api";
import ProjectView from "../ProjectView";

/** Пути детальных страниц проектов (по одному на каждый slug × язык). */
export async function generateStaticParams() {
  try {
    const projects = await listProjects();
    return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "ru";
  const dict = getDictionary(locale);

  const project = await listProjects()
    .then((all) => all.find((p) => p.slug === decodeURIComponent(slug)) ?? null)
    .catch(() => null);

  const name = project
    ? byLang(locale, project.title_ru, project.title_uz, project.title_en)
    : "";
  const content = project
    ? byLang(locale, project.content_ru, project.content_uz, project.content_en)
    : "";
  const title = project?.seo_title?.trim() || name || dict.projects.meta.title;
  const description =
    project?.seo_description?.trim() || metaText(content) || dict.projects.meta.description;
  const image = project?.cover_image ? mediaUrl(project.cover_image) : null;

  return pageMetadata(locale, `project/${slug}`, {
    title,
    description,
    keywords: project?.seo_keywords ?? undefined,
    image,
    ogType: "article",
    ogLocale: dict.meta.ogLocale,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectView slug={decodeURIComponent(slug)} />;
}
