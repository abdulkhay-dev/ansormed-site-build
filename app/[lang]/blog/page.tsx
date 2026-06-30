import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { BlogExplorer } from "@/components/sections/BlogExplorer";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "ru";
  const dict = getDictionary(locale);
  return pageMetadata(locale, "blog", {
    title: dict.blog.meta.title,
    description: dict.blog.meta.description,
    ogLocale: dict.meta.ogLocale,
  });
}

export default async function BlogPage({
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
