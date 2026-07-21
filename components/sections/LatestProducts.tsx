"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  getCatalog,
  listCategories,
  listSubcategories,
  type CategoryOut,
  type ProductOut,
  type SubCategory,
} from "@/lib/api";
import {
  buildCategoryContext,
  isProductVisible,
  localizeProduct,
  type LocalProduct,
} from "@/lib/catalog";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { NewBadge } from "@/components/ui/NewBadge";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { formatPrice, iconForCategory } from "@/lib/utils";

/** Сколько новинок показываем максимум и сколько добираем, если новых мало. */
const MAX_ITEMS = 8;
const MIN_ITEMS = 4;

/**
 * Блок новинок на главной. Показываем товары, добавленные за последнюю неделю
 * (см. NEW_PRODUCT_DAYS) — так новинка гарантированно висит на главной минимум
 * неделю. Если свежих мало, добираем самыми последними, чтобы блок не пустовал.
 */
export function LatestProducts() {
  const lang = useLang();
  const [items, setItems] = useState<LocalProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCatalog(),
      listCategories().catch(() => [] as CategoryOut[]),
      listSubcategories().catch(() => [] as SubCategory[]),
    ])
      .then(([products, cats, subs]: [ProductOut[], CategoryOut[], SubCategory[]]) => {
        if (cancelled) return;
        const ctx = buildCategoryContext(cats ?? [], subs ?? []);
        const sorted = (products ?? [])
          .filter((p) => isProductVisible(p))
          .map((p) => localizeProduct(p, lang, ctx))
          .sort((a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""));
        const fresh = sorted.filter((p) => p.isNew);
        setItems(
          fresh.length >= MIN_ITEMS
            ? fresh.slice(0, MAX_ITEMS)
            : sorted.slice(0, MIN_ITEMS),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang]);

  if (items.length === 0) return null;

  return (
    <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((p) => (
        <RevealItem key={p.id}>
          <NewProductCard product={p} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

function NewProductCard({ product }: { product: LocalProduct }) {
  const dict = useDict();
  const price = formatPrice(product.price, null, dict.currencyUnit);
  return (
    <Link
      href={`/product/${encodeURIComponent(product.slug)}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[4/3] w-full bg-white">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <MediaVisual
            seed={String(product.id)}
            icon={iconForCategory(product.categoryName)}
            label={product.name}
            className="h-full w-full"
          />
        )}
        {product.isNew && <NewBadge className="absolute left-4 top-4" />}
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full glass-strong text-ink-muted transition-all duration-300 group-hover:rotate-45 group-hover:text-accent">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {product.categoryName && (
          <span className="text-xs font-medium uppercase tracking-wider text-accent">
            {product.categoryName}
          </span>
        )}
        <h3 className="font-display text-base font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          <span className="font-display text-sm font-semibold text-ink">
            {price || dict.product.priceOnRequest}
          </span>
        </div>
      </div>
    </Link>
  );
}
