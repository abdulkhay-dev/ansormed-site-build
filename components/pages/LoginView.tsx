"use client";

import { useEffect, useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Field, PasswordField, FormError } from "@/components/forms/Field";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { usePageTitle } from "@/components/app/usePageTitle";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n";
import { nextParam, redirect } from "@/lib/navigate";
import { ApiError } from "@/lib/api";

type Errors = { email?: string; password?: string };

export default function LoginView() {
  const dict = useDict();
  const lang = useLang();
  const t = dict.auth;
  const { status, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  usePageTitle(`${t.login.meta.title} — Ansor Med`);

  // Куда вернуться после входа (?next=). Читаем в эффекте: на сервере query нет,
  // а значение попадает в href ссылки — иначе разойдётся разметка при гидратации.
  const [nextHref, setNextHref] = useState<string | null>(null);
  useEffect(() => setNextHref(nextParam()), []);
  const keepNext = nextHref ? `?next=${encodeURIComponent(nextHref)}` : "";

  // Уже вошли — на страницу входа возвращаться незачем.
  useEffect(() => {
    if (status === "authenticated") redirect(nextParam() ?? localizeHref(lang, "/account"));
  }, [status, lang]);

  const validate = (): Errors => {
    const found: Errors = {};
    if (!email.trim()) found.email = t.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      found.email = t.errors.emailFormat;
    if (!password) found.password = t.errors.passwordRequired;
    return found;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await login(email.trim(), password);
      redirect(nextParam() ?? localizeHref(lang, "/account"));
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ email: err.fields.email, password: err.fields.password });
        // Неверная пара email/пароль: бэкенд отвечает 400/401 с англоязычным
        // detail («Invalid credentials») — показываем свой локализованный текст.
        const shownOnFields = Boolean(err.fields.email || err.fields.password);
        const credentialsRejected =
          Object.keys(err.fields).length === 0 &&
          (err.status === 400 || err.status === 401);
        setFormError(
          shownOnFields
            ? null
            : credentialsRejected
              ? t.login.failed
              : err.message || t.common.genericError,
        );
      } else {
        setFormError(t.common.genericError);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t.login.header.eyebrow}
        title={<>{t.login.header.title}</>}
        subtitle={t.login.header.subtitle}
      />

      <section className="py-12 md:py-16">
        <Container>
          <Reveal className="mx-auto w-full max-w-md">
            <form
              noValidate
              onSubmit={onSubmit}
              className="flex flex-col gap-5 rounded-[2rem] glass-strong p-6 md:p-9"
            >
              <Field
                id="login-email"
                type="email"
                label={t.common.emailLabel}
                placeholder={t.common.emailPlaceholder}
                autoComplete="email"
                value={email}
                error={errors.email}
                onChange={setEmail}
              />
              <PasswordField
                id="login-password"
                label={t.common.passwordLabel}
                autoComplete="current-password"
                value={password}
                error={errors.password}
                onChange={setPassword}
                showLabel={t.common.showPassword}
                hideLabel={t.common.hidePassword}
              />

              {formError && <FormError>{formError}</FormError>}

              <Button type="submit" size="lg" disabled={busy} className="w-full">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.common.submitting}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {t.login.submit}
                  </>
                )}
              </Button>

              <GoogleSignInButton
                text="signin_with"
                onSuccess={() => redirect(nextParam() ?? localizeHref(lang, "/account"))}
                onError={setFormError}
              />

              <p className="text-center text-sm text-ink-muted">
                {t.login.noAccount}{" "}
                <LocaleLink
                  href={`/register${keepNext}`}
                  className="font-medium text-accent transition-colors hover:text-accent-deep"
                >
                  {t.login.registerLink}
                </LocaleLink>
              </p>
            </form>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
