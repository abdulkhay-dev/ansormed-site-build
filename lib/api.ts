/**
 * Клиент Ansor Med REST API (по openapi.json).
 *
 * Запросы идут напрямую на бэкенд https://api.ansormed.uz (и в браузере, и при
 * сборке). Для работы в браузере бэкенд ДОЛЖЕН отдавать CORS-заголовки для
 * https://ansormed.uz (django-cors-headers), иначе fetch блокируется.
 * В dev база переопределяется на локальный CORS-прокси через NEXT_PUBLIC_API_BASE
 * (scripts/dev.mjs).
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

/**
 * Прямой URL для скачивания PDF-карточки товара — /api/products/{id}/pdf/.
 * Ведёт на реальный бэкенд (не dev-прокси): это обычная <a>-навигация к файлу,
 * а не fetch, поэтому CORS не мешает, и ссылка работает в статическом экспорте.
 */
export function productPdfUrl(id: number): string {
  return `${MEDIA_BASE}/api/products/${id}/pdf/`;
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
  /** Прямая привязка к категории (товар может не иметь подкатегории). */
  category: number | null;
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
  /** Признак новинки из админки. У старых ответов может отсутствовать. */
  is_new?: boolean;
  created_at: string;
  updated_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

/** Позиция комплекта — KitItem: развёрнутый товар + количество. */
export interface KitItemOut {
  product: ProductOut;
  quantity?: number;
}

/** Комплект оборудования — /api/kits/. Цена только итоговая (final_price). */
export interface KitOut {
  id: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  description_ru?: string;
  description_uz?: string;
  description_en?: string;
  slug: string;
  cover_image: string | null;
  final_price: string;
  discount?: string;
  tags?: string;
  items: KitItemOut[];
  created_at: string;
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

/**
 * Ошибка API. Кроме текста несёт HTTP-статус и разбор ошибок по полям
 * (DRF отдаёт `{"email": ["…"], "password": ["…"]}`) — формы подсвечивают
 * конкретные поля, а не только общий текст.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

/** Первая строка из значения поля ошибки: "текст" | ["текст"] | {msg}. */
function firstMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstMessage(value[0]);
  if (value && typeof value === "object") {
    const msg = (value as { msg?: unknown }).msg;
    if (typeof msg === "string") return msg;
  }
  return "";
}

/** Разбирает тело ошибки DRF в ApiError (detail + ошибки по полям). */
function toApiError(body: unknown, status: number): ApiError {
  const fields: Record<string, string> = {};
  let detail = "";
  if (body && typeof body === "object") {
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      const message = firstMessage(value);
      if (!message) continue;
      // detail/non_field_errors — общая ошибка запроса, а не конкретного поля.
      if (key === "detail" || key === "non_field_errors") detail = message;
      else fields[key] = message;
    }
  }
  const first = detail || Object.values(fields)[0] || "";
  return new ApiError(first || `HTTP ${status}`, status, fields);
}

