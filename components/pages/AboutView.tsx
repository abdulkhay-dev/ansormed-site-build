"use client";

import { PageHeader } from "@/components/sections/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FeatureCard, StatCard } from "@/components/cards/FeatureCard";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { Icon } from "@/components/ui/Icon";
import { useDict } from "@/components/i18n/I18nProvider";

/** Иконки направлений реабилитации — по порядку `about.rehab.items`. */
const REHAB_ICONS = [
  "Brain",
  "Bone",
  "Baby",
  "Dumbbell",
  "Footprints",
  "Bot",
  "Glasses",
  "Hand",
  "Waves",
  "Puzzle",
  "Blocks",
];

/** Иконки прочих направлений — по порядку `about.other.items`. */
const OTHER_ICONS = [
  "ScanLine",
  "Syringe",
  "Radiation",
  "HeartPulse",
  "FlaskConical",
  "Stethoscope",
  "Armchair",
  "Boxes",
];

/** Иконки ценностей — по порядку `values`. */
const VALUE_ICONS = ["Gauge", "Scale", "Users", "ShieldCheck", "TrendingUp", "HeartHandshake"];

export default function AboutView() {
  const dict = useDict();
  const a = dict.about;

  return (
    <>
      <PageHeader
        eyebrow={a.hero.eyebrow}
        title={<>{a.hero.title}</>}
        subtitle={a.hero.subtitle}
      />

      {/* Кто мы */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden rounded-[2rem] glass">
                <MediaVisual
                  seed="ansor-rehab-intro"
                  icon="Activity"
                  label={a.intro.mediaLabel}
                  className="aspect-[4/3] w-full"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col gap-5">
              <SectionHeading
                align="left"
                eyebrow={a.intro.eyebrow}
                title={<>{a.intro.title}</>}
              />
              <p className="leading-relaxed text-ink-muted">{a.intro.p1}</p>
              <p className="leading-relaxed text-ink-muted">{a.intro.p2}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Манифест: что для нас реабилитация */}
      <section className="relative overflow-hidden border-y border-line bg-base-2 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(70%_70%_at_50%_40%,#000,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[48rem] -translate-x-1/2 -translate-y-1/2 spotlight" />
        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
            <SectionHeading
              align="left"
              eyebrow={a.manifesto.eyebrow}
              title={<>{a.manifesto.title}</>}
            />
            <div className="relative">
              <span
                className="pointer-events-none absolute bottom-3 left-0 top-3 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent"
                aria-hidden="true"
              />
              <RevealGroup className="flex flex-col gap-6">
                {a.manifesto.lines.map((line) => (
                  <RevealItem key={line} className="relative pl-7">
                    <span
                      className="absolute left-0 top-[0.6em] h-2 w-2 -translate-x-1/2 rounded-full bg-signal shadow-[0_0_14px_2px_rgba(255,93,119,0.45)]"
                      aria-hidden="true"
                    />
                    <p className="font-display text-xl leading-snug text-ink md:text-2xl">
                      {line}
                    </p>
                  </RevealItem>
                ))}
              </RevealGroup>
              <Reveal delay={0.2}>
                <p className="mt-8 pl-7 leading-relaxed text-ink-muted">{a.manifesto.note}</p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Высшая цель */}
      <section className="py-20 md:py-28">
        <Container>
          <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] glass-strong px-6 py-12 text-center md:px-14 md:py-16">
            <div className="pointer-events-none absolute inset-x-0 -top-28 h-64 spotlight" />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <Eyebrow>{a.goal.eyebrow}</Eyebrow>
              <h2 className="max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.15] md:text-4xl">
                <span className="text-accent-gradient">{a.goal.title}</span>
              </h2>
              <p className="max-w-2xl text-pretty leading-relaxed text-ink-muted md:text-lg">
                {a.goal.text}
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Цифры */}
      <section className="relative overflow-hidden pb-20 md:pb-28">
        <Container className="relative z-10">
          <RevealGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {dict.stats.map((s) => (
              <RevealItem key={s.label}>
                <StatCard value={Number(s.value)} suffix={s.suffix} label={s.label} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Направления реабилитации */}
      <section className="relative py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 grid-dots opacity-20" />
        <Container className="relative z-10">
          <SectionHeading
            eyebrow={a.rehab.eyebrow}
            title={<>{a.rehab.title}</>}
            subtitle={a.rehab.subtitle}
          />
          <RevealGroup
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.06}
          >
            {a.rehab.items.map((item, i) => (
              <RevealItem key={item.title} className="h-full">
                <div className="group flex h-full gap-4 rounded-2xl border border-line bg-surface/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface hover:shadow-soft">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-wash ring-1 ring-accent/15">
                    <Icon
                      name={REHAB_ICONS[i]}
                      className="h-5 w-5 text-accent"
                      strokeWidth={1.6}
                    />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-base font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-10 max-w-3xl text-balance text-center leading-relaxed text-ink-muted">
              {a.rehab.note}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Комплексные решения — этапы работы */}
      <section className="relative overflow-hidden border-y border-line bg-base-2 py-20 md:py-28">
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-[38rem] spotlight" />
        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                align="left"
                eyebrow={a.solutions.eyebrow}
                title={<>{a.solutions.title}</>}
              />
              <Reveal delay={0.1}>
                <p className="leading-relaxed text-ink-muted">{a.solutions.text}</p>
              </Reveal>
            </div>

            <ol className="flex flex-col">
              {a.solutions.steps.map((step, i) => (
                <Reveal
                  as="li"
                  key={step.title}
                  delay={i * 0.05}
                  className="grid grid-cols-[auto_1fr] gap-5 pb-7 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <span className="label flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {i < a.solutions.steps.length - 1 && (
                      <span
                        className="mt-2 w-px flex-1 bg-gradient-to-b from-line-strong to-transparent"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1.5">
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Другие направления */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow={a.other.eyebrow}
            title={<>{a.other.title}</>}
            subtitle={a.other.subtitle}
          />
          <Reveal delay={0.1}>
            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {a.other.items.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-base-2 p-5 transition-colors duration-300 hover:bg-surface"
                >
                  <Icon
                    name={OTHER_ICONS[i]}
                    className="h-5 w-5 shrink-0 text-accent"
                    strokeWidth={1.6}
                  />
                  <span className="text-sm font-medium leading-snug text-ink">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-8 max-w-3xl text-balance text-center text-sm leading-relaxed text-ink-dim">
              {a.other.note}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Наше видение */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 grid-dots opacity-20" />
        <Container className="relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-5">
              <SectionHeading
                align="left"
                eyebrow={a.vision.eyebrow}
                title={<>{a.vision.title}</>}
              />
              <Reveal delay={0.1} className="flex flex-col gap-5">
                <p className="leading-relaxed text-ink-muted">{a.vision.p1}</p>
                <p className="leading-relaxed text-ink-muted">{a.vision.p2}</p>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <figure className="relative overflow-hidden rounded-[2rem] glass p-8 md:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
                <span
                  className="relative font-display text-6xl leading-none text-accent/40"
                  aria-hidden="true"
                >
                  “
                </span>
                <blockquote className="relative mt-2 text-balance font-display text-2xl font-semibold leading-snug text-ink md:text-3xl">
                  {a.vision.quote}
                </blockquote>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Ценности */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow={a.valuesHeading.eyebrow}
            title={<>{a.valuesHeading.title}</>}
          />
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dict.principles.map((v, i) => (
              <RevealItem key={v.title} className="h-full">
                <FeatureCard icon={VALUE_ICONS[i]} title={v.title} text={v.text} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Девиз */}
      <section className="relative overflow-hidden border-y border-line bg-base-2 py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 grid-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[46rem] -translate-x-1/2 -translate-y-1/2 spotlight" />
        <Container className="relative z-10">
          <Reveal className="flex flex-col items-center gap-5 text-center">
            <Eyebrow>{a.slogan.label}</Eyebrow>
            <p className="max-w-4xl text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              <span className="text-accent-gradient">{a.slogan.text}</span>
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Партнёры */}
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow={a.partners.eyebrow}
            title={<>{a.partners.title}</>}
            subtitle={a.partners.subtitle}
          />
          <LogoMarquee />
        </Container>
      </section>

      <CTASection />
    </>
  );
}
