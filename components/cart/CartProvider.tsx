"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** Ключ в localStorage. Версия в имени — чтобы менять формат без миграций. */
const STORAGE_KEY = "ansormed.cart.v1";

/**
 * Строка корзины. Кроме id храним снимок названия/цены/картинки: корзина
 * рисуется мгновенно, не дожидаясь каталога. На странице корзины данные
 * освежаются из API (цена могла измениться, язык — переключиться).
 */
export interface CartLine {
  /** Позиция заказа — товар или комплект (см. OrderItemCreate в схеме API). */
  kind: "product" | "kit";
  id: number;
  quantity: number;
  name: string;
  slug: string | null;
  image: string | null;
  /** Цена за штуку либо null — «по запросу». */
  price: number | null;
}

/** Ключ строки: товар и комплект с одинаковым id — разные позиции. */
export const lineKey = (kind: CartLine["kind"], id: number) => `${kind}:${id}`;

interface CartValue {
  lines: CartLine[];
  /** Суммарное количество единиц (бейдж в шапке). */
  count: number;
  /** Сумма по позициям с известной ценой. */
  total: number;
  /** Есть позиции без цены — итог показываем как неполный. */
  hasPriceless: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  /** Изменить количество на delta. Для кнопок «−/+»: быстрые клики не теряются. */
  changeQuantity: (key: string, delta: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
}

const CartContext = createContext<CartValue | null>(null);

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        !!l && typeof l.id === "number" && typeof l.quantity === "number",
    );
  } catch {
    return [];
  }
}

function write(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* приватный режим — работаем без персистентности */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  // Читаем корзину после монтирования: на сервере localStorage нет, а разметка
  // должна совпасть с серверной (иначе ошибка гидратации).
  useEffect(() => {
    setLines(read());
  }, []);

  // Изменения из соседней вкладки.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: CartLine[]) => {
    setLines(next);
    write(next);
  }, []);

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      setLines((cur) => {
        const key = lineKey(line.kind, line.id);
        const found = cur.find((l) => lineKey(l.kind, l.id) === key);
        // Повторное добавление — увеличиваем количество и обновляем снимок.
        const next = found
          ? cur.map((l) =>
              lineKey(l.kind, l.id) === key
                ? { ...l, ...line, quantity: l.quantity + quantity }
                : l,
            )
          : [...cur, { ...line, quantity }];
        write(next);
        return next;
      });
    },
    [],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((cur) => {
      const next =
        quantity <= 0
          ? cur.filter((l) => lineKey(l.kind, l.id) !== key)
          : cur.map((l) =>
              lineKey(l.kind, l.id) === key ? { ...l, quantity: Math.min(999, quantity) } : l,
            );
      write(next);
      return next;
    });
  }, []);

  const changeQuantity = useCallback((key: string, delta: number) => {
    setLines((cur) => {
      const next = cur
        .map((l) =>
          lineKey(l.kind, l.id) === key
            ? { ...l, quantity: Math.min(999, l.quantity + delta) }
            : l,
        )
        .filter((l) => l.quantity > 0);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback(
    (key: string) => setQuantity(key, 0),
    [setQuantity],
  );

  const clear = useCallback(() => commit([]), [commit]);

  const value = useMemo<CartValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const total = lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0);
    return {
      lines,
      count,
      total,
      hasPriceless: lines.some((l) => l.price == null),
      add,
      setQuantity,
      changeQuantity,
      remove,
      clear,
      has: (key) => lines.some((l) => lineKey(l.kind, l.id) === key),
    };
  }, [lines, add, setQuantity, changeQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart должен использоваться внутри <CartProvider>");
  return ctx;
}
