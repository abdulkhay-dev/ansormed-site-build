"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
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
import { useEffect, useRef, useState } from "react";
import { cn, EASE } from "@/lib/utils";

export type IconSpec = {
  Icon: LucideIcon;
  /** position as CSS top/left strings (percentages keep it responsive) */
  top: string;
  left: string;
  /** frame diameter in px */
  size: number;
  /** parallax depth 0..1 — bigger reacts more to the pointer */
  depth: number;
  /** entrance + float offset in seconds */
  delay: number;
  /**
   * Exact point on the model the leader line should land on, in percent of
   * the layer. Used when the layer is rendered with `connect="pin"`.
   */
  target?: { x: number; y: number };
};

/** Scattered medical icons, roughly matching the reference composition. */
const ICONS: IconSpec[] = [
  { Icon: Heart, top: "13%", left: "5%", size: 60, depth: 0.9, delay: 0.05 },
  { Icon: Dna, top: "15%", left: "87%", size: 64, depth: 1, delay: 0.18 },
  { Icon: Activity, top: "49%", left: "2%", size: 52, depth: 0.7, delay: 0.32 },
  { Icon: Stethoscope, top: "29%", left: "57%", size: 46, depth: 0.45, delay: 0.46 },
  { Icon: HeartPulse, top: "70%", left: "90%", size: 56, depth: 0.85, delay: 0.24 },
  { Icon: Atom, top: "79%", left: "11%", size: 58, depth: 0.95, delay: 0.4 },
  { Icon: Microscope, top: "87%", left: "45%", size: 50, depth: 0.6, delay: 0.55 },
  { Icon: Brain, top: "33%", left: "32%", size: 44, depth: 0.35, delay: 0.6 },
];

/**
 * Composition tuned for a centered full-height anatomy model: a loose
 * constellation around the figure that steers clear of the right-hand
 * text panel.
 */
export const ANATOMY_ICONS: IconSpec[] = [
  // top — points down onto the head
  { Icon: Brain, top: "7%", left: "41%", size: 50, depth: 0.5, delay: 0.05, target: { x: 41, y: 16 } },
  // left flank — lines reach right onto the torso
  { Icon: Heart, top: "20%", left: "24%", size: 56, depth: 0.85, delay: 0.18, target: { x: 37, y: 31 } },
  { Icon: Activity, top: "41%", left: "20%", size: 50, depth: 1, delay: 0.3, target: { x: 38, y: 42 } },
  { Icon: Dna, top: "61%", left: "22%", size: 58, depth: 0.9, delay: 0.22, target: { x: 39, y: 55 } },
  { Icon: Atom, top: "81%", left: "27%", size: 54, depth: 0.95, delay: 0.42, target: { x: 40, y: 67 } },
  // right side — kept clear of the text panel (top + bottom corners)
  { Icon: HeartPulse, top: "10%", left: "66%", size: 54, depth: 0.9, delay: 0.26, target: { x: 45, y: 22 } },
  { Icon: Microscope, top: "25%", left: "80%", size: 44, depth: 0.45, delay: 0.55, target: { x: 46, y: 31 } },
  { Icon: Stethoscope, top: "84%", left: "64%", size: 48, depth: 0.6, delay: 0.5, target: { x: 44, y: 63 } },
];

/**
 * Композиция вокруг центрированной фигуры человека (Hero): иконки по периметру,
 * линии-выноски тянутся к точкам на теле. `target` — в процентах слоя (квадрат).
 */
export const FIGURE_ICONS: IconSpec[] = [
  { Icon: Brain, top: "2%", left: "42%", size: 46, depth: 0.5, delay: 0.05, target: { x: 50, y: 19 } },
  { Icon: Heart, top: "14%", left: "8%", size: 52, depth: 0.9, delay: 0.18, target: { x: 45, y: 38 } },
  { Icon: HeartPulse, top: "10%", left: "80%", size: 52, depth: 0.9, delay: 0.3, target: { x: 55, y: 36 } },
  { Icon: Activity, top: "42%", left: "1%", size: 48, depth: 1, delay: 0.24, target: { x: 46, y: 50 } },
  { Icon: Stethoscope, top: "34%", left: "88%", size: 44, depth: 0.6, delay: 0.42, target: { x: 55, y: 46 } },
  { Icon: Dna, top: "74%", left: "7%", size: 54, depth: 0.85, delay: 0.36, target: { x: 47, y: 64 } },
  { Icon: Atom, top: "78%", left: "82%", size: 50, depth: 0.95, delay: 0.5, target: { x: 54, y: 64 } },
  { Icon: Microscope, top: "88%", left: "46%", size: 44, depth: 0.6, delay: 0.6, target: { x: 50, y: 74 } },
];

