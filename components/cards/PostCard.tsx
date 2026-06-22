"use client";

import { PlayCircle } from "lucide-react";
import type { ApiBlogPost } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useDict, useLang } from "@/components/i18n/I18nProvider";

/** Убирает HTML-теги и сжимает пробелы — для превью текста поста. */
export function plainText(html: string): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function PostCard({ post }: { post: ApiBlogPost }) {
  const dict = useDict();
  const lang = useLang();
  const title = (lang === "uz" && post.title_uz) || post.title_ru;
  const content = (lang === "uz" && post.content_uz) || post.content_ru;
  const excerpt = plainText(content);
  const short = excerpt.length > 160 ? `${excerpt.slice(0, 157)}…` : excerpt;

  return (
    <Link
      href={`/post?id=${post.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[16/9] w-full">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt={title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <MediaVisual seed={String(post.id)} icon="Brain" label={`${dict.post.coverAlt}: ${title}`} className="h-full w-full" />
        )}
        {post.video_url && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs text-accent ring-1 ring-line backdrop-blur">
            <PlayCircle className="h-3.5 w-3.5" /> {dict.blog.videoBadge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.created_at && (
          <span className="text-xs text-ink-dim">{formatDate(post.created_at, dict.months)}</span>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {title}
        </h3>
        {short && <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{short}</p>}
      </div>
    </Link>
  );
}
