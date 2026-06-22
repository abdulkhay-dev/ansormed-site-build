"use client";

import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowLeft, Home } from "lucide-react";
import { useDict } from "@/components/i18n/I18nProvider";

export default function NotFound() {
  const dict = useDict();
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-dots opacity-25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 spotlight" />
      <Container className="relative z-10">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="font-display text-7xl font-bold text-accent-gradient md:text-9xl">
            404
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ink md:text-3xl">
            {dict.notFound.title}
          </h1>
          <p className="mt-3 text-ink-muted">{dict.notFound.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">
              <Home className="h-4 w-4" />
              {dict.notFound.home}
            </ButtonLink>
            <ButtonLink href="/products" variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              {dict.notFound.catalog}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
