import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FeatureCard, StatCard } from "@/components/cards/FeatureCard";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { partners, statValues } from "@/lib/data/site";
import { getDictionary, isLocale } from "@/lib/i18n";

const VALUE_ICONS = ["Target", "HeartHandshake", "Sparkles", "LifeBuoy"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "ru");
  return {
    title: dict.about.meta.title,
    description: dict.about.meta.description,
  };
}

export default async function AboutPage({
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
        eyebrow={dict.about.header.eyebrow}
        title={<>{dict.about.header.title}</>}
        subtitle={dict.about.header.subtitle}
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
                  label={dict.about.mission.mediaLabel}
                  className="aspect-[4/3] w-full"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col gap-5">
              <SectionHeading
                align="left"
                eyebrow={dict.about.mission.eyebrow}
                title={<>{dict.about.mission.title}</>}
              />
              <p className="leading-relaxed text-ink-muted">
                {dict.about.mission.p1}
              </p>
              <p className="leading-relaxed text-ink-muted">
                {dict.about.mission.p2}
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
            {dict.stats.map((s, i) => (
              <RevealItem key={s.label}>
                <StatCard value={statValues[i]} suffix={s.suffix} label={s.label} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow={dict.about.valuesHeading.eyebrow}
            title={<>{dict.about.valuesHeading.title}</>}
          />
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dict.values.map((v, i) => (
              <RevealItem key={v.title}>
                <FeatureCard icon={VALUE_ICONS[i]} title={v.title} text={v.text} />
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
            eyebrow={dict.about.timelineHeading.eyebrow}
            title={<>{dict.about.timelineHeading.title}</>}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dict.timeline.map((t, i) => (
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
            eyebrow={dict.about.partners.eyebrow}
            title={<>{dict.about.partners.title}</>}
            subtitle={dict.about.partners.subtitle}
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
