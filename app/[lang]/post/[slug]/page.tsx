import PostView from "../PostView";

/**
 * Одна статическая страница-оболочка на язык (slug = "_"): реальный slug берём
 * из URL на клиенте, `PostView` сам грузит пост по нему. Так новые посты
 * открываются без пересборки сайта — страница на каждый пост не пекётся, и
 * per-item SEO-меты нет (заголовок вкладки проставляется на клиенте).
 */
export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function Page() {
  return <PostView />;
}
