import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { AnatomyScroll } from "@/components/sections/AnatomyScroll";
import { CTASection } from "@/components/sections/CTASection";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FeatureCard, StatCard } from "@/components/cards/FeatureCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { BlogCard } from "@/components/cards/BlogCard";
import { ButtonLink } from "@/components/ui/Button";
import { advantages, stats } from "@/lib/data/site";
import { categories } from "@/lib/data/categories";
import { posts } from "@/lib/data/posts";

export default function HomePage() {
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <Hero />

      {/* Advantages */}
      <section className="relative py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Почему Ansor Med"
            title={<>Надёжный партнёр для современной клиники</>}
            subtitle="Мы отвечаем не только за поставку, но и за то, чтобы оборудование работало без сбоев на всём жизненном цикле."
          />
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <RevealItem key={a.title}>
                <FeatureCard icon={a.icon} title={a.title} text={a.text} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Anatomy scrollytelling — human model reveals region by region */}
      <AnatomyScroll />

      {/* Categories */}
      <section className="relative py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 grid-dots opacity-20" />
        <Container className="relative z-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Каталог"
              title={<>Популярные категории оборудования</>}
              subtitle="Полный спектр медтехники — от диагностики до расходных материалов."
            />
            <Reveal>
              <ButtonLink href="/products" variant="secondary">
                Весь каталог
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </Reveal>
          </div>
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <RevealItem key={c.id}>
                <CategoryCard category={c} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[50rem] -translate-x-1/2 -translate-y-1/2 spotlight" />
        <Container className="relative z-10">
          <RevealGroup className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((s) => (
              <RevealItem key={s.label}>
                <StatCard value={s.value} suffix={s.suffix} label={s.label} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Blog preview */}
      <section className="relative py-20 md:py-28">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Блог"
              title={<>Экспертиза и тренды медтехники</>}
              subtitle="Разбираем технологии, делимся опытом внедрения и сервиса."
            />
            <Reveal>
              <ButtonLink href="/blog" variant="secondary">
                Все статьи
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </Reveal>
          </div>
          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
            {latestPosts.map((p) => (
              <RevealItem key={p.slug}>
                <BlogCard post={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
