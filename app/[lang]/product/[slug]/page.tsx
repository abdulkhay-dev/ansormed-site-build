import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata, byLang, metaText } from "@/lib/seo";
import { getCatalog, getProductBySlug, mediaUrl } from "@/lib/api";
import ProductView from "../ProductView";

/** Пути детальных страниц товаров (по одному на каждый slug × язык). */
export async function generateStaticParams() {
  try {
    const products = await getCatalog();
    return products.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
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

  const product = await getProductBySlug(decodeURIComponent(slug)).catch(() => null);

  // Приоритет — собственные SEO-поля товара, иначе имя/описание, иначе дефолт секции.
  const name = product ? byLang(locale, product.name_ru, product.name_uz, product.name_en) : "";
  const desc = product
    ? byLang(locale, product.description_ru, product.description_uz, product.description_en)
    : "";
  const title = product?.seo_title?.trim() || name || dict.products.meta.title;
  const description =
    product?.seo_description?.trim() || metaText(desc) || dict.products.meta.description;
  const image = product?.cover_image ? mediaUrl(product.cover_image) : null;

  return pageMetadata(locale, `product/${slug}`, {
    title,
    description,
    keywords: product?.seo_keywords ?? undefined,
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
  return <ProductView slug={decodeURIComponent(slug)} />;
}
