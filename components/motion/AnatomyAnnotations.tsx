"use client";

import {
  Activity,
  Atom,
  Brain,
  Dna,
  Heart,
  HeartPulse,
  Microscope,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";

/** Иконки/размеры/задержки — в том же порядке, что ANNO_ANCHORS. */
const ANNOTATIONS: { Icon: LucideIcon; size: number; delay: number }[] = [
  { Icon: Brain, size: 50, delay: 0.05 },
  { Icon: Heart, size: 54, delay: 0.16 },
  { Icon: Activity, size: 50, delay: 0.28 },
  { Icon: Dna, size: 56, delay: 0.22 },
  { Icon: Atom, size: 52, delay: 0.4 },
  { Icon: HeartPulse, size: 54, delay: 0.24 },
  { Icon: Microscope, size: 46, delay: 0.5 },
  { Icon: Stethoscope, size: 48, delay: 0.46 },
];

/**
 * DOM-оверлей: рисует иконки + линии-выноски + бегущий импульс по позициям,
 * которые каждый кадр считает реальной 3D-камерой AnatomyScene и кладёт в
 * `positions` (плоский массив [iconX%, iconY%, nodeX%, nodeY%, …]).
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
  const rootRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    let shown = false;

    const tick = () => {
      const pos = positions.current;
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (pos && pos.length >= ANNOTATIONS.length * 4 && w > 0 && h > 0) {
        for (let i = 0; i < ANNOTATIONS.length; i++) {
          const ix = (pos[i * 4] / 100) * w;
          const iy = (pos[i * 4 + 1] / 100) * h;
          const nx = (pos[i * 4 + 2] / 100) * w;
          const ny = (pos[i * 4 + 3] / 100) * h;

          const iconEl = iconRefs.current[i];
          if (iconEl) {
            iconEl.style.left = `${ix}px`;
            iconEl.style.top = `${iy}px`;
          }
          const lineEl = lineRefs.current[i];
          if (lineEl) {
            const dx = nx - ix;
            const dy = ny - iy;
            const dist = Math.hypot(dx, dy);
            const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
            lineEl.style.left = `${ix}px`;
            lineEl.style.top = `${iy}px`;
            lineEl.style.width = `${dist}px`;
            lineEl.style.transform = `rotate(${ang}deg)`;
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
  }, [positions]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[5] overflow-hidden opacity-0 transition-opacity duration-700",
        className,
      )}
    >
      {ANNOTATIONS.map((a, i) => (
        <div key={i}>
          {/* leader line + node (origin pinned to the icon, reaching the body) */}
          <div
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 h-px origin-left"
          >
            <div className="h-px w-full bg-gradient-to-r from-accent/0 via-accent/45 to-accent-soft/90" />
            <span
              className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent-soft"
              style={{ boxShadow: "0 0 8px var(--color-accent-soft)" }}
            />
            {/* бегущий импульс: тонкий светящийся отрезок вдоль линии */}
            {!reduce && (
              <span
                className="absolute top-1/2 h-px w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                style={{
                  boxShadow: "0 0 5px 0.5px var(--color-accent-soft)",
                  animation: "anno-flow 2s linear infinite",
                  animationDelay: `${a.delay}s`,
                }}
              />
            )}
          </div>

          {/* icon badge */}
          <div
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
            style={{ width: a.size, height: a.size }}
          >
            {/* статичное мягкое свечение сзади (не мигает) */}
            <div className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-xl" />
            <div className="grid h-full w-full place-items-center rounded-full glass shadow-float ring-1 ring-accent/25">
              <a.Icon
                className="text-accent-soft"
                strokeWidth={1.5}
                style={{ width: a.size * 0.42, height: a.size * 0.42 }}
              />
            </div>
            {/* вспышка самого кружка в момент прихода точки */}
            {!reduce && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-accent-soft/35 ring-2 ring-accent-soft"
                style={{ animation: "anno-ring 2s linear infinite", animationDelay: `${a.delay}s` }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
