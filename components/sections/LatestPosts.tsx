"use client";

import { useEffect, useState } from "react";
import { listPosts, type ApiBlogPost } from "@/lib/api";
import { PostCard } from "@/components/cards/PostCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/** Превью последних статей на главной — реальные данные из /api/v1/blog/. */
export function LatestPosts() {
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listPosts()
      .then((res) => {
        if (cancelled) return;
        setPosts(
          (res ?? [])
            .filter((p) => p.is_published !== false && p.display_ru !== false)
            .slice(0, 3),
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loaded && posts.length === 0) {
    return (
      <p className="mt-14 rounded-3xl glass px-6 py-12 text-center text-ink-muted">
        Скоро здесь появятся статьи о технологиях и сервисе медтехники.
      </p>
    );
  }

  return (
    <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
      {posts.map((p) => (
        <RevealItem key={p.id}>
          <PostCard post={p} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
