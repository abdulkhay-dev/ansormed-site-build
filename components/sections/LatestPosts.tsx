"use client";

import { useEffect, useState } from "react";
import { listPosts, type ApiBlogPost } from "@/lib/api";
import { isPostVisible } from "@/lib/blog";
import { PostCard } from "@/components/cards/PostCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { useDict, useLang } from "@/components/i18n/I18nProvider";

/** Превью последних статей на главной — реальные данные из /api/v1/blog/. */
export function LatestPosts() {
  const dict = useDict();
  const lang = useLang();
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listPosts()
      .then((res) => {
        if (cancelled) return;
        setPosts((res ?? []).filter((p) => isPostVisible(p, lang)).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  if (loaded && posts.length === 0) {
    return (
      <p className="mt-14 rounded-3xl glass px-6 py-12 text-center text-ink-muted">
        {dict.blog.latestEmpty}
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
