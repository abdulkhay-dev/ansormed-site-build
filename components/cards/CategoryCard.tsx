import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/data/categories";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";

const accentMap: Record<string, string> = {
  cyan: "text-accent",
  mint: "text-accent-soft",
  violet: "text-accent-soft",
  amber: "text-accent",
};

export function CategoryCard({
  category,
  cta,
}: {
  category: Category;
  cta: string;
}) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.apiCategory)}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-surface border border-line p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      {/* hover glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-wash ring-1 ring-accent/15 transition-colors duration-300 group-hover:ring-accent/30">
        <Icon
          name={category.icon}
          className={`h-6 w-6 ${accentMap[category.accent] ?? "text-accent"}`}
          strokeWidth={1.6}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-lg font-semibold text-ink">
          {category.name}
        </h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          {category.description}
        </p>
      </div>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
