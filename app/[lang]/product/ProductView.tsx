"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Phone,
  Check,
  Loader2,
  PackageX,
} from "lucide-react";
import {
  getProductBySlug,
  listCategories,
  listSubcategories,
  type ProductOut,
} from "@/lib/api";
import {
  localizeProduct,
  buildCategoryContext,
  type CategoryContext,
  type LocalProduct,
} from "@/lib/catalog";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { Icon } from "@/components/ui/Icon";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { cn, formatPrice, iconForCategory } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "ok"; product: ProductOut; ctx: CategoryContext }
  | { status: "missing" };

export default function ProductView({ slug }: { slug: string }) {
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
    Promise.all([
      getProductBySlug(slug),
      listCategories().catch(() => []),
      listSubcategories().catch(() => []),
    ])
      .then(([product, cats, subs]) => {
        if (cancelled) return;
        setState(
          product
            ? { status: "ok", product, ctx: buildCategoryContext(cats, subs) }
            : { status: "missing" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // SEO из API: заголовок вкладки и meta-description.
  useEffect(() => {
    if (state.status !== "ok") return;
    const lp = localizeProduct(state.product, lang, state.ctx);
    document.title = lp.seo.title || `${lp.name} — Ansor Med`;
    const desc = lp.seo.description || lp.description.slice(0, 160);
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
              <PackageX className="h-7 w-7 text-ink-muted" />
            </span>
            <h1 className="font-display text-2xl font-semibold text-ink">{dict.product.notFoundTitle}</h1>
            <p className="max-w-sm text-ink-muted">
              {dict.product.notFoundText}
            </p>
            <ButtonLink href="/products">
              <ArrowLeft className="h-4 w-4" />{dict.product.backToCatalog}
            </ButtonLink>
          </div>
        </Container>
      </div>
    );
  }

  const p = localizeProduct(state.product, lang, state.ctx);
  const price = formatPrice(p.price, null, dict.currencyUnit);
  const oldPrice = formatPrice(p.oldPrice, null, dict.currencyUnit);
  const specs: { label: string; value: string }[] = [
    p.categoryName ? { label: dict.product.categoryLabel, value: p.categoryName } : null,
    { label: dict.product.availabilityLabel, value: p.available ? dict.product.inStock : dict.product.onOrder },
    price ? { label: dict.product.priceLabel, value: price } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="pt-28 md:pt-36">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label={dict.product.breadcrumbAria} className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
          <Link href="/" className="hover:text-accent">{dict.product.breadcrumbHome}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-accent">{dict.product.breadcrumbProducts}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink-muted">{p.name}</span>
        </nav>

        <div className="mt-8 lg:[&::after]:clear-both lg:[&::after]:table lg:[&::after]:content-['']">
          {/* Media — floats left on desktop so the description wraps beneath it */}
          <div className="mb-8 lg:float-left lg:mb-4 lg:mr-12 lg:w-[46%]">
            <ProductMedia product={p} />
          </div>

          {/* Info — flows around the media, filling the space under the image */}
          <div className="min-w-0">
            {p.categoryName && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-accent">
                <Icon name={iconForCategory(p.categoryName)} className="h-3.5 w-3.5" />
                {p.categoryName}
              </span>
            )}
            <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl">{p.name}</h1>

            <div className="mt-6 flex items-baseline gap-3">
              {price ? (
                <>
                  <span className="font-display text-3xl font-semibold text-ink">{price}</span>
                  {oldPrice && (
                    <span className="text-xl text-ink-dim line-through">{oldPrice}</span>
                  )}
                </>
              ) : (
                <span className="text-lg text-ink-muted">{dict.product.priceOnRequest}</span>
              )}
            </div>

            {p.description && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-muted">
                {p.description}
              </p>
            )}

            {p.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
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

            {/* Specs */}
            <div className="mt-7 overflow-hidden rounded-2xl border border-line">
              <dl className="grid sm:grid-cols-2">
                {specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                      i % 2 === 0 ? "sm:border-r border-line" : ""
                    } border-b border-line last:border-b-0`}
                  >
                    <dt className="text-sm text-ink-muted">{s.label}</dt>
                    <dd className="text-right text-sm font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contacts" size="lg">
                <FileText className="h-4 w-4" />
                {dict.product.requestPrice}
              </ButtonLink>
              <ButtonLink href="/contacts" variant="secondary" size="lg">
                <Phone className="h-4 w-4" />
                {dict.product.contact}
              </ButtonLink>
            </div>

            <ul className="mt-7 flex flex-col gap-2.5 text-sm text-ink-muted">
              {dict.product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent ring-1 ring-accent/20">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 mb-20">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {dict.product.allCatalog}
          </Link>
        </div>
      </Container>
    </div>
  );
}

/** Картинка с зум-лупой при наведении: фон увеличивается и следует за курсором. */
function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setPos({ x, y });
  };

  return (
    <div
      ref={ref}
      role="img"
      aria-label={alt}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      className="h-full w-full cursor-zoom-in bg-surface bg-no-repeat transition-[background-size] duration-200 ease-out"
      style={{
        backgroundImage: `url("${src}")`,
        backgroundSize: pos ? "220%" : "cover",
        backgroundPosition: pos ? `${pos.x}% ${pos.y}%` : "center",
      }}
    />
  );
}

/** YouTube/Vimeo → iframe-embed; иначе прямой файл в <video>. */
function toVideoEmbed(url: string): { type: "iframe" | "video"; src: string } {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { type: "video", src: url };
}

/** Галерея изображений товара + видео. */
function ProductMedia({ product }: { product: LocalProduct }) {
  const dict = useDict();
  const [active, setActive] = useState(0);
  const current = product.images[active];
  const embed = product.video ? toVideoEmbed(product.video) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        {current ? (
          <ZoomImage src={current} alt={product.name} />
        ) : (
          <MediaVisual
            seed={String(product.id)}
            icon={iconForCategory(product.categoryName)}
            label={product.name}
            className="h-full w-full"
          />
        )}
        <span
          className={`label absolute left-4 top-4 rounded-full px-2.5 py-1 backdrop-blur ${
            product.available
              ? "bg-signal/15 text-signal ring-1 ring-signal/30"
              : "bg-surface/90 text-ink-muted ring-1 ring-line"
          }`}
        >
          {product.available ? dict.product.inStock : dict.product.onOrder}
        </span>
      </div>

      {product.images.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${product.name} — ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-colors",
                i === active ? "border-accent" : "border-line hover:border-line-strong",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {embed && (
        <ProductVideo embed={embed} poster={product.image} title={product.name} />
      )}
    </div>
  );
}

/** Видео: у YouTube/Vimeo — их собственный плеер (обложка, play, контролы). */
function ProductVideo({
  embed,
  poster,
  title,
}: {
  embed: { type: "iframe" | "video"; src: string };
  poster: string | null;
  title: string;
}) {
  const dict = useDict();

  return (
    <div className="mt-1 overflow-hidden rounded-3xl border border-line bg-black shadow-soft">
      {embed.type === "iframe" ? (
        <iframe
          src={`${embed.src}${embed.src.includes("?") ? "&" : "?"}controls=1&rel=0&playsinline=1`}
          title={`${title} — ${dict.blog.videoBadge}`}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={embed.src}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full"
        />
      )}
    </div>
  );
}
