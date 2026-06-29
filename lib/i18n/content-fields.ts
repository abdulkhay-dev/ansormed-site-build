import ru from "./dictionaries/ru";

/**
 * Поля сайта, которые редактируются через админку (GET/POST /api/v1/content/).
 *
 * Список собирается автоматически из словаря `ru`: берём все строковые листья,
 * исключая меню, aria/служебные подписи, SEO-коды и форматные данные.
 *
 * ВАЖНО: API ограничивает `section` пятью значениями
 * (`header | hero | about | services | footer`), поэтому полный путь поля
 * хранится в `key` (например `home.categories.title`), а `section` — только
 * «корзина» для группировки в админке. Сайт применяет контент ПО `key`.
 *
 * Перекрываются только ru/uz (в content-API нет EN).
 */
export interface ContentField {
  section: string; // одна из 5 разрешённых секций (корзина для админки)
  key: string; // полный dot-путь в словаре
}

/** Полный путь поля в словаре (== key). */
export const fieldPath = (f: ContentField): string => f.key;

// Что НЕ выносим в CMS.
const EXCLUDE_EXACT = new Set([
  "skipToContent",
  "currencyUnit",
  "langSwitcher.aria",
  "meta.ogLocale",
  "header.openMenu",
  "header.closeMenu",
  "header.navLabel",
  "header.mainNavAria",
]);
const EXCLUDE_PREFIX = ["nav", "meta.keywords", "months"];
const isAria = (p: string) => /aria$/i.test(p);

// Раскладка верхних разделов словаря по 5 разрешённым секциям API.
const SECTION_BUCKET: Record<string, string> = {
  header: "header",
  hero: "hero",
  home: "hero",
  anatomy: "hero",
  about: "about",
  advantages: "about",
  stats: "about",
  values: "about",
  timeline: "about",
  blog: "services",
  post: "services",
  products: "services",
  product: "services",
  footer: "footer",
  meta: "footer",
  site: "footer",
  preloader: "footer",
  cta: "footer",
  contacts: "footer",
  contactForm: "footer",
  notFound: "footer",
};
const bucketOf = (top: string) => SECTION_BUCKET[top] ?? "footer";

function collectLeaves(obj: unknown, prefix: string, out: string[]): void {
  if (obj === null || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.push(path);
    else if (v && typeof v === "object") collectLeaves(v, path, out);
  }
}

function buildFields(): ContentField[] {
  const leaves: string[] = [];
  collectLeaves(ru, "", leaves);
  return leaves
    .filter((p) => !EXCLUDE_EXACT.has(p))
    .filter((p) => !EXCLUDE_PREFIX.some((pre) => p === pre || p.startsWith(pre + ".")))
    .filter((p) => !isAria(p))
    .filter((p) => p.includes("."))
    .map((p) => ({ section: bucketOf(p.split(".")[0]), key: p }));
}

export const CONTENT_FIELDS: ContentField[] = buildFields();

/** Множество допустимых путей — по нему сайт решает, применять ли запись. */
export const CONTENT_PATHS: Set<string> = new Set(CONTENT_FIELDS.map((f) => f.key));

/**
 * Записывает значение по dot-пути ТОЛЬКО если такой лист уже существует и это
 * строка (защита от мусора и от создания новых полей). Поддерживает числовые
 * сегменты (индексы массивов). Возвращает true при перезаписи.
 */
export function setStringPath(obj: unknown, path: string, value: string): boolean {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = cur[parts[i]];
    if (typeof next !== "object" || next === null) return false;
    cur = next as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1];
  if (typeof cur[leaf] !== "string") return false;
  cur[leaf] = value;
  return true;
}
