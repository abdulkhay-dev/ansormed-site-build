import ProjectView from "../ProjectView";

/**
 * Одна статическая страница-оболочка на язык (slug = "_"): реальный slug берём
 * из URL на клиенте, `ProjectView` сам грузит проект по нему. Так новые проекты
 * открываются без пересборки сайта — страница на каждый проект не пекётся, и
 * per-item SEO-меты нет (заголовок вкладки проставляется на клиенте).
 */
export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function Page() {
  return <ProjectView />;
}
