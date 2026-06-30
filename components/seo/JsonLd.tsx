import { site } from "@/lib/data/site";
import { SITE_URL, localeUrl } from "@/lib/seo";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Глобальная структурированная разметка (schema.org): Organization + WebSite.
 * Рендерится один раз в layout. Тексты берутся из словаря под текущую локаль.
 */
export function SiteJsonLd({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    url: localeUrl(lang),
    logo: `${SITE_URL}/favicon.ico`,
    image: `${SITE_URL}/og.png`,
    description: dict.meta.description,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: dict.site.addressDisplay,
      addressLocality: "Tashkent",
      addressCountry: "UZ",
    },
    sameAs: [site.socials.telegram, site.socials.instagram],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    url: localeUrl(lang),
    inLanguage: lang,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  // Навигация сайта — подсказка Google для sitelinks (имя + своё описание).
  const navItems = [
    { name: dict.nav.products, path: "products", description: dict.products.meta.description },
    { name: dict.nav.blog, path: "blog", description: dict.blog.meta.description },
    { name: dict.nav.about, path: "about", description: dict.about.meta.description },
    { name: dict.nav.contacts, path: "contacts", description: dict.contacts.meta.description },
  ];
  const navigation = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/#sitenav`,
    name: site.name,
    itemListElement: navItems.map((n, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: n.name,
      description: n.description,
      url: localeUrl(lang, n.path),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigation) }}
      />
    </>
  );
}
