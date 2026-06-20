"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { cn, EASE } from "@/lib/utils";

/** Product image gallery — a main visual with selectable thumbnails. */
export function ProductGallery({
  slug,
  icon,
  name,
}: {
  slug: string;
  icon?: string;
  name: string;
}) {
  const views = [
    { seed: slug, label: "Общий вид" },
    { seed: `${slug}-detail`, label: "Детали" },
    { seed: `${slug}-panel`, label: "Панель управления" },
    { seed: `${slug}-context`, label: "В работе" },
  ];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[2rem] glass">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <MediaVisual
              seed={views[active].seed}
              icon={icon}
              label={`${name} — ${views[active].label}`}
              className="aspect-[4/3] w-full"
            />
          </motion.div>
        </AnimatePresence>
        <span className="label absolute bottom-3 left-3 rounded-full bg-surface/85 px-2.5 py-1 text-accent ring-1 ring-line backdrop-blur">
          {views[active].label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {views.map((v, i) => (
          <button
            key={v.seed}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Показать: ${v.label}`}
            aria-pressed={i === active}
            className={cn(
              "overflow-hidden rounded-2xl border bg-surface transition-all duration-200 cursor-pointer",
              i === active
                ? "border-accent ring-2 ring-accent/25"
                : "border-line hover:border-line-strong",
            )}
          >
            <MediaVisual seed={v.seed} icon={icon} className="aspect-square w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
