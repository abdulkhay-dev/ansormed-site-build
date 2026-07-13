import ProductView from "../ProductView";

/**
 * Одна статическая страница-оболочка на язык (slug = "_"): реальный slug берём
 * из URL на клиенте, `ProductView` сам грузит товар по нему. Так новые товары
 * открываются без пересборки сайта — страница на каждый товар не пекётся, и
 * per-item SEO-меты нет (заголовок вкладки проставляется на клиенте).
 */
export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function Page() {
  return <ProductView />;
}
