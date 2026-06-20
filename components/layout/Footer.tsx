import Link from "next/link";
import { Phone, Mail, MapPin, Send, MessageCircle, Camera } from "lucide-react";
import { nav, site } from "@/lib/data/site";
import { categories } from "@/lib/data/categories";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const year = 2026;
  return (
    <footer className="relative mt-24 border-t border-line bg-base-2">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        {/* Brand */}
        <div className="flex flex-col gap-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
            {site.description}
          </p>
          <div className="flex gap-2.5">
            <SocialLink href={site.socials.telegram} label="Telegram">
              <Send className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={site.socials.whatsapp} label="WhatsApp">
              <MessageCircle className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={site.socials.instagram} label="Instagram">
              <Camera className="h-5 w-5" />
            </SocialLink>
          </div>
        </div>

        {/* Nav */}
        <FooterCol title="Навигация">
          {nav.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </FooterCol>

        {/* Categories */}
        <FooterCol title="Категории">
          {categories.slice(0, 5).map((c) => (
            <FooterLink key={c.id} href={`/products?category=${c.id}`}>
              {c.short}
            </FooterLink>
          ))}
        </FooterCol>

        {/* Contacts */}
        <FooterCol title="Контакты">
          <FooterContact icon={<Phone className="h-4 w-4" />} href={`tel:${site.phoneHref}`}>
            {site.phone}
          </FooterContact>
          <FooterContact icon={<Mail className="h-4 w-4" />} href={`mailto:${site.email}`}>
            {site.email}
          </FooterContact>
          <li className="flex items-start gap-2.5 text-sm text-ink-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{site.address}</span>
          </li>
        </FooterCol>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-sm text-ink-dim sm:flex-row">
          <p>© {year} {site.name}. Все права защищены.</p>
          <p>Поставка медицинского оборудования по всему Узбекистану</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-ink-muted transition-colors duration-200 hover:text-accent"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterContact({
  icon,
  href,
  children,
}: {
  icon: React.ReactNode;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-2.5 text-sm text-ink-muted transition-colors duration-200 hover:text-accent"
      >
        <span className="text-accent">{icon}</span>
        {children}
      </a>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full glass text-ink-muted transition-all duration-200 hover:text-accent hover:border-line-strong hover:-translate-y-0.5"
    >
      {children}
    </a>
  );
}
