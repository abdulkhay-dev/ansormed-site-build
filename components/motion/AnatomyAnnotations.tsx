"use client";

import { Dna, Microscope, type LucideIcon } from "lucide-react";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { useDict } from "@/components/i18n/I18nProvider";
import { ANNO_ANCHORS, HOTSPOT_ANCHORS } from "@/lib/anatomyAnchors";

/* ---------- SVG-органы (рисованные глифы с цветным свечением) ---------- */

function OrganSvg({ glow, children }: { glow: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "70%", height: "70%", filter: `drop-shadow(0 0 6px ${glow})` }}
    >
      {children}
    </svg>
  );
}

function BrainGlyph({ color, glow }: { color: string; glow: string }) {
  return (
    <OrganSvg glow={glow}>
      <path
        d="M23 14c-6 1-10 6-9 12-3 2-4 7-2 10 1 6 6 10 12 10h2c2 3 6 4 9 3 5 2 11 0 13-5 4-2 6-7 4-11 1-5-2-10-7-11-1-5-6-9-11-8-3-2-8-2-11 0z"
        fill={color}
        fillOpacity={0.16}
        stroke={color}
      />
      <path
        d="M24 20c4 2 3 8 7 9m-12-2c5 0 6 5 4 9m17-15c-3 3-1 8-5 10m11-4c-4 1-4 6-8 6"
        stroke={color}
        strokeOpacity={0.85}
        strokeWidth={1.6}
      />
    </OrganSvg>
  );
}

function HeartGlyph({ color, glow }: { color: string; glow: string }) {
  return (
    <OrganSvg glow={glow}>
      <path d="M27 13c0-3 3-5 6-4m3 5c1-3 5-4 7-2" stroke={color} strokeWidth={1.6} strokeOpacity={0.8} />
      <path
        d="M32 52C22 45 14 37 15 27c1-8 9-11 15-6 1 1 3 1 4 0 6-5 14-2 15 6 1 10-7 18-17 25z"
        fill={color}
        fillOpacity={0.18}
        stroke={color}
      />
      <path d="M28 24c5 6 3 14 7 20" stroke={color} strokeOpacity={0.7} strokeWidth={1.4} />
    </OrganSvg>
  );
}

function LungsGlyph({ color, glow }: { color: string; glow: string }) {
  return (
    <OrganSvg glow={glow}>
      <path d="M32 10v9m0-1c0 4-3 5-6 7m6-7c0 4 3 5 6 7" stroke={color} strokeWidth={1.8} />
      <path
        d="M26 24c-8 3-12 12-12 21 0 4 3 7 7 6 4-1 6-3 6-7l1-16c0-3-1-4-2-4z"
        fill={color}
        fillOpacity={0.18}
        stroke={color}
      />
      <path
        d="M38 24c8 3 12 12 12 21 0 4-3 7-7 6-4-1-6-3-6-7l-1-16c0-3 1-4 2-4z"
        fill={color}
        fillOpacity={0.18}
        stroke={color}
      />
    </OrganSvg>
  );
}

function KidneysGlyph({ color, glow }: { color: string; glow: string }) {
  return (
    <OrganSvg glow={glow}>
      <path
        d="M25 17c-8 0-13 8-11 17 1 7 7 11 12 8 3-2 3-5 1-7-3-3-3-10 0-13 2-2 1-5-2-5z"
        fill={color}
        fillOpacity={0.18}
        stroke={color}
      />
      <path
        d="M39 17c8 0 13 8 11 17-1 7-7 11-12 8-3-2-3-5-1-7 3-3 3-10 0-13-2-2-1-5 2-5z"
        fill={color}
        fillOpacity={0.18}
        stroke={color}
      />
    </OrganSvg>
  );
}

const CELL_SPIKES = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + 0.3;
  return {
    x1: 32 + Math.cos(a) * 14,
    y1: 32 + Math.sin(a) * 14,
    x2: 32 + Math.cos(a) * 19,
    y2: 32 + Math.sin(a) * 19,
  };
});

