"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { FormError } from "@/components/forms/Field";
import { MediaVisual } from "@/components/ui/MediaVisual";
import { useCart, lineKey, type CartLine } from "@/components/cart/CartProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePageTitle } from "@/components/app/usePageTitle";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { interpolate, localizeHref } from "@/lib/i18n";
import { navigate } from "@/lib/navigate";
import { cn, formatPrice, iconForCategory } from "@/lib/utils";
import { ApiError, createOrder, getCatalog, type OrderItemInput } from "@/lib/api";
import { buildCategoryContext, localizeProduct } from "@/lib/catalog";

export default function CartView() {
  const dict = useDict();
  const lang = useLang();
  const t = dict.cart;
  const { lines, count, changeQuantity, remove, clear } = useCart();
  const { status, authFetch } = useAuth();

  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  /** Свежие название/цена/картинка по id товара — из каталога. */
  const [fresh, setFresh] = useState<Record<number, Partial<CartLine>>>({});

  usePageTitle(`${t.meta.title} — Ansor Med`);

  // Снимок в localStorage мог устареть: цена изменилась, язык переключён.
  // Тянем каталог и переопределяем отображаемые поля товаров.
  useEffect(() => {
    if (lines.length === 0) return;
    let cancelled = false;
    getCatalog()
      .then((products) => {
        if (cancelled) return;
        const ctx = buildCategoryContext([], []);
        const map: Record<number, Partial<CartLine>> = {};
        for (const raw of products) {
          const p = localizeProduct(raw, lang, ctx);
          map[p.id] = { name: p.name, price: p.price, image: p.image, slug: p.slug };
        }
        setFresh(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Пересобираем при смене языка; количество строк на запрос не влияет.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, lines.length === 0]);

  /** Строки с подставленными свежими данными. */
  const view = useMemo(
    () =>
      lines.map((line) => ({
        ...line,
        ...(line.kind === "product" ? fresh[line.id] ?? {} : {}),
        quantity: line.quantity,
      })),
    [lines, fresh],
  );

  const total = view.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0);
  const hasPriceless = view.some((l) => l.price == null);
  const totalText = formatPrice(total || null, null, dict.currencyUnit);

  const checkout = async () => {
    setBusy(true);
    setError(null);
    try {
      const items: OrderItemInput[] = lines.map((l) =>
        l.kind === "kit"
          ? { kit_id: l.id, quantity: l.quantity }
          : { product_id: l.id, quantity: l.quantity },
      );
      const order = await authFetch((token) =>
        createOrder(token, {
          items,
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        }),
      );
      clear();
      setCreatedId(order?.id ?? 0);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError(t.authRequired);
      else setError(err instanceof Error && err.message ? err.message : t.submitError);
    } finally {
      setBusy(false);
    }
  };

  // ── Заказ создан ──
  if (createdId !== null) {
    return (
      <>
        <PageHeader
          eyebrow={t.header.eyebrow}
          title={<>{t.success.title}</>}
          subtitle={t.success.text}
        />
        <section className="py-12 md:py-16">
          <Container>
            <Reveal className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-[2rem] glass-strong p-8 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent-wash ring-1 ring-accent/20">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </span>
              {createdId > 0 && (
                <p className="font-display text-xl font-semibold text-ink">
                  {interpolate(t.success.number, { id: createdId })}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/account">{t.success.toAccount}</ButtonLink>
                <ButtonLink href="/products" variant="secondary">
                  {t.success.toCatalog}
                </ButtonLink>
              </div>
            </Reveal>
          </Container>
        </section>
      </>
    );
  }

  // ── Пустая корзина ──
  if (lines.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow={t.header.eyebrow}
          title={<>{t.header.title}</>}
          subtitle={t.header.subtitle}
        />
        <section className="py-12 md:py-16">
          <Container>
            <Reveal className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-[2rem] glass p-10 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-ink-dim ring-1 ring-line-strong">
                <ShoppingCart className="h-7 w-7" />
              </span>
              <p className="text-ink-muted">{t.empty}</p>
              <ButtonLink href="/products">{t.toCatalog}</ButtonLink>
            </Reveal>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={t.header.eyebrow}
        title={<>{t.header.title}</>}
        subtitle={interpolate(t.header.count, { count })}
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:gap-12">
            {/* Позиции */}
            <Reveal className="flex flex-col gap-4">
              {view.map((line) => {
                const key = lineKey(line.kind, line.id);
                const price = formatPrice(line.price, null, dict.currencyUnit);
                const sum = formatPrice(
                  line.price != null ? line.price * line.quantity : null,
                  null,
                  dict.currencyUnit,
                );
                return (
                  <article
                    key={key}
                    className="flex gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white sm:h-24 sm:w-24">
                      {line.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.image}
                          alt={line.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MediaVisual
                          seed={String(line.id)}
                          icon={iconForCategory(line.name)}
                          label={line.name}
                          className="h-full w-full"
                        />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        {line.slug && line.kind === "product" ? (
                          <LocaleLink
                            href={`/product/${encodeURIComponent(line.slug)}`}
                            className="font-medium text-ink transition-colors hover:text-accent"
                          >
                            {line.name}
                          </LocaleLink>
                        ) : (
                          <span className="font-medium text-ink">{line.name}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          aria-label={t.removeAria}
                          className="shrink-0 cursor-pointer rounded-full p-2 text-ink-dim transition-colors hover:bg-surface-2 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <span className="text-sm text-ink-muted">
                        {price ?? dict.product.priceOnRequest}
                      </span>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                        <Stepper
                          value={line.quantity}
                          onChange={(delta) => changeQuantity(key, delta)}
                          decreaseLabel={t.decreaseAria}
                          increaseLabel={t.increaseAria}
                        />
                        {sum && (
                          <span className="font-display font-semibold text-ink">{sum}</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

              <button
                type="button"
                onClick={clear}
                className="cursor-pointer self-start text-sm text-ink-dim transition-colors hover:text-red-400"
              >
                {t.clear}
              </button>
            </Reveal>

            {/* Оформление */}
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-5 rounded-[2rem] glass-strong p-6 md:p-7 lg:sticky lg:top-28">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {t.checkoutTitle}
                </h2>

                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <span className="text-ink-muted">{t.totalLabel}</span>
                  <span className="font-display text-lg font-semibold text-ink">
                    {totalText ?? dict.product.priceOnRequest}
                  </span>
                </div>
                {hasPriceless && (
                  <p className="-mt-2 text-sm text-ink-dim">{t.pricelessNote}</p>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="cart-comment" className="text-sm font-medium text-ink">
                    {t.commentLabel}
                  </label>
                  <textarea
                    id="cart-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.commentPlaceholder}
                    className="w-full resize-y rounded-2xl border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-dim transition-colors focus:border-accent focus:outline-none"
                  />
                </div>

                {error && <FormError>{error}</FormError>}

                {status === "authenticated" ? (
                  <Button size="lg" onClick={checkout} disabled={busy} className="w-full">
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.submitting}
                      </>
                    ) : (
                      t.submit
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-ink-muted">{t.loginNote}</p>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() =>
                        // Возврат в корзину после входа — через ?next=.
                        navigate(
                          `${localizeHref(lang, "/login")}?next=${encodeURIComponent(
                            localizeHref(lang, "/cart"),
                          )}`,
                        )
                      }
                    >
                      {t.loginToOrder}
                    </Button>
                  </div>
                )}

                <p className="text-sm text-ink-dim">{t.note}</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

/** Счётчик количества: −  N  +. onChange получает шаг (±1), а не итог. */
function Stepper({
  value,
  onChange,
  decreaseLabel,
  increaseLabel,
}: {
  value: number;
  onChange: (delta: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const btn =
    "inline-flex h-9 w-9 cursor-pointer items-center justify-center text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-line-strong">
      <button
        type="button"
        onClick={() => onChange(-1)}
        aria-label={decreaseLabel}
        className={cn(btn, "rounded-l-full")}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-10 text-center font-mono text-sm tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        aria-label={increaseLabel}
        disabled={value >= 999}
        className={cn(btn, "rounded-r-full")}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
