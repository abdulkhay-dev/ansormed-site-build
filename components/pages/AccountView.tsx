"use client";

import { useCallback, useEffect, useState } from "react";
import { FileDown, LogOut, Loader2, Package, RefreshCw, User } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth, displayName } from "@/components/auth/AuthProvider";
import { usePageTitle } from "@/components/app/usePageTitle";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { interpolate, localizeHref, type Dictionary } from "@/lib/i18n";
import { redirect } from "@/lib/navigate";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { listOrders, mediaUrl, type OrderOut, type OrderStatus } from "@/lib/api";

export default function AccountView() {
  const dict = useDict();
  const lang = useLang();
  const t = dict.auth.account;
  const { status, user, logout, authFetch } = useAuth();

  const [orders, setOrders] = useState<OrderOut[] | null>(null);
  const [ordersError, setOrdersError] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  usePageTitle(`${t.meta.title} — Ansor Med`);

  // Гость на защищённой странице — уводим на вход (без записи в историю).
  useEffect(() => {
    if (status === "anonymous") redirect(localizeHref(lang, "/login"));
  }, [status, lang]);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrdersError(false);
    try {
      setOrders(await authFetch((token) => listOrders(token)));
    } catch {
      setOrdersError(true);
    } finally {
      setLoadingOrders(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (status === "authenticated") loadOrders();
  }, [status, loadOrders]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-ink-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        {dict.auth.common.checking}
      </div>
    );
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

  return (
    <>
      <PageHeader
        eyebrow={t.header.eyebrow}
        title={<>{interpolate(t.header.title, { name: displayName(user) })}</>}
        subtitle={t.header.subtitle}
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            {/* Профиль */}
            <Reveal>
              <div className="flex flex-col gap-5 rounded-[2rem] glass-strong p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-wash text-accent ring-1 ring-accent/20">
                    <User className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold text-ink">
                      {t.profileTitle}
                    </h2>
                    <p className="truncate text-sm text-ink-muted">{user?.email}</p>
                  </div>
                </div>

                <dl className="flex flex-col gap-3">
                  <Row label={t.nameLabel} value={fullName || t.empty} />
                  <Row label={t.usernameLabel} value={user?.username || t.empty} />
                  <Row label={t.emailLabel} value={user?.email || t.empty} />
                </dl>

                <Button variant="secondary" onClick={logout} className="w-full">
                  <LogOut className="h-4 w-4" />
                  {t.logout}
                </Button>
              </div>
            </Reveal>

            {/* Заказы */}
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-5 rounded-[2rem] glass p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    {t.ordersTitle}
                  </h2>
                  {loadingOrders && <Loader2 className="h-4 w-4 animate-spin text-ink-dim" />}
                </div>

                {ordersError ? (
                  <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6">
                    <p className="text-ink-muted">{t.ordersError}</p>
                    <Button variant="secondary" onClick={loadOrders}>
                      <RefreshCw className="h-4 w-4" />
                      {t.retry}
                    </Button>
                  </div>
                ) : orders === null ? (
                  <p className="text-ink-muted">{t.ordersLoading}</p>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-dim ring-1 ring-line-strong">
                      <Package className="h-5 w-5" />
                    </span>
                    <p className="text-ink-muted">{t.ordersEmpty}</p>
                    <ButtonLink href="/products" variant="secondary">
                      {t.ordersEmptyCta}
                    </ButtonLink>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {orders.map((order) => (
                      <li key={order.id}>
                        <OrderCard order={order} dict={dict} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wider text-ink-dim">{label}</dt>
      <dd className="min-w-0 truncate text-ink">{value}</dd>
    </div>
  );
}

/** Цвет плашки статуса заказа (StatusEnum из схемы API). */
const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  confirmed: "bg-accent-wash text-accent ring-accent/25",
  rejected: "bg-red-400/10 text-red-300 ring-red-400/25",
  completed: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
};

/** Карточка заказа — по схеме Order из /api/schema/. */
function OrderCard({ order, dict }: { order: OrderOut; dict: Dictionary }) {
  const t = dict.auth.account;
  const total = money(order.total, dict);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display font-semibold text-ink">
          {interpolate(t.orderNumber, { id: order.id })}
        </h3>
        <span className="text-sm text-ink-dim">
          {formatDate(order.created_at, dict.months)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
            STATUS_TONE[order.status] ?? STATUS_TONE.pending,
          )}
        >
          {t.statuses[order.status] ?? order.status}
        </span>
        {total && (
          <span className="text-ink-muted">
            {t.totalLabel}: <span className="font-medium text-ink">{total}</span>
          </span>
        )}
      </div>

      {order.items.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-3">
          <span className="text-xs uppercase tracking-wider text-ink-dim">
            {t.itemsLabel}
          </span>
          <ul className="flex flex-col gap-1">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-4 text-sm"
              >
                <span className="min-w-0 truncate text-ink">{item.item_name}</span>
                <span className="shrink-0 text-ink-muted">
                  {item.quantity != null && interpolate(t.quantity, { count: item.quantity })}
                  {money(item.subtotal, dict) ? ` · ${money(item.subtotal, dict)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {order.comment && (
        <p className="border-t border-line pt-3 text-sm text-ink-muted">
          <span className="text-ink-dim">{t.commentLabel}: </span>
          {order.comment}
        </p>
      )}

      {/* Коммерческое предложение появляется после подтверждения заказа. */}
      {order.offer_file && (
        <a
          href={mediaUrl(order.offer_file) ?? order.offer_file}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-accent-deep"
        >
          <FileDown className="h-4 w-4" />
          {t.offerFile}
        </a>
      )}
    </article>
  );
}

/** Сумма из строки/числа в «40 000 сум». Нечисловое значение — как есть. */
function money(
  value: string | number | null | undefined,
  dict: Dictionary,
): string | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (Number.isNaN(n)) return String(value);
  return formatPrice(n, "UZS", dict.currencyUnit);
}
