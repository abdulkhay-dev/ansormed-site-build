import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { Hero3D } from "@/components/three/Hero3D";
import { localizeHref, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type HeroCopy = Dictionary["hero"];

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out focus-visible:outline-none cursor-pointer whitespace-nowrap h-13 px-7 text-base";

function HeroLink({
  href,
  variant = "primary",
  lang,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  lang: Locale;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={localizeHref(lang, href)}
      className={cn(
        buttonBase,
        variant === "primary"
          ? "bg-accent text-white font-semibold shadow-[0_10px_30px_-10px_rgba(42,65,232,0.7)] hover:bg-accent-deep hover:shadow-[0_14px_40px_-10px_rgba(42,65,232,0.8)]"
          : "bg-surface text-ink border border-line-strong hover:border-accent/40 hover:bg-surface-2 shadow-soft",
      )}
    >
      {children}
    </Link>
  );
}

export function Hero({ lang, hero: h }: { lang: Locale; hero: HeroCopy }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.5]" />
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent)]">
        <div className="absolute inset-0 grid-lines opacity-40" />
      </div>

      <div className="container-x relative grid items-center gap-10 pb-16 pt-28 md:pb-24 md:pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        {/* Copy */}
        <div className="order-2 flex flex-col items-start lg:order-1">
          <span className="label inline-flex items-center gap-2 text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            {h.badge}
          </span>

          <h1 className="mt-6 text-[2rem] font-semibold leading-[1.02] tracking-tight text-ink sm:text-4xl md:text-5xl">
            {h.titlePre}
            <span className="text-accent-gradient">{h.titleAccent}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            {h.subtitle}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <HeroLink href="/products" lang={lang}>
              {h.ctaCatalog}
              <ArrowRight className="h-4 w-4" />
            </HeroLink>
            <HeroLink href="/contacts" variant="secondary" lang={lang}>
              <Phone className="h-4 w-4" />
              {h.ctaContact}
            </HeroLink>
          </div>

          <dl className="mt-12 grid w-full max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
            <HeroStat value={h.stats.deliveries.value} label={h.stats.deliveries.label} />
            <HeroStat value={h.stats.years.value} label={h.stats.years.label} />
            <HeroStat value={h.stats.clinics.value} label={h.stats.clinics.label} />
          </dl>
        </div>

        {/* 3D instrument viewport */}
        <div className="order-1 lg:order-2">
          <InstrumentViewport />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        {value}
      </dt>
      <dd className="label text-ink-dim">{label}</dd>
    </div>
  );
}

function InstrumentViewport() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      {/* soft accent glow behind model */}
      <div className="pointer-events-none absolute inset-0 spotlight" />

      {/* the 3D model */}
      <Hero3D className="absolute inset-0" />

      {/* calibration brackets */}
      <Bracket className="left-0 top-0" />
      <Bracket className="right-0 top-0 rotate-90" />
      <Bracket className="bottom-0 right-0 rotate-180" />
      <Bracket className="bottom-0 left-0 -rotate-90" />

      {/* readouts */}
      <span className="label absolute left-3 top-3 text-ink-dim">
        fig.01 — neural model
      </span>
      <span className="label absolute bottom-3 right-3 text-ink-dim">
        cortex / live
      </span>
      <span className="label absolute right-3 top-3 flex items-center gap-1.5 text-ink-dim">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
        rec
      </span>

      {/* center crosshair tick */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-line-strong" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-line-strong" />
    </div>
  );
}

function Bracket({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={`absolute h-6 w-6 text-accent ${className ?? ""}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
