import type { Locale } from "@/lib/i18n";

export type Accent = "cyan" | "mint" | "violet" | "amber";

/** Сырые данные категории с переводами (ru/uz). */
interface CategoryRaw {
  id: string;
  name: { ru: string; uz: string };
  short: { ru: string; uz: string };
  description: { ru: string; uz: string };
  /** lucide-react icon name */
  icon: string;
  accent: Accent;
}

/** Локализованная категория, готовая к отрисовке. */
export interface Category {
  id: string;
  name: string;
  short: string;
  description: string;
  icon: string;
  accent: Accent;
}

const categoriesRaw: CategoryRaw[] = [
  {
    id: "diagnostics",
    name: { ru: "Диагностическое оборудование", uz: "Diagnostika uskunalari" },
    short: { ru: "Диагностика", uz: "Diagnostika" },
    description: {
      ru: "УЗИ-системы, МРТ и КТ-комплексы, рентген и оборудование функциональной диагностики премиум-класса.",
      uz: "UTT tizimlari, MRT va KT majmualari, rentgen va premium-klass funksional diagnostika uskunalari.",
    },
    icon: "ScanLine",
    accent: "cyan",
  },
  {
    id: "neurosurgery",
    name: { ru: "Нейрохирургия", uz: "Neyroxirurgiya" },
    short: { ru: "Нейрохирургия", uz: "Neyroxirurgiya" },
    description: {
      ru: "Операционные микроскопы, нейронавигация и системы интраоперационного мониторинга для точных вмешательств.",
      uz: "Aniq aralashuvlar uchun operatsion mikroskoplar, neyronavigatsiya va intraoperatsion monitoring tizimlari.",
    },
    icon: "Brain",
    accent: "violet",
  },
  {
    id: "rehabilitation",
    name: { ru: "Реабилитация", uz: "Reabilitatsiya" },
    short: { ru: "Реабилитация", uz: "Reabilitatsiya" },
    description: {
      ru: "Роботизированные комплексы, аппараты механотерапии и физиотерапии для восстановления пациентов.",
      uz: "Bemorlarni tiklash uchun robotlashtirilgan majmualar, mexanoterapiya va fizioterapiya apparatlari.",
    },
    icon: "Activity",
    accent: "mint",
  },
  {
    id: "monitoring",
    name: { ru: "Мониторинг пациентов", uz: "Bemorlar monitoringi" },
    short: { ru: "Мониторинг", uz: "Monitoring" },
    description: {
      ru: "Прикроватные мониторы, центральные станции и телеметрия для отделений интенсивной терапии.",
      uz: "Reanimatsiya bo'limlari uchun bemor yonidagi monitorlar, markaziy stansiyalar va telemetriya.",
    },
    icon: "HeartPulse",
    accent: "cyan",
  },
  {
    id: "laboratory",
    name: { ru: "Лабораторное оборудование", uz: "Laboratoriya uskunalari" },
    short: { ru: "Лаборатория", uz: "Laboratoriya" },
    description: {
      ru: "Анализаторы, центрифуги и автоматизированные системы для клинико-диагностических лабораторий.",
      uz: "Klinik-diagnostika laboratoriyalari uchun analizatorlar, sentrifugalar va avtomatlashtirilgan tizimlar.",
    },
    icon: "FlaskConical",
    accent: "mint",
  },
  {
    id: "consumables",
    name: { ru: "Расходные материалы", uz: "Sarflanadigan materiallar" },
    short: { ru: "Расходники", uz: "Sarf materiallar" },
    description: {
      ru: "Сертифицированные расходные материалы и комплектующие для бесперебойной работы оборудования.",
      uz: "Uskunalarning uzluksiz ishlashi uchun sertifikatlangan sarflanadigan materiallar va butlovchilar.",
    },
    icon: "Boxes",
    accent: "amber",
  },
];

/** Возвращает список категорий, локализованный под переданный язык. */
export function getCategories(lang: Locale): Category[] {
  return categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name[lang],
    short: c.short[lang],
    description: c.description[lang],
    icon: c.icon,
    accent: c.accent,
  }));
}
