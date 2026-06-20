import Link from "next/link";
import { cn } from "@/lib/utils";

/** Ansor Med wordmark with a neuron/synapse glyph. */
export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Ansor Med — на главную"
      className={cn(
        "group inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          className="h-9 w-9"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#5566f2" />
              <stop offset="100%" stopColor="#2a41e8" />
            </linearGradient>
          </defs>
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#logo-grad)"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          {/* synapse edges */}
          <g stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round">
            <line x1="12" y1="14" x2="20" y2="20" />
            <line x1="20" y1="20" x2="28" y2="13" />
            <line x1="20" y1="20" x2="26" y2="27" />
            <line x1="20" y1="20" x2="13" y2="27" />
          </g>
          {/* nodes */}
          <g fill="url(#logo-grad)">
            <circle cx="20" cy="20" r="3.2" />
            <circle cx="12" cy="14" r="2" />
            <circle cx="28" cy="13" r="2" />
            <circle cx="26" cy="27" r="2" />
            <circle cx="13" cy="27" r="2" />
          </g>
          <circle
            cx="20"
            cy="20"
            r="3.2"
            fill="#5566f2"
            className="origin-center transition-transform duration-500 group-hover:scale-150"
          />
        </svg>
      </span>
      <span className="text-ink">
        Ansor<span className="text-accent"> Med</span>
      </span>
    </Link>
  );
}
