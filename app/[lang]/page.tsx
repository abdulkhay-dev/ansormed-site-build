import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { AnatomyScroll } from "@/components/sections/AnatomyScroll";
import { CTASection } from "@/components/sections/CTASection";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FeatureCard, StatCard } from "@/components/cards/FeatureCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { ButtonLink } from "@/components/ui/Button";
import { statValues } from "@/lib/data/site";
import { getCategories } from "@/lib/data/categories";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const categories = getCategories(lang);

  return (
    <>
      <Hero />

      {/* Advantages */}
      <section className="relative py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow={dict.home.advantages.eyebrow}
            title={<>{dict.home.advantages.title}</>}
            subtitle={dict.home.advantages.subtitle}
          />
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dict.advantages.map((a, i) => (
              <RevealItem key={a.title}>
                <FeatureCard
                  icon={["ShieldCheck", "Wrench", "Truck", "GraduationCap"][i]}
                  title={a.title}
                  text={a.text}
                />
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
              eyebrow={dict.home.categories.eyebrow}
              title={<>{dict.home.categories.title}</>}
              subtitle={dict.home.categories.subtitle}
            />
            <Reveal>
              <ButtonLink href="/products" variant="secondary">
                {dict.home.categories.viewAll}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </Reveal>
          </div>
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <RevealItem key={c.id}>
                <CategoryCard category={c} cta={dict.home.categories.cardCta} />
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
            {dict.stats.map((s, i) => (
              <RevealItem key={s.label}>
                <StatCard value={statValues[i]} suffix={s.suffix} label={s.label} />
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
              eyebrow={dict.home.blog.eyebrow}
              title={<>{dict.home.blog.title}</>}
              subtitle={dict.home.blog.subtitle}
            />
            <Reveal>
              <ButtonLink href="/blog" variant="secondary">
                {dict.home.blog.viewAll}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </Reveal>
          </div>
          <LatestPosts />
        </Container>
      </section>

      <CTASection />
    </>
  );
}
