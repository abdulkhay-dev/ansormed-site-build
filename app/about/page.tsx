import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FeatureCard, StatCard } from "@/components/cards/FeatureCard";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { values, stats, partners, timeline, site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "Ansor Med — поставщик современного медицинского оборудования в Узбекистане. История, миссия, ценности и партнёры компании.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="О компании"
        title={<>Технологии на службе здоровья</>}
        subtitle={`${site.name} — это команда инженеров и медицинских специалистов, которые более 5 лет оснащают клиники Узбекистана оборудованием мирового уровня.`}
      />

      {/* Mission */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden rounded-[2rem] glass">
                <MediaVisual
                  seed="ansor-mission-brain"
                  icon="Brain"
                  label="Нейротехнологии Ansor Med"
                  className="aspect-[4/3] w-full"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col gap-5">
              <SectionHeading
                align="left"
                eyebrow="Наша миссия"
                title={<>Делать передовую медицину доступной</>}
              />
              <p className="leading-relaxed text-ink-muted">
                Мы убеждены, что качество медицинской помощи начинается с
                оборудования. Поэтому привозим решения, которые задают стандарт
                современной диагностики, хирургии и реабилитации — и сопровождаем
                их на всём жизненном цикле.
              </p>
              <p className="leading-relaxed text-ink-muted">
                От первой консультации до обучения персонала и сервисного
                обслуживания — мы остаёмся рядом с клиникой как технологический
                партнёр, а не просто поставщик.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[46rem] -translate-x-1/2 -translate-y-1/2 spotlight" />
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

      {/* Values */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Ценности"
            title={<>Принципы, на которых строим работу</>}
          />
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <RevealItem key={v.title}>
                <FeatureCard icon={v.icon} title={v.title} text={v.text} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Timeline */}
      <section className="relative py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 grid-dots opacity-20" />
        <Container className="relative z-10">
          <SectionHeading
            align="left"
            eyebrow="История"
            title={<>Путь компании</>}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <div className="relative flex h-full flex-col gap-3 rounded-3xl glass p-6">
                  <span className="font-display text-3xl font-bold text-accent-gradient">
                    {t.year}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {t.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{t.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Partners */}
      <section className="py-12 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Партнёры"
            title={<>Работаем с ведущими брендами</>}
            subtitle="Поставляем оборудование проверенных мировых производителей медтехники."
          />
          <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((p) => (
              <RevealItem key={p}>
                <div className="flex h-20 items-center justify-center rounded-2xl glass px-4 text-center font-display text-base font-semibold text-ink-muted transition-colors duration-200 hover:text-accent">
                  {p}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
