"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createLead } from "@/lib/api";
import { useDict } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface Fields {
  name: string;
  phone: string;
  email: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;
type ErrorMessages = {
  name: string;
  phoneRequired: string;
  phoneFormat: string;
  email: string;
  message: string;
};

const empty: Fields = { name: "", phone: "", email: "", message: "" };

function validate(values: Fields, msg: ErrorMessages): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = msg.name;
  if (!values.phone.trim()) {
    errors.phone = msg.phoneRequired;
  } else if (!/^[+\d][\d\s()-]{6,}$/.test(values.phone.trim())) {
    errors.phone = msg.phoneFormat;
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = msg.email;
  }
  if (!values.message.trim()) errors.message = msg.message;
  return errors;
}

export function ContactForm() {
  const dict = useDict();
  const t = dict.contactForm;
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (key: keyof Fields, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key]) {
      setErrors(validate({ ...values, [key]: value }, t.errors));
    }
  };

  const onBlur = (key: keyof Fields) => {
    setTouched((tt) => ({ ...tt, [key]: true }));
    setErrors(validate(values, t.errors));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values, t.errors);
    setErrors(found);
    setTouched({ name: true, phone: true, email: true, message: true });
    if (Object.keys(found).length > 0) return;

    setStatus("loading");
    setSubmitError(null);
    try {
      await createLead({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || null,
        message: values.message.trim() || null,
      });
      setStatus("success");
      setValues(empty);
      setTouched({});
    } catch (err) {
      setStatus("idle");
      setSubmitError(
        err instanceof Error && err.message ? err.message : t.submitError,
      );
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-3xl glass p-10 text-center"
          >
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent-wash ring-1 ring-accent/20">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </span>
            <h3 className="font-display text-2xl font-semibold text-ink">
              {t.successTitle}
            </h3>
            <p className="max-w-sm text-ink-muted">
              {t.successText}
            </p>
            <Button variant="secondary" onClick={() => setStatus("idle")}>
              {t.sendAnother}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="name"
                label={t.nameLabel}
                value={values.name}
                error={errors.name}
                onChange={(v) => update("name", v)}
                onBlur={() => onBlur("name")}
                placeholder={t.namePlaceholder}
                autoComplete="name"
                optionalLabel={t.optional}
              />
              <Field
                id="phone"
                label={t.phoneLabel}
                type="tel"
                value={values.phone}
                error={errors.phone}
                onChange={(v) => update("phone", v)}
                onBlur={() => onBlur("phone")}
                placeholder={t.phonePlaceholder}
                autoComplete="tel"
                optionalLabel={t.optional}
              />
            </div>
            <Field
              id="email"
              label={t.emailLabel}
              type="email"
              optional
              value={values.email}
              error={errors.email}
              onChange={(v) => update("email", v)}
              onBlur={() => onBlur("email")}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              optionalLabel={t.optional}
            />
            <Field
              id="message"
              label={t.messageLabel}
              textarea
              value={values.message}
              error={errors.message}
              onChange={(v) => update("message", v)}
              onBlur={() => onBlur("message")}
              placeholder={t.messagePlaceholder}
              optionalLabel={t.optional}
            />

            {submitError && (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submitError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={status === "loading"}
              className="w-full sm:w-auto"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t.submit}
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  textarea = false,
  optional = false,
  optionalLabel,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  autoComplete?: string;
}) {
  const base =
    "w-full rounded-2xl border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-dim transition-colors duration-200 focus:outline-none";
  const borderClass = error
    ? "border-red-400 focus:border-red-500"
    : "border-line-strong focus:border-accent";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional && optionalLabel && (
          <span className="ml-1 text-ink-dim">{optionalLabel}</span>
        )}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={5}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(base, borderClass, "resize-y")}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(base, borderClass)}
        />
      )}
      {error && (
        <span id={`${id}-error`} className="text-sm text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
