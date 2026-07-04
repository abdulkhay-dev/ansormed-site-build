"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "@/lib/utils";

/**
 * Entrance transition rendered by app/template.tsx — re-mounts on every
 * navigation, producing a soft fade/blur reveal plus a quick synapse flash.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <>
      {/* Synapse impulse flash sweeping across the neural network */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] spotlight"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {children}
      </motion.div>
    </>
  );
}
