"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2, Newspaper } from "lucide-react";
import { getPost, type ApiBlogPost } from "@/lib/api";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { formatDateRu } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "ok"; post: ApiBlogPost }
  | { status: "missing" };

export default function PostPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setState({ status: "missing" });
      return;
    }
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
  }, []);

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
            <h1 className="font-display text-2xl font-semibold text-ink">Статья не найдена</h1>
            <p className="max-w-sm text-ink-muted">Возможно, она была удалена или ещё не опубликована.</p>
            <ButtonLink href="/blog">
              <ArrowLeft className="h-4 w-4" />В блог
            </ButtonLink>
          </div>
        </Container>
      </div>
    );
  }

  const p = state.post;

  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
          <Link href="/" className="hover:text-accent">Главная</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-accent">Блог</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 text-ink-muted">{p.title_ru}</span>
        </nav>

        <article className="mx-auto mt-8 max-w-3xl">
          {p.created_at && (
            <span className="label text-ink-dim">{formatDateRu(p.created_at)}</span>
          )}
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            {p.title_ru}
          </h1>

          {p.image && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.title_ru} className="w-full object-cover" />
            </div>
          )}

          {p.video_url && (
            <div className="mt-8 aspect-video overflow-hidden rounded-3xl border border-line">
              <video src={p.video_url} controls className="h-full w-full" />
            </div>
          )}

          <div
            className="mt-8 leading-relaxed text-ink-muted [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_img]:my-6 [&_img]:rounded-2xl [&_li]:mb-1.5 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_ul]:mb-4"
            dangerouslySetInnerHTML={{ __html: p.content_ru ?? "" }}
          />
        </article>

        <div className="mt-16 mb-20">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Все статьи
          </Link>
        </div>
      </Container>
    </div>
  );
}
