import type { Locale } from "@/lib/i18n";

export type Accent = "cyan" | "mint" | "violet" | "amber";

/** Сырые данные категории с переводами (ru/uz/en). */
interface CategoryRaw {
  id: string;
  name: { ru: string; uz: string; en: string };
  short: { ru: string; uz: string; en: string };
  description: { ru: string; uz: string; en: string };
  /** lucide-react icon name */
  icon: string;
  accent: Accent;
  /**
   * Точное значение поля `category` в API товаров, на которое ведёт карточка
   * (фильтр каталога идёт по нему). Маркетинговые категории сайта не совпадают
   * 1:1 с таксономией API, поэтому связь задаётся явно.
   */
  apiCategory: string;
}

/** Локализованная категория, готовая к отрисовке. */
export interface Category {
  id: string;
  name: string;
  short: string;
  description: string;
  icon: string;
  accent: Accent;
  apiCategory: string;
}

const categoriesRaw: CategoryRaw[] = [
  {
    id: "diagnostics",
    name: { ru: "Диагностическое оборудование", uz: "Diagnostika uskunalari", en: "Diagnostic equipment" },
    short: { ru: "Диагностика", uz: "Diagnostika", en: "Diagnostics" },
    description: {
      ru: "УЗИ-системы, МРТ и КТ-комплексы, рентген и оборудование функциональной диагностики премиум-класса.",
      uz: "UTT tizimlari, MRT va KT majmualari, rentgen va premium-klass funksional diagnostika uskunalari.",
      en: "Ultrasound systems, MRI and CT suites, X-ray and premium-class functional diagnostics equipment.",
    },
    icon: "ScanLine",
    accent: "cyan",
    apiCategory: "DIAGNOSTIC DEVICES",
  },
  {
    id: "neurosurgery",
    name: { ru: "Нейрохирургия", uz: "Neyroxirurgiya", en: "Neurosurgery" },
    short: { ru: "Нейрохирургия", uz: "Neyroxirurgiya", en: "Neurosurgery" },
    description: {
      ru: "Операционные микроскопы, нейронавигация и системы интраоперационного мониторинга для точных вмешательств.",
      uz: "Aniq aralashuvlar uchun operatsion mikroskoplar, neyronavigatsiya va intraoperatsion monitoring tizimlari.",
      en: "Surgical microscopes, neuronavigation and intraoperative monitoring systems for precise interventions.",
    },
    icon: "Brain",
    accent: "violet",
    apiCategory: "SURGICAL INSTRUMENT",
  },
  {
    id: "rehabilitation",
    name: { ru: "Реабилитация", uz: "Reabilitatsiya", en: "Rehabilitation" },
    short: { ru: "Реабилитация", uz: "Reabilitatsiya", en: "Rehabilitation" },
    description: {
      ru: "Роботизированные комплексы, аппараты механотерапии и физиотерапии для восстановления пациентов.",
      uz: "Bemorlarni tiklash uchun robotlashtirilgan majmualar, mexanoterapiya va fizioterapiya apparatlari.",
      en: "Robotic systems, mechanotherapy and physiotherapy devices for patient recovery.",
    },
    icon: "Activity",
    accent: "mint",
    apiCategory: "REHABILITATION",
  },
  {
    id: "monitoring",
    name: { ru: "Мониторинг пациентов", uz: "Bemorlar monitoringi", en: "Patient monitoring" },
    short: { ru: "Мониторинг", uz: "Monitoring", en: "Monitoring" },
    description: {
      ru: "Прикроватные мониторы, центральные станции и телеметрия для отделений интенсивной терапии.",
      uz: "Reanimatsiya bo'limlari uchun bemor yonidagi monitorlar, markaziy stansiyalar va telemetriya.",
      en: "Bedside monitors, central stations and telemetry for intensive care units.",
    },
    icon: "HeartPulse",
    accent: "cyan",
    apiCategory: "DIAGNOSTIC DEVICES",
  },
  {
    id: "laboratory",
    name: { ru: "Лабораторное оборудование", uz: "Laboratoriya uskunalari", en: "Laboratory equipment" },
    short: { ru: "Лаборатория", uz: "Laboratoriya", en: "Laboratory" },
    description: {
      ru: "Анализаторы, центрифуги и автоматизированные системы для клинико-диагностических лабораторий.",
      uz: "Klinik-diagnostika laboratoriyalari uchun analizatorlar, sentrifugalar va avtomatlashtirilgan tizimlar.",
      en: "Analyzers, centrifuges and automated systems for clinical diagnostic laboratories.",
    },
    icon: "FlaskConical",
    accent: "mint",
    apiCategory: "Лаборатория",
  },
  {
    id: "consumables",
    name: { ru: "Расходные материалы", uz: "Sarflanadigan materiallar", en: "Consumables" },
    short: { ru: "Расходники", uz: "Sarf materiallar", en: "Consumables" },
    description: {
      ru: "Сертифицированные расходные материалы и комплектующие для бесперебойной работы оборудования.",
      uz: "Uskunalarning uzluksiz ishlashi uchun sertifikatlangan sarflanadigan materiallar va butlovchilar.",
      en: "Certified consumables and components for uninterrupted equipment operation.",
    },
    icon: "Boxes",
    accent: "amber",
    apiCategory: "OTHER",
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
    apiCategory: c.apiCategory,
  }));
}
