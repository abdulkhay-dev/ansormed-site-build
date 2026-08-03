"use client";

import { useEffect, useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
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

interface Values {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = {
  email: "",
  username: "",
  first_name: "",
  last_name: "",
  password: "",
  confirm: "",
};

/** Ограничения бэкенда: username до 150 символов, латиница/цифры/@ . + - _ */
const USERNAME_RE = /^[\w.@+-]+$/;

export default function RegisterView() {
  const dict = useDict();
  const lang = useLang();
  const t = dict.auth;
  const { status, register } = useAuth();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  usePageTitle(`${t.register.meta.title} — Ansor Med`);

  // См. LoginView: ?next= читаем после монтирования и пробрасываем в ссылку.
  const [nextHref, setNextHref] = useState<string | null>(null);
  useEffect(() => setNextHref(nextParam()), []);
  const keepNext = nextHref ? `?next=${encodeURIComponent(nextHref)}` : "";

  useEffect(() => {
    if (status === "authenticated") redirect(nextParam() ?? localizeHref(lang, "/account"));
  }, [status, lang]);

  const set = (key: keyof Values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validate = (): Errors => {
    const found: Errors = {};
    if (!values.email.trim()) found.email = t.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      found.email = t.errors.emailFormat;

    if (!values.username.trim()) found.username = t.errors.usernameRequired;
    else if (!USERNAME_RE.test(values.username.trim()))
      found.username = t.errors.usernameFormat;

    if (!values.password) found.password = t.errors.passwordRequired;
    else if (values.password.length < 8) found.password = t.errors.passwordShort;

    if (values.confirm !== values.password) found.confirm = t.errors.passwordMismatch;
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
      await register({
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
        // Пустые необязательные поля не отправляем.
        ...(values.first_name.trim() ? { first_name: values.first_name.trim() } : {}),
        ...(values.last_name.trim() ? { last_name: values.last_name.trim() } : {}),
      });
      redirect(nextParam() ?? localizeHref(lang, "/account"));
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({
          email: err.fields.email,
          username: err.fields.username,
          password: err.fields.password,
          first_name: err.fields.first_name,
          last_name: err.fields.last_name,
        });
        // Общий текст показываем, только если он не дублирует ошибку поля.
        const fieldShown = Object.keys(err.fields).some((k) => k !== "detail");
        setFormError(fieldShown ? null : err.message || t.common.genericError);
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
        eyebrow={t.register.header.eyebrow}
        title={<>{t.register.header.title}</>}
        subtitle={t.register.header.subtitle}
      />

      <section className="py-12 md:py-16">
        <Container>
          <Reveal className="mx-auto w-full max-w-xl">
            <form
              noValidate
              onSubmit={onSubmit}
              className="flex flex-col gap-5 rounded-[2rem] glass-strong p-6 md:p-9"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="reg-first-name"
                  label={t.register.firstNameLabel}
                  placeholder={t.register.firstNamePlaceholder}
                  autoComplete="given-name"
                  optionalLabel={t.register.optional}
                  value={values.first_name}
                  error={errors.first_name}
                  onChange={set("first_name")}
                />
                <Field
                  id="reg-last-name"
                  label={t.register.lastNameLabel}
                  placeholder={t.register.lastNamePlaceholder}
                  autoComplete="family-name"
                  optionalLabel={t.register.optional}
                  value={values.last_name}
                  error={errors.last_name}
                  onChange={set("last_name")}
                />
              </div>

              <Field
                id="reg-email"
                type="email"
                label={t.common.emailLabel}
                placeholder={t.common.emailPlaceholder}
                autoComplete="email"
                value={values.email}
                error={errors.email}
                onChange={set("email")}
              />
              <Field
                id="reg-username"
                label={t.register.usernameLabel}
                placeholder={t.register.usernamePlaceholder}
                hint={t.register.usernameHint}
                autoComplete="username"
                value={values.username}
                error={errors.username}
                onChange={set("username")}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  id="reg-password"
                  label={t.common.passwordLabel}
                  placeholder={t.common.passwordPlaceholder}
                  autoComplete="new-password"
                  value={values.password}
                  error={errors.password}
                  onChange={set("password")}
                  showLabel={t.common.showPassword}
                  hideLabel={t.common.hidePassword}
                />
                <PasswordField
                  id="reg-confirm"
                  label={t.register.passwordConfirmLabel}
                  autoComplete="new-password"
                  value={values.confirm}
                  error={errors.confirm}
                  onChange={set("confirm")}
                  showLabel={t.common.showPassword}
                  hideLabel={t.common.hidePassword}
                />
              </div>

              {formError && <FormError>{formError}</FormError>}

              <Button type="submit" size="lg" disabled={busy} className="w-full">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.common.submitting}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {t.register.submit}
                  </>
                )}
              </Button>

              <GoogleSignInButton
                text="signup_with"
                onSuccess={() => redirect(nextParam() ?? localizeHref(lang, "/account"))}
                onError={setFormError}
              />

              <p className="text-center text-sm text-ink-muted">
                {t.register.haveAccount}{" "}
                <LocaleLink
                  href={`/login${keepNext}`}
                  className="font-medium text-accent transition-colors hover:text-accent-deep"
                >
                  {t.register.loginLink}
                </LocaleLink>
              </p>
            </form>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
