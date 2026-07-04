"use client";

import dynamic from "next/dynamic";
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
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      <NeuralBrainScene reduce={!!reduce} />
    </div>
  );
}
