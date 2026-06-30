import type { Metadata } from "next";
import { getCatalog, type ProductOut } from "@/lib/api";
import { localizeProduct } from "@/lib/catalog";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, localeUrl } from "@/lib/seo";
import ProductView from "../ProductView";

export const dynamicParams = false;

/** id всех товаров на момент сборки (один кешированный запрос каталога). */
export async function generateStaticParams() {
  const all = await getCatalog().catch(() => []);
  const ids = all.map((p) => ({ id: String(p.id) }));
  // output: export не допускает пустой список — отдаём noindex-заглушку.
  return ids.length ? ids : [{ id: "none" }];
}

function clip(s: string, n = 160): string {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

async function findProduct(id: string): Promise<ProductOut | null> {
  const all = await getCatalog().catch(() => []);
  return all.find((p) => String(p.id) === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ru";
  const dict = getDictionary(locale);
  const raw = await findProduct(id);
  if (!raw) {
    return {
      ...pageMetadata(locale, `product/${id}`, {
        title: dict.product.notFoundTitle,
        description: dict.products.meta.description,
        ogLocale: dict.meta.ogLocale,
      }),
      robots: { index: false, follow: false },
    };
  }
  const p = localizeProduct(raw, locale);
  return pageMetadata(locale, `product/${id}`, {
    title: p.name,
    description: clip(p.description) || dict.products.meta.description,
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
  const raw = await findProduct(id);
  const ld = raw ? productJsonLd(localizeProduct(raw, locale), id, locale) : null;

  return (
    <>
      {ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      )}
      <ProductView id={id} />
    </>
  );
}

function productJsonLd(
  p: ReturnType<typeof localizeProduct>,
  id: string,
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: clip(p.description, 5000) || undefined,
    image: p.images.length ? p.images : undefined,
    category: p.categoryName ?? undefined,
    offers:
      p.price != null
        ? {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "UZS",
            availability: p.available
              ? "https://schema.org/InStock"
              : "https://schema.org/PreOrder",
            url: localeUrl(locale, `product/${id}`),
          }
        : undefined,
  };
}
