/**
 * Неизменяемые (нелокализуемые) данные сайта: бренд, контакты, соцсети.
 * Весь локализуемый текст (слоганы, описания, навигация, преимущества и т.д.)
 * вынесен в словари lib/i18n/dictionaries/{ru,uz}.ts.
 */
export const site = {
  name: "Ansor Med",
  phone: "+998 95 222 32 32",
  phoneHref: "+998952223232",
  email: "info@ansormed.uz",
  socials: {
    telegram: "https://t.me/ansormed",
    instagram: "https://instagram.com/ansormed",
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
