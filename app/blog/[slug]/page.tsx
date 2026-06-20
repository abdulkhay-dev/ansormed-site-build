import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import { posts, postBySlug, type Block } from "@/lib/data/posts";
import { formatDateRu } from "@/lib/utils";
import { Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { BlogCard } from "@/components/cards/BlogCard";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return { title: "Статья не найдена" };
  return { title: post.title, description: post.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  const related = posts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .concat(posts.filter((p) => p.slug !== post.slug && p.category !== post.category))
    .slice(0, 3);

  return (
    <>
      <article className="pt-28 md:pt-36">
        <Container>
          <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
            <Link href="/" className="hover:text-accent">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/blog" className="hover:text-accent">Блог</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-ink-muted line-clamp-1">{post.title}</span>
          </nav>

          <div className="mx-auto mt-8 max-w-3xl">
            <Reveal className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-line-strong bg-surface-2 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-ink-dim">
                  <Calendar className="h-4 w-4" />
                  {formatDateRu(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-ink-dim">
                  <Clock className="h-4 w-4" />
                  {post.readingMinutes} мин чтения
                </span>
              </div>
              <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-ink-muted">
                {post.excerpt}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-8 overflow-hidden rounded-[2rem] glass">
              <MediaVisual
                seed={post.slug}
                icon="Brain"
                label={`Обложка статьи: ${post.title}`}
                className="aspect-[16/9] w-full"
              />
            </Reveal>

            {/* Content */}
            <div className="mt-10 flex flex-col gap-6">
              {post.content.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}
            </div>

            <div className="mt-12 border-t border-line pt-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Ко всем статьям
              </Link>
            </div>
          </div>
        </Container>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-20 md:py-24">
          <Container>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Похожие статьи
            </h2>
            <RevealGroup className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <RevealItem key={p.slug}>
                  <BlogCard post={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </section>
      )}
    </>
  );
}

function ContentBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
          {block.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="rounded-2xl border-l-2 border-accent bg-surface-2 px-6 py-5 text-lg italic leading-relaxed text-ink">
          {block.text}
        </blockquote>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-ink-muted">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p className="text-base leading-[1.8] text-ink-muted md:text-lg">
          {block.text}
        </p>
      );
  }
}
