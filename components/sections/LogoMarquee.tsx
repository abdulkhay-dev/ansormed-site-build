type BrandLogo = {
  src: string;
  alt: string;
  crop?: "left";
};

const BRAND_LOGOS: BrandLogo[] = [
  { src: "/brand-logos/1689297925533621.png", alt: "Partner logo" },
  { src: "/brand-logos/da.png", alt: "Partner logo" },
  { src: "/brand-logos/2306-202507171503565876.webp", alt: "Partner logo" },
  { src: "/brand-logos/4023875.png", alt: "Partner logo" },
  { src: "/brand-logos/624515ad92ab7.png", alt: "Partner logo" },
  {
    src: "/brand-logos/BAIHE-medical-europe-rairkp677938akukr5qiddjpwi32np7buq5tu41ag0.png",
    alt: "Baihe Medical",
  },
  { src: "/brand-logos/alma.svg", alt: "Alma" },
  { src: "/brand-logos/brand-02.svg", alt: "Astar" },
  { src: "/brand-logos/image_2.svg", alt: "Partner logo" },
  { src: "/brand-logos/logo.png", alt: "Partner logo" },
  { src: "/brand-logos/neo.svg", alt: "Neo" },
  { src: "/brand-logos/nerotex.svg", alt: "Nerotex" },
  { src: "/brand-logos/syrebo.webp", alt: "Syrebo" },
  { src: "/brand-logos/qian-jing.png", alt: "Qian Jing" },
  {
    src: "/brand-logos/shanghai-meddo-medical-devices-co.webp",
    alt: "Shanghai Meddo Medical Devices",
  },
  { src: "/brand-logos/tabor.png", alt: "Tabor", crop: "left" },
  { src: "/brand-logos/brand-red-white.png", alt: "Partner logo" },
  { src: "/brand-logos/zeru.png", alt: "Zeru" },
  { src: "/brand-logos/brand-magenta.png", alt: "Partner logo" },
  { src: "/brand-logos/%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F.png", alt: "Partner logo" },
];

export function LogoMarquee() {
  return (
    <div className="relative mt-14 overflow-hidden py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-base to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-base to-transparent md:w-32" />
      <div className="brand-marquee flex w-max items-center">
        <LogoSet />
        <LogoSet ariaHidden />
      </div>
    </div>
  );
}

function LogoSet({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex items-center gap-4 pr-4 md:gap-5 md:pr-5"
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {BRAND_LOGOS.map((brand) => (
        <div
          key={brand.src}
          className="flex h-24 w-48 shrink-0 items-center justify-center rounded-lg border border-line bg-surface/75 px-5 shadow-soft md:h-28 md:w-64 md:px-8"
        >
          {brand.crop === "left" ? (
            <span className="block w-32 overflow-hidden md:w-44">
              <img
                src={brand.src}
                alt={brand.alt}
                className="h-auto w-[19rem] max-w-none md:w-[26rem]"
              />
            </span>
          ) : (
            <img
              src={brand.src}
              alt={brand.alt}
              className="max-h-14 max-w-[10rem] object-contain md:max-h-16 md:max-w-[13.5rem]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
