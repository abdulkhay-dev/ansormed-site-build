import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProductsExplorer } from "@/components/sections/ProductsExplorer";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "ru");
  return {
    title: dict.products.meta.title,
    description: dict.products.meta.description,
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <PageHeader
        eyebrow={dict.products.header.eyebrow}
        title={<>{dict.products.header.title}</>}
        subtitle={dict.products.header.subtitle}
      />
      <section className="py-12 md:py-16">
        <Container>
          <ProductsExplorer />
        </Container>
      </section>
    </>
  );
}
