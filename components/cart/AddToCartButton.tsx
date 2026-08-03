"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, lineKey, type CartLine } from "@/components/cart/CartProvider";
import { useDict } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Добавление позиции в корзину. Две подачи: обычная кнопка (карточка товара)
 * и круглая иконка (плитка каталога).
 */
export function AddToCartButton({
  line,
  variant = "button",
  className,
}: {
  line: Omit<CartLine, "quantity">;
  variant?: "button" | "icon";
  className?: string;
}) {
  const dict = useDict();
  const t = dict.cart;
  const { add, has } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = has(lineKey(line.kind, line.id));

  // Короткое подтверждение «Добавлено» после клика.
  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const onAdd = (e: React.MouseEvent) => {
    // В каталоге кнопка лежит внутри ссылки-карточки — гасим переход.
    e.preventDefault();
    e.stopPropagation();
    add(line);
    setJustAdded(true);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onAdd}
        data-no-nav
        aria-label={t.add}
        title={inCart ? t.inCart : t.add}
        className={cn(
          "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full glass-strong transition-all duration-200 hover:text-accent",
          justAdded || inCart ? "text-accent" : "text-ink-muted",
          className,
        )}
      >
        {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button type="button" size="lg" onClick={onAdd} className={className}>
      {justAdded ? (
        <>
          <Check className="h-4 w-4" />
          {t.added}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {inCart ? t.addMore : t.add}
        </>
      )}
    </Button>
  );
}
