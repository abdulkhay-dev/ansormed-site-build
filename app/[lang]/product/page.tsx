import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import ProductView from "./ProductView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "ru";
  const dict = getDictionary(locale);
  return pageMetadata(locale, "product", {
    title: dict.products.meta.title,
    description: dict.products.meta.description,
    ogLocale: dict.meta.ogLocale,
  });
}

export default function Page() {
  return <ProductView />;
}
