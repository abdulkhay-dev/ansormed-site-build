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
  return `${d.getUTCDate()} ${RU_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