interface FloatingIconsProps {
  className?: string;
  /** Override the default icon composition. */
  icons?: IconSpec[];
  /**
   * Point the leader lines aim at, in percent of the layer (the model
   * center). Defaults to the layer centre. Used as a fallback when an icon
   * has no `target` of its own.
   */
  focal?: { x: number; y: number };
  /**
   * "stub" — short fixed leader pointing toward `focal` (good for a loose
   * scatter). "pin" — leader stretches to each icon's exact `target` point
   * on the model, like anatomical annotations.
   */
  connect?: "stub" | "pin";
}

/**
 * Decorative layer of floating medical icons in glass frames, each tied to
 * the model by a leader line + node, with a pointer-driven parallax. Purely
 * cosmetic — `pointer-events-none`, `aria-hidden`, and disabled when the
 * user prefers reduced motion.
 */
export function FloatingIcons({
  className,
  icons = ICONS,
  focal = { x: 50, y: 48 },
  connect = "stub",
}: FloatingIconsProps) {
  const reduce = useReducedMotion();

  // Live layer size so "pin" leaders reach their target in real pixels,
  // independent of the layer's aspect ratio.
  const layerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Normalised pointer position, -1..1 on each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 55, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 55, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 2);
      py.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, reduce]);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {icons.map((spec, i) => (
        <FloatingIcon
          key={i}
          spec={spec}
          focal={focal}
          connect={connect}
          box={box}
          sx={sx}
          sy={sy}
          reduce={reduce}
        />
      ))}
    </div>
  );
}

function FloatingIcon({
  spec,
  focal,
  connect,
  box,
  sx,
  sy,
  reduce,
}: {
  spec: IconSpec;
  focal: { x: number; y: number };
  connect: "stub" | "pin";
  box: { w: number; h: number };
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduce: boolean | null;
}) {
  const { Icon, top, left, size, depth, delay } = spec;
  // Pointer parallax — deeper icons drift further.
  const x = useTransform(sx, (v) => v * depth * 28);
  const y = useTransform(sy, (v) => v * depth * 28);

  const ix = parseFloat(left);
  const iy = parseFloat(top);
  const target = spec.target ?? focal;

  let angle: number;
  let reach: number;
  if (connect === "pin" && box.w > 0 && box.h > 0) {
    // Real-pixel vector from the icon centre to its target on the model, so
    // the line actually lands on the point regardless of aspect ratio.
    const dx = ((target.x - ix) / 100) * box.w;
    const dy = ((target.y - iy) / 100) * box.h;
    angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    reach = Math.max(0, Math.hypot(dx, dy) - size / 2 - 4);
  } else {
    // Short leader pointing toward the focal point.
    angle = (Math.atan2(focal.y - iy, focal.x - ix) * 180) / Math.PI;
    reach = 30 + depth * 34;
  }

  return (
    <motion.div
      className="absolute"
      style={{ top, left, x: reduce ? 0 : x, y: reduce ? 0 : y }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{
          duration: 5 + depth * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      >
        <IconBadge
          Icon={Icon}
          size={size}
          angle={angle}
          reach={reach}
          delay={delay}
          reduce={!!reduce}
        />
      </motion.div>
    </motion.div>
  );
}

function IconBadge({
  Icon,
  size,
  angle,
  reach,
  delay,
  reduce,
}: {
  Icon: LucideIcon;
  size: number;
  angle: number;
  reach: number;
  delay: number;
  reduce: boolean;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* leader line + node aimed at the model, like the reference */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div
          className="absolute top-0 -translate-y-1/2"
          style={{ left: size / 2 - 2, width: reach }}
        >
          <div className="h-px w-full bg-gradient-to-r from-accent/0 via-accent/40 to-accent-soft/80" />
          <span
            className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent-soft"
            style={{ boxShadow: "0 0 8px var(--color-accent-soft)" }}
          />
          {/* бегущий импульс: «вытекает» из тела (узел) к иконке */}
          {!reduce && reach > 12 && (
            <motion.span
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white"
              style={{ boxShadow: "0 0 6px 1px var(--color-accent-soft)" }}
              animate={{ left: ["100%", "0%"], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1.9,
                repeat: Infinity,
                ease: "linear",
                delay: delay + 0.4,
              }}
            />
          )}
        </div>
      </div>

      {/* soft accent glow */}
      <div className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-xl" />

      {/* frame */}
      <div className="relative grid h-full w-full place-items-center rounded-full glass shadow-float ring-1 ring-accent/25">
        <Icon
          className="text-accent-soft"
          strokeWidth={1.5}
          style={{ width: size * 0.42, height: size * 0.42 }}
        />
      </div>
    </div>
  );
}
