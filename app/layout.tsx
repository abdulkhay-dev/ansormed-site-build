import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/app/AppShell";
import { site } from "@/lib/data/site";
import { getDictionary } from "@/lib/i18n";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Базовые (языконезависимые) метаданные. Сайт — клиентский SPA, поэтому
// per-page тайтлы/описания проставляются на клиенте во вьюхах.
export function generateMetadata(): Metadata {
  const dict = getDictionary("ru");
  return {
    metadataBase: new URL("https://ansormed.uz"),
    title: {
      default: `${site.name} — ${dict.meta.tagline}`,
      template: `%s — ${site.name}`,
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${site.name} — ${dict.meta.tagline}`,
      description: dict.meta.description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${dict.meta.tagline}`,
      description: dict.meta.description,
      images: ["/og.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f6f8fc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-base">
        {/* Yandex.Metrika counter */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110002545', 'ym');
          ym(110002545, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
        </Script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/110002545"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
