"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDict } from "@/components/i18n/I18nProvider";
import { AnatomyAnnotations } from "@/components/motion/AnatomyAnnotations";
import type { StageDef } from "@/components/three/AnatomyScene";

const AnatomyScene = dynamic(() => import("@/components/three/AnatomyScene"), {
  ssr: false,
});

/** Числовая конфигурация сцены (язык-независимая); тексты берутся из словаря. */
const STAGE_CONFIG: (StageDef & { key: string })[] = [
  { key: "body", yFrac: 0.53, zoom: 0.9 },
  { key: "head", yFrac: 0.9, zoom: 3.2 },
  { key: "torso", yFrac: 0.64, zoom: 2.3 },
  { key: "arms", yFrac: 0.58, zoom: 1.8 },
  { key: "legs", yFrac: 0.22, zoom: 2.1 },
];

const sceneStages: StageDef[] = STAGE_CONFIG.map((s) => ({ yFrac: s.yFrac, zoom: s.zoom }));

function NerveLegend({
  className,
  title,
  cns,
  pns,
}: {
  className?: string;
  title: string;
  cns: string;
  pns: string;
}) {
  const items = [
    { color: "#bfe0ff", label: cns },
    { color: "#5f9fe6", label: pns },
  ];
  return (
    <div className={className}>
      <span className="label mb-2.5 block text-white/35">{title}</span>
      <ul className="flex flex-col gap-2">
        {items.map((n) => (
          <li key={n.label} className="flex items-center gap-2.5 text-xs text-white/65">
            <i
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: n.color, boxShadow: `0 0 10px ${n.color}` }}
            />
            {n.label}
          </li>
        ))}
      </ul>
    </div>
  );
}


export function AnatomyScroll() {
  const dict = useDict();
  const a = dict.anatomy;
  const STAGES = STAGE_CONFIG.map((c, i) => ({ ...c, ...a.stages[i] }));
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const annoPos = useRef<number[]>([]); // экранные % якорей (пишет сцена, читает оверлей)
  const [nearest, setNearest] = useState(0);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = r.height - vh;
      const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
      progress.current = p;
      const nn = Math.round(p * (STAGES.length - 1));
      setNearest((prev) => (prev !== nn ? nn : prev));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted]);

  const jump = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const vh = window.innerHeight || 800;
    const total = el.offsetHeight - vh;
    const top = el.offsetTop + (i / (STAGES.length - 1)) * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[520vh] bg-[#070b16]"
      aria-label={a.sectionAria}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* faint clinical grid */}
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_70%_15%,#11203200,#070b16_70%)]" />

        {mounted && (
          <div className="absolute inset-0">
            <AnatomyScene
              stages={sceneStages}
              progress={progress}
              reduce={!!reduce}
              annoOut={annoPos}
            />
          </div>
        )}

        {/* медицинские иконки с линиями к телу + бегущий импульс */}
        <AnatomyAnnotations positions={annoPos} reduce={!!reduce} />

        <span className="label absolute left-[6%] top-10 z-10 text-[#8ea2ff]">
          {a.sectionLabel}
        </span>

        {/* step text panels */}
        {STAGES.map((s, i) => (
          <div
            key={s.key}
            className={cn(
              "absolute z-10 transition-all duration-500",
              "inset-x-5 bottom-24 md:inset-x-auto md:bottom-auto md:right-[7%] md:top-1/2 md:w-[min(400px,38vw)]",
              nearest === i
                ? "opacity-100 md:-translate-y-1/2"
                : "pointer-events-none translate-y-2 opacity-0 md:translate-y-[calc(-50%+36px)]",
            )}
          >
            <span className="block text-sm font-semibold tracking-wide text-white">
              {String(i + 1).padStart(2, "0")}{" "}
              <i className="not-italic text-white/35">/ {String(STAGES.length).padStart(2, "0")}</i>
            </span>
            <span className="label mt-3 inline-flex rounded-full border border-[#5566f2]/45 px-3.5 py-1.5 text-[#8ea2ff] md:mt-4">
              {s.label}
            </span>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-[1.05] text-white md:mt-4 md:text-4xl">
              {s.title}
            </h3>
            <p className="mt-3 hidden text-sm leading-relaxed text-white/55 md:mt-4 md:block">
              {s.text}
            </p>
          </div>
        ))}

        {/* progress nav */}
        <div className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 md:left-[6%]">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={s.label}
              onClick={() => jump(i)}
              className={cn(
                "w-2 cursor-pointer rounded-full transition-all duration-300",
                nearest === i ? "h-7 bg-[#7ee3ff]" : "h-2 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>

        <NerveLegend
          className="absolute bottom-8 left-[6%] z-10 hidden md:block"
          title={a.nerveTitle}
          cns={a.cns}
          pns={a.pns}
        />

        <div
          className={cn(
            "label absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-white/45 transition-opacity duration-500",
            nearest > 0 ? "opacity-0" : "opacity-100",
          )}
        >
          {a.scrollHint}
        </div>
      </div>
    </section>
  );
}
