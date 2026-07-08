"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Loader2, ArrowUpRight } from "lucide-react";
import {
  globalSearch,
  mediaUrl,
  type SearchResults,
  type ProductOut,
  type ApiBlogPost,
  type ApiProject,
} from "@/lib/api";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { cn, EASE, formatPrice } from "@/lib/utils";

const MIN_CHARS = 2;

/** Значение по языку с фолбэком на ru. */
function pick(lang: string, ru: string, uz: string, en: string): string {
  if (lang === "uz") return (uz || ru).trim();
  if (lang === "en") return (en || ru).trim();
  return (ru || "").trim();
}

export function GlobalSearch() {
  const dict = useDict();
  const lang = useLang();
  const t = dict.search;
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Дебаунс запроса.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  // Запрос к API при изменении дебаунса (с защитой от гонки).
  useEffect(() => {
    if (debounced.length < MIN_CHARS) {
      setResults(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    globalSearch(debounced)
      .then((r) => {
        if (!cancelled) setResults(r);
      })
      .catch(() => {
        if (!cancelled) setResults({ products: [], blogs: [], projects: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // Открытие: фокус на инпут + блокировка скролла. Esc — закрыть.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Глобальный хоткей ⌘K / Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Закрывать при смене маршрута.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const total = results
    ? results.products.length + results.projects.length + results.blogs.length
    : 0;
  const showEmpty =
    !loading && results != null && debounced.length >= MIN_CHARS && total === 0;

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={t.aria}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full glass text-ink shadow-soft transition-colors hover:text-accent cursor-pointer"
      >
        <Search className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex justify-center bg-ink/50 px-3 pt-[12vh] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t.aria}
              className="flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-float"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Поисковая строка */}
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-ink-dim" />
                ) : (
                  <Search className="h-5 w-5 shrink-0 text-ink-dim" />
                )}
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.placeholder}
                  aria-label={t.aria}
                  className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-dim"
                />
                <button
                  type="button"
                  aria-label={t.close}
                  onClick={close}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Результаты */}
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {debounced.length < MIN_CHARS ? (
                  <p className="px-4 py-10 text-center text-sm text-ink-muted">{t.hint}</p>
                ) : showEmpty ? (
                  <div className="px-4 py-10 text-center">
                    <p className="font-display text-base font-semibold text-ink">
                      {t.emptyTitle}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">{t.emptyText}</p>
                  </div>
                ) : results ? (
                  <div className="flex flex-col gap-4 py-1">
                    <ResultGroup title={t.groups.products} show={results.products.length > 0}>
                      {results.products.map((p) => (
                        <ProductRow key={p.id} p={p} lang={lang} unit={dict.currencyUnit} onNavigate={close} />
                      ))}
                    </ResultGroup>
                    <ResultGroup title={t.groups.projects} show={results.projects.length > 0}>
                      {results.projects.map((p) => (
                        <ProjectRow key={p.id} p={p} lang={lang} onNavigate={close} />
                      ))}
                    </ResultGroup>
                    <ResultGroup title={t.groups.blogs} show={results.blogs.length > 0}>
                      {results.blogs.map((b) => (
                        <BlogRow key={b.id} b={b} lang={lang} onNavigate={close} />
                      ))}
                    </ResultGroup>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ResultGroup({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div>
      <p className="label px-3 pb-1 text-ink-dim">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

/** Оболочка строки результата: превью + контент + стрелка. */
function Row({
  href,
  image,
  onNavigate,
  children,
}: {
  href: string;
  image: string | null;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-2"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Search className="h-4 w-4 text-ink-dim" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">{children}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-ink-dim opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

function ProductRow({
  p,
  lang,
  unit,
  onNavigate,
}: {
  p: ProductOut;
  lang: string;
  unit: string;
  onNavigate: () => void;
}) {
  const name = pick(lang, p.name_ru, p.name_uz, p.name_en);
  const priceNum = Number(p.final_price ?? p.price);
  const price =
    Number.isFinite(priceNum) && priceNum > 0 ? formatPrice(priceNum, null, unit) : null;
  return (
    <Row href={`/product/${encodeURIComponent(p.slug)}`} image={mediaUrl(p.cover_image)} onNavigate={onNavigate}>
      <span className="truncate text-sm font-medium text-ink group-hover:text-accent">{name}</span>
      {price && <span className="truncate text-xs text-ink-muted">{price}</span>}
    </Row>
  );
}

function ProjectRow({
  p,
  lang,
  onNavigate,
}: {
  p: ApiProject;
  lang: string;
  onNavigate: () => void;
}) {
  const title = pick(lang, p.title_ru, p.title_uz, p.title_en);
  return (
    <Row href={`/project/${encodeURIComponent(p.slug)}`} image={mediaUrl(p.cover_image)} onNavigate={onNavigate}>
      <span className="truncate text-sm font-medium text-ink group-hover:text-accent">{title}</span>
    </Row>
  );
}

function BlogRow({
  b,
  lang,
  onNavigate,
}: {
  b: ApiBlogPost;
  lang: string;
  onNavigate: () => void;
}) {
  const title = pick(lang, b.title_ru, b.title_uz, b.title_en);
  return (
    <Row href={`/post/${encodeURIComponent(b.slug)}`} image={mediaUrl(b.image)} onNavigate={onNavigate}>
      <span className="truncate text-sm font-medium text-ink group-hover:text-accent">{title}</span>
    </Row>
  );
}
