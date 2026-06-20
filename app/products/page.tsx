import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProductsExplorer } from "@/components/sections/ProductsExplorer";
import { categories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Продукция",
  description:
    "Каталог медицинского оборудования Ansor Med: диагностика, нейрохирургия, реабилитация, мониторинг, лаборатория и расходные материалы.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const valid = category && categories.some((c) => c.id === category);
  const initialCategory = valid ? category! : "all";

  return (
    <>
      <PageHeader
        eyebrow="Каталог продукции"
        title={<>Оборудование, которому доверяют клиники</>}
        subtitle="Подберите технику по категории или найдите конкретную модель. По каждой позиции — характеристики и быстрый запрос цены."
      />
      <section className="py-12 md:py-16">
        <Container>
          <ProductsExplorer initialCategory={initialCategory} />
        </Container>
      </section>
    </>
  );
}
