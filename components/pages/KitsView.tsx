"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2, PackageX } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { usePageTitle } from "@/components/app/usePageTitle";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { interpolate } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { listCategories, listKits, listSubcategories } from "@/lib/api";
import { buildCategoryContext, localizeKit, type LocalKit } from "@/lib/catalog";

export default function KitsView() {
  const dict = useDict();
  const lang = useLang();
  const t = dict.kits;
  const [kits, setKits] = useState<LocalKit[] | null>(null);

  usePageTitle(`${t.meta.title} — Ansor Med`);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listKits(),
      listCategories().catch(() => []),
      listSubcategories().catch(() => []),
    ])
      .then(([raw, cats, subs]) => {
        if (cancelled) return;
        const ctx = buildCategoryContext(cats, subs);
        setKits(raw.map((k) => localizeKit(k, lang, ctx)));
      })
      .catch(() => {
        if (!cancelled) setKits([]);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <>
      <PageHeader
        eyebrow={t.header.eyebrow}
        title={<>{t.header.title}</>}
        subtitle={t.header.subtitle}
      />

      <section className="py-12 md:py-16">
        <Container>
          {kits === null ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : kits.length === 0 ? (
            <Reveal className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-[2rem] glass p-10 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-ink-dim ring-1 ring-line-strong">
                <PackageX className="h-7 w-7" />
              </span>
              <h2 className="font-display text-xl font-semibold text-ink">
                {t.emptyTitle}
              </h2>
              <p className="text-ink-muted">{t.emptyText}</p>
              <ButtonLink href="/products">{t.toCatalog}</ButtonLink>
            </Reveal>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {kits.map((kit, i) => (
                <Reveal key={kit.id} delay={i * 0.05}>
                  <KitCard kit={kit} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

function KitCard({ kit }: { kit: LocalKit }) {
  const dict = useDict();
  const t = dict.kits;
  const price = formatPrice(kit.price, null, dict.currencyUnit);
  const itemsTotal =
    kit.itemsTotal != null && kit.price != null && kit.itemsTotal > kit.price
      ? formatPrice(kit.itemsTotal, null, dict.currencyUnit)
      : null;
  const count = kit.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Link
      href={`/kit/${encodeURIComponent(kit.slug)}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[4/3] w-full bg-white">
        {kit.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={kit.image}
            alt={kit.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <MediaVisual seed={String(kit.id)} icon="Boxes" label={kit.name} className="h-full w-full" />
        )}
        {kit.discountPercent != null && kit.discountPercent > 0 && (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
            −{Math.round(kit.discountPercent)}%
          </span>
        )}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full glass-strong text-ink-muted transition-all duration-300 group-hover:rotate-45 group-hover:text-accent">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <AddToCartButton
            variant="icon"
            line={{
              kind: "kit",
              id: kit.id,
              name: kit.name,
              slug: kit.slug,
              image: kit.image,
              price: kit.price,
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          {interpolate(t.itemsCount, { count })}
        </span>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {kit.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {price ? (
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-base font-semibold text-ink">{price}</span>
              {itemsTotal && (
                <span className="text-xs text-ink-dim line-through">{itemsTotal}</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-ink-dim">{dict.product.priceOnRequest}</span>
          )}
          <span className="shrink-0 text-sm font-medium text-accent group-hover:underline">
            {dict.products.more}
          </span>
        </div>
      </div>
    </Link>
  );
}
