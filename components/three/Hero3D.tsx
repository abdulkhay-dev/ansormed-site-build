"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const NeuralBrainScene = dynamic(() => import("./NeuralBrainScene"), {
  ssr: false,
  loading: () => <Fallback />,
});

function Fallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-56 w-56 animate-pulse rounded-full bg-accent/10 blur-2xl" />
    </div>
  );
}

/** Client-only 3D neural model. SSR disabled; reduced motion → static render. */
export function Hero3D({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 1400 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setReady(true), 700);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className={className}>
      {ready ? <NeuralBrainScene reduce={!!reduce} /> : <Fallback />}
    </div>
  );
}
