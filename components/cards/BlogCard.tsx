import Link from "next/link";
import { Clock } from "lucide-react";
import type { Post } from "@/lib/data/posts";
import { formatDateRu } from "@/lib/utils";
import { MediaVisual } from "@/components/ui/MediaVisual";

export function BlogCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-surface border border-line shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[16/9] w-full">
        <MediaVisual
          seed={post.slug}
          icon="Brain"
          label={`Обложка статьи: ${post.title}`}
          className="h-full w-full"
        />
        <span className="label absolute left-4 top-4 rounded-full bg-surface/90 px-2.5 py-1 text-accent ring-1 ring-line shadow-soft backdrop-blur">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3 text-xs text-ink-dim">
          <span>{formatDateRu(post.date)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingMinutes} мин
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
