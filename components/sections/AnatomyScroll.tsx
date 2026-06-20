"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StageDef } from "@/components/three/AnatomyScene";

const AnatomyScene = dynamic(() => import("@/components/three/AnatomyScene"), {
  ssr: false,
});

interface Stage extends StageDef {
  key: string;
  label: string;
  title: string;
  text: string;
}

const STAGES: Stage[] = [
  {
    key: "body",
    label: "Ansor Med",
    title: "Весь организм под контролем",
    text: "Поставляем оборудование для каждой области медицины — более 1000 клиник по всему Узбекистану доверяют нам.",
    yFrac: 0.53,
    zoom: 0.9,
  },
  {
    key: "head",
    label: "Неврология · Радиология",
    title: "Голова и нервная система",
    text: "МРТ, КТ и нейродиагностика экспертного класса. Точные изображения — для точных решений врача.",
    yFrac: 0.9,
    zoom: 3.2,
  },
  {
    key: "torso",
    label: "Кардиология · Диагностика",
    title: "Сердце и внутренние органы",
    text: "УЗИ-аппараты, ЭКГ, мониторинг пациента и эндоскопия — видим то, что скрыто от глаз.",
    yFrac: 0.64,
    zoom: 2.3,
  },
  {
    key: "arms",
    label: "Хирургия · Операционные",
    title: "Руки хирурга — наша техника",
    text: "Операционные столы, светильники, наркозно-дыхательная аппаратура и инструменты для уверенной работы.",
    yFrac: 0.58,
    zoom: 1.8,
  },
  {
    key: "legs",
    label: "Реабилитация · Ортопедия",
    title: "Возвращаем движение",
    text: "Оборудование для восстановления и физиотерапии: от первых шагов реабилитации до полного возвращения к жизни.",
    yFrac: 0.22,
    zoom: 2.1,
  },
];

const sceneStages: StageDef[] = STAGES.map((s) => ({ yFrac: s.yFrac, zoom: s.zoom }));

const NERVE_LEGEND = [
  { color: "#bfe0ff", label: "Центральная нервная система" },
  { color: "#5f9fe6", label: "Периферическая нервная система" },
] as const;

function NerveLegend({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span className="label mb-2.5 block text-white/35">Нервная система</span>
      <ul className="flex flex-col gap-2">
        {NERVE_LEGEND.map((n) => (
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
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
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
      aria-label="Оборудование для всего организма"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* faint clinical grid */}
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_70%_15%,#11203200,#070b16_70%)]" />

        {mounted && (
          <div className="absolute inset-0">
            <AnatomyScene stages={sceneStages} progress={progress} reduce={!!reduce} />
          </div>
        )}

        <span className="label absolute left-[6%] top-10 z-10 text-[#8ea2ff]">
          Карта медицины
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

        <NerveLegend className="absolute bottom-8 left-[6%] z-10 hidden md:block" />

        <div
          className={cn(
            "label absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-white/45 transition-opacity duration-500",
            nearest > 0 ? "opacity-0" : "opacity-100",
          )}
        >
          прокрутите ↓
        </div>
      </div>
    </section>
  );
}
