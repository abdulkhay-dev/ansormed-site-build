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

/* ---------- Типы ответов API (catalog/categories) ---------- */

export interface CategoryOut {
  id: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  slug: string;
  is_active: boolean;
}

export interface ProductOut {
  id: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  description_ru: string;
  description_uz: string;
  description_en: string;
  price: number | null;
  discount: number | null;
  final_price: number | null;
  images: string[] | null;
  image: string | null;
  video_url: string | null;
  is_active: boolean;
  display_ru: boolean;
  display_uz: boolean;
  display_en: boolean;
  category_id: number | null;
  category: CategoryOut | null;
}

export interface ApiBlogPost {
  id: number;
  title_ru: string;
  title_uz: string;
  content_ru: string;
  content_uz: string;
  video_url: string | null;
  image: string | null;
  is_published: boolean;
  display_ru: boolean;
  display_uz: boolean;
  created_at: string;
  updated_at: string;
  author_id: number;
}

export interface ApiContent {
  id: number;
  section: string;
  key: string;
  value_ru: string;
  value_uz: string;
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

/* ---------- Catalog ---------- */

/** Один товар по id — /api/v1/catalog/{product_id}. */
export const getCatalogProduct = (id: string | number) =>
  req<ProductOut>(`/api/v1/catalog/${encodeURIComponent(String(id))}`);

/**
 * Товар по id с фолбэком: прямой эндпоинт, иначе ищем в полном каталоге
 * (кешированном). Имя сохранено для обратной совместимости с импортами.
 */
export async function getProductById(id: string | number): Promise<ProductOut | null> {
  const wanted = String(id);
  try {
    const direct = await getCatalogProduct(wanted);
    if (direct) return direct;
  } catch {
    /* падаем в фолбэк по каталогу */
  }
  const all = await getCatalog();
  return all.find((p) => String(p.id) === wanted) ?? null;
}

/* --- Кеш полного каталога (клиентский) --- */

const PRODUCTS_TTL = 5 * 60_000; // 5 минут
const PRODUCTS_SS_KEY = "ansormed:catalog:v2";

type ProductsCache = { at: number; data: ProductOut[] };
let productsCache: ProductsCache | null = null;
let productsInflight: Promise<ProductOut[]> | null = null;

function readProductsSession(): ProductsCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PRODUCTS_SS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductsCache;
    if (parsed && typeof parsed.at === "number" && Array.isArray(parsed.data)) {
      return parsed;
    }
  } catch {
    /* битый кеш — игнорируем */
  }
  return null;
}

function writeProductsSession(entry: ProductsCache): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PRODUCTS_SS_KEY, JSON.stringify(entry));
  } catch {
    /* квота/приватный режим — кеш остаётся только в памяти */
  }
}

/** Сбрасывает кеш каталога (на случай ручного обновления данных). */
export function invalidateProductsCache(): void {
  productsCache = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(PRODUCTS_SS_KEY);
    } catch {
      /* no-op */
    }
  }
}

/**
 * Весь каталог — /api/v1/catalog/ (возвращает полный массив товаров).
 * Кешируется на TTL: в памяти (переживает переходы внутри SPA) и в
 * sessionStorage (переживает перезагрузку вкладки). Параллельные вызовы
 * дедуплицируются. `force` обходит кеш.
 */
export async function getCatalog(
  { force = false }: { force?: boolean } = {},
): Promise<ProductOut[]> {
  const now = Date.now();

  if (!force) {
    if (productsCache && now - productsCache.at < PRODUCTS_TTL) {
      return productsCache.data;
    }
    if (!productsCache) {
      const ss = readProductsSession();
      if (ss && now - ss.at < PRODUCTS_TTL) {
        productsCache = ss;
        return ss.data;
      }
    }
    if (productsInflight) return productsInflight;
  }

  const fetchAll = (async () => {
    const items = (await req<ProductOut[]>(`/api/v1/catalog/`)) ?? [];
    if (items.length > 0) {
      productsCache = { at: Date.now(), data: items };
      writeProductsSession(productsCache);
    }
    return items;
  })();

  productsInflight = fetchAll.finally(() => {
    productsInflight = null;
  });
  return productsInflight;
}

/** Категории — /api/v1/categories/. */
export const listCategories = () => req<CategoryOut[]>(`/api/v1/categories/`);

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

/** Список постов блога — /api/v1/blog/. */
export const listPosts = () => req<ApiBlogPost[]>(`/api/v1/blog/`);

/** Один пост — /api/v1/blog/{post_id}. */
export const getPost = (id: string | number) =>
  req<ApiBlogPost>(`/api/v1/blog/${encodeURIComponent(String(id))}`);
