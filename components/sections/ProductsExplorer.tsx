"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, SearchX, ChevronDown } from "lucide-react";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { ProductCard } from "@/components/cards/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { cn, EASE } from "@/lib/utils";

type Sort = "default" | "az" | "za";

export function ProductsExplorer({
  initialCategory = "all",
}: {
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(initialCategory);
  const [sort, setSort] = useState<Sort>("default");
  const [catOpen, setCatOpen] = useState(false);

  // Deep-link по категории (?category=…) — читаем на клиенте, чтобы работало в статике.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c && categories.some((cat) => cat.id === c)) setActive(c);
  }, []);

  // Count per category (respects the current search query so numbers stay honest).
  const counts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesQuery = (p: (typeof products)[number]) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    const map: Record<string, number> = { all: 0 };
    for (const p of products) {
      if (!matchesQuery(p)) continue;
      map.all += 1;
      map[p.categoryId] = (map[p.categoryId] ?? 0) + 1;
    }
    return map;
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const inCat = active === "all" || p.categoryId === active;
      const inQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return inCat && inQuery;
    });
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    if (sort === "za") list = [...list].sort((a, b) => b.name.localeCompare(a.name, "ru"));
    return list;
  }, [query, active, sort]);

  // Текущая категория для мобильного селектора
  const activeCat = categories.find((c) => c.id === active);
  const currentLabel = active === "all" ? "Все категории" : activeCat?.short ?? "Все категории";
  const currentIcon = active === "all" ? "LayoutGrid" : activeCat?.icon ?? "LayoutGrid";
  const currentCount = counts[active] ?? counts.all ?? 0;

  return (
    <div className="lg:grid lg:grid-cols-[clamp(220px,22vw,280px)_1fr] lg:gap-8 xl:gap-10">
      {/* ── Categories: left sidebar (vertical on desktop, chip row on mobile) ── */}
      <aside className="mb-8 lg:mb-0">
        {/* Desktop: vertical list */}
        <div className="hidden lg:block lg:sticky lg:top-28">
          <p className="label mb-3 px-1 text-ink-dim">Категории</p>
          <nav className="flex flex-col gap-1">
            <CatItem
              icon="LayoutGrid"
              label="Все"
              count={counts.all ?? 0}
              active={active === "all"}
              onClick={() => setActive("all")}
            />
            {categories.map((c) => (
              <CatItem
                key={c.id}
                icon={c.icon}
                label={c.short}
                count={counts[c.id] ?? 0}
                active={active === c.id}
                onClick={() => setActive(c.id)}
              />
            ))}
          </nav>
        </div>

        {/* Mobile: dropdown selector (выдерживает большое число категорий) */}
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
            <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-ink-dim">
              {currentCount}
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
                        count={counts.all ?? 0}
                        active={active === "all"}
                        onClick={() => {
                          setActive("all");
                          setCatOpen(false);
                        }}
                      />
                      {categories.map((c) => (
                        <CatItem
                          key={c.id}
                          icon={c.icon}
                          label={c.short}
                          count={counts[c.id] ?? 0}
                          active={active === c.id}
                          onClick={() => {
                            setActive(c.id);
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

      {/* ── Products: right column ── */}
      <div>
        {/* Search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
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
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Сортировка"
              className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-line bg-surface/70 pl-11 pr-9 text-sm text-ink transition-colors focus:border-accent/60 focus:outline-none sm:w-56"
            >
              <option value="default">По умолчанию</option>
              <option value="az">Название: А–Я</option>
              <option value="za">Название: Я–А</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-dim">▾</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-dim" aria-live="polite">
          Найдено: {filtered.length}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState onReset={() => { setQuery(""); setActive("all"); }} />
        )}
      </div>
    </div>
  );
}

function CatItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  count: number;
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
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums transition-colors",
          active ? "bg-accent/15 text-accent" : "bg-surface-2 text-ink-dim",
        )}
      >
        {count}
      </span>
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
      <p className="max-w-sm text-ink-muted">
        Попробуйте изменить запрос или выбрать другую категорию.
      </p>
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
