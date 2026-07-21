import { cn } from "@/lib/utils";

/**
 * Метка «NEW» для недавно добавленных товаров. Надпись латиницей одинакова
 * для всех языков, поэтому не локализуется.
 */
export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "label inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-white shadow-float ring-1 ring-accent/30",
        className,
      )}
    >
      NEW
    </span>
  );
}
