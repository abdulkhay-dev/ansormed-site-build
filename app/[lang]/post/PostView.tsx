"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Loader2, Newspaper } from "lucide-react";
import { getPost, type ApiBlogPost } from "@/lib/api";
import { localizePost } from "@/lib/blog";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { formatDate } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "ok"; post: ApiBlogPost }
  | { status: "missing" };

export default function PostView({ id }: { id: string }) {
  const dict = useDict();
  const lang = useLang();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getPost(id)
      .then((post) => {
        if (cancelled) return;
        setState(post ? { status: "ok", post } : { status: "missing" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing" });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <div className="pt-28 md:pt-36">
        <Container>
          <div className="flex flex-col items-center gap-5 rounded-3xl glass px-6 py-20 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
              <Newspaper className="h-7 w-7 text-ink-muted" />
            </span>
            <h1 className="font-display text-2xl font-semibold text-ink">{dict.post.notFoundTitle}</h1>
            <p className="max-w-sm text-ink-muted">{dict.post.notFoundText}</p>
            <ButtonLink href="/blog">
              <ArrowLeft className="h-4 w-4" />{dict.post.backToBlog}
            </ButtonLink>
          </div>
        </Container>
      </div>
    );
  }

  const p = localizePost(state.post, lang);
  const title = p.title;
  const content = p.content;

  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <nav aria-label={dict.post.breadcrumbAria} className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
          <Link href="/" className="hover:text-accent">{dict.post.breadcrumbHome}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-accent">{dict.post.breadcrumbBlog}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 text-ink-muted">{title}</span>
        </nav>

        <article className="mx-auto mt-8 max-w-3xl">
          {p.createdAt && (
            <span className="label text-ink-dim">{formatDate(p.createdAt, dict.months)}</span>
          )}
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h1>

          {p.image && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={title} className="w-full object-cover" />
            </div>
          )}

          {p.video && (
            <div className="mt-8 aspect-video overflow-hidden rounded-3xl border border-line">
              <video src={p.video} controls className="h-full w-full" />
            </div>
          )}

          <div
            className="mt-8 leading-relaxed text-ink-muted [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_img]:my-6 [&_img]:rounded-2xl [&_li]:mb-1.5 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_ul]:mb-4"
            dangerouslySetInnerHTML={{ __html: content ?? "" }}
          />
        </article>

        <div className="mt-16 mb-20">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {dict.post.allPosts}
          </Link>
        </div>
      </Container>
    </div>
  );
}
