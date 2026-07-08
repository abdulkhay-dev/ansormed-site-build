/**
 * Клиент Ansor Med REST API (по openapi.json).
 *
 * По умолчанию запросы идут напрямую на бэкенд-поддомен https://api.ansormed.uz.
 * В dev переопределяется на локальный прокси через NEXT_PUBLIC_API_BASE
 * (scripts/dev.mjs), чтобы не упираться в CORS на localhost.
 */

const BASE = (
  process.env.NEXT_PUBLIC_API_BASE || "https://api.ansormed.uz"
).replace(/\/$/, "");

/** Origin для медиа (/uploads/...) — всегда реальный бэкенд, не dev-прокси. */
const MEDIA_BASE = (
  process.env.NEXT_PUBLIC_MEDIA_BASE || "https://api.ansormed.uz"
).replace(/\/$/, "");

/** Абсолютный URL для относительных путей картинок (/uploads/...). */
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${MEDIA_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ---------- Типы ответов API (openapi schema) ---------- */

/** DRF-пагинация: обёртка над списками (?page=N). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Элемент галереи (товар/пост/проект). */
export interface GalleryImage {
  id: number;
  image: string;
  sort_order?: number;
}

/** Категория — /api/categories/. */
export interface CategoryOut {
  id: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Подкатегория — /api/subcategories/ (принадлежит категории). */
export interface SubCategory {
  id: number;
  category: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Товар — /api/products/. Цены приходят строками-decimal ("0.00"). */
export interface ProductOut {
  id: number;
  subcategory: number | null;
  name_ru: string;
  name_uz: string;
  name_en: string;
  description_ru: string;
  description_uz: string;
  description_en: string;
  slug: string;
  price: string;
  discount: string;
  final_price: string;
  cover_image: string | null;
  gallery: GalleryImage[];
  video_url: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export interface ApiBlogPost {
  id: number;
  title_ru: string;
  title_uz: string;
  title_en: string;
  content_ru: string;
  content_uz: string;
  content_en: string;
  slug: string;
  image: string | null;
  gallery: GalleryImage[];
  video_url: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export interface ApiProject {
  id: number;
  slug: string;
  title_ru: string;
  title_uz: string;
  title_en: string;
  content_ru: string | null;
  content_uz: string | null;
  content_en: string | null;
  cover_image: string | null;
  gallery: GalleryImage[];
  tags: string[];
  source_url: string | null;
  is_manually_edited: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export interface ApiContent {
  id: number;
  section: string;
  key: string;
  value_ru: string;
  value_uz: string;
  value_en: string;
  content_type: string;
  updated_at: string;
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
}

/** Базовый fetch с таймаутом и единым форматом ошибок. */
async function req<T>(
  path: string,
  opts: RequestInit & { timeoutMs?: number } = {},
): Promise<T | null> {
  const { timeoutMs = 12000, ...init } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, {
      signal: controller.signal,
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail =
          typeof body?.detail === "string"
            ? body.detail
            : Array.isArray(body?.detail)
              ? body.detail[0]?.msg ?? ""
              : "";
      } catch {
        /* тело без JSON */
      }
      throw new Error(detail || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : ((await res.json()) as T);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Забирает все страницы пагинированного списка (DRF `?page=N`).
 * Идёт по `next`, пока он не станет null; на ошибке пробрасывает исключение.
 */
async function fetchAllPages<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  const sep = path.includes("?") ? "&" : "?";
  for (let page = 1; page <= 200; page++) {
    const data = await req<Paginated<T>>(`${path}${sep}page=${page}`);
    if (!data) break;
    out.push(...(data.results ?? []));
    if (!data.next) break;
  }
  return out;
}

/* ---------- Catalog / Categories ---------- */

/** Весь каталог товаров — /api/products/ (все страницы). */
export const getCatalog = () => fetchAllPages<ProductOut>(`/api/products/`);

/** Товар по slug — резолвится из полного каталога. */
export async function getProductBySlug(slug: string): Promise<ProductOut | null> {
  const wanted = String(slug);
  const all = await getCatalog();
  return all.find((p) => p.slug === wanted) ?? null;
}

/** Результат глобального поиска — /api/search/?q=… (товары + статьи + проекты). */
export interface SearchResults {
  products: ProductOut[];
  blogs: ApiBlogPost[];
  projects: ApiProject[];
}

/** Глобальный поиск по сайту. Пустой запрос → пустой результат (без запроса к API). */
export async function globalSearch(q: string): Promise<SearchResults> {
  const empty: SearchResults = { products: [], blogs: [], projects: [] };
  const term = q.trim();
  if (!term) return empty;
  const data = await req<SearchResults>(`/api/search/?q=${encodeURIComponent(term)}`);
  return data ?? empty;
}

/** Категории — /api/categories/. */
export const listCategories = () => fetchAllPages<CategoryOut>(`/api/categories/`);

/** Подкатегории — /api/subcategories/. */
export const listSubcategories = () => fetchAllPages<SubCategory>(`/api/subcategories/`);

/* ---------- Site content (тексты из админки) ---------- */

let contentCache: { at: number; data: ApiContent[] } | null = null;
let contentInflight: Promise<ApiContent[]> | null = null;
const CONTENT_TTL = 60_000; // 1 минута

/**
 * Все редактируемые тексты сайта — /api/v1/content/. Кешируется на короткий
 * TTL в памяти; параллельные вызовы дедуплицируются. При ошибке возвращает [].
 */
export async function getContent(force = false): Promise<ApiContent[]> {
  const now = Date.now();
  if (!force) {
    if (contentCache && now - contentCache.at < CONTENT_TTL) return contentCache.data;
    if (contentInflight) return contentInflight;
  }
  contentInflight = req<ApiContent[]>(`/api/v1/content/`)
    .then((rows) => {
      const data = rows ?? [];
      if (data.length) contentCache = { at: Date.now(), data };
      return data;
    })
    .catch(() => [] as ApiContent[])
    .finally(() => {
      contentInflight = null;
    });
  return contentInflight;
}

/* ---------- Leads ---------- */

export const createLead = (data: LeadInput) =>
  req<null>(`/api/v1/leads/`, { method: "POST", body: JSON.stringify(data) });

/* ---------- Blog ---------- */

/** Список постов блога — /api/blog/ (все страницы). */
export const listPosts = () => fetchAllPages<ApiBlogPost>(`/api/blog/`);

/** Пост по slug — резолвится из списка. */
export async function getPostBySlug(slug: string): Promise<ApiBlogPost | null> {
  const posts = await listPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/* ---------- Projects ---------- */

/** Список проектов — /api/projects/ (все страницы). */
export const listProjects = () => fetchAllPages<ApiProject>(`/api/projects/`);

/** Проект по slug — резолвится из списка. */
export async function getProjectBySlug(slug: string): Promise<ApiProject | null> {
  const projects = await listProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}