function CellGlyph({ color, glow }: { color: string; glow: string }) {
  return (
    <OrganSvg glow={glow}>
      <circle cx={32} cy={32} r={13} fill={color} fillOpacity={0.14} stroke={color} />
      <circle cx={29} cy={34} r={5} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={1.4} />
      {CELL_SPIKES.map((s, i) => (
        <g key={i} stroke={color} strokeWidth={1.6}>
          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          <circle cx={s.x2} cy={s.y2} r={1.6} fill={color} stroke="none" />
        </g>
      ))}
    </OrganSvg>
  );
}

const ECG_WAVE = "M2 18h12l4-7 5 14 6-22 5 18 4-7h14 8";

/** Высоты столбиков «эквалайзера» (%) — статичный паттерн, анимируется по-CSS. */
const EQ_BARS = [42, 68, 52, 80, 58, 74, 46, 62, 86, 50, 70, 44];

function EcgGlyph({ color, glow, reduce }: { color: string; glow: string; reduce: boolean }) {
  const wave = ECG_WAVE;
  return (
    <svg
      viewBox="0 0 62 32"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "82%", height: "70%", filter: `drop-shadow(0 0 5px ${glow})` }}
    >
      <path d={wave} stroke={color} strokeOpacity={0.25} strokeWidth={1.6} />
      <path
        d={wave}
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray="40 90"
        style={reduce ? undefined : { animation: "hud-ecg 2.2s linear infinite" }}
      />
    </svg>
  );
}

/* ---------- Конфигурация карточек (порядок СТРОГО как в ANNO_ANCHORS) ---------- */

type AnnoDef = {
  key: "brain" | "heart" | "lungs" | "kidneys" | "cell" | "ecg" | "dna" | "lab";
  w: number;
  h: number;
  delay: number; // фаза импульса 0..1
  color: string;
  glow: string;
  Icon?: LucideIcon;
};

const ANNOTATIONS: AnnoDef[] = [
  { key: "brain", w: 72, h: 72, delay: 0.05, color: "#f6c26b", glow: "rgba(246,194,107,0.55)" },
  { key: "heart", w: 68, h: 68, delay: 0.18, color: "#ff7d8c", glow: "rgba(255,125,140,0.55)" },
  { key: "lungs", w: 72, h: 72, delay: 0.32, color: "#f58fd0", glow: "rgba(245,143,208,0.55)" },
  { key: "kidneys", w: 64, h: 64, delay: 0.46, color: "#ffb469", glow: "rgba(255,180,105,0.55)" },
  { key: "cell", w: 62, h: 62, delay: 0.6, color: "#6fe5dc", glow: "rgba(111,229,220,0.5)" },
  { key: "ecg", w: 86, h: 52, delay: 0.74, color: "#7ee3ff", glow: "rgba(126,227,255,0.5)" },
  { key: "dna", w: 52, h: 52, delay: 0.86, color: "#8ea2ff", glow: "rgba(142,162,255,0.5)", Icon: Dna },
  { key: "lab", w: 52, h: 52, delay: 0.94, color: "#8ea2ff", glow: "rgba(142,162,255,0.5)", Icon: Microscope },
];

const HOTSPOT = "#ff8a5c";
const CYCLE = 2.4; // секунд на пробег импульса по линии

function renderGlyph(a: AnnoDef, reduce: boolean) {
  switch (a.key) {
    case "brain":
      return <BrainGlyph color={a.color} glow={a.glow} />;
    case "heart":
      return <HeartGlyph color={a.color} glow={a.glow} />;
    case "lungs":
      return <LungsGlyph color={a.color} glow={a.glow} />;
    case "kidneys":
      return <KidneysGlyph color={a.color} glow={a.glow} />;
    case "cell":
      return <CellGlyph color={a.color} glow={a.glow} />;
    case "ecg":
      return <EcgGlyph color={a.color} glow={a.glow} reduce={reduce} />;
    default: {
      const I = a.Icon!;
      return (
        <I
          strokeWidth={1.5}
          style={{
            width: "46%",
            height: "46%",
            color: a.color,
            filter: `drop-shadow(0 0 5px ${a.glow})`,
          }}
        />
      );
    }
  }
}

