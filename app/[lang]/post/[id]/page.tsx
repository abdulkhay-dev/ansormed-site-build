import type { Metadata } from "next";
import { listPosts, type ApiBlogPost } from "@/lib/api";
import { localizePost, plainText } from "@/lib/blog";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, localeUrl } from "@/lib/seo";
import { site } from "@/lib/data/site";
import PostView from "../PostView";

export const dynamicParams = false;

// Один запрос /api/v1/blog/ на всю сборку (дедуп между хуками).
let postsPromise: Promise<ApiBlogPost[]> | null = null;
function allPosts(): Promise<ApiBlogPost[]> {
  if (!postsPromise) postsPromise = listPosts().then((r) => r ?? []).catch(() => []);
  return postsPromise;
}

async function findPost(id: string): Promise<ApiBlogPost | null> {
  const all = await allPosts();
  return all.find((p) => String(p.id) === id) ?? null;
}

function clip(s: string, n = 160): string {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

export async function generateStaticParams() {
  const all = await allPosts();
  const ids = all.map((p) => ({ id: String(p.id) }));
  // Всегда добавляем "none" — статическая оболочка-фоллбэк (см. netlify.toml)
  // для постов, добавленных уже после сборки.
  return [...ids, { id: "none" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ru";
  const dict = getDictionary(locale);
  const raw = await findPost(id);
  if (!raw) {
    return {
      ...pageMetadata(locale, `post/${id}`, {
        title: dict.post.notFoundTitle,
        description: dict.blog.meta.description,
        ogLocale: dict.meta.ogLocale,
      }),
      robots: { index: false, follow: false },
    };
  }
  const p = localizePost(raw, locale);
  return pageMetadata(locale, `post/${id}`, {
    title: p.title,
    description: clip(plainText(p.content)) || dict.blog.meta.description,
    ogLocale: dict.meta.ogLocale,
    image: p.image,
    ogType: "article",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ru";
  const raw = await findPost(id);
  const ld = raw ? postJsonLd(localizePost(raw, locale), id, locale) : null;

  return (
    <>
      {ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      )}
      <PostView id={id} />
    </>
  );
}

function postJsonLd(
  p: ReturnType<typeof localizePost>,
  id: string,
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    image: p.image ? [p.image] : undefined,
    datePublished: p.createdAt || undefined,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@id": "https://ansormed.uz/#organization" },
    mainEntityOfPage: localeUrl(locale, `post/${id}`),
  };
}
