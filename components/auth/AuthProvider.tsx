"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ApiError,
  getMe,
  loginAccount,
  loginWithGoogle,
  refreshAccessToken,
  registerAccount,
  type AuthTokens,
  type AuthUser,
  type RegisterInput,
} from "@/lib/api";

/** Ключ в localStorage. Версия в имени — чтобы менять формат без миграций. */
const STORAGE_KEY = "ansormed.auth.v1";

interface Session {
  tokens: AuthTokens;
  user: AuthUser | null;
}

type Status = "loading" | "authenticated" | "anonymous";

interface AuthValue {
  status: Status;
  user: AuthUser | null;
  /** Вход по email + паролю. Бросает ApiError с ошибками по полям. */
  login: (email: string, password: string) => Promise<void>;
  /** Регистрация и сразу вход (если бэкенд не вернул токены — логинимся сами). */
  register: (input: RegisterInput) => Promise<void>;
  /** Вход по Google id_token (credential из Google Identity Services). */
  loginGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  /**
   * Запрос к API от имени пользователя. При 401 один раз обновляет access
   * по refresh и повторяет; если не вышло — разлогинивает.
   */
  authFetch: <T>(fn: (token: string) => Promise<T>) => Promise<T>;
}

const AuthContext = createContext<AuthValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return typeof parsed?.tokens?.access === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* приватный режим — работаем без персистентности */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  // Токены держим в ref: они нужны внутри колбэков, но не влияют на рендер.
  const tokens = useRef<AuthTokens | null>(null);
  // Один общий запрос обновления на все параллельные вызовы.
  const refreshing = useRef<Promise<string | null> | null>(null);

  const apply = useCallback((session: Session | null) => {
    tokens.current = session?.tokens ?? null;
    setUser(session?.user ?? null);
    setStatus(session ? "authenticated" : "anonymous");
    writeSession(session);
  }, []);

  const logout = useCallback(() => apply(null), [apply]);

  /** Обновляет access по refresh. Возвращает новый access или null. */
  const refresh = useCallback(async (): Promise<string | null> => {
    const current = tokens.current;
    if (!current?.refresh) return null;
    if (!refreshing.current) {
      refreshing.current = refreshAccessToken(current.refresh)
        .then((next) => {
          if (!next) return null;
          tokens.current = next;
          writeSession({ tokens: next, user });
          return next.access;
        })
        .catch(() => null)
        .finally(() => {
          refreshing.current = null;
        });
    }
    return refreshing.current;
  }, [user]);

  const authFetch = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      const access = tokens.current?.access;
      if (!access) throw new ApiError("Unauthorized", 401);
      try {
        return await fn(access);
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 401) throw err;
        const fresh = await refresh();
        if (!fresh) {
          logout();
          throw err;
        }
        return fn(fresh);
      }
    },
    [refresh, logout],
  );

  /** Сохраняет сессию и подтягивает профиль, если бэкенд его не вернул. */
  const start = useCallback(
    async (result: { tokens: AuthTokens | null; user: AuthUser | null }) => {
      if (!result.tokens) throw new ApiError("no tokens", 500);
      let profile = result.user;
      if (!profile) {
        profile = await getMe(result.tokens.access).catch(() => null);
      }
      apply({ tokens: result.tokens, user: profile });
    },
    [apply],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      await start(await loginAccount(email, password));
    },
    [start],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await registerAccount(input);
      // Часть бэкендов на регистрации токены не отдаёт — входим отдельным запросом.
      if (result.tokens) await start(result);
      else await start(await loginAccount(input.email, input.password));
    },
    [start],
  );

  const loginGoogle = useCallback(
    async (idToken: string) => {
      await start(await loginWithGoogle(idToken));
    },
    [start],
  );

  // Восстановление сессии при загрузке: проверяем access, при 401 — refresh.
  useEffect(() => {
    let cancelled = false;
    const stored = readSession();
    if (!stored) {
      setStatus("anonymous");
      return;
    }
    tokens.current = stored.tokens;
    setUser(stored.user);
    setStatus("authenticated");

    (async () => {
      try {
        const profile = await getMe(stored.tokens.access);
        if (!cancelled && profile) apply({ tokens: stored.tokens, user: profile });
      } catch (err) {
        if (cancelled) return;
        if (!(err instanceof ApiError) || err.status !== 401) return; // сеть — сессию не рвём
        const fresh = stored.tokens.refresh
          ? await refreshAccessToken(stored.tokens.refresh).catch(() => null)
          : null;
        if (cancelled) return;
        if (!fresh) {
          apply(null);
          return;
        }
        const profile = await getMe(fresh.access).catch(() => null);
        if (!cancelled) apply({ tokens: fresh, user: profile ?? stored.user });
      }
    })();

    return () => {
      cancelled = true;
    };
    // Только при монтировании: дальше сессией управляют login/logout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Синхронизация между вкладками: вход/выход в одной применяется в остальных.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = readSession();
      tokens.current = next?.tokens ?? null;
      setUser(next?.user ?? null);
      setStatus(next ? "authenticated" : "anonymous");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{ status, user, login, register, loginGoogle, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри <AuthProvider>");
  return ctx;
}

/** Отображаемое имя пользователя: имя+фамилия → username → email. */
export function displayName(user: AuthUser | null): string {
  if (!user) return "";
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return full || user.username || user.email;
}
