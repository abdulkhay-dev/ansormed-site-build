"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/data/site";
import { useDict } from "@/components/i18n/I18nProvider";

export function CTASection() {
  const dict = useDict();
  const c = dict.cta;
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 grid-dots opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 spotlight" />
      <Container className="relative z-10">
        <div className="overflow-hidden rounded-[2rem] glass-strong">
          <div className="grid gap-10 p-7 md:grid-cols-2 md:gap-12 md:p-12">
            <Reveal className="flex flex-col gap-6">
              <span className="label inline-flex w-fit items-center gap-2 text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                {c.badge}
              </span>
              <h2 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
                {c.title}
              </h2>
              <p className="text-pretty leading-relaxed text-ink-muted">
                {c.text}
              </p>

              <ul className="mt-2 flex flex-col gap-4">
                <ContactRow icon={<Phone className="h-5 w-5" />} href={`tel:${site.phoneHref}`} label={c.phoneLabel}>
                  {site.phone}
                </ContactRow>
                <ContactRow icon={<Mail className="h-5 w-5" />} href={`mailto:${site.email}`} label={c.emailLabel}>
                  {site.email}
                </ContactRow>
                <ContactRow icon={<MapPin className="h-5 w-5" />} label={c.addressLabel}>
                  {dict.site.addressDisplay}
                </ContactRow>
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <ContactForm />
            </Reveal>
          </div>

          <Reveal className="border-t border-line-strong">
            <div className="relative">
              <div className="aspect-[16/10] w-full sm:aspect-[21/9]">
                <iframe
                  title={dict.contacts.mapTitle}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=69.18%2C41.33%2C69.29%2C41.38&layer=mapnik&marker=41.354458%2C69.236303"
                  className="h-full w-full grayscale-[0.2] [filter:invert(0.9)_hue-rotate(170deg)]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm">
                <div className="pointer-events-auto rounded-2xl glass-strong p-4">
                  <p className="font-display font-semibold text-ink">{site.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{dict.site.addressDisplay}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function ContactRow({
  icon,
  href,
  label,
  children,
}: {
  icon: React.ReactNode;
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-accent ring-1 ring-line-strong">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-ink-dim">{label}</span>
        <span className="text-ink">{children}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="flex items-center gap-4 transition-colors hover:text-accent">
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-4">{content}</div>
      )}
    </li>
  );
}
