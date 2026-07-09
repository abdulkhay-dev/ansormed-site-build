import { Phone, Mail, MapPin } from "lucide-react";
import { InstagramIcon, TelegramIcon, WhatsAppIcon, YouTubeIcon } from "@/components/ui/SocialIcons";
import { site } from "@/lib/data/site";
import { getCategories } from "@/lib/data/categories";
import { Logo } from "@/components/ui/Logo";
import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { getDictionary, interpolate, telHref, type Locale } from "@/lib/i18n";

export async function Footer({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const categories = await getCategories(lang);
  const year = 2026;

  const nav = [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.products, href: "/products" },
    { label: dict.nav.blog, href: "/blog" },
    { label: dict.nav.about, href: "/about" },
    { label: dict.nav.contacts, href: "/contacts" },
  ];

  return (
    <footer className="relative mt-24 border-t border-line bg-base-2">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        {/* Brand */}
        <div className="flex flex-col gap-5" style={{alignItems: 'flex-start'}}>
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
            {dict.meta.description}
          </p>
          <div className="flex gap-2.5">
            <SocialLink href={dict.site.social.telegram} label="Telegram">
              <TelegramIcon className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={dict.site.social.instagram} label="Instagram">
              <InstagramIcon className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={dict.site.social.youtube} label="YouTube">
              <YouTubeIcon className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={dict.site.social.whatsapp} label="WhatsApp">
              <WhatsAppIcon className="h-5 w-5" />
            </SocialLink>
          </div>
        </div>

        {/* Nav */}
        <FooterCol title={dict.footer.navTitle}>
          {nav.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </FooterCol>

        {/* Categories */}
        <FooterCol title={dict.footer.categoriesTitle}>
          {categories.slice(0, 5).map((c) => (
            <FooterLink key={c.id} href={`/products?category=${encodeURIComponent(c.apiCategory)}`}>
              {c.short}
            </FooterLink>
          ))}
        </FooterCol>

        {/* Contacts */}
        <FooterCol title={dict.footer.contactsTitle}>
          <FooterContact icon={<Phone className="h-4 w-4" />} href={`tel:${telHref(dict.site.phone)}`}>
            {dict.site.phone}
          </FooterContact>
          {dict.site.phone2 && (
            <FooterContact href={`tel:${telHref(dict.site.phone2)}`}>
              {dict.site.phone2}
            </FooterContact>
          )}
          <FooterContact icon={<Mail className="h-4 w-4" />} href={`mailto:${dict.site.email}`}>
            {dict.site.email}
          </FooterContact>
          <li className="flex items-start gap-2.5 text-sm text-ink-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{dict.site.addressDisplay}</span>
          </li>
        </FooterCol>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-sm text-ink-dim sm:flex-row">
          <p>{interpolate(dict.footer.rights, { year, name: site.name })}</p>
          <p>{dict.footer.tagline}</p>
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
  icon?: React.ReactNode;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-2.5 text-sm text-ink-muted transition-colors duration-200 hover:text-accent"
      >
        {icon ? (
          <span className="text-accent shrink-0">{icon}</span>
        ) : (
          <span className="w-4 shrink-0" />
        )}
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
