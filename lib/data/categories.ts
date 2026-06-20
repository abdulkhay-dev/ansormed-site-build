export type Accent = "cyan" | "mint" | "violet" | "amber";

export interface Category {
  id: string;
  name: string;
  short: string;
  description: string;
  /** lucide-react icon name */
  icon: string;
  accent: Accent;
}

export const categories: Category[] = [
  {
    id: "diagnostics",
    name: "Диагностическое оборудование",
    short: "Диагностика",
    description:
      "УЗИ-системы, МРТ и КТ-комплексы, рентген и оборудование функциональной диагностики премиум-класса.",
    icon: "ScanLine",
    accent: "cyan",
  },
  {
    id: "neurosurgery",
    name: "Нейрохирургия",
    short: "Нейрохирургия",
    description:
      "Операционные микроскопы, нейронавигация и системы интраоперационного мониторинга для точных вмешательств.",
    icon: "Brain",
    accent: "violet",
  },
  {
    id: "rehabilitation",
    name: "Реабилитация",
    short: "Реабилитация",
    description:
      "Роботизированные комплексы, аппараты механотерапии и физиотерапии для восстановления пациентов.",
    icon: "Activity",
    accent: "mint",
  },
  {
    id: "monitoring",
    name: "Мониторинг пациентов",
    short: "Мониторинг",
    description:
      "Прикроватные мониторы, центральные станции и телеметрия для отделений интенсивной терапии.",
    icon: "HeartPulse",
    accent: "cyan",
  },
  {
    id: "laboratory",
    name: "Лабораторное оборудование",
    short: "Лаборатория",
    description:
      "Анализаторы, центрифуги и автоматизированные системы для клинико-диагностических лабораторий.",
    icon: "FlaskConical",
    accent: "mint",
  },
  {
    id: "consumables",
    name: "Расходные материалы",
    short: "Расходники",
    description:
      "Сертифицированные расходные материалы и комплектующие для бесперебойной работы оборудования.",
    icon: "Boxes",
    accent: "amber",
  },
];

export const categoryById = (id: string) =>
  categories.find((c) => c.id === id);
