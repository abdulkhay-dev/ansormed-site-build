"use client";

import { useEffect } from "react";

/** Заголовок сайта по умолчанию — тот, что стоял до первой смены маршрута. */
let siteTitle: string | null = null;

/**
 * Заголовок вкладки для клиентского маршрута SPA.
 *
 * Просто присвоить document.title в эффекте мало: при прямой загрузке страницы
 * Next применяет metadata из layout уже ПОСЛЕ монтирования и затирает значение.
 * Поэтому пока вьюха смонтирована, следим за <head> и возвращаем свой заголовок,
 * а при уходе с маршрута отдаём заголовок сайта обратно.
 */
export function usePageTitle(title: string): void {
  useEffect(() => {
    if (!title) return;
    if (siteTitle === null) siteTitle = document.title;

    document.title = title;
    const observer = new MutationObserver(() => {
      if (document.title !== title) document.title = title;
    });
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      // Если заголовок уже перебила следующая страница — не трогаем.
      if (document.title === title && siteTitle) document.title = siteTitle;
    };
  }, [title]);
}
