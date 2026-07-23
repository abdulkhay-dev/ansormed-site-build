import { cn } from "@/lib/utils";

/**
 * Рендерит форматированный HTML из админки (описания товаров, тексты постов и
 * проектов) с единым типографическим стилем. Контент доверенный — приходит из
 * нашей CMS, поэтому вставляется через dangerouslySetInnerHTML без санитайза
 * (тот же подход, что и раньше в постах/проектах).
 */
const PROSE =
  "leading-relaxed text-ink-muted " +
  "[&_a]:text-accent [&_a]:underline " +
  "[&_strong]:font-semibold [&_strong]:text-ink [&_b]:font-semibold [&_b]:text-ink " +
  "[&_em]:italic [&_i]:italic " +
  "[&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink " +
  "[&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink " +
  "[&_h4]:mt-5 [&_h4]:font-display [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-ink " +
  "[&_img]:my-6 [&_img]:rounded-2xl " +
  "[&_p]:mb-4 " +
  "[&_ul]:mb-4 [&_ol]:mb-4 [&_li]:mb-1.5 [&_li]:ml-5 [&_ul>li]:list-disc [&_ol>li]:list-decimal " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-ink " +
  "[&_table]:my-4 [&_table]:w-full [&_th]:border [&_th]:border-line [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-line [&_td]:p-2";

/** Проверяет, что строка содержит HTML-разметку, а не просто текст. */
export function looksLikeHtml(s: string | null | undefined): boolean {
  return !!s && /<\/?[a-z][\s\S]*>/i.test(s);
}

export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(PROSE, className)}
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    />
  );
}