/* ---------- Декоративный слой (статичные панели данных, сетка, силуэты) ---------- */

const MESH_LINES = [
  "63,16 70,20 70,32",
  "60,64 69,60 76,63",
  "40,20 33,16 27,20",
  "37,66 29,70 23,66",
];
const MESH_DOTS: [number, number][] = [
  [63, 16], [70, 20], [70, 32],
  [60, 64], [69, 60], [76, 63],
  [40, 20], [33, 16], [27, 20],
  [37, 66], [29, 70], [23, 66],
];

function DataRow({
  color,
  w,
  label,
  value,
}: {
  color: string;
  w: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <i className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="label w-11 shrink-0 !text-[9px] text-white/45" style={{ textTransform: "none" }}>
        {label}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-white/30" style={{ width: w }} />
      </div>
      <span className="label !text-[9px] text-white/60" style={{ textTransform: "none" }}>
        {value}
      </span>
    </div>
  );
}

const VITAL_COLORS = ["#7ee3ff", "#ff7d8c", "#ffb469", "#6fe5dc"];
const VITAL_BARS = ["72%", "55%", "64%", "60%"];

interface HudTables {
  vitals: { title: string; rows: { label: string; value: string }[] };
  scan: { title: string; ok: string };
  organs: Record<AnnoDef["key"], string>;
  hud: { ecg: string; genome: string; activity: string; activityPeriod: string };
}

