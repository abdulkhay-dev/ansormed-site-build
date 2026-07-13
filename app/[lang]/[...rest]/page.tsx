import RouteDispatcher from "./RouteDispatcher";

/**
 * Catch-all для динамических маршрутов (product/post/project/… по slug).
 * Явные страницы (home, about, products, blog, projects, contacts) имеют выше
 * приоритет и рендерятся своей статикой с SEO. Сюда попадают детальные и любые
 * несуществующие в сборке пути — их обслуживает клиентский диспетчер.
 *
 * В проде (output: export) собирается один плейсхолдер `_` на язык; nginx
 * отдаёт его на любой путь под /:lang/ (try_files … /$lang/_/index.html).
 * Реальный slug читается из URL на клиенте — per-item SEO нет.
 */
export function generateStaticParams() {
  return [{ rest: ["_"] }];
}

export default function Page() {
  return <RouteDispatcher />;
}
