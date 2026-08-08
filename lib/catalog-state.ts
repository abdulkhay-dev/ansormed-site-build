/**
 * Запоминает состояние каталога (категория / страница / поиск), чтобы при
 * возврате из карточки товара пользователь попадал ровно туда, откуда ушёл.
 * Состояние живёт в sessionStorage, а не в URL — ссылки остаются чистыми.
 */

const STATE_KEY = "ansormed:catalog-state";
const ARMED_KEY = "ansormed:catalog-restore";

export type CatalogState = {
  /** "all" | id категории | "sub:<id>" */
  active: string;
  page: number;
  query: string;
};

/** Сохраняет текущее состояние каталога. */
export function saveCatalogState(state: CatalogState) {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* приватный режим / переполнение — просто не запоминаем */
  }
}

/**
 * Разрешает одно восстановление: вызывается при уходе из каталога в карточку
 * товара и при возврате в каталог кнопкой «назад». Без этого флага переход в
 * каталог из меню откроет его «с нуля».
 */
export function armCatalogRestore() {
  try {
    sessionStorage.setItem(ARMED_KEY, "1");
  } catch {
    /* см. выше */
  }
}

/** Отменяет восстановление: осознанный переход в каталог (меню, подвал, логотип). */
export function disarmCatalogRestore() {
  try {
    sessionStorage.removeItem(ARMED_KEY);
  } catch {
    /* см. выше */
  }
}

/**
 * «Назад/вперёд» с полной перезагрузкой документа (например, после F5 на
 * карточке товара): popstate не приходит, но браузер помечает навигацию как
 * back_forward — этого достаточно, чтобы разрешить восстановление.
 */
function isBackForwardNavigation(): boolean {
  try {
    const [nav] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    return nav?.type === "back_forward";
  } catch {
    return false;
  }
}

/** Отдаёт сохранённое состояние один раз (и снимает флаг). */
export function consumeCatalogState(): CatalogState | null {
  try {
    const armed = sessionStorage.getItem(ARMED_KEY) === "1";
    sessionStorage.removeItem(ARMED_KEY);
    if (!armed && !isBackForwardNavigation()) return null;
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<CatalogState>;
    if (typeof s?.active !== "string") return null;
    return {
      active: s.active,
      page: Number.isFinite(s.page) && Number(s.page) > 0 ? Number(s.page) : 1,
      query: typeof s.query === "string" ? s.query : "",
    };
  } catch {
    return null;
  }
}
