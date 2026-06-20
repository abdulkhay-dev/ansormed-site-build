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

/* ---------- Типы ответов API ---------- */

export interface ApiProduct {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  in_stock: boolean;
  brand: string | null;
}

export interface ApiProductList {
  items: ApiProduct[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiCategory {
  id: number;
  name_ru: string;
  name_uz: string;
  slug: string;
  is_active: boolean;
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

/* ---------- Products ---------- */

/** Список товаров с серверной пагинацией/фильтром/поиском. */
export function listProducts(
  params: { page?: number; pageSize?: number; category?: string; search?: string } = {},
): Promise<ApiProductList | null> {
  const { page = 1, pageSize = 15, category, search } = params;
  const q = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (category) q.set("category", category);
  if (search) q.set("search", search);
  return req<ApiProductList>(`/api/v1/products/?${q.toString()}`);
}

/** Один товар по id — /api/v1/products/{product_id}. */
export const getProduct = (id: string | number) =>
  req<ApiProduct>(`/api/v1/products/${encodeURIComponent(String(id))}`);

/**
 * Товар по id с устойчивостью к бэкенду: сначала прямой эндпоинт
 * /products/{id}; если он недоступен/не находит — ищем товар в каталоге
 * (список рабочий). Когда get-by-id на бэке починят, фолбэк не понадобится.
 */
export async function getProductById(id: string | number): Promise<ApiProduct | null> {
  const wanted = String(id);
  try {
    const direct = await getProduct(wanted);
    if (direct) return direct;
  } catch {
    /* падаем в фолбэк */
  }
  const pageSize = 100;
  const first = await listProducts({ page: 1, pageSize });
  if (!first) return null;
  const inFirst = first.items.find((p) => String(p.id) === wanted);
  if (inFirst) return inFirst;
  const totalPages = Math.min(12, Math.ceil((first.total || 0) / pageSize));
  for (let page = 2; page <= totalPages; page++) {
    const res = await listProducts({ page, pageSize });
    const hit = res?.items.find((p) => String(p.id) === wanted);
    if (hit) return hit;
  }
  return null;
}

/** Категории — /api/v1/categories/. */
export const listCategories = () => req<ApiCategory[]>(`/api/v1/categories/`);

/* ---------- Leads ---------- */

export const createLead = (data: LeadInput) =>
  req<null>(`/api/v1/leads/`, { method: "POST", body: JSON.stringify(data) });

/* ---------- Blog ---------- */

/** Список постов блога — /api/v1/blog/. */
export const listPosts = () => req<ApiBlogPost[]>(`/api/v1/blog/`);

/** Один пост — /api/v1/blog/{post_id}. */
export const getPost = (id: string | number) =>
  req<ApiBlogPost>(`/api/v1/blog/${encodeURIComponent(String(id))}`);
