import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/data/products";
import { categoryById } from "@/lib/data/categories";
import { MediaVisual } from "@/components/ui/MediaVisual";

export function ProductCard({ product }: { product: Product }) {
  const category = categoryById(product.categoryId);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface border border-line shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[4/3] w-full">
        <MediaVisual
          seed={product.slug}
          icon={category?.icon}
          label={`${product.name} — ${category?.name ?? "оборудование"}`}
          className="h-full w-full"
        />
        {product.badge && (
          <span className="label absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 text-white shadow-soft">
            {product.badge}
          </span>
        )}
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full glass-strong text-ink-muted transition-all duration-300 group-hover:text-accent group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          {category?.short}
        </span>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {product.tagline}
        </p>
      </div>
    </Link>
  );
}
