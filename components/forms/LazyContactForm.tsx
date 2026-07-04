"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useOnScreen } from "@/lib/use-device";

const ContactForm = dynamic(
  () => import("@/components/forms/ContactForm").then((mod) => mod.ContactForm),
  {
    ssr: false,
    loading: () => <ContactFormPlaceholder />,
  },
);

export function LazyContactForm() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(ref, "700px", false);

  return (
    <div ref={ref}>
      {visible ? <ContactForm /> : <ContactFormPlaceholder />}
    </div>
  );
}

function ContactFormPlaceholder() {
  return (
    <div
      className="flex min-h-[460px] flex-col gap-5 rounded-3xl border border-line bg-surface/40 p-1"
      aria-hidden="true"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <span className="h-12 rounded-2xl bg-surface-2" />
        <span className="h-12 rounded-2xl bg-surface-2" />
      </div>
      <span className="h-12 rounded-2xl bg-surface-2" />
      <span className="h-36 rounded-2xl bg-surface-2" />
      <span className="h-13 w-full rounded-full bg-accent/20 sm:w-40" />
    </div>
  );
}
