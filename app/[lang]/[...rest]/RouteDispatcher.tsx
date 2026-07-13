"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, Loader2, Compass } from "lucide-react";
import ProductView from "../product/ProductView";
import PostView from "../post/PostView";
import ProjectView from "../project/ProjectView";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { useDict } from "@/components/i18n/I18nProvider";

/**
 * Единая клиентская оболочка-диспетчер для маршрутов, которых нет в статике.
 * На проде (output: export) собирается один плейсхолдер `_` на язык, а nginx
 * отдаёт его на любой несуществующий путь под /:lang/. Тип страницы и slug
 * определяются из URL на клиенте — так каталог/блог/проекты работают как SPA:
 * новые элементы открываются без пересборки сайта.
 */
export default function RouteDispatcher() {
  const pathname = usePathname();
  // Избегаем hydration-mismatch: на сервере и при первом клиентском рендере
  // показываем один и тот же лоадер, а диспетчеризуем уже после маунта, когда
  // в usePathname лежит реальный URL (а не плейсхолдер `_`).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <Spinner />;

  const type = (pathname ?? "").split("/").filter(Boolean)[1];
  if (type === "product") return <ProductView />;
  if (type === "post") return <PostView />;
  if (type === "project") return <ProjectView />;
  return <UnknownRoute />;
}

function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-28">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );
}

function UnknownRoute() {
  const dict = useDict();
  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <div className="flex flex-col items-center gap-5 rounded-3xl glass px-6 py-20 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
            <Compass className="h-7 w-7 text-ink-muted" />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {dict.product.notFoundTitle}
          </h1>
          <ButtonLink href="/">
            <ArrowLeft className="h-4 w-4" />
            {dict.product.breadcrumbHome}
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
