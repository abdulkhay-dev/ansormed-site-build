/**
 * Наполнение CMS (/api/site-content/) контентом homepage.
 *
 * Значения берутся напрямую из словарей ru/uz/en, ключ = полный dot-путь
 * (так их применяет фронт: I18nProvider + content-fields.ts по CONTENT_PATHS).
 *
 * Запуск (Node 24, исполняет .ts):
 *   DRY=1 node scripts/seed-content.ts            # показать, что зальётся
 *   API=https://api.ansormed.uz \
 *   AUTH='admin:пароль' node scripts/seed-content.ts   # реальная заливка
 */
import ru from "../lib/i18n/dictionaries/ru.ts";
import uz from "../lib/i18n/dictionaries/uz.ts";
import en from "../lib/i18n/dictionaries/en.ts";

type Dict = Record<string, unknown>;

/** Все строковые листья словаря → массив dot-путей. */
function leaves(obj: unknown, prefix: string, out: string[]): void {
  if (obj === null || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj as Dict)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.push(path);
    else if (v && typeof v === "object") leaves(v, path, out);
  }
}

function getPath(obj: unknown, p: string): string {
  const v = p.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Dict)[k]), obj);
  return typeof v === "string" ? v : "";
}

/** Ключи, относящиеся к homepage. Подписи-плейсхолдеры (cta.*Label) исключены. */
function isHomepageKey(p: string): boolean {
  if (p === "meta.description") return true;
  if (p === "footer.tagline") return true;
  if (p === "cta.badge" || p === "cta.title" || p === "cta.text") return true;
  return (
    p.startsWith("hero.") ||
    p.startsWith("home.") ||
    p.startsWith("anatomy.stages.") ||
    p.startsWith("stats.") ||
    p.startsWith("site.")
  );
}

// Раскладка по 5 разрешённым «корзинам» API (как в content-fields.ts).
const SECTION: Record<string, string> = {
  hero: "hero",
  home: "hero",
  anatomy: "hero",
  stats: "about",
  meta: "footer",
  footer: "footer",
  site: "footer",
  cta: "footer",
};

const all: string[] = [];
leaves(ru, "", all);
const keys = all.filter(isHomepageKey);

const records = keys.map((key) => ({
  section: SECTION[key.split(".")[0]] ?? "footer",
  key,
  value_ru: getPath(ru, key),
  value_uz: getPath(uz, key),
  value_en: getPath(en, key),
  content_type: key.startsWith("site.social.") ? "link" : "text",
}));

const DRY = process.env.DRY === "1";
const API = (process.env.API ?? "https://api.ansormed.uz").replace(/\/$/, "");
const AUTH = process.env.AUTH ?? "";

console.log(`Собрано записей: ${records.length}`);

if (DRY) {
  for (const r of records) {
    console.log(`  [${r.section}] ${r.key} = "${r.value_ru}" | uz:"${r.value_uz}" | en:"${r.value_en}"`);
  }
  console.log(`\nDRY-run: ничего не отправлено. Для заливки: AUTH='user:pass' node scripts/seed-content.ts`);
  process.exit(0);
}

if (!AUTH) {
  console.error("Нет AUTH='user:pass' — заливка отменена.");
  process.exit(1);
}

const header = "Basic " + Buffer.from(AUTH).toString("base64");
let ok = 0;
const fails: { key: string; status: number; body: string }[] = [];

for (const r of records) {
  const res = await fetch(`${API}/api/site-content/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: header },
    body: JSON.stringify(r),
  });
  if (res.ok) {
    ok++;
    console.log(`✓ ${r.key}`);
  } else {
    const body = await res.text();
    fails.push({ key: r.key, status: res.status, body: body.slice(0, 300) });
    console.log(`✗ ${r.key} → HTTP ${res.status}`);
  }
}

console.log(`\nГотово: ${ok}/${records.length} создано.`);
if (fails.length) {
  console.log(`Ошибки (${fails.length}):`);
  for (const f of fails) console.log(`  ${f.key} [${f.status}]: ${f.body}`);
}
