"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Loader2, Newspaper } from "lucide-react";
import { getPostBySlug, type ApiBlogPost } from "@/lib/api";
import { localizePost, plainText } from "@/lib/blog";
import { Container } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { formatDate } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "ok"; post: ApiBlogPost }
  | { status: "missing" };

export default function PostView({ slug }: { slug: string }) {
  const dict = useDict();
  const lang = useLang();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!slug) {
      setState({ status: "missing" });
      return;
    }
    setState({ status: "loading" });
    let cancelled = false;
    getPostBySlug(slug)
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
  }, [slug]);

  // SEO из API: заголовок вкладки и meta-description (клиентский рендер).
  useEffect(() => {
    if (state.status !== "ok") return;
    const p = localizePost(state.post, lang);
    document.title = p.seo.title || `${p.title} — Ansor Med`;
    const desc = p.seo.description || plainText(p.content).slice(0, 160);
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", desc);
  }, [state, lang]);

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

          <Prose html={content ?? ""} className="mt-8" />

          {p.images.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={title}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl border border-line object-cover"
                />
              ))}
            </div>
          )}

          {p.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-ink-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
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
