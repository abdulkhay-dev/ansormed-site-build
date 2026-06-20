import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Phone,
  FileText,
  ChevronRight,
  ShieldCheck,
  Video,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import {
  products,
  productBySlug,
  productOverview,
  productApplications,
  productLinks,
  type LinkKind,
} from "@/lib/data/products";
import { categoryById } from "@/lib/data/categories";
import { Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductCard } from "@/components/cards/ProductCard";
import { Icon } from "@/components/ui/Icon";

const LINK_ICON: Record<LinkKind, typeof FileText> = {
  doc: FileText,
  cert: ShieldCheck,
  video: Video,
  site: ExternalLink,
};

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const category = categoryById(product.categoryId);
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.slug !== product.slug)
    .slice(0, 3);
  const fill = related.length < 3
    ? products.filter((p) => p.slug !== product.slug && !related.includes(p)).slice(0, 3 - related.length)
    : [];
  const relatedFinal = [...related, ...fill];

  const overview = productOverview(product);
  const applications = productApplications(product);
  const links = productLinks(product);

  return (
    <>
      <div className="pt-28 md:pt-36">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
            <Link href="/" className="hover:text-accent">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-accent">Продукция</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-ink-muted">{product.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <Reveal>
              <ProductGallery slug={product.slug} icon={category?.icon} name={product.name} />
            </Reveal>

            {/* Info */}
            <Reveal delay={0.1} className="flex flex-col">
              {category && (
                <Link
                  href={`/products?category=${category.id}`}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-accent transition-colors hover:border-accent/40"
                >
                  <Icon name={category.icon} className="h-3.5 w-3.5" />
                  {category.short}
                </Link>
              )}
              <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 text-lg text-accent">{product.tagline}</p>
              <p className="mt-5 leading-relaxed text-ink-muted">{product.description}</p>

              {/* Features */}
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent ring-1 ring-accent/20">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/contacts" size="lg">
                  <FileText className="h-4 w-4" />
                  Запросить цену
                </ButtonLink>
                <ButtonLink href="/contacts" variant="secondary" size="lg">
                  <Phone className="h-4 w-4" />
                  Связаться
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {/* Overview + applications */}
          <Reveal className="mt-16 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
            <div>
              <h2 className="font-display text-2xl font-semibold">Описание</h2>
              <div className="mt-5 flex flex-col gap-4">
                {overview.map((para, i) => (
                  <p key={i} className="leading-relaxed text-ink-muted">{para}</p>
                ))}
              </div>
            </div>
            {applications.length > 0 && (
              <div className="rounded-3xl bg-surface border border-line p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-ink">Области применения</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {applications.map((a) => (
                    <li key={a} className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          {/* Specs */}
          <Reveal className="mt-16">
            <h2 className="font-display text-2xl font-semibold">Характеристики</h2>
            <div className="mt-6 overflow-hidden rounded-3xl glass">
              <dl className="grid sm:grid-cols-2">
                {product.specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center justify-between gap-4 px-6 py-4 ${
                      i % 2 === 0 ? "sm:border-r border-line" : ""
                    } border-b border-line`}
                  >
                    <dt className="text-sm text-ink-muted">{s.label}</dt>
                    <dd className="text-right font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* Documents & links */}
          <Reveal className="mt-16">
            <h2 className="font-display text-2xl font-semibold">Документы и материалы</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {links.map((l) => {
                const LinkIcon = LINK_ICON[l.kind];
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl bg-surface border border-line p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-wash text-accent ring-1 ring-accent/15">
                      <LinkIcon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-ink">{l.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-ink-dim transition-all duration-200 group-hover:text-accent group-hover:rotate-45" />
                  </a>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-ink-dim">
              Нужны полные технические данные или коммерческое предложение?{" "}
              <Link href="/contacts" className="font-medium text-accent hover:underline">
                Свяжитесь с нами
              </Link>{" "}
              — пришлём документацию по вашему запросу.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* Related */}
      <section className="py-20 md:py-24">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Похожее оборудование
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Весь каталог
            </Link>
          </div>
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedFinal.map((p) => (
              <RevealItem key={p.slug}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>
    </>
  );
}
