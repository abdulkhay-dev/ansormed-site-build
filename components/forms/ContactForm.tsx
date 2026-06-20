"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Fields {
  name: string;
  phone: string;
  email: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", phone: "", email: "", message: "" };

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Укажите ваше имя";
  if (!values.phone.trim()) {
    errors.phone = "Укажите телефон";
  } else if (!/^[+\d][\d\s()-]{6,}$/.test(values.phone.trim())) {
    errors.phone = "Проверьте формат номера";
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Проверьте email";
  }
  if (!values.message.trim()) errors.message = "Напишите сообщение";
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const update = (key: keyof Fields, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key]) {
      setErrors(validate({ ...values, [key]: value }));
    }
  };

  const onBlur = (key: keyof Fields) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, phone: true, email: true, message: true });
    if (Object.keys(found).length > 0) return;

    setStatus("loading");
    // Simulated submission — replace with real API call.
    await new Promise((r) => setTimeout(r, 1100));
    setStatus("success");
    setValues(empty);
    setTouched({});
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
              Заявка отправлена
            </h3>
            <p className="max-w-sm text-ink-muted">
              Спасибо! Наш специалист свяжется с вами в ближайшее рабочее время.
            </p>
            <Button variant="secondary" onClick={() => setStatus("idle")}>
              Отправить ещё одну
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
                label="Имя"
                value={values.name}
                error={errors.name}
                onChange={(v) => update("name", v)}
                onBlur={() => onBlur("name")}
                placeholder="Иван Иванов"
                autoComplete="name"
              />
              <Field
                id="phone"
                label="Телефон"
                type="tel"
                value={values.phone}
                error={errors.phone}
                onChange={(v) => update("phone", v)}
                onBlur={() => onBlur("phone")}
                placeholder="+998 90 123 45 67"
                autoComplete="tel"
              />
            </div>
            <Field
              id="email"
              label="Email"
              type="email"
              optional
              value={values.email}
              error={errors.email}
              onChange={(v) => update("email", v)}
              onBlur={() => onBlur("email")}
              placeholder="you@clinic.uz"
              autoComplete="email"
            />
            <Field
              id="message"
              label="Сообщение"
              textarea
              value={values.message}
              error={errors.message}
              onChange={(v) => update("message", v)}
              onBlur={() => onBlur("message")}
              placeholder="Опишите задачу или интересующее оборудование…"
            />

            <Button
              type="submit"
              size="lg"
              disabled={status === "loading"}
              className="w-full sm:w-auto"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Отправляем…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Отправить заявку
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
        {optional && <span className="ml-1 text-ink-dim">(необязательно)</span>}
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
