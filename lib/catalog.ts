import type { Locale } from "@/lib/i18n";
import {
  mediaUrl,
  type CategoryOut,
  type KitOut,
  type ProductOut,
  type SubCategory,
} from "@/lib/api";

/** Товар, локализованный под язык и готовый к отрисовке. */
export interface LocalProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  /** Итоговая цена (с учётом скидки), либо null — «по запросу». */
  price: number | null;
  /** Старая цена до скидки (зачёркивается), либо null — скидки нет. */
  oldPrice: number | null;
  /** Размер скидки в процентах, либо null. */
  discountPercent: number | null;
  /** Первая картинка (для карточки). */
  image: string | null;
  /** Все картинки (галерея на детальной), абсолютные URL. */
  images: string[];
  /** Видео товара: ссылка (YouTube/Vimeo) или файл, либо null. */
  video: string | null;
  /** Ключевые слова/теги товара. */
  tags: string[];
  subcategoryId: number | null;
  categoryId: number | null;
  categoryName: string | null;
  /** SEO-мета (общая, не по языкам). */
  seo: { title: string; description: string; keywords: string };
  available: boolean;
  /** Дата добавления товара (ISO), либо null. */
  createdAt: string | null;
  /** Товар добавлен недавно — показываем бейдж «NEW». */
  isNew: boolean;
}

/** Категория, локализованная под язык. */
export interface LocalCategory {
  id: number;
  name: string;
}

/** Контекст для резолва категории товара через его подкатегорию. */
export interface CategoryContext {
  /** id подкатегории → id категории. */
  subToCat: Record<number, number>;
  /** id категории → сырые данные категории (для локализованного имени). */
  catById: Record<number, CategoryOut>;
}

/** Собирает контекст «подкатегория → категория» из списков API. */
export function buildCategoryContext(
  cats: CategoryOut[],
  subs: SubCategory[],
): CategoryContext {
  const catById: Record<number, CategoryOut> = {};
  for (const c of cats) catById[c.id] = c;
  const subToCat: Record<number, number> = {};
  for (const s of subs) subToCat[s.id] = s.category;
  return { subToCat, catById };
}

/** Выбор значения по языку с фолбэком на ru (например, name_en пустой). */
function byLang(lang: Locale, ru: string, uz: string, en: string): string {
  if (lang === "uz") return (uz || ru).trim();
  if (lang === "en") return (en || ru).trim();
  return (ru || "").trim();
}

/** Парсит строку-decimal в положительное число, иначе null. */
function toPrice(s: string | null | undefined): number | null {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Виден ли товар в каталоге (только is_active — display_* больше нет). */
export function isProductVisible(p: ProductOut): boolean {
  return p.is_active !== false;
}

/** Сколько дней товар считается новинкой, если бэкенд не прислал is_new. */
export const NEW_PRODUCT_DAYS = 7;

/**
 * Новинка ли товар. Приоритет — флаг is_new из админки; если поля нет
 * (старые ответы), падаем на расчёт по дате created_at.
 */
export function isNewProduct(p: ProductOut): boolean {
  if (typeof p.is_new === "boolean") return p.is_new;
  const t = Date.parse(p.created_at ?? "");
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
}

export function localizeProduct(
  p: ProductOut,
  lang: Locale,
  ctx?: CategoryContext,
): LocalProduct {
  // Уникальные абсолютные URL: обложка + галерея.
  const raw = [p.cover_image, ...(p.gallery ?? []).map((g) => g.image)].filter(
    Boolean,
  ) as string[];
  const images = [...new Set(raw.map((s) => mediaUrl(s)).filter(Boolean) as string[])];

  const base = toPrice(p.price);
  const final = toPrice(p.final_price) ?? base;
  const hasDiscount = base != null && final != null && final < base;

  // Категория товара: через подкатегорию, иначе — прямая привязка `category`.
  const categoryId =
    (p.subcategory != null ? ctx?.subToCat[p.subcategory] ?? null : null) ??
    p.category ??
    null;
  const cat = categoryId != null ? ctx?.catById[categoryId] : undefined;

  return {
    id: p.id,
    slug: p.slug,
    name: byLang(lang, p.name_ru, p.name_uz, p.name_en),
    description: byLang(lang, p.description_ru, p.description_uz, p.description_en),
    price: final,
    oldPrice: hasDiscount ? base : null,
    discountPercent: toPrice(p.discount),
    image: images[0] ?? null,
    images,
    video: p.video_url ? mediaUrl(p.video_url) : null,
    tags: p.tags ?? [],
    subcategoryId: p.subcategory ?? null,
    categoryId,
    categoryName: cat ? byLang(lang, cat.name_ru, cat.name_uz, cat.name_en) : null,
    seo: {
      title: p.seo_title ?? "",
      description: p.seo_description ?? "",
      keywords: p.seo_keywords ?? "",
    },
    available: p.is_active !== false,
    createdAt: p.created_at ?? null,
    isNew: isNewProduct(p),
  };
}

/** Комплект, локализованный под язык и готовый к отрисовке. */
export interface LocalKit {
  id: number;
  slug: string;
  name: string;
  description: string;
  /** Итоговая цена комплекта, либо null — «по запросу». */
  price: number | null;
  /** Скидка в процентах, либо null. */
  discountPercent: number | null;
  image: string | null;
  tags: string[];
  items: { product: LocalProduct; quantity: number }[];
  /** Сумма позиций по отдельности — показываем как «выгоду», если она больше цены. */
  itemsTotal: number | null;
}

export function localizeKit(k: KitOut, lang: Locale, ctx?: CategoryContext): LocalKit {
  const items = (k.items ?? []).map((i) => ({
    product: localizeProduct(i.product, lang, ctx),
    quantity: i.quantity && i.quantity > 0 ? i.quantity : 1,
  }));
  // Сумма позиций считается только если цена известна у всех товаров.
  const everyPriced = items.length > 0 && items.every((i) => i.product.price != null);
  const itemsTotal = everyPriced
    ? items.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0)
    : null;

  return {
    id: k.id,
    slug: k.slug,
    name: byLang(lang, k.name_ru, k.name_uz, k.name_en),
    description: byLang(
      lang,
      k.description_ru ?? "",
      k.description_uz ?? "",
      k.description_en ?? "",
    ),
    price: toPrice(k.final_price),
    discountPercent: toPrice(k.discount),
    image: mediaUrl(k.cover_image),
    // tags у комплекта — одна строка через запятую (в отличие от товара).
    tags: (k.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    items,
    itemsTotal,
  };
}

export function localizeCategory(c: CategoryOut, lang: Locale): LocalCategory {
  return { id: c.id, name: byLang(lang, c.name_ru, c.name_uz, c.name_en) };
}

export function localizeSubcategory(s: SubCategory, lang: Locale): LocalCategory {
  return { id: s.id, name: byLang(lang, s.name_ru, s.name_uz, s.name_en) };
}
