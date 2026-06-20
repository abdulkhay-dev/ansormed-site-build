"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  SearchX,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  listProducts,
  listCategories,
  type ApiProduct,
  type ApiCategory,
} from "@/lib/api";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { Icon } from "@/components/ui/Icon";
import { cn, EASE, formatPrice, iconForCategory } from "@/lib/utils";

const PAGE_SIZE = 15;

/** Компактный набор номеров страниц с многоточиями вокруг текущей. */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function ProductsExplorer({
  initialCategory = "all",
}: {
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(initialCategory);
  const [catOpen, setCatOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Категории — один раз при загрузке (/api/v1/categories/).
  useEffect(() => {
    let cancelled = false;
    listCategories()
      .then((cats) => {
        if (!cancelled && cats) setCategories(cats.filter((c) => c.is_active !== false));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Deep-link по категории (?category=slug).
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c) setActive(c);
  }, []);

  // Дебаунс поискового запроса.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Сброс на 1-ю страницу при смене поиска/категории.
  useEffect(() => {
    setPage(1);
  }, [debounced, active]);

  // Загрузка страницы товаров (серверная пагинация/фильтр/поиск).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProducts({
      page,
      pageSize: PAGE_SIZE,
      category: active === "all" ? undefined : active,
      search: debounced || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res?.items ?? []);
        setTotal(res?.total ?? 0);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, active, debounced]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), pageCount));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCat = categories.find((c) => c.slug === active);
  const currentLabel = active === "all" ? "Все категории" : activeCat?.name_ru ?? active;
  const currentIcon = active === "all" ? "LayoutGrid" : iconForCategory(activeCat?.slug ?? active);

  return (
    <div className="lg:grid lg:grid-cols-[clamp(220px,22vw,280px)_1fr] lg:gap-8 xl:gap-10">
      {/* ── Categories ── */}
      <aside className="mb-8 lg:mb-0">
        {/* Desktop */}
        <div className="hidden lg:block lg:sticky lg:top-28">
          <p className="label mb-3 px-1 text-ink-dim">Категории</p>
          <nav className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto pr-1">
            <CatItem
              icon="LayoutGrid"
              label="Все"
              active={active === "all"}
              onClick={() => setActive("all")}
            />
            {categories.map((c) => (
              <CatItem
                key={c.id}
                icon={iconForCategory(c.slug || c.name_ru)}
                label={c.name_ru}
                active={active === c.slug}
                onClick={() => setActive(c.slug)}
              />
            ))}
          </nav>
        </div>

        {/* Mobile dropdown */}
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            aria-expanded={catOpen}
            aria-label="Выбрать категорию"
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 text-left shadow-soft transition-colors hover:border-line-strong"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
              <Icon name={currentIcon} className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="label text-ink-dim">Категория</span>
              <span className="truncate text-sm font-medium text-ink">{currentLabel}</span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-ink-dim transition-transform duration-200",
                catOpen && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {catOpen && (
              <>
                <button
                  type="button"
                  aria-label="Закрыть список категорий"
                  onClick={() => setCatOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="absolute inset-x-0 top-[calc(100%+8px)] z-40 origin-top overflow-hidden rounded-2xl border border-line bg-surface shadow-float"
                >
                  <div className="max-h-[60vh] overflow-y-auto p-2">
                    <nav className="flex flex-col gap-1">
                      <CatItem
                        icon="LayoutGrid"
                        label="Все категории"
                        active={active === "all"}
                        onClick={() => {
                          setActive("all");
                          setCatOpen(false);
                        }}
                      />
                      {categories.map((c) => (
                        <CatItem
                          key={c.id}
                          icon={iconForCategory(c.slug || c.name_ru)}
                          label={c.name_ru}
                          active={active === c.slug}
                          onClick={() => {
                            setActive(c.slug);
                            setCatOpen(false);
                          }}
                        />
                      ))}
                    </nav>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* ── Products ── */}
      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-dim" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию оборудования…"
            aria-label="Поиск по продукции"
            className="h-12 w-full rounded-2xl border border-line bg-surface/70 pl-12 pr-4 text-base text-ink placeholder:text-ink-dim transition-colors focus:border-accent/60 focus:outline-none"
          />
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm text-ink-dim" aria-live="polite">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading
            ? "Загружаем каталог…"
            : total > 0
              ? `Показаны ${rangeStart}–${rangeEnd} из ${total}`
              : "Найдено: 0"}
        </p>

        {items.length > 0 ? (
          <>
            <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {items.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <CatalogCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {pageCount > 1 && <Pager current={page} total={pageCount} onChange={goToPage} />}
          </>
        ) : (
          !loading && (
            <EmptyState
              onReset={() => {
                setQuery("");
                setActive("all");
              }}
            />
          )
        )}
      </div>
    </div>
  );
}

/* ---------- Карточка товара ---------- */

function CatalogCard({ product }: { product: ApiProduct }) {
  const price = formatPrice(product.price, product.currency);
  return (
    <Link
      href={`/product?id=${encodeURIComponent(product.id)}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[4/3] w-full">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <MediaVisual
            seed={product.id}
            icon={iconForCategory(product.category)}
            label={`${product.name} — ${product.category ?? "оборудование"}`}
            className="h-full w-full"
          />
        )}
        {product.in_stock ? (
          <span className="label absolute left-4 top-4 rounded-full bg-signal/15 px-2.5 py-1 text-signal ring-1 ring-signal/30 backdrop-blur">
            В наличии
          </span>
        ) : (
          <span className="label absolute left-4 top-4 rounded-full bg-surface/90 px-2.5 py-1 text-ink-muted ring-1 ring-line backdrop-blur">
            Под заказ
          </span>
        )}
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full glass-strong text-ink-muted transition-all duration-300 group-hover:rotate-45 group-hover:text-accent">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-accent">
            {product.category}
          </span>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        {product.brand && (
          <p className="line-clamp-1 text-sm text-ink-muted">{product.brand}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {price ? (
            <span className="font-display text-base font-semibold text-ink">{price}</span>
          ) : (
            <span className="text-sm text-ink-dim">Цена по запросу</span>
          )}
          <span className="shrink-0 text-sm font-medium text-accent group-hover:underline">
            Подробнее →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Пагинация ---------- */

function Pager({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Страницы каталога">
      <PagerButton onClick={() => onChange(current - 1)} disabled={current <= 1} aria-label="Предыдущая страница">
        <ChevronLeft className="h-4 w-4" />
      </PagerButton>

      {pageWindow(current, total).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-ink-dim select-none" aria-hidden="true">
            …
          </span>
        ) : (
          <PagerButton
            key={p}
            onClick={() => onChange(p)}
            active={p === current}
            aria-label={`Страница ${p}`}
            aria-current={p === current ? "page" : undefined}
          >
            {p}
          </PagerButton>
        ),
      )}

      <PagerButton onClick={() => onChange(current + 1)} disabled={current >= total} aria-label="Следующая страница">
        <ChevronRight className="h-4 w-4" />
      </PagerButton>
    </nav>
  );
}

function PagerButton({
  children,
  onClick,
  active = false,
  disabled = false,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-medium tabular-nums transition-all duration-200",
        active
          ? "border-accent bg-accent text-white shadow-soft"
          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
        disabled && "pointer-events-none opacity-40",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function CatItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
        active
          ? "border-accent/30 bg-accent/10 text-accent shadow-soft"
          : "border-transparent text-ink-muted hover:bg-surface hover:text-ink",
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active ? "bg-accent text-white" : "bg-surface-2 text-ink-dim group-hover:text-ink",
        )}
      >
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl glass px-6 py-16 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
        <SearchX className="h-7 w-7 text-ink-muted" />
      </span>
      <h3 className="font-display text-xl font-semibold text-ink">Ничего не найдено</h3>
      <p className="max-w-sm text-ink-muted">Попробуйте изменить запрос или выбрать другую категорию.</p>
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer text-sm font-medium text-accent hover:underline"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}
