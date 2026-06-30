import type { Locale } from "@/lib/i18n";
import { mediaUrl, type CategoryOut, type ProductOut } from "@/lib/api";

/** Товар, локализованный под язык и готовый к отрисовке. */
export interface LocalProduct {
  id: number;
  name: string;
  description: string;
  /** Итоговая цена (с учётом скидки), либо null — «по запросу». */
  price: number | null;
  /** Старая цена до скидки (зачёркивается), либо null — скидки нет. */
  oldPrice: number | null;
  /** Первая картинка (для карточки). */
  image: string | null;
  /** Все картинки (галерея на детальной), абсолютные URL. */
  images: string[];
  /** Видео товара: ссылка (YouTube/Vimeo) или файл, либо null. */
  video: string | null;
  categoryId: number | null;
  categoryName: string | null;
  available: boolean;
}

/** Категория, локализованная под язык. */
export interface LocalCategory {
  id: number;
  name: string;
}

/** Выбор значения по языку с фолбэком на ru (например, name_en пустой). */
function byLang(lang: Locale, ru: string, uz: string, en: string): string {
  if (lang === "uz") return uz || ru;
  if (lang === "en") return en || ru;
  return ru;
}

/** Виден ли товар в каталоге для данного языка (is_active + display_<lang>). */
export function isProductVisible(p: ProductOut, lang: Locale): boolean {
  if (p.is_active === false) return false;
  if (lang === "uz") return p.display_uz !== false;
  if (lang === "en") return p.display_en !== false;
  return p.display_ru !== false;
}

export function localizeProduct(p: ProductOut, lang: Locale): LocalProduct {
  // Уникальные абсолютные URL: основная картинка + галерея.
  const raw = [p.image, ...(p.images ?? [])].filter(Boolean) as string[];
  const images = [...new Set(raw.map((s) => mediaUrl(s)).filter(Boolean) as string[])];
  const base = p.price ?? null;
  const final = p.final_price ?? p.price ?? null;
  const hasDiscount = base != null && final != null && final < base;
  return {
    id: p.id,
    name: byLang(lang, p.name_ru, p.name_uz, p.name_en),
    description: byLang(lang, p.description_ru, p.description_uz, p.description_en),
    price: final,
    oldPrice: hasDiscount ? base : null,
    image: images[0] ?? null,
    images,
    video: p.video_url ? mediaUrl(p.video_url) : null,
    categoryId: p.category_id ?? p.category?.id ?? null,
    categoryName: p.category
      ? byLang(lang, p.category.name_ru, p.category.name_uz, p.category.name_en)
      : null,
    available: p.is_active !== false,
  };
}

export function localizeCategory(c: CategoryOut, lang: Locale): LocalCategory {
  return { id: c.id, name: byLang(lang, c.name_ru, c.name_uz, c.name_en) };
}
