import { LocaleLink as Link } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils";

/** Ansor Med wordmark. */
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
      <span className="relative inline-flex h-9 w-12 shrink-0 items-center justify-center">
        <img
          src="/logo.png"
          alt=""
          width={512}
          height={313}
          className="h-9 w-12 object-contain transition-transform duration-500 group-hover:scale-105"
          aria-hidden="true"
        />
      </span>
      <span className="text-ink">
        Ansor<span className="text-accent"> Med</span>
      </span>
    </Link>
  );
}
