"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Кнопка «Войти через Google» (Google Identity Services).
 *
 * GIS отдаёт credential — это и есть id_token, который бэкенд принимает на
 * POST /api/auth/google/.
 *
 * Client ID веб-приложения не секрет (он всё равно виден в бандле и в запросах
 * к Google), поэтому рабочий ID зашит здесь; NEXT_PUBLIC_GOOGLE_CLIENT_ID может
 * его переопределить — например, под отдельный проект Google для стенда.
 * Если очистить константу, блок Google не рендерится вовсе.
 */
const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "207519184080-2te17lg791gc90i999qpdptudtq321mc.apps.googleusercontent.com";

const GIS_SRC = "https://accounts.google.com/gsi/client";

/** Высота кнопки GIS размера large и нашей кнопки size="lg" (h-13), px. */
const GIS_HEIGHT = 40;
const BUTTON_HEIGHT = 52;
/** GIS не принимает ширину больше 400. */
const GIS_MAX_WIDTH = 400;

/** Минимальная типизация используемой части GIS (пакета типов в проекте нет). */
interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        ux_mode?: "popup" | "redirect";
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "small" | "medium" | "large";
          shape?: "rectangular" | "pill" | "circle" | "square";
          text?: "signin_with" | "signup_with" | "continue_with";
          logo_alignment?: "left" | "center";
          width?: number;
          locale?: string;
        },
      ) => void;
      cancel: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

let scriptPromise: Promise<void> | null = null;

/**
 * Одна загрузка скрипта GIS на всё приложение.
 *
 * Язык надписи на кнопке задаёт ?hl= в адресе скрипта: опция locale у
 * renderButton не действует после того, как GIS подтянул свои строки. Значит,
 * язык фиксируется на момент загрузки страницы — при смене языка внутри SPA
 * подпись на кнопке Google останется прежней до перезагрузки.
 */
function loadGis(lang: string): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    const src = `${GIS_SRC}?hl=${encodeURIComponent(lang)}`;
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src^="${GIS_SRC}"]`,
      );
      const script = existing ?? document.createElement("script");
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", () => reject(new Error("gis load failed")));
      if (!existing) {
        script.src = src;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }).catch((err) => {
      scriptPromise = null; // дать шанс повторной попытке
      throw err;
    });
  }
  return scriptPromise;
}

export function GoogleSignInButton({
  text = "signin_with",
  onSuccess,
  onError,
}: {
  /** Подпись на кнопке Google: вход или регистрация. */
  text?: "signin_with" | "signup_with" | "continue_with";
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const dict = useDict();
  const lang = useLang();
  const { loginGoogle } = useAuth();
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // Ширину GIS принимает только числом — следим за фактической шириной обёртки.
  const [width, setWidth] = useState(0);

  // Колбэк GIS живёт дольше рендера — держим свежие обработчики в ref.
  const handlers = useRef({ loginGoogle, onSuccess, onError, dict });
  handlers.current = { loginGoogle, onSuccess, onError, dict };

  useEffect(() => {
    const el = wrap.current;
    if (!el || !CLIENT_ID) return;
    // Меряем сразу: ResizeObserver отдаёт первый коллбэк только вместе с кадром
    // отрисовки, и в неотрисовываемой вкладке кнопка иначе не появится вовсе.
    setWidth(Math.round(el.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!CLIENT_ID || !width) return;
    let cancelled = false;

    loadGis(lang)
      .then(() => {
        const gis = window.google?.accounts.id;
        if (cancelled || !gis || !box.current) return;
        gis.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            const { loginGoogle: run, onSuccess: ok, onError: fail, dict: d } =
              handlers.current;
            if (!credential) {
              fail(d.auth.google.failed);
              return;
            }
            try {
              await run(credential);
              ok();
            } catch (err) {
              fail(err instanceof Error && err.message ? err.message : d.auth.google.failed);
            }
          },
        });
        box.current.replaceChildren();
        gis.renderButton(box.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          width: Math.min(GIS_MAX_WIDTH, width),
          locale: lang,
        });
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        handlers.current.onError(handlers.current.dict.auth.google.unavailable);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, text, width]);

  if (!CLIENT_ID || failed) return null;

  const label = text === "signup_with" ? dict.auth.google.signUp : dict.auth.google.signIn;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-wider text-ink-dim">
          {dict.auth.common.or}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {/*
        Перекрасить кнопку GIS нельзя — её рисует скрипт Google. Поэтому рисуем
        свою в стиле сайта, а настоящую кладём поверх прозрачным слоем: клики,
        всплывающее окно и получение id_token остаются за Google.
      */}
      <div ref={wrap} className="group relative">
        <div
          aria-hidden
          className={cn(
            buttonClasses("secondary", "lg", "w-full gap-3"),
            "pointer-events-none transition-all",
            ready
              ? "group-hover:border-accent/40 group-hover:bg-surface-2 group-has-[:focus-visible]:border-accent group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-accent/40"
              : "opacity-60",
          )}
        >
          <GoogleLogo className="h-5 w-5" />
          {ready ? label : dict.auth.google.loading}
        </div>
        {/* Кнопка GIS всегда 40px в высоту и не шире 400px, поэтому растягиваем
            слой до размеров нашей кнопки — иначе её края не кликаются. */}
        <div
          ref={box}
          className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0"
          style={{
            transform: `scale(${width / Math.min(GIS_MAX_WIDTH, width || 1)}, ${
              BUTTON_HEIGHT / GIS_HEIGHT
            })`,
          }}
        />
      </div>
    </div>
  );
}

/** Официальный четырёхцветный логотип Google (требование их брендбука). */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}
