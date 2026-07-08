"use client";

import { Images } from "lucide-react";
import type { ApiProject } from "@/lib/api";
import { localizeProject, projectExcerpt } from "@/lib/projects";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { useDict, useLang } from "@/components/i18n/I18nProvider";

export function ProjectCard({ project }: { project: ApiProject }) {
  const dict = useDict();
  const lang = useLang();
  const p = localizeProject(project, lang);
  const short = projectExcerpt(p);

  return (
    <Link
      href={`/project/${encodeURIComponent(project.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
    >
      <div className="relative aspect-[16/9] w-full">
        {p.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.coverImage} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <MediaVisual
            seed={project.slug || String(project.id)}
            icon="Activity"
            label={`${dict.project.coverAlt}: ${p.title}`}
            className="h-full w-full"
          />
        )}
        {p.images.length > 1 && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs text-accent ring-1 ring-line backdrop-blur">
            <Images className="h-3.5 w-3.5" /> {p.images.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {p.title}
        </h3>
        {short && <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{short}</p>}
      </div>
    </Link>
  );
}
