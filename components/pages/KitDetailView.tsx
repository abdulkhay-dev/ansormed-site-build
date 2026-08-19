"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, Loader2, PackageX, Phone } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { Prose, looksLikeHtml } from "@/components/ui/Prose";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { interpolate } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { getKitBySlug, kitPdfUrl, listCategories, listSubcategories } from "@/lib/api";
import { buildCategoryContext, localizeKit, type LocalKit } from "@/lib/catalog";

type State =
  | { status: "loading" }
  | { status: "ok"; kit: LocalKit }
  | { status: "missing" };

export default function KitDetailView({ slug }: { slug: string }) {
  const dict = useDict();
  const lang = useLang();
  const t = dict.kits;
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!slug) {
      setState({ status: "missing" });
      return;
    }
    setState({ status: "loading" });
    let cancelled = false;
    Promise.all([
      getKitBySlug(slug),
      listCategories().catch(() => []),
      listSubcategories().catch(() => []),
    ])
      .then(([kit, cats, subs]) => {
        if (cancelled) return;
        setState(
          kit
            ? { status: "ok", kit: localizeKit(kit, lang, buildCategoryContext(cats, subs)) }
            : { status: "missing" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, lang]);

  useEffect(() => {
    if (state.status === "ok") document.title = `${state.kit.name} — Ansor Med`;
  }, [state]);

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
            <h1 className="font-display text-2xl font-semibold text-ink">{t.notFound}</h1>
            <ButtonLink href="/kits">{t.allKits}</ButtonLink>
          </div>
        </Container>
      </div>
    );
  }

  const kit = state.kit;
  const price = formatPrice(kit.price, null, dict.currencyUnit);
  const itemsTotal =
    kit.itemsTotal != null && kit.price != null && kit.itemsTotal > kit.price
      ? formatPrice(kit.itemsTotal, null, dict.currencyUnit)
      : null;
  const count = kit.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink-dim">
          <Link href="/kits" className="transition-colors hover:text-accent">
            {t.header.title}
          </Link>
          <span>/</span>
          <span className="truncate text-ink-muted">{kit.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-white">
            <div className="aspect-[4/3] w-full">
              {kit.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kit.image} alt={kit.name} className="h-full w-full object-cover" />
              ) : (
                <MediaVisual
                  seed={String(kit.id)}
                  icon="Boxes"
                  label={kit.name}
                  className="h-full w-full"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="label text-accent">{interpolate(t.itemsCount, { count })}</span>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
              {kit.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              {price ? (
                <>
                  <span className="font-display text-3xl font-semibold text-ink">{price}</span>
                  {itemsTotal && (
                    <span className="text-lg text-ink-dim line-through">{itemsTotal}</span>
                  )}
                </>
              ) : (
                <span className="text-lg text-ink-muted">{dict.product.priceOnRequest}</span>
              )}
              {kit.discountPercent != null && kit.discountPercent > 0 && (
                <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
                  −{Math.round(kit.discountPercent)}%
                </span>
              )}
            </div>

            {kit.description &&
              (looksLikeHtml(kit.description) ? (
                <Prose html={kit.description} className="mt-6" />
              ) : (
                <p className="mt-6 leading-relaxed text-ink-muted">{kit.description}</p>
              ))}

            {kit.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {kit.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <AddToCartButton
                line={{
                  kind: "kit",
                  id: kit.id,
                  name: kit.name,
                  slug: kit.slug,
                  image: kit.image,
                  price: kit.price,
                }}
              />
              <ButtonLink href="/contacts" variant="secondary" size="lg">
                <Phone className="h-4 w-4" />
                {dict.product.contact}
              </ButtonLink>
            </div>

            {/* PDF комплекта — /api/kits/{id}/pdf/, прямая ссылка на бэкенд. */}
            <a
              href={kitPdfUrl(kit.id)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("ghost", "md", "mt-4 self-start px-0")}
            >
              <Download className="h-4 w-4" />
              {dict.product.downloadPdf}
            </a>
          </div>
        </div>

        {/* Состав комплекта */}
        {kit.items.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-ink">{t.contents}</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {kit.items.map(({ product, quantity }) => {
                const itemPrice = formatPrice(product.price, null, dict.currencyUnit);
                return (
                  <li key={product.id}>
                    <Link
                      href={`/product/${encodeURIComponent(product.slug)}`}
                      className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <MediaVisual
                            seed={String(product.id)}
                            label={product.name}
                            className="h-full w-full"
                          />
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">
                        {product.name}
                      </span>
                      <span className="shrink-0 text-sm text-ink-muted">
                        {interpolate(t.quantity, { count: quantity })}
                        {itemPrice ? ` · ${itemPrice}` : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-16 mb-20">
          <Link
            href="/kits"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.allKits}
          </Link>
        </div>
      </Container>
    </div>
  );
}
