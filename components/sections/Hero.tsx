"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Hero3D } from "@/components/three/Hero3D";
import { ButtonLink } from "@/components/ui/Button";
import { EASE } from "@/lib/utils";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.5]" />
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent)]">
        <div className="absolute inset-0 grid-lines opacity-40" />
      </div>

      <div className="container-x relative grid items-center gap-10 pb-16 pt-28 md:pb-24 md:pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        {/* Copy */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="order-2 flex flex-col items-start lg:order-1"
        >
          <motion.span
            variants={item}
            className="label inline-flex items-center gap-2 text-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Медтехника · Нейротехнологии · Узбекистан
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-[2.6rem] font-semibold leading-[0.98] tracking-tight text-ink sm:text-6xl md:text-7xl"
          >
            Оборудование,
            <br />
            которому{" "}
            <span className="text-accent-gradient">доверяют клиники</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted"
          >
            Ansor Med поставляет, монтирует и обслуживает высокотехнологичную
            медтехнику по всему Узбекистану — от диагностики и нейрохирургии до
            реабилитации и мониторинга пациентов.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <ButtonLink href="/products" size="lg">
              Каталог продукции
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/contacts" variant="secondary" size="lg">
              <Phone className="h-4 w-4" />
              Связаться с нами
            </ButtonLink>
          </motion.div>

          <motion.dl
            variants={item}
            className="mt-12 grid w-full max-w-md grid-cols-3 gap-6 border-t border-line pt-6"
          >
            <HeroStat value="500+" label="поставок" />
            <HeroStat value="10 лет" label="на рынке" />
            <HeroStat value="1000+" label="клиник" />
          </motion.dl>
        </motion.div>

        {/* 3D instrument viewport */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          className="order-1 lg:order-2"
        >
          <InstrumentViewport />
        </motion.div>
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
