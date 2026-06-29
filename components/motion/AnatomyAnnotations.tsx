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

/** Stage camera config — mirrors what AnatomyScene receives. */
export interface AnnoStage {
  yFrac: number;
  zoom: number;
}

type Anno = {
  Icon: LucideIcon;
  size: number;
  /**
   * Anchor points in the model's own frame:
   *  - bx: horizontal offset from the body centerline, in units of body height
   *    (±0.5 ≈ fingertips of the out-stretched arms)
   *  - by: height as a fraction of body height measured from the feet (0) to
   *    the crown (≈1)
   * `icon` is where the badge floats; `node` is the point it pins to.
   */
  icon: { bx: number; by: number };
  node: { bx: number; by: number };
  delay: number;
};

/**
 * Annotations laid out around the figure. Because they live in the model's
 * coordinate frame, they pan and scale together with it as the camera moves.
 */
const ANNOTATIONS: Anno[] = [
  // top — just above the head
  { Icon: Brain, size: 50, node: { bx: 0.0, by: 0.94 }, icon: { bx: 0.0, by: 1.07 }, delay: 0.05 },
  // left arc, hugging the head -> chest -> waist with short leaders
  { Icon: Heart, size: 54, node: { bx: -0.12, by: 0.88 }, icon: { bx: -0.27, by: 0.95 }, delay: 0.16 },
  { Icon: Activity, size: 50, node: { bx: -0.17, by: 0.75 }, icon: { bx: -0.34, by: 0.78 }, delay: 0.28 },
  { Icon: Dna, size: 56, node: { bx: -0.17, by: 0.61 }, icon: { bx: -0.34, by: 0.62 }, delay: 0.22 },
  { Icon: Atom, size: 52, node: { bx: -0.14, by: 0.5 }, icon: { bx: -0.28, by: 0.48 }, delay: 0.4 },
  // right arc, kept in the upper band to clear the text panel
  { Icon: HeartPulse, size: 54, node: { bx: 0.12, by: 0.88 }, icon: { bx: 0.27, by: 0.95 }, delay: 0.24 },
  { Icon: Microscope, size: 46, node: { bx: 0.18, by: 0.76 }, icon: { bx: 0.35, by: 0.79 }, delay: 0.5 },
  { Icon: Stethoscope, size: 48, node: { bx: 0.16, by: 0.63 }, icon: { bx: 0.32, by: 0.64 }, delay: 0.46 },
];

/** Fraction of body height visible vertically at zoom = 1 (matches the scene). */
const SPAN = 1.05;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * DOM overlay that projects model-frame anchor points to the screen every
 * frame, so the floating medical icons read as part of the 3D body — they
 * track the camera's pan and zoom as the user scrolls the section.
 */
export function AnatomyAnnotations({
  stages,
  progress,
  reduce,
  className,
}: {
  stages: AnnoStage[];
  progress: RefObject<number>;
  reduce: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const smooth = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || stages.length === 0) return;

    const n = stages.length - 1;
    let raf = 0;
    let shown = false;

    const tick = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (w > 0 && h > 0) {
        // Smoothed scroll progress -> interpolated camera (same shape as scene).
        const p = reduce ? 0 : progress.current ?? 0;
        const target = p * n;
        smooth.current += (target - smooth.current) * 0.08;
        const pCur = smooth.current;
        const i0 = Math.min(n, Math.max(0, Math.floor(pCur)));
        const i1 = Math.min(n, i0 + 1);
        let f = pCur - i0;
        f = f * f * (3 - 2 * f);
        const cyFrac = lerp(stages[i0].yFrac, stages[i1].yFrac, f);
        const zoom = lerp(stages[i0].zoom, stages[i1].zoom, f);

        const hv = SPAN / zoom / 2; // half of the visible vertical span (body-height units)
        const hh = hv * (w / h); // half horizontal span, corrected for aspect

        // Project a model-frame point to screen pixels.
        const project = (bx: number, by: number) => ({
          x: (0.5 + bx / hh / 2) * w,
          y: (0.5 + (cyFrac - by) / hv / 2) * h,
        });

        for (let i = 0; i < ANNOTATIONS.length; i++) {
          const a = ANNOTATIONS[i];
          const ip = project(a.icon.bx, a.icon.by);
          const np = project(a.node.bx, a.node.by);

          const iconEl = iconRefs.current[i];
          if (iconEl) {
            iconEl.style.left = `${ip.x}px`;
            iconEl.style.top = `${ip.y}px`;
          }
          const lineEl = lineRefs.current[i];
          if (lineEl) {
            const dx = np.x - ip.x;
            const dy = np.y - ip.y;
            const dist = Math.hypot(dx, dy);
            const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
            // Anchor at the icon centre and span the full distance; the badge
            // paints over the inner stub, so the node lands exactly on the body.
            lineEl.style.left = `${ip.x}px`;
            lineEl.style.top = `${ip.y}px`;
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
  }, [stages, progress, reduce]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-700",
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
            style={{ transitionDelay: `${a.delay}s` }}
          >
            <div className="h-px w-full bg-gradient-to-r from-accent/0 via-accent/45 to-accent-soft/90" />
            <span
              className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent-soft"
              style={{ boxShadow: "0 0 8px var(--color-accent-soft)" }}
            />
          </div>

          {/* icon badge */}
          <div
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
            style={{ width: a.size, height: a.size }}
          >
            <div className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-xl" />
            <div className="grid h-full w-full place-items-center rounded-full glass shadow-float ring-1 ring-accent/25">
              <a.Icon
                className="text-accent-soft"
                strokeWidth={1.5}
                style={{ width: a.size * 0.42, height: a.size * 0.42 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
