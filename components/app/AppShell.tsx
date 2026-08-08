"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
// Прелоадер временно отключён — см. место использования ниже.
// import { Preloader } from "@/components/layout/Preloader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactFab } from "@/components/layout/ContactFab";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { getCategories, type Category } from "@/lib/data/categories";
import { getDictionary, langFromPath, routeSegments } from "@/lib/i18n";
import { armCatalogRestore, disarmCatalogRestore } from "@/lib/catalog-state";

/** Первый сегмент пути после локали: "/ru/product/x/" → "product". */
function routeOf(pathname: string): string | undefined {
  return routeSegments(pathname)[0];
}

/**
 * Решает, восстанавливать ли состояние каталога (категория/страница/поиск)
 * при следующем открытии /products.
 * Каталог → карточка и карточка → каталог: восстанавливаем.
 * Любой другой переход в каталог (меню, подвал, логотип): открываем с нуля.
 */
function syncCatalogRestore(fromPath: string, toPath: string) {
  const from = routeOf(fromPath);
  const to = routeOf(toPath);
  if (to === "products") {
    if (from === "product") armCatalogRestore();
    else disarmCatalogRestore();
  } else if (to === "product" && from === "products") {
    armCatalogRestore();
  }
}

/**
 * Клиентская оболочка SPA: определяет язык из URL, поднимает i18n-контекст и
 * общий каркас (прелоадер, шапка, подвал, кнопка связи). Категории для
 * шапки/подвала грузятся на клиенте один раз на язык.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);
  const [categories, setCategories] = useState<Category[]>([]);

  // Синхронизируем <html lang> с активной локалью.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Клиентская навигация без перезагрузки. В статическом экспорте (один
  // index.html) next/link по клику пытается подгрузить данные несуществующего
  // маршрута и делает полную перезагрузку. Перехватываем клики по внутренним
  // ссылкам и переходим через history.pushState — Next синхронизирует
  // usePathname, и приложение перерисовывается на месте.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const el = e.target as HTMLElement | null;
      // Интерактивные элементы внутри ссылки-карточки (кнопка «в корзину»)
      // сами гасят переход в своём onClick — не перехватываем их клик.
      if (el?.closest?.("[data-no-nav]")) return;
      const anchor = el?.closest?.("a");
      if (!anchor) return;
      const target = anchor.getAttribute("target");
      if ((target && target !== "_self") || anchor.hasAttribute("download"))
        return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }
      // Внешние ссылки, tel:, mailto: — не трогаем.
      if (url.origin !== window.location.origin) return;
      // Внутренний переход → SPA через pushState (перебивает обработчик next/link).
      e.preventDefault();
      e.stopPropagation();
      const dest = url.pathname + url.search + url.hash;
      const current =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      if (dest !== current) {
        syncCatalogRestore(window.location.pathname, url.pathname);
        window.history.pushState(null, "", dest);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // «Назад/вперёд» в браузере: возврат в каталог должен открыть его там же,
  // где человек его оставил. Слушатель синхронный — флаг успевает встать до
  // перерисовки, и ProductsExplorer подхватит его при монтировании.
  useEffect(() => {
    const onPopState = () => {
      if (routeOf(window.location.pathname) === "products") armCatalogRestore();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Категории для навигации (шапка/подвал).
  useEffect(() => {
    let cancelled = false;
    getCategories(lang)
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <I18nProvider lang={lang} dict={dict}>
      <AuthProvider>
        <CartProvider>
          <SiteJsonLd lang={lang} dict={dict} />
          {/* Прелоадер временно отключён (мешает отладке входа) — вернуть строку:
            <Preloader /> */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
          >
            {dict.skipToContent}
          </a>
          <Header categories={categories} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer categories={categories} />
          <ContactFab />
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
