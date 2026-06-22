"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDict } from "@/components/i18n/I18nProvider";
import { EASE } from "@/lib/utils";

const NODES = [
  { x: 36, y: 42 },
  { x: 84, y: 40 },
  { x: 80, y: 82 },
  { x: 40, y: 80 },
];

/**
 * Intro preloader. Mounted in the root layout, so it runs once on full page
 * load and never re-triggers on client-side route changes.
 */
export function Preloader() {
  const dict = useDict();
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const duration = reduce ? 800 : 3200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVisible(false);
    };
    document.documentElement.style.overflow = "hidden";
    raf = requestAnimationFrame(tick);
    // Fallback: ensure dismissal even if rAF is throttled (e.g. background tab).
    const fallback = setTimeout(() => {
      setPct(100);
      setVisible(false);
    }, duration + 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [reduce]);

  useEffect(() => {
    if (!visible) document.documentElement.style.overflow = "";
  }, [visible]);

  const half = { duration: 0.8, ease: EASE, delay: 0.12 };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[200] overflow-hidden"
          aria-hidden="true"
        >
          {/* two halves that split open on exit */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-base"
            exit={{ y: "-100%" }}
            transition={half}
          >
            {/* background video — top half */}
            <video
              className="absolute left-0 top-0 h-screen w-full object-cover opacity-30"
              src="/preloader-neurons.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </motion.div>
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-base"
            exit={{ y: "100%" }}
            transition={half}
          >
            {/* background video — bottom half */}
            <video
              className="absolute bottom-0 left-0 h-screen w-full object-cover opacity-30"
              src="/preloader-neurons.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </motion.div>
          {/* seam glow line */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
            exit={{ opacity: 0, scaleX: 1.4 }}
            transition={{ duration: 0.3 }}
          />

          {/* content (fades out before the split) */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.5] [mask-image:radial-gradient(45%_45%_at_50%_45%,#000,transparent)]" />

            <svg viewBox="0 0 120 120" className="relative h-28 w-28">
              <defs>
                <linearGradient id="pre-grad" x1="0" y1="0" x2="120" y2="120">
                  <stop offset="0%" stopColor="#5566f2" />
                  <stop offset="100%" stopColor="#2a41e8" />
                </linearGradient>
              </defs>

              {/* ring */}
              <motion.circle
                cx="60" cy="60" r="50"
                fill="none" stroke="url(#pre-grad)" strokeWidth="1.5" strokeOpacity="0.4"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduce ? 0.4 : 1.2, ease: EASE }}
                style={{ transformOrigin: "60px 60px" }}
              />

              {/* synapses */}
              {NODES.map((n, i) => (
                <motion.line
                  key={`l${i}`}
                  x1="60" y1="60" x2={n.x} y2={n.y}
                  stroke="url(#pre-grad)" strokeWidth="1.6" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : 0.25 + i * 0.12, ease: EASE }}
                />
              ))}

              {/* outer nodes */}
              {NODES.map((n, i) => (
                <motion.circle
                  key={`n${i}`}
                  cx={n.x} cy={n.y} r="3.4"
                  fill="url(#pre-grad)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: reduce ? 0.1 : 0.55 + i * 0.12, ease: EASE }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              ))}

              {/* core node pulse */}
              <motion.circle
                cx="60" cy="60" r="5"
                fill="#5566f2"
                initial={{ scale: 0 }}
                animate={reduce ? { scale: 1 } : { scale: [0, 1.3, 1] }}
                transition={{ duration: 1, delay: 0.2, ease: EASE }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            </svg>

            {/* wordmark */}
            <motion.span
              className="mt-7 font-display text-2xl font-semibold tracking-tight text-ink"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduce ? 0.1 : 0.7, ease: EASE }}
            >
              Ansor<span className="text-accent"> Med</span>
            </motion.span>

            {/* scan readout + progress bar */}
            <div className="mt-8 flex w-56 items-center gap-3">
              <div className="relative h-px flex-1 bg-line-strong">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-accent"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="label w-9 text-right text-ink-dim tabular-nums">{pct}%</span>
            </div>
            <span className="label mt-3 text-ink-dim">{dict.preloader.loading}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