/** Базовый fetch с таймаутом и единым форматом ошибок. */
async function req<T>(
  path: string,
  opts: RequestInit & { timeoutMs?: number; token?: string | null } = {},
): Promise<T | null> {
  const { timeoutMs = 12000, token, ...init } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, {
      signal: controller.signal,
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) {
      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        /* тело без JSON */
      }
      throw toApiError(body, res.status);
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

/**
 * Категории, временно скрытые из интерфейса (дубли/незаполненные разделы).
 * Фильтруем на уровне API, чтобы раздел исчез сразу везде: шапка, подвал,
 * главная, сайдбар каталога и карточка товара.
 */
const HIDDEN_CATEGORY_IDS = new Set<number>([6]);

/** Категории — /api/categories/ (без скрытых). */
export const listCategories = async () =>
  (await fetchAllPages<CategoryOut>(`/api/categories/`)).filter(
    (c) => !HIDDEN_CATEGORY_IDS.has(c.id),
  );

/** Подкатегории — /api/subcategories/ (без принадлежащих скрытым категориям). */
export const listSubcategories = async () =>
  (await fetchAllPages<SubCategory>(`/api/subcategories/`)).filter(
    (s) => !HIDDEN_CATEGORY_IDS.has(s.category),
  );

/* ---------- Комплекты ---------- */

/** Комплекты — /api/kits/ (все страницы). */
export const listKits = () => fetchAllPages<KitOut>(`/api/kits/`);

/** Комплект по slug: detail-эндпоинт только по id, поэтому ищем в списке. */
export async function getKitBySlug(slug: string): Promise<KitOut | null> {
  const kits = await listKits();
  return kits.find((k) => k.slug === slug) ?? null;
}

/* ---------- Site content (тексты из админки) ---------- */

let contentCache: { at: number; data: ApiContent[] } | null = null;
let contentInflight: Promise<ApiContent[]> | null = null;
const CONTENT_TTL = 60_000; // 1 минута

/**
 * Все редактируемые тексты сайта — /api/site-content/ (пагинированный DRF-список).
 * Кешируется на короткий TTL в памяти; параллельные вызовы дедуплицируются.
 * При ошибке возвращает [].
 */
export async function getContent(force = false): Promise<ApiContent[]> {
  const now = Date.now();
  if (!force) {
    if (contentCache && now - contentCache.at < CONTENT_TTL) return contentCache.data;
    if (contentInflight) return contentInflight;
  }
  contentInflight = fetchAllPages<ApiContent>(`/api/site-content/`)
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
  req<null>(`/api/leads/`, { method: "POST", body: JSON.stringify(data) });

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

/* ---------- Аккаунты (JWT) ---------- */
/*
 * Бэкенд: djangorestframework-simplejwt.
 *   POST /api/auth/register/       {email, username, password, first_name?, last_name?}
 *   POST /api/auth/login/          {email, password}          → access/refresh
 *   POST /api/auth/token/refresh/  {refresh}                  → access
 *   GET  /api/auth/me/             Bearer access              → профиль
 *   GET  /api/orders/              Bearer access              → заказы пользователя
 * Схема (/api/schema/) закрыта админ-логином, поэтому тела ответов читаем
 * терпимо: токены/профиль ищем и в корне, и во вложенных обёртках.
 */

/** Профиль пользователя — /api/auth/me/. */
export interface AuthUser {
  id?: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

/** Пара токенов SimpleJWT. refresh может не прийти (тогда — только access). */
export interface AuthTokens {
  access: string;
  refresh: string | null;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/** Ответ логина/регистрации: токены и, если бэкенд их вернул, данные профиля. */
export interface AuthResult {
  tokens: AuthTokens | null;
  user: AuthUser | null;
}

/** Возможные обёртки ответа: {…} | {data:{…}} | {tokens:{…}}. */
function unwrap(body: unknown): Record<string, unknown>[] {
  if (!body || typeof body !== "object") return [];
  const root = body as Record<string, unknown>;
  const out = [root];
  for (const key of ["data", "tokens", "token"]) {
    const nested = root[key];
    if (nested && typeof nested === "object") out.push(nested as Record<string, unknown>);
  }
  return out;
}

const str = (value: unknown): string | null =>
  typeof value === "string" && value ? value : null;

/** Достаёт access/refresh из ответа (учитывая вложенные обёртки). */
function pickTokens(body: unknown): AuthTokens | null {
  for (const scope of unwrap(body)) {
    const access = str(scope.access) ?? str(scope.access_token) ?? str(scope.token);
    if (!access) continue;
    return { access, refresh: str(scope.refresh) ?? str(scope.refresh_token) };
  }
  return null;
}

/** Достаёт профиль из ответа: корень или поле user/profile. */
function pickUser(body: unknown): AuthUser | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  for (const candidate of [root.user, root.profile, root]) {
    if (!candidate || typeof candidate !== "object") continue;
    const obj = candidate as Record<string, unknown>;
    const email = str(obj.email);
    const username = str(obj.username);
    if (!email && !username) continue;
    return {
      id: typeof obj.id === "number" ? obj.id : undefined,
      email: email ?? "",
      username: username ?? "",
      first_name: str(obj.first_name) ?? undefined,
      last_name: str(obj.last_name) ?? undefined,
    };
  }
  return null;
}

/** Регистрация. Токены возвращаются, только если их отдал бэкенд. */
export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
  const body = await req<unknown>(`/api/auth/register/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { tokens: pickTokens(body), user: pickUser(body) };
}

/** Вход по email + паролю. */
export async function loginAccount(
  email: string,
  password: string,
): Promise<AuthResult> {
  const body = await req<unknown>(`/api/auth/login/`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return { tokens: pickTokens(body), user: pickUser(body) };
}

/**
 * Вход через Google — POST /api/auth/google/ {id_token}.
 * id_token берём у Google Identity Services (credential из колбэка кнопки);
 * бэкенд проверяет его сам и заводит пользователя при первом входе.
 */
export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  const body = await req<unknown>(`/api/auth/google/`, {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
  return { tokens: pickTokens(body), user: pickUser(body) };
}

/** Обновление access-токена по refresh. */
export async function refreshAccessToken(refresh: string): Promise<AuthTokens | null> {
  const body = await req<unknown>(`/api/auth/token/refresh/`, {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  const tokens = pickTokens(body);
  // ROTATE_REFRESH_TOKENS может быть выключен — тогда оставляем старый refresh.
  return tokens ? { access: tokens.access, refresh: tokens.refresh ?? refresh } : null;
}

/** Текущий пользователь — /api/auth/me/. */
export async function getMe(token: string): Promise<AuthUser | null> {
  const body = await req<unknown>(`/api/auth/me/`, { token });
  return pickUser(body);
}

/** Статус заказа — StatusEnum в схеме API. */
export type OrderStatus = "pending" | "confirmed" | "rejected" | "completed";

/** Позиция заказа — OrderItem (товар ИЛИ комплект). */
export interface OrderItemOut {
  id: number;
  /** id товара; null, если позиция — комплект. */
  product: number | null;
  /** id комплекта; null, если позиция — товар. */
  kit: number | null;
  /** Готовое название позиции с бэкенда. */
  item_name: string;
  quantity?: number;
  unit_price: string;
  subtotal: string;
}

/** Заказ пользователя — Order (GET /api/orders/ и /api/orders/{id}/). */
export interface OrderOut {
  id: number;
  status: OrderStatus;
  comment?: string;
  items: OrderItemOut[];
  total: string;
  /** Файл коммерческого предложения — появляется после подтверждения заказа. */
  offer_file: string | null;
  offer_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Позиция для создания заказа — OrderItemCreate (нужен product_id ИЛИ kit_id). */
export interface OrderItemInput {
  product_id?: number;
  kit_id?: number;
  quantity: number;
}

/** Заказы текущего пользователя — все страницы /api/orders/. */
export async function listOrders(token: string): Promise<OrderOut[]> {
  const out: OrderOut[] = [];
  for (let page = 1; page <= 50; page++) {
    const data = await req<Paginated<OrderOut>>(`/api/orders/?page=${page}`, { token });
    if (!data) break;
    out.push(...(data.results ?? []));
    if (!data.next) break;
  }
  return out;
}

/** Один заказ — /api/orders/{id}/. */
export const getOrder = (token: string, id: number) =>
  req<OrderOut>(`/api/orders/${id}/`, { token });

/** Создание заказа — POST /api/orders/. */
export const createOrder = (
  token: string,
  data: { items: OrderItemInput[]; comment?: string },
) =>
  req<OrderOut>(`/api/orders/`, {
    token,
    method: "POST",
    body: JSON.stringify(data),
  });
