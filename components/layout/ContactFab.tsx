"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Phone, Mail, MessageCircle, X } from "lucide-react";
import { useDict } from "@/components/i18n/I18nProvider";
import { telHref } from "@/lib/i18n";
import { EASE } from "@/lib/utils";

/**
 * Плавающая кнопка связи в правом нижнем углу. По клику раскрывает контакты
 * (телефон и email) с анимацией. В закрытом состоянии периодически
 * «подёргивается», привлекая внимание.
 */
export function ContactFab() {
  const dict = useDict();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // Закрытие по Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const actions = [
    {
      key: "phone",
      icon: Phone,
      label: dict.site.phone,
      href: `tel:${telHref(dict.site.phone)}`,
    },
    {
      key: "email",
      icon: Mail,
      label: dict.site.email,
      href: `mailto:${dict.site.email}`,
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3 md:bottom-7 md:right-7">
      <AnimatePresence>
        {open &&
          actions.map((a, i) => (
            <motion.a
              key={a.key}
              href={a.href}
              initial={{ opacity: 0, y: 14, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.85 }}
              transition={{
                duration: 0.22,
                ease: EASE,
                delay: (actions.length - 1 - i) * 0.05,
              }}
              className="group flex items-center gap-3"
            >
              <span className="max-w-[60vw] truncate rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-float">
                {a.label}
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-accent shadow-float ring-1 ring-line transition-colors group-hover:bg-accent group-hover:text-white">
                <a.icon className="h-5 w-5" />
              </span>
            </motion.a>
          ))}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? dict.header.closeMenu : dict.header.contact}
        aria-expanded={open}
        whileTap={{ scale: 0.92 }}
        animate={
          open || reduceMotion ? { rotate: 0 } : { rotate: [0, -14, 12, -10, 8, -4, 0] }
        }
        transition={
          open || reduceMotion
            ? { duration: 0.2 }
            : { duration: 0.7, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.5 }
        }
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-float ring-1 ring-accent/30 transition-colors hover:bg-accent-deep cursor-pointer"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
