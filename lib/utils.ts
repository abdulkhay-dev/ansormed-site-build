export type ClassValue = string | number | null | false | undefined;

/** Shared cubic-bezier easing (easeOutExpo-ish) typed as a 4-tuple for Framer Motion. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Tiny classnames joiner (no extra deps). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Slug детальной страницы из URL вида `/{lang}/{type}/{slug}/` — третий сегмент.
 * Детальные маршруты (product/post/project) собираются одной статической
 * оболочкой на язык, поэтому реальный slug берём из адреса на клиенте.
 */
export function slugFromPathname(pathname: string | null | undefined): string {
  const seg = (pathname ?? "").split("/").filter(Boolean)[2] ?? "";
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

/**
 * Format an ISO date string to a localized long form, e.g. "12 мая 2026"
 * or "12 may 2026". Названия месяцев берутся из словаря (dict.months).
 */
export function formatDate(iso: string, months: readonly string[]): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Цена в формате "40 000 сум" / "40 000 so'm". null → null (показываем
 * «Цена по запросу»). Денежная единица по умолчанию берётся из словаря.
 */
export function formatPrice(
  price: number | null | undefined,
  currency: string | null | undefined,
  defaultUnit: string,
): string | null {
  if (price == null) return null;
  const n = new Intl.NumberFormat("ru-RU").format(price);
  const unit = currency === "UZS" || !currency ? defaultUnit : currency;
  return `${n} ${unit}`.trim();
}

/** Подбор иконки из реестра @/components/ui/Icon по названию/слагу категории. */
const ICON_RULES: [RegExp, string][] = [
  [/rehab|physio|реабил|физио/i, "Activity"],
  [/furnitur|trolley|мебел|тележ|ходун/i, "Boxes"],
  [/diagnos|radiolog|imaging|диагнос|рентген|узи/i, "ScanLine"],
  [/neuro|невро/i, "Brain"],
  [/monitor|cardio|gynecol|pediatr|монитор|кардио|гинеколог|педиатр/i, "HeartPulse"],
  [/lab|стерил|анализ/i, "FlaskConical"],
  [/surg|instrument|хирург|инструмент/i, "Wrench"],
  [/emergency|скор|неотлож/i, "LifeBuoy"],
];

export function iconForCategory(raw?: string | null): string {
  if (!raw) return "Boxes";
  for (const [re, icon] of ICON_RULES) if (re.test(raw)) return icon;
  return "Boxes";
}

/** Категория реабилитации должна быть первой в публичных списках. */
export function categorySortRank(category: {
  id?: string | number | null;
  name?: string | null;
  slug?: string | null;
}): number {
  if (String(category.id) === "1") return 0;
  const value = `${category.name ?? ""} ${category.slug ?? ""}`;
  return /rehab|реабил|reabil/i.test(value) ? 0 : 1;
}
