import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";
import { site } from "@/lib/data/site";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "ru");
  return {
    title: dict.contacts.meta.title,
    description: dict.contacts.meta.description,
  };
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const c = dict.contacts;

  return (
    <>
      <PageHeader
        eyebrow={c.header.eyebrow}
        title={<>{c.header.title}</>}
        subtitle={c.header.subtitle}
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            {/* Info */}
            <Reveal className="flex flex-col gap-4">
              <InfoCard
                icon={<Phone className="h-5 w-5" />}
                title={c.phoneLabel}
                href={`tel:${site.phoneHref}`}
                value={site.phone}
              />
              <InfoCard
                icon={<Mail className="h-5 w-5" />}
                title={c.emailLabel}
                href={`mailto:${site.email}`}
                value={site.email}
              />
              <InfoCard
                icon={<MapPin className="h-5 w-5" />}
                title={c.addressLabel}
                value={dict.site.addressDisplay}
              />
              <InfoCard
                icon={<Clock className="h-5 w-5" />}
                title={c.hoursLabel}
                value={dict.site.hours}
                note={dict.site.hoursNote}
              />

              <div className="mt-2 flex flex-col gap-3 rounded-3xl glass p-6">
                <h3 className="font-display text-base font-semibold text-ink">
                  {c.messengerTitle}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={site.socials.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#229ED9]/15 px-4 py-2.5 text-sm font-medium text-[#7cc9ef] ring-1 ring-[#229ED9]/30 transition-colors hover:bg-[#229ED9]/25"
                  >
                    <Send className="h-4 w-4" />
                    Telegram
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal delay={0.1}>
              <div className="rounded-[2rem] glass-strong p-6 md:p-9">
                <h2 className="font-display text-2xl font-semibold text-ink">
                  {c.formTitle}
                </h2>
                <p className="mt-2 text-ink-muted">
                  {c.formSubtitle}
                </p>
                <div className="mt-7">
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Map */}
      <section className="pb-20 md:pb-28">
        <Container>
          <Reveal className="overflow-hidden rounded-[2rem] glass">
            <div className="relative">
              <div className="aspect-[16/10] w-full sm:aspect-[21/9]">
                <iframe
                  title={c.mapTitle}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=69.20%2C41.27%2C69.36%2C41.35&layer=mapnik&marker=41.311081%2C69.279737"
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
        </Container>
      </section>
    </>
  );
}

function InfoCard({
  icon,
  title,
  value,
  note,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-3xl glass p-5 transition-all duration-200 hover:border-line-strong">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-accent ring-1 ring-line-strong">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-ink-dim">{title}</span>
        <span className="text-ink">{value}</span>
        {note && <span className="text-sm text-ink-muted">{note}</span>}
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:text-accent">
      {inner}
    </a>
  ) : (
    inner
  );
}
