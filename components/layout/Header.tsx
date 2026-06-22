"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, ArrowUpRight, Mail, Clock } from "lucide-react";
import { site } from "@/lib/data/site";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n";
import { cn, EASE } from "@/lib/utils";

export function Header() {
  const dict = useDict();
  const lang = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const nav = [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.products, href: "/products" },
    { label: dict.nav.blog, href: "/blog" },
    { label: dict.nav.about, href: "/about" },
    { label: dict.nav.contacts, href: "/contacts" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const target = localizeHref(lang, href);
    const path = (pathname || "/").replace(/\/$/, "") || "/";
    return href === "/" ? path === target : path.startsWith(target);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "glass-strong border-b border-line shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          className="container-x flex h-16 items-center justify-between md:h-20"
          aria-label={dict.header.mainNavAria}
        >
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                    isActive(item.href)
                      ? "text-accent"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-accent-wash ring-1 ring-accent/15"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <span className="hidden sm:inline-flex">
              <ButtonLink href="/contacts" size="md">
                <Phone className="h-4 w-4" />
                {dict.header.contact}
              </ButtonLink>
            </span>

            <button
              type="button"
              aria-label={open ? dict.header.closeMenu : dict.header.openMenu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full glass text-ink shadow-soft lg:hidden cursor-pointer"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-md lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-3 top-[4.75rem] z-40 origin-top overflow-hidden rounded-[28px] border border-line bg-surface shadow-float lg:hidden md:top-[5.75rem]"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {/* clinical dot texture */}
              <div className="pointer-events-none absolute inset-0 grid-dots opacity-50" />

              <div className="relative p-3">
                <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                  <span className="label text-ink-dim">{dict.header.navLabel}</span>
                  <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <span className="label flex items-center gap-1.5 text-ink-dim">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
                      24/7
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col">
                  {nav.map((item, i) => {
                    const active = isActive(item.href);
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 + i * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors",
                            active ? "bg-accent-wash ring-1 ring-accent/15" : "hover:bg-surface-2",
                          )}
                        >
                          <span
                            className={cn(
                              "font-mono text-xs tabular-nums",
                              active ? "text-accent" : "text-ink-dim",
                            )}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "flex-1 text-[1.0625rem] font-medium",
                              active ? "text-accent" : "text-ink",
                            )}
                          >
                            {item.label}
                          </span>
                          <ArrowUpRight
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              active
                                ? "text-accent opacity-100"
                                : "-translate-x-1 text-ink-dim opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                            )}
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>

                <div className="my-3 h-px bg-line" />

                <div className="px-1">
                  <ButtonLink href={`tel:${site.phoneHref}`} size="lg" className="w-full">
                    <Phone className="h-4 w-4" />
                    {site.phone}
                  </ButtonLink>

                  <div className="mt-3 flex items-center justify-between gap-3 px-1">
                    <a
                      href={`mailto:${site.email}`}
                      className="flex min-w-0 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-ink-dim" />
                      <span className="truncate">{site.email}</span>
                    </a>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-dim">
                      <Clock className="h-3.5 w-3.5" />
                      {dict.site.hours}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
