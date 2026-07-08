import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata, byLang, metaText } from "@/lib/seo";
import { listPosts, mediaUrl } from "@/lib/api";
import PostView from "../PostView";

/** Пути детальных страниц постов блога (по одному на каждый slug × язык). */
export async function generateStaticParams() {
  try {
    const posts = await listPosts();
    return posts.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
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

  const post = await listPosts()
    .then((all) => all.find((p) => p.slug === decodeURIComponent(slug)) ?? null)
    .catch(() => null);

  const name = post ? byLang(locale, post.title_ru, post.title_uz, post.title_en) : "";
  const content = post
    ? byLang(locale, post.content_ru, post.content_uz, post.content_en)
    : "";
  const title = post?.seo_title?.trim() || name || dict.blog.meta.title;
  const description =
    post?.seo_description?.trim() || metaText(content) || dict.blog.meta.description;
  const image = post?.image ? mediaUrl(post.image) : null;

  return pageMetadata(locale, `post/${slug}`, {
    title,
    description,
    keywords: post?.seo_keywords ?? undefined,
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
  return <PostView slug={decodeURIComponent(slug)} />;
}
