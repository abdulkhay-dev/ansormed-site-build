"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, BriefcaseMedical, ChevronRight, Loader2 } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { getProjectBySlug, type ApiProject } from "@/lib/api";
import { localizeProject } from "@/lib/projects";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { Container } from "@/components/ui/Section";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { slugFromPathname } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "ok"; project: ApiProject }
  | { status: "missing" };

export default function ProjectView() {
  const dict = useDict();
  const lang = useLang();
  const slug = slugFromPathname(usePathname());
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!slug) {
      setState({ status: "missing" });
      return;
    }
    setState({ status: "loading" });
    let cancelled = false;
    getProjectBySlug(slug)
      .then((project) => {
        if (!cancelled) setState(project ? { status: "ok", project } : { status: "missing" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <div className="pt-28 md:pt-36">
        <Container>
          <div className="flex flex-col items-center gap-5 rounded-3xl glass px-6 py-20 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
              <BriefcaseMedical className="h-7 w-7 text-ink-muted" />
            </span>
            <h1 className="font-display text-2xl font-semibold text-ink">{dict.project.notFoundTitle}</h1>
            <p className="max-w-sm text-ink-muted">{dict.project.notFoundText}</p>
            <ButtonLink href="/projects">
              <ArrowLeft className="h-4 w-4" />{dict.project.backToProjects}
            </ButtonLink>
          </div>
        </Container>
      </div>
    );
  }

  const project = localizeProject(state.project, lang);
  const gallery = project.images.slice(project.coverImage ? 1 : 0);

  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <nav aria-label={dict.project.breadcrumbAria} className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
          <Link href="/" className="hover:text-accent">{dict.project.breadcrumbHome}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/projects" className="hover:text-accent">{dict.project.breadcrumbProjects}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 text-ink-muted">{project.title}</span>
        </nav>

        <article className="mx-auto mt-8 max-w-4xl">
          <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            {project.title}
          </h1>

          <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
            {project.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.coverImage} alt={project.title} className="max-h-[620px] w-full object-cover" />
            ) : (
              <MediaVisual
                seed={project.slug || String(project.id)}
                icon="Activity"
                label={project.title}
                className="aspect-[16/9] w-full"
              />
            )}
          </div>

          <div
            className="mt-8 leading-relaxed text-ink-muted [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_img]:my-6 [&_img]:rounded-2xl [&_li]:mb-1.5 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_ul]:mb-4"
            dangerouslySetInnerHTML={{ __html: project.content ?? "" }}
          />

          {gallery.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {gallery.map((src) => (
                <div key={src} className="overflow-hidden rounded-2xl border border-line bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {project.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-ink-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              {project.sourceUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
            </a>
          )}
        </article>

        <div className="mt-16 mb-20">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {dict.project.allProjects}
          </Link>
        </div>
      </Container>
    </div>
  );
}
