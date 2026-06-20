import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Section";

/** Compact header used at the top of inner pages. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-base-2">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-50 [mask-image:radial-gradient(80%_80%_at_30%_0%,#000,transparent)]" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-[36rem] spotlight" />

      <div className="container-x relative z-10 pb-14 pt-32 md:pb-20 md:pt-40">
        <div className="flex max-w-3xl flex-col gap-5">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>
          </Reveal>
          {subtitle && (
            <Reveal delay={0.1}>
              <p className="max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted">
                {subtitle}
              </p>
            </Reveal>
          )}
          {children && <Reveal delay={0.15}>{children}</Reveal>}
        </div>
      </div>
    </section>
  );
}
