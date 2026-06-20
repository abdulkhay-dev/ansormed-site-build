export type ClassValue = string | number | null | false | undefined;

/** Shared cubic-bezier easing (easeOutExpo-ish) typed as a 4-tuple for Framer Motion. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Tiny classnames joiner (no extra deps). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO date string to Russian long form, e.g. "12 мая 2026". */
const RU_MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function formatDateRu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${RU_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Цена в формате "40 000 сум". null → null (показываем «Цена по запросу»). */
export function formatPrice(
  price?: number | null,
  currency?: string | null,
): string | null {
  if (price == null) return null;
  const n = new Intl.NumberFormat("ru-RU").format(price);
  const unit = currency === "UZS" || !currency ? "сум" : currency;
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
