"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Phone,
  Check,
  Loader2,
  PackageX,
} from "lucide-react";
import { getProductById, type ApiProduct } from "@/lib/api";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { Icon } from "@/components/ui/Icon";
import { useDict } from "@/components/i18n/I18nProvider";
import { formatPrice, iconForCategory } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "ok"; product: ApiProduct }
  | { status: "missing" };

export default function ProductPage() {
  const dict = useDict();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setState({ status: "missing" });
      return;
    }
    let cancelled = false;
    getProductById(id)
      .then((product) => {
        if (cancelled) return;
        setState(product ? { status: "ok", product } : { status: "missing" });
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

  const p = state.product;
  const price = formatPrice(p.price, p.currency, dict.currencyUnit);
  const specs: { label: string; value: string }[] = [
    p.category ? { label: dict.product.categoryLabel, value: p.category } : null,
    p.brand ? { label: dict.product.brandLabel, value: p.brand } : null,
    { label: dict.product.availabilityLabel, value: p.in_stock ? dict.product.inStock : dict.product.onOrder },
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

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Media */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <MediaVisual seed={p.id} icon={iconForCategory(p.category)} label={p.name} className="h-full w-full" />
            )}
            <span
              className={`label absolute left-4 top-4 rounded-full px-2.5 py-1 backdrop-blur ${
                p.in_stock
                  ? "bg-signal/15 text-signal ring-1 ring-signal/30"
                  : "bg-surface/90 text-ink-muted ring-1 ring-line"
              }`}
            >
              {p.in_stock ? dict.product.inStock : dict.product.onOrder}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {p.category && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-accent">
                <Icon name={iconForCategory(p.category)} className="h-3.5 w-3.5" />
                {p.category}
              </span>
            )}
            <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl">{p.name}</h1>
            {p.brand && <p className="mt-3 text-lg text-accent">{p.brand}</p>}

            <div className="mt-6 flex items-baseline gap-3">
              {price ? (
                <span className="font-display text-3xl font-semibold text-ink">{price}</span>
              ) : (
                <span className="text-lg text-ink-muted">{dict.product.priceOnRequest}</span>
              )}
            </div>

            {p.description && (
              <p className="mt-5 leading-relaxed text-ink-muted">{p.description}</p>
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
