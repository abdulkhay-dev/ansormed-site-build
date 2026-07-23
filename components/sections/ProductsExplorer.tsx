"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  getCatalog,
  listCategories,
  listSubcategories,
  type CategoryOut,
  type ProductOut,
  type SubCategory,
} from "@/lib/api";
import {
  localizeProduct,
  localizeCategory,
  localizeSubcategory,
  isProductVisible,
  buildCategoryContext,
  type LocalProduct,
} from "@/lib/catalog";
import { plainText } from "@/lib/blog";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { NewBadge } from "@/components/ui/NewBadge";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { interpolate } from "@/lib/i18n";
import {
  armCatalogRestore,
  consumeCatalogState,
  saveCatalogState,
} from "@/lib/catalog-state";
import { categorySortRank, cn, EASE, formatPrice, iconForCategory } from "@/lib/utils";

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
  const dict = useDict();
  const lang = useLang();
  const t = dict.products;
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(initialCategory);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [rawItems, setRawItems] = useState<ProductOut[]>([]);
  const [rawCats, setRawCats] = useState<CategoryOut[]>([]);
  const [rawSubs, setRawSubs] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Каталог + категории + подкатегории — один раз при загрузке.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getCatalog(),
      listCategories().catch(() => []),
      listSubcategories().catch(() => []),
    ])
      .then(([products, cats, subs]) => {
        if (cancelled) return;
        setRawItems(products);
        setRawCats(cats ?? []);
        setRawSubs(subs ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setRawItems([]);
          setRawCats([]);
          setRawSubs([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Последние применённые фильтры — чтобы отличать реальную смену фильтра
  // пользователем от восстановления состояния при возврате из карточки.
  const lastFilterRef = useRef({ active: initialCategory, debounced: "" });
  // Значения, которых ждём после восстановления: пока они не применились,
  // страницу не сбрасываем.
  const pendingRestoreRef = useRef<{ active: string; debounced: string } | null>(null);
  const restoredRef = useRef(false);

  // Возврат из карточки товара либо deep-link по категории (?category=...).
  // Возврат приоритетнее: в URL может остаться ?category= от того, как человек
  // попал в каталог изначально (ссылка из меню), и по «назад» в браузере он
  // возвращается на тот же адрес — deep-link не должен сбрасывать страницу.
  useEffect(() => {
    const saved = consumeCatalogState();
    if (saved) {
      setActive(saved.active);
      setQuery(saved.query);
      setDebounced(saved.query);
      setPage(saved.page);
      pendingRestoreRef.current = { active: saved.active, debounced: saved.query };
    } else {
      const c = new URLSearchParams(window.location.search).get("category");
      if (c) {
        setActive(c);
        pendingRestoreRef.current = { active: c, debounced: "" };
      }
    }
    restoredRef.current = true;
  }, []);

  // Дебаунс поискового запроса.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  // Сброс на 1-ю страницу при смене поиска/категории (но не при восстановлении).
  useEffect(() => {
    const pending = pendingRestoreRef.current;
    if (pending) {
      // Ждём, пока восстановленные фильтры реально применятся, и только тогда
      // снова разрешаем сброс страницы.
      if (pending.active === active && pending.debounced === debounced) {
        pendingRestoreRef.current = null;
        lastFilterRef.current = { active, debounced };
      }
      return;
    }
    const last = lastFilterRef.current;
    if (last.active === active && last.debounced === debounced) return;
    lastFilterRef.current = { active, debounced };
    setPage(1);
  }, [debounced, active]);

  // Запоминаем состояние каталога для возврата из карточки товара.
  useEffect(() => {
    if (!restoredRef.current) return;
    saveCatalogState({ active, page, query });
  }, [active, page, query]);

  // Уход в карточку товара разрешает одно восстановление. Клики по ссылкам
  // перехватывает AppShell (capture + stopPropagation), поэтому onClick на
  // карточке не долетает до React — слушаем document в той же фазе.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const href = (e.target as HTMLElement | null)
        ?.closest?.("a")
        ?.getAttribute("href");
      if (href?.includes("/product/")) armCatalogRestore();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Контекст «подкатегория → категория» для резолва категории товара.
  const catCtx = useMemo(
    () => buildCategoryContext(rawCats, rawSubs),
    [rawCats, rawSubs],
  );

  // Локализованные видимые товары.
  const products = useMemo(
    () =>
      rawItems
        .filter((p) => isProductVisible(p))
        .map((p) => localizeProduct(p, lang, catCtx)),
    [rawItems, lang, catCtx],
  );

  // Категории из /api/v1/categories/ (активные, локализованные) + счётчики.
  const categories = useMemo(() => {
    const counts = new Map<number, number>();
    for (const p of products) {
      if (p.categoryId != null) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
    }
    return rawCats
      .filter((c) => c.is_active !== false)
      .map((c) => ({ ...localizeCategory(c, lang), slug: c.slug, count: counts.get(c.id) ?? 0 }))
      .sort((a, b) => categorySortRank(a) - categorySortRank(b));
  }, [rawCats, products, lang]);

  // Подкатегории, сгруппированные по id категории (активные, со счётчиками).
  const subsByCat = useMemo(() => {
    const counts = new Map<number, number>();
    for (const p of products) {
      if (p.subcategoryId != null)
        counts.set(p.subcategoryId, (counts.get(p.subcategoryId) ?? 0) + 1);
    }
    const map = new Map<number, Array<{ id: number; name: string; count: number }>>();
    for (const s of rawSubs) {
      if (s.is_active === false) continue;
      const arr = map.get(s.category) ?? [];
      arr.push({ ...localizeSubcategory(s, lang), count: counts.get(s.id) ?? 0 });
      map.set(s.category, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [rawSubs, products, lang]);

  // Активная подкатегория (active === "sub:<id>") и её родительская категория.
  const activeSubId = active.startsWith("sub:") ? Number(active.slice(4)) : null;
  const activeParentId =
    activeSubId != null
      ? catCtx.subToCat[activeSubId] ?? null
      : active === "all"
        ? null
        : Number(active);

  // Держим раскрытой категорию активной подкатегории (в т.ч. по deep-link).
  useEffect(() => {
    if (activeSubId != null && activeParentId != null) setExpandedCat(activeParentId);
  }, [activeSubId, activeParentId]);

  // Клик по категории: всегда фильтруем по ней (показываем все товары категории,
  // включая привязанные напрямую и через подкатегории). Если есть подкатегории —
  // ещё и раскрываем список, чтобы можно было сузить выбор.
  const onCatClick = (id: number, hasSubs: boolean, onFiltered?: () => void) => {
    setActive(String(id));
    if (hasSubs) {
      setExpandedCat((prev) => (prev === id ? null : id));
    } else {
      setExpandedCat(null);
      onFiltered?.();
    }
  };

  // Резолвим ?category= после загрузки: id → точное имя → вхождение → всё.
  const resolvedRef = useRef(false);
  useEffect(() => {
    if (resolvedRef.current || categories.length === 0) return;
    resolvedRef.current = true;
    setActive((cur) => {
      if (cur === "all" || cur.startsWith("sub:")) return cur;
      if (categories.some((c) => String(c.id) === cur)) return cur;
      const low = cur.toLowerCase();
      const byName =
        categories.find((c) => c.name.toLowerCase() === low) ??
        categories.find(
          (c) => c.name.toLowerCase().includes(low) || low.includes(c.name.toLowerCase()),
        );
      return byName ? String(byName.id) : "all";
    });
  }, [categories]);

  // Клиентская фильтрация по категории и поиску.
  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    return products.filter((p) => {
      if (active !== "all") {
        if (activeSubId != null) {
          if (p.subcategoryId !== activeSubId) return false;
        } else if (String(p.categoryId) !== active) return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        plainText(p.description).toLowerCase().includes(q)
      );
    });
  }, [products, active, activeSubId, debounced]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), pageCount));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCat = categories.find((c) => c.id === activeParentId);
  const activeSub =
    activeSubId != null
      ? (subsByCat.get(activeParentId ?? -1) ?? []).find((s) => s.id === activeSubId)
      : null;
  const currentLabel =
    active === "all" ? t.allCategories : activeSub?.name ?? activeCat?.name ?? t.allCategories;
  const currentIcon =
    active === "all" ? "LayoutGrid" : iconForCategory(activeCat?.name ?? "");

  return (
    <div className="lg:grid lg:grid-cols-[clamp(220px,22vw,280px)_1fr] lg:gap-8 xl:gap-10">
      {/* ── Categories ── */}
      <aside className="mb-8 lg:mb-0">
        {/* Desktop */}
        <div className="hidden lg:block lg:sticky lg:top-28">
          <p className="label mb-3 px-1 text-ink-dim">{t.categoriesLabel}</p>
          <nav className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto pr-1">
            <CatItem
              icon="LayoutGrid"
              label={t.all}
              active={active === "all"}
              onClick={() => setActive("all")}
            />
            {categories.map((c) => {
              const subs = subsByCat.get(c.id) ?? [];
              return (
                <div key={c.id} className="flex flex-col gap-1">
                  <CatItem
                    icon={iconForCategory(c.name)}
                    label={c.name}
                    count={c.count}
                    active={active === String(c.id)}
                    featured={/rehab|реабил|reabil/i.test(`${c.name} ${c.slug}`)}
                    hasSubs={subs.length > 0}
                    expanded={expandedCat === c.id}
                    onClick={() => onCatClick(c.id, subs.length > 0)}
                  />
                  <SubList
                    subs={subs}
                    open={expandedCat === c.id}
                    activeId={activeSubId}
                    onSelect={(id) => setActive(`sub:${id}`)}
                  />
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mobile dropdown */}
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            aria-expanded={catOpen}
            aria-label={t.selectCategory}
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 text-left shadow-soft transition-colors hover:border-line-strong"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
              <Icon name={currentIcon} className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="label text-ink-dim">{t.categoryLabel}</span>
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
                  aria-label={t.closeCategories}
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
                        label={t.allCategories}
                        active={active === "all"}
                        onClick={() => {
                          setActive("all");
                          setCatOpen(false);
                        }}
                      />
                      {categories.map((c) => {
                        const subs = subsByCat.get(c.id) ?? [];
                        return (
                          <div key={c.id} className="flex flex-col gap-1">
                            <CatItem
                              icon={iconForCategory(c.name)}
                              label={c.name}
                              count={c.count}
                              active={active === String(c.id)}
                              featured={/rehab|реабил|reabil/i.test(`${c.name} ${c.slug}`)}
                              hasSubs={subs.length > 0}
                              expanded={expandedCat === c.id}
                              onClick={() =>
                                onCatClick(c.id, subs.length > 0, () => setCatOpen(false))
                              }
                            />
                            <SubList
                              subs={subs}
                              open={expandedCat === c.id}
                              activeId={activeSubId}
                              onSelect={(id) => {
                                setActive(`sub:${id}`);
                                setCatOpen(false);
                              }}
                            />
                          </div>
                        );
                      })}
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
            placeholder={t.searchPlaceholder}
            aria-label={t.searchAria}
            className="h-12 w-full rounded-2xl border border-line bg-surface/70 pl-12 pr-4 text-base text-ink placeholder:text-ink-dim transition-colors focus:border-accent/60 focus:outline-none"
          />
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm text-ink-dim" aria-live="polite">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading
            ? t.loading
            : total > 0
              ? interpolate(t.showing, { start: rangeStart, end: rangeEnd, total })
              : t.foundNone}
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

function CatalogCard({ product }: { product: LocalProduct }) {
  const dict = useDict();
  const t = dict.products;
  const price = formatPrice(product.price, null, dict.currencyUnit);
  const oldPrice = formatPrice(product.oldPrice, null, dict.currencyUnit);
  return (
    <Link
      href={`/product/${encodeURIComponent(product.slug)}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[4/3] w-full bg-white">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <MediaVisual
            seed={String(product.id)}
            icon={iconForCategory(product.categoryName)}
            label={`${product.name} — ${product.categoryName ?? t.fallbackEquip}`}
            className="h-full w-full"
          />
        )}
        {product.isNew && <NewBadge className="absolute left-4 top-4" />}
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full glass-strong text-ink-muted transition-all duration-300 group-hover:rotate-45 group-hover:text-accent">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {product.categoryName && (
          <span className="text-xs font-medium uppercase tracking-wider text-accent">
            {product.categoryName}
          </span>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {price ? (
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-base font-semibold text-ink">{price}</span>
              {oldPrice && (
                <span className="text-xs text-ink-dim line-through">{oldPrice}</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-ink-dim">{t.priceOnRequest}</span>
          )}
          <span className="shrink-0 text-sm font-medium text-accent group-hover:underline">
            {t.more}
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
  const t = useDict().products;
  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label={t.pagerAria}>
      <PagerButton onClick={() => onChange(current - 1)} disabled={current <= 1} aria-label={t.prevPage}>
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
            aria-label={interpolate(t.pageN, { n: p })}
            aria-current={p === current ? "page" : undefined}
          >
            {p}
          </PagerButton>
        ),
      )}

      <PagerButton onClick={() => onChange(current + 1)} disabled={current >= total} aria-label={t.nextPage}>
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
  count,
  active,
  featured = false,
  hasSubs = false,
  expanded = false,
  onClick,
}: {
  icon: string;
  label: string;
  count?: number;
  active: boolean;
  featured?: boolean;
  hasSubs?: boolean;
  expanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-expanded={hasSubs ? expanded : undefined}
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
      <span className={cn("flex-1 truncate", featured && "font-bold text-ink")}>{label}</span>
      {count != null && (
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 text-xs tabular-nums",
            active ? "bg-accent/15 text-accent" : "bg-surface-2 text-ink-dim",
          )}
        >
          {count}
        </span>
      )}
      {hasSubs && (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            active ? "text-accent" : "text-ink-dim",
            expanded && "rotate-180",
          )}
        />
      )}
    </button>
  );
}

/** Раскрывающийся список подкатегорий под категорией. */
function SubList({
  subs,
  open,
  activeId,
  onSelect,
}: {
  subs: Array<{ id: number; name: string; count: number }>;
  open: boolean;
  activeId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && subs.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="ml-4 flex flex-col gap-0.5 border-l border-line pl-3 pt-0.5">
            {subs.map((s) => {
              const active = activeId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelect(s.id)}
                  aria-pressed={active}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors",
                    active
                      ? "font-semibold text-accent"
                      : "text-ink-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                      active ? "bg-accent" : "bg-line-strong group-hover:bg-ink-dim",
                    )}
                  />
                  <span className="flex-1 truncate">{s.name}</span>
                  {s.count > 0 && (
                    <span
                      className={cn(
                        "shrink-0 text-xs tabular-nums",
                        active ? "text-accent" : "text-ink-dim",
                      )}
                    >
                      {s.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  const t = useDict().products;
  return (
    <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl glass px-6 py-16 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
        <SearchX className="h-7 w-7 text-ink-muted" />
      </span>
      <h3 className="font-display text-xl font-semibold text-ink">{t.emptyTitle}</h3>
      <p className="max-w-sm text-ink-muted">{t.emptyText}</p>
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer text-sm font-medium text-accent hover:underline"
      >
        {t.resetFilters}
      </button>
    </div>
  );
}
