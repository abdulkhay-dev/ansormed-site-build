import RouteView from "@/components/app/RouteView";

/**
 * Единственная страница-оболочка SPA. Экспорт собирает один `index.html`, а
 * весь роутинг (язык, раздел, slug) выполняется на клиенте в RouteView. nginx
 * отдаёт этот index.html на любой путь (try_files $uri $uri/ /index.html).
 */
export function generateStaticParams() {
  return [{ slug: [] as string[] }];
}

export default function Page() {
  return <RouteView />;
}
