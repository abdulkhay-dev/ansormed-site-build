"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX, Loader2, Newspaper } from "lucide-react";
import { listPosts, type ApiBlogPost } from "@/lib/api";
import { PostCard } from "@/components/cards/PostCard";
import { EASE } from "@/lib/utils";

export function BlogExplorer() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPosts()
      .then((res) => {
        if (cancelled) return;
        setPosts((res ?? []).filter((p) => p.is_published !== false && p.display_ru !== false));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title_ru.toLowerCase().includes(q) ||
        (p.content_ru ?? "").toLowerCase().includes(q),
    );
  }, [query, posts]);

  return (
    <div>
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

      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-ink-dim">
          <Loader2 className="h-4 w-4 animate-spin" /> Загружаем статьи…
        </p>
      ) : filtered.length > 0 ? (
        <motion.div layout className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <PostCard post={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl glass px-6 py-16 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
            {query ? <SearchX className="h-7 w-7 text-ink-muted" /> : <Newspaper className="h-7 w-7 text-ink-muted" />}
          </span>
          <h3 className="font-display text-xl font-semibold text-ink">
            {query ? "Статьи не найдены" : "Скоро здесь появятся статьи"}
          </h3>
          <p className="max-w-sm text-ink-muted">
            {query
              ? "Попробуйте изменить запрос."
              : "Мы готовим материалы о технологиях и сервисе медтехники."}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="cursor-pointer text-sm font-medium text-accent hover:underline"
            >
              Сбросить поиск
            </button>
          )}
        </div>
      )}
    </div>
  );
}
