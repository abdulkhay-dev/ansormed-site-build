"use client";

import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { BlogExplorer } from "@/components/sections/BlogExplorer";
import { useDict } from "@/components/i18n/I18nProvider";

export default function BlogView() {
  const dict = useDict();
  return (
    <>
      <PageHeader
        eyebrow={dict.blog.header.eyebrow}
        title={<>{dict.blog.header.title}</>}
        subtitle={dict.blog.header.subtitle}
      />
      <section className="py-12 md:py-16">
        <Container>
          <BlogExplorer />
        </Container>
      </section>
    </>
  );
}
