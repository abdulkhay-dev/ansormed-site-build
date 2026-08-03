/**
 * Программная навигация в SPA статического экспорта.
 *
 * next/router здесь не годится: под каждый маршрут нет своей сборки, и переход
 * приводит к полной перезагрузке. Меняем history напрямую — Next патчит
 * pushState/replaceState и сам обновляет usePathname (тот же приём, что и в
 * перехватчике кликов в AppShell).
 */

/** Текущий путь с query и хешем. */
function currentHref(): string {
  return window.location.pathname + window.location.search + window.location.hash;
}

/**
 * Завершающий слэш в пути (next.config: trailingSlash) — так же, как его
 * проставляет next/link. Иначе после редиректа перезагрузка страницы уходит
 * на URL без слэша.
 */
function normalize(href: string): string {
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? "" : href.slice(cut);
  return (path.endsWith("/") ? path : `${path}/`) + rest;
}

/**
 * Куда вернуться после входа — из `?next=` в текущем URL.
 * Берём только внутренние пути («/…», но не «//host»), чтобы параметром нельзя
 * было увести человека на чужой сайт.
 */
export function nextParam(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("next");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

/** Переход с добавлением записи в историю (обычная навигация по ссылке). */
export function navigate(href: string): void {
  if (typeof window === "undefined") return;
  const dest = normalize(href);
  if (dest === currentHref()) return;
  window.history.pushState(null, "", dest);
  window.scrollTo({ top: 0, behavior: "instant" });
}

/** Переход без записи в историю — для редиректов-охранников (/account → /login). */
export function redirect(href: string): void {
  if (typeof window === "undefined") return;
  const dest = normalize(href);
  if (dest === currentHref()) return;
  window.history.replaceState(null, "", dest);
  window.scrollTo({ top: 0, behavior: "instant" });
}
