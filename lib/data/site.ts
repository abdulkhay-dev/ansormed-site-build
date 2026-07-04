/**
 * Неизменяемые (нелокализуемые) данные сайта: бренд, контакты, соцсети.
 * Весь локализуемый текст (слоганы, описания, навигация, преимущества и т.д.)
 * вынесен в словари lib/i18n/dictionaries/{ru,uz}.ts.
 */
export const site = {
  name: "Ansor Med",
  phone: "+998 94 618 19 91",
  phoneHref: "+998946181991",
  phone2: "+998 95 222 32 32",
  phone2Href: "+998952223232",
  email: "info@ansormed.uz",
  socials: {
    telegram: "https://t.me/Ansormed1",
    instagram: "https://www.instagram.com/ansormed.uz?igsh=MW0xcTEwc3Q2M2JzbQ==",
  },
};

/**
 * Числовые значения счётчиков (зипуются по индексу с подписями dict.stats).
 * Порядок: поставки, лет на рынке, клиник, режим поддержки.
 */
export const statValues: number[] = [500, 5, 1000, 24];

/** Бренды-партнёры — названия не переводятся. */
export const partners: string[] = [
  "MediCore",
  "NeuroTech",
  "VitaLab",
  "CardioLine",
  "Helix Systems",
  "ProScan",
];
