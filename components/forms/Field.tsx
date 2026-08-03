"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-2xl border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-dim transition-colors duration-200 focus:outline-none";

const borderFor = (error?: string) =>
  error ? "border-red-400 focus:border-red-500" : "border-line-strong focus:border-accent";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  optionalLabel?: string;
}

/** Текстовое поле формы: подпись, ошибка, подсказка — как в ContactForm. */
export function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  type = "text",
  placeholder,
  autoComplete,
  optionalLabel,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optionalLabel && <span className="ml-1 text-ink-dim">{optionalLabel}</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(inputBase, borderFor(error))}
      />
      {error ? (
        <span id={`${id}-error`} className="text-sm text-red-400">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="text-sm text-ink-dim">
            {hint}
          </span>
        )
      )}
    </div>
  );
}

/** Поле пароля с переключателем видимости. */
export function PasswordField({
  showLabel,
  hideLabel,
  ...props
}: Omit<FieldProps, "type"> & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = useState(false);
  const { id, label, value, onChange, onBlur, error, hint, placeholder, autoComplete } = props;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(inputBase, borderFor(error), "pr-12")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? (
        <span id={`${id}-error`} className="text-sm text-red-400">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="text-sm text-ink-dim">
            {hint}
          </span>
        )
      )}
    </div>
  );
}

/** Общая ошибка формы (не привязанная к полю). */
export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
    >
      {children}
    </p>
  );
}
