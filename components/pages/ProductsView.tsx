"use client";

import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProductsExplorer } from "@/components/sections/ProductsExplorer";
import { useDict } from "@/components/i18n/I18nProvider";

export default function ProductsView() {
  const dict = useDict();
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
