export const site = {
  name: "Ansor Med",
  tagline: "Медицинское оборудование нового поколения",
  description:
    "Поставка, монтаж и сервис современного медицинского оборудования по всему Узбекистану.",
  phone: "+998 95 222 32 32",
  phoneHref: "+998952223232",
  email: "info@ansormed.uz",
  address: "г. Ташкент",
  hours: "9:00 — 20:00",
  hoursNote: "Ежедневно, без выходных",
  socials: {
    telegram: "https://t.me/ansormed",
    instagram: "https://instagram.com/ansormed",
  },
};

export interface NavItem {
  label: string;
  href: string;
}

export const nav: NavItem[] = [
  { label: "Главная", href: "/" },
  { label: "Продукция", href: "/products" },
  { label: "Блог", href: "/blog" },
  { label: "О нас", href: "/about" },
  { label: "Контакты", href: "/contacts" },
];

export interface Advantage {
  icon: string;
  title: string;
  text: string;
}

export const advantages: Advantage[] = [
  {
    icon: "ShieldCheck",
    title: "Сертифицированное оборудование",
    text: "Только проверенные бренды с полным пакетом регистрационных документов и сертификатов.",
  },
  {
    icon: "Wrench",
    title: "Гарантия и сервис",
    text: "Собственная сервисная служба, гарантированное время реакции и склад запчастей в регионе.",
  },
  {
    icon: "Truck",
    title: "Доставка по Узбекистану",
    text: "Логистика, монтаж и ввод в эксплуатацию в любой точке страны под ключ.",
  },
  {
    icon: "GraduationCap",
    title: "Обучение персонала",
    text: "Готовим врачей и инженеров к работе с оборудованием — очно и дистанционно.",
  },
];

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 500, suffix: "+", label: "единиц оборудования поставлено" },
  { value: 5, suffix: " лет", label: "на рынке медтехники" },
  { value: 1000, suffix: "+", label: "клиник и партнёров" },
  { value: 24, suffix: "/7", label: "сервисная поддержка" },
];

export interface Value {
  icon: string;
  title: string;
  text: string;
}

export const values: Value[] = [
  {
    icon: "Target",
    title: "Точность",
    text: "Подбираем оборудование под реальные клинические задачи, а не «по каталогу».",
  },
  {
    icon: "HeartHandshake",
    title: "Доверие",
    text: "Прозрачные условия, честные сроки и долгосрочные отношения с клиниками.",
  },
  {
    icon: "Sparkles",
    title: "Технологичность",
    text: "Привозим решения, которые задают стандарт современной медицины.",
  },
  {
    icon: "LifeBuoy",
    title: "Поддержка",
    text: "Сопровождаем оборудование на всём жизненном цикле — от поставки до апгрейда.",
  },
];

export const partners: string[] = [
  "MediCore",
  "NeuroTech",
  "VitaLab",
  "CardioLine",
  "Helix Systems",
  "ProScan",
];

export interface TimelineItem {
  year: string;
  title: string;
  text: string;
}

export const timeline: TimelineItem[] = [
  {
    year: "2016",
    title: "Основание компании",
    text: "Ansor Med начинает поставки диагностического оборудования в клиники Ташкента.",
  },
  {
    year: "2019",
    title: "Собственный сервис",
    text: "Запуск инженерной службы и склада запчастей для быстрого реагирования.",
  },
  {
    year: "2022",
    title: "Расширение по стране",
    text: "Поставки и монтаж оборудования во всех регионах Узбекистана.",
  },
  {
    year: "2026",
    title: "Фокус на нейротехнологиях",
    text: "Развиваем направление нейрохирургии, нейровизуализации и роботизированной реабилитации.",
  },
];
