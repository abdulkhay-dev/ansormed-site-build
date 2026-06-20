"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import { posts, postCategories } from "@/lib/data/posts";
import { BlogCard } from "@/components/cards/BlogCard";
import { cn, EASE } from "@/lib/utils";

export function BlogExplorer() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const inCat = active === "all" || p.category === active;
      const inQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [query, active]);

  // Only show category chips that actually have posts
  const usedCategories = postCategories.filter((c) =>
    posts.some((p) => p.category === c),
  );

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-dim" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по статьям…"
            aria-label="Поиск по блогу"
            className="h-12 w-full rounded-2xl border border-line bg-surface/70 pl-12 pr-4 text-base text-ink placeholder:text-ink-dim transition-colors focus:border-accent/60 focus:outline-none"
          />
        </div>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={active === "all"} onClick={() => setActive("all")}>
            Все
          </Chip>
          {usedCategories.map((c) => (
            <Chip key={c} active={active === c} onClick={() => setActive(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <motion.div layout className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <BlogCard post={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl glass px-6 py-16 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
            <SearchX className="h-7 w-7 text-ink-muted" />
          </span>
          <h3 className="font-display text-xl font-semibold text-ink">Статьи не найдены</h3>
          <p className="max-w-sm text-ink-muted">
            Попробуйте изменить запрос или выбрать другую категорию.
          </p>
          <button
            type="button"
            onClick={() => { setQuery(""); setActive("all"); }}
            className="cursor-pointer text-sm font-medium text-accent hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "border-accent bg-accent text-white shadow-soft"
          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
