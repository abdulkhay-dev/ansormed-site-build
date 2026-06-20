import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProductsExplorer } from "@/components/sections/ProductsExplorer";

export const metadata: Metadata = {
  title: "Продукция",
  description:
    "Каталог медицинского оборудования Ansor Med: диагностика, нейрохирургия, реабилитация, мониторинг, лаборатория и расходные материалы.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Каталог продукции"
        title={<>Оборудование, которому доверяют клиники</>}
        subtitle="Подберите технику по категории или найдите конкретную модель. По каждой позиции — характеристики и быстрый запрос цены."
      />
      <section className="py-12 md:py-16">
        <Container>
          <ProductsExplorer />
        </Container>
      </section>
    </>
  );
}
