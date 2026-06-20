import { Icon } from "@/components/ui/Icon";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

export function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl bg-surface border border-line p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float">
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-wash ring-1 ring-accent/15">
        <Icon name={icon} className="h-6 w-6 text-accent" strokeWidth={1.6} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

export function StatCard({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface border border-line px-4 py-8 text-center shadow-soft">
      <span className="font-display text-4xl font-bold text-accent-gradient md:text-5xl">
        <AnimatedCounter value={value} suffix={suffix} />
      </span>
      <span className="text-sm leading-snug text-ink-muted">{label}</span>
    </div>
  );
}
