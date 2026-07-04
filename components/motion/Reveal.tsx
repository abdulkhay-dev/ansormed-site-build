import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article";
}

/** Lightweight wrapper kept for layout consistency without client-side animation cost. */
export function Reveal({
  children,
  className,
  as = "div",
}: RevealProps) {
  const Tag = as;

  return <Tag className={className}>{children}</Tag>;
}

export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return <div className={className}>{children}</div>;
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
}
