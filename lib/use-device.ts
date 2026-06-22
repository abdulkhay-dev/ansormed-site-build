"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Маломощное/мобильное устройство: узкий экран ИЛИ грубый указатель (тач),
 * либо мало ядер CPU. Используется для снижения качества 3D-сцен.
 */
export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px), (pointer: coarse)");
    const lowCores = (navigator.hardwareConcurrency || 8) <= 4;
    const update = () => setMobile(mq.matches || lowCores);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

/**
 * Виден ли элемент во вьюпорте (с запасом rootMargin). Нужно, чтобы ставить
 * 3D-канвас на паузу (frameloop="never"), когда секция ушла за экран.
 */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>, rootMargin = "150px") {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return visible;
}
