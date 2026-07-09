/**
 * Неизменяемое имя бренда. Контакты/соцсети/адрес и числа-счётчики теперь живут
 * в словарях (lib/i18n/dictionaries/{ru,uz,en}.ts) под ключами `site.*` и
 * `stats.N.value` — единый источник, редактируемый через CMS (/api/site-content/).
 */
export const site = {
  name: "Ansor Med",
};

/** Бренды-партнёры — названия не переводятся. */
export const partners: string[] = [
  "MediCore",
  "NeuroTech",
  "VitaLab",
  "CardioLine",
  "Helix Systems",
  "ProScan",
];
