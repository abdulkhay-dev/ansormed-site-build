import type { MetadataRoute } from "next";
import { site } from "@/lib/data/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — медицинское оборудование`,
    short_name: site.name,
    description:
      "Поставка, монтаж и сервис современного медицинского оборудования по всему Узбекистану.",
    start_url: "/ru/",
    display: "standalone",
    background_color: "#04060e",
    theme_color: "#04060e",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
