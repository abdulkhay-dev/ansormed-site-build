import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { BlogExplorer } from "@/components/sections/BlogExplorer";

export const metadata: Metadata = {
  title: "Блог",
  description:
    "Статьи о медицинских технологиях, диагностике, реабилитации и сервисе оборудования от экспертов Ansor Med.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Блог"
        title={<>Технологии, которые меняют медицину</>}
        subtitle="Экспертные материалы о современном оборудовании, внедрении и сервисе — простым и понятным языком."
      />
      <section className="py-12 md:py-16">
        <Container>
          <BlogExplorer />
        </Container>
      </section>
    </>
  );
}