function HudDecor({ reduce, tables }: { reduce: boolean; tables: HudTables }) {
  const float = (d: number) =>
    reduce ? undefined : { animation: `hud-float 7s ease-in-out ${d}s infinite` };
  return (
    <div className="hidden md:block">
      {/* тонкая сетка-меш вокруг фигуры */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {MESH_LINES.map((p) => (
          <polyline
            key={p}
            points={p}
            fill="none"
            stroke="#9ec5ff"
            strokeOpacity={0.14}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {MESH_DOTS.map(([x, y]) => (
        <i
          key={`${x}-${y}`}
          className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9ec5ff]/50"
          style={{ left: `${x}%`, top: `${y}%`, boxShadow: "0 0 6px rgba(158,197,255,0.6)" }}
        />
      ))}

      {/* сканирующая линия у головы */}
      <div className="absolute left-[24%] top-[15%] h-px w-40 bg-gradient-to-r from-[#7ee3ff]/0 via-[#7ee3ff]/70 to-[#7ee3ff]/0" />

      {/* таблица показателей пациента */}
      <div
        className="glass absolute right-[6%] top-[13%] w-52 rounded-xl p-3.5 ring-1 ring-white/10"
        style={float(0.5)}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="label !text-[9px] text-white/40">{tables.vitals.title} · 0417</span>
          <i className="h-1.5 w-1.5 rounded-full bg-[#6fe5dc]" style={{ boxShadow: "0 0 6px #6fe5dc" }} />
        </div>
        <div className="flex flex-col gap-2">
          {tables.vitals.rows.map((r, i) => (
            <DataRow
              key={r.label}
              color={VITAL_COLORS[i % VITAL_COLORS.length]}
              w={VITAL_BARS[i % VITAL_BARS.length]}
              label={r.label}
              value={r.value}
            />
          ))}
        </div>
      </div>

      {/* таблица сканирования органов: строки подсвечиваются по очереди */}
      <div
        className="glass absolute bottom-[3%] right-[5%] w-48 rounded-xl p-3.5 ring-1 ring-white/10"
        style={float(1.4)}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="label !text-[9px] text-white/40">{tables.scan.title}</span>
          <span className="label !text-[8px] text-[#6fe5dc]">● LIVE</span>
        </div>
        <div className="mb-2 h-px overflow-hidden rounded-full bg-white/10">
          <i
            className="block h-full w-1/3 rounded-full bg-[#6fe5dc]/70"
            style={reduce ? undefined : { animation: "hud-scan 2.8s linear infinite" }}
          />
        </div>
        <ul className="flex flex-col">
          {ANNOTATIONS.slice(0, 6).map((a, i) => (
            <li
              key={a.key}
              className="flex items-center gap-2 rounded-md px-1.5 py-[3px]"
              style={reduce ? undefined : { animation: `hud-row 4.2s linear ${i * 0.7}s infinite` }}
            >
              <i
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ background: a.color, boxShadow: `0 0 5px ${a.color}` }}
              />
              <span className="label flex-1 !text-[9px] text-white/50" style={{ textTransform: "none" }}>
                {tables.organs[a.key]}
              </span>
              <span className="label !text-[9px] text-[#6fe5dc]">{tables.scan.ok}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Левая колонка HUD-панелей: геном · ЭКГ · активность.
          Единый стек с фиксированным зазором — панели не наезжают друг на друга
          ни при какой высоте экрана. */}
      <div className="absolute left-[10%] top-[30%] flex w-44 flex-col gap-7">
        {/* Геномный секвенсор: спираль ДНК + дата-матрица */}
        <div className="glass rounded-xl p-3.5 ring-1 ring-white/10" style={float(1.2)}>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="label !text-[9px] text-white/40">{tables.hud.genome}</span>
            <span className="label !text-[8px] text-[#9ec5ff]">● REC</span>
          </div>
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 22 44"
              fill="none"
              className="h-11 w-[22px] shrink-0"
              style={{ filter: "drop-shadow(0 0 4px rgba(126,227,255,0.4))" }}
            >
              <path d="M5 2Q17 8 5 15 17 22 5 29 17 36 5 43" stroke="#7ee3ff" strokeWidth={1.3} strokeOpacity={0.85} />
              <path d="M17 2Q5 8 17 15 5 22 17 29 5 36 17 43" stroke="#9ec5ff" strokeWidth={1.3} strokeOpacity={0.65} />
              {[6, 12, 18, 25, 31, 37].map((y) => (
                <line key={y} x1={7} y1={y} x2={15} y2={y} stroke="#7ee3ff" strokeWidth={1} strokeOpacity={0.4} />
              ))}
            </svg>
            <div className="grid flex-1 grid-cols-5 gap-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <i
                  key={i}
                  className="h-2 rounded-[1px]"
                  style={{ background: `rgba(126,227,255,${(0.14 + ((i * 41) % 100) / 100 * 0.5).toFixed(2)})` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ЭКГ-осциллограф */}
        <div className="glass rounded-xl p-3.5 ring-1 ring-white/10" style={float(0.9)}>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !text-[9px] text-white/40">{tables.hud.ecg}</span>
            <span className="label !text-[9px] text-[#ff7d8c]" style={{ textTransform: "none" }}>
              ♥ 72
            </span>
          </div>
          <svg
            viewBox="0 0 62 32"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            preserveAspectRatio="none"
            className="h-9 w-full"
            style={{ filter: "drop-shadow(0 0 5px rgba(126,227,255,0.5))" }}
          >
            <path d={ECG_WAVE} stroke="#7ee3ff" strokeOpacity={0.22} strokeWidth={1.4} />
            <path
              d={ECG_WAVE}
              stroke="#7ee3ff"
              strokeWidth={1.8}
              strokeDasharray="40 90"
              style={reduce ? undefined : { animation: "hud-ecg 2.2s linear infinite" }}
            />
          </svg>
          <div className="mt-2 flex items-center justify-between">
            <span className="label !text-[8px] text-white/35">SYNC</span>
            <span className="label !text-[8px] text-[#6fe5dc]">● STABLE</span>
          </div>
        </div>

        {/* Спектр активности: анимированный «эквалайзер» */}
        <div className="glass rounded-xl p-3.5 ring-1 ring-white/10" style={float(0.6)}>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !text-[9px] text-white/40">{tables.hud.activity}</span>
            <span className="label !text-[8px] text-[#6fe5dc]">{tables.hud.activityPeriod}</span>
          </div>
          <div className="flex h-10 items-end gap-[3px]">
            {EQ_BARS.map((h, i) => (
              <i
                key={i}
                className="flex-1 rounded-sm bg-[#7ee3ff]/45"
                style={{
                  height: `${h}%`,
                  transformOrigin: "bottom",
                  animation: reduce
                    ? undefined
                    : `hud-eq ${(1.4 + (i % 5) * 0.2).toFixed(1)}s ease-in-out ${(i * 0.11).toFixed(2)}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Основной оверлей ---------- */

/**
 * DOM-оверлей «голограммы»: карточки органов + ломаные линии-выноски с узлами,
 * бегущие импульсы и хотспоты на суставах. Позиции каждый кадр считает реальная
 * 3D-камера AnatomyScene и кладёт в `positions`: сначала [iconX%, iconY%, nodeX%,
 * nodeY%] на карточку, затем [x%, y%] на хотспот.
 */
export function AnatomyAnnotations({
  positions,
  reduce,
  className,
}: {
  positions: RefObject<number[]>;
  reduce: boolean;
  className?: string;
}) {
  const dict = useDict();
  const anat = dict.anatomy;
  const labels = anat.organs;

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const bendRefs = useRef<(SVGGElement | null)[]>([]);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const pulseRefs = useRef<(SVGGElement | null)[]>([]);
  const hotspotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const needed = ANNOTATIONS.length * 4 + HOTSPOT_ANCHORS.length * 2;
    let raf = 0;
    let shown = false;

    const tick = (now: number) => {
      const pos = positions.current;
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (pos && pos.length >= needed && w > 0 && h > 0) {
        for (let i = 0; i < ANNOTATIONS.length; i++) {
          const ix = (pos[i * 4] / 100) * w;
          const iy = (pos[i * 4 + 1] / 100) * h;
          const nx = (pos[i * 4 + 2] / 100) * w;
          const ny = (pos[i * 4 + 3] / 100) * h;
          // излом: от карточки горизонтально, затем к точке на теле
          const bx = ix + (nx - ix) * 0.45;
          const by = iy;

          const card = cardRefs.current[i];
          if (card) {
            card.style.left = `${ix}px`;
            card.style.top = `${iy}px`;
          }
          lineRefs.current[i]?.setAttribute("points", `${ix},${iy} ${bx},${by} ${nx},${ny}`);
          bendRefs.current[i]?.setAttribute("transform", `translate(${bx},${by})`);
          nodeRefs.current[i]?.setAttribute("transform", `translate(${nx},${ny})`);

          if (!reduce) {
            // импульс бежит от тела (node) к карточке; в конце карточка вспыхивает
            const t = (now / 1000 / CYCLE + ANNOTATIONS[i].delay) % 1;
            const l1 = Math.hypot(bx - nx, by - ny);
            const l2 = Math.hypot(ix - bx, iy - by);
            const d = t * (l1 + l2);
            let px: number, py: number;
            if (d <= l1 && l1 > 0) {
              const k = d / l1;
              px = nx + (bx - nx) * k;
              py = ny + (by - ny) * k;
            } else {
              const k = l2 > 0 ? Math.min(1, (d - l1) / l2) : 1;
              px = bx + (ix - bx) * k;
              py = by + (iy - by) * k;
            }
            pulseRefs.current[i]?.setAttribute("transform", `translate(${px},${py})`);
            const ring = ringRefs.current[i];
            if (ring) {
              ring.style.opacity =
                t > 0.9 ? String(Math.sin(((t - 0.9) / 0.1) * Math.PI) * 0.9) : "0";
            }
          }
        }
        const base = ANNOTATIONS.length * 4;
        for (let i = 0; i < HOTSPOT_ANCHORS.length; i++) {
          const el = hotspotRefs.current[i];
          if (el) {
            el.style.left = `${(pos[base + i * 2] / 100) * w}px`;
            el.style.top = `${(pos[base + i * 2 + 1] / 100) * h}px`;
          }
        }
        if (!shown) {
          shown = true;
          root.style.opacity = "1";
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [positions, reduce]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[5] overflow-hidden opacity-0 transition-opacity duration-700",
        className,
      )}
    >
      <HudDecor
        reduce={reduce}
        tables={{ vitals: anat.vitals, scan: anat.scan, organs: anat.organs, hud: anat.hud }}
      />

      {/* линии-выноски, узлы и импульсы — один SVG на весь экран */}
      <svg className="absolute inset-0 h-full w-full">
        {ANNOTATIONS.map((a, i) => (
          <g key={a.key}>
            {/* линия и излом — только на md+: на телефоне карточек нет */}
            <g className="hidden md:block">
              <polyline
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                fill="none"
                stroke="#9ec5ff"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
              <g
                ref={(el) => {
                  bendRefs.current[i] = el;
                }}
              >
                <circle r={1.8} fill="#dcecff" fillOpacity={0.7} />
              </g>
            </g>
            {/* узел на теле — цвет органа */}
            <g
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
            >
              <circle r={8} fill={a.color} fillOpacity={0.18} />
              <circle r={3.2} fill={a.color} />
              <circle r={3.2} fill="none" stroke={a.color} strokeOpacity={0.6}>
                {!reduce && (
                  <animate attributeName="r" values="3.2;9;3.2" dur="2.4s" repeatCount="indefinite" />
                )}
                {!reduce && (
                  <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
                )}
              </circle>
            </g>
            {/* бегущий импульс */}
            {!reduce && (
              <g
                className="hidden md:block"
                ref={(el) => {
                  pulseRefs.current[i] = el;
                }}
              >
                <circle r={5} fill={a.color} fillOpacity={0.3} />
                <circle r={1.8} fill="#ffffff" />
              </g>
            )}
          </g>
        ))}
      </svg>

      {/* карточки органов */}
      {ANNOTATIONS.map((a, i) => (
        <div
          key={a.key}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 md:block"
          style={{ width: a.w, height: a.h }}
        >
          <div
            className="absolute inset-0 -z-10 rounded-2xl blur-xl"
            style={{ background: a.glow, opacity: 0.45 }}
          />
          <div
            className="grid h-full w-full place-items-center rounded-2xl glass shadow-float"
            style={{ boxShadow: `inset 0 0 0 1px ${a.glow}` }}
          >
            {renderGlyph(a, reduce)}
          </div>
          {/* вспышка карточки в момент прихода импульса (яркость ведёт JS) */}
          <span
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0"
            style={{ boxShadow: `0 0 18px 3px ${a.glow}, inset 0 0 10px ${a.glow}` }}
          />
          <span className="label absolute left-1/2 top-full mt-1.5 hidden -translate-x-1/2 whitespace-nowrap !text-[9px] text-white/60 md:block">
            {labels[a.key]}
          </span>
        </div>
      ))}

      {/* хотспоты на суставах */}
      {HOTSPOT_ANCHORS.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            hotspotRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2"
        >
          <i
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: HOTSPOT, boxShadow: `0 0 8px ${HOTSPOT}` }}
          />
          <i
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: HOTSPOT,
              opacity: 0.5,
              animation: reduce ? undefined : `hud-ping 2.2s ease-out ${i * 0.28}s infinite`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
