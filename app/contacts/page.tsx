import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с Ansor Med: телефон, email, адрес офиса в Ташкенте и мессенджеры. Оставьте заявку — мы перезвоним.",
};

export default function ContactsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Контакты"
        title={<>Давайте обсудим ваш проект</>}
        subtitle="Ответим на вопросы, подберём оборудование и подготовим коммерческое предложение. Мы на связи в рабочее время и в мессенджерах."
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            {/* Info */}
            <Reveal className="flex flex-col gap-4">
              <InfoCard
                icon={<Phone className="h-5 w-5" />}
                title="Телефон"
                href={`tel:${site.phoneHref}`}
                value={site.phone}
              />
              <InfoCard
                icon={<Mail className="h-5 w-5" />}
                title="Email"
                href={`mailto:${site.email}`}
                value={site.email}
              />
              <InfoCard
                icon={<MapPin className="h-5 w-5" />}
                title="Адрес"
                value={site.address}
              />
              <InfoCard
                icon={<Clock className="h-5 w-5" />}
                title="Режим работы"
                value={site.hours}
              />

              <div className="mt-2 flex flex-col gap-3 rounded-3xl glass p-6">
                <h3 className="font-display text-base font-semibold text-ink">
                  Напишите в мессенджер
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
                  <a
                    href={site.socials.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/15 px-4 py-2.5 text-sm font-medium text-[#7ef0a3] ring-1 ring-[#25D366]/30 transition-colors hover:bg-[#25D366]/25"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal delay={0.1}>
              <div className="rounded-[2rem] glass-strong p-6 md:p-9">
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Оставить заявку
                </h2>
                <p className="mt-2 text-ink-muted">
                  Заполните форму — специалист свяжется с вами в ближайшее время.
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
                  title="Карта — офис Ansor Med в Ташкенте"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=69.20%2C41.27%2C69.36%2C41.35&layer=mapnik&marker=41.311081%2C69.279737"
                  className="h-full w-full grayscale-[0.2] [filter:invert(0.9)_hue-rotate(170deg)]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm">
                <div className="pointer-events-auto rounded-2xl glass-strong p-4">
                  <p className="font-display font-semibold text-ink">{site.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{site.address}</p>
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
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
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
