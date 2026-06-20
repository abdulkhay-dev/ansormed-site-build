import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** Deterministic string hash → uint32. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const palettes: [string, string][] = [
  ["#0a1530", "#0e244e"], // indigo wash
  ["#091a38", "#10305c"], // sky wash
  ["#0c1330", "#171f4c"], // violet wash
  ["#08152f", "#0e2350"], // blue wash
];

const dotColors = ["#3a7bff", "#5e9bff", "#6d8cff", "#4f9bff"];

/**
 * On-brand abstract medical-tech visual: seeded gradient + neuron motif +
 * category icon. Fully self-contained (no external images).
 */
export function MediaVisual({
  seed,
  icon,
  label,
  className,
  iconClassName,
}: {
  seed: string;
  icon?: string;
  label?: string;
  className?: string;
  iconClassName?: string;
}) {
  const h = hash(seed);
  const rng = mulberry32(h);
  const palette = palettes[h % palettes.length];
  const dot = dotColors[h % dotColors.length];
  const gradId = `mv-${(h % 100000).toString(36)}`;

  // generate node positions in 0..100 viewBox
  const nodes = Array.from({ length: 6 }, () => ({
    x: 12 + rng() * 76,
    y: 12 + rng() * 76,
  }));

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface",
        className,
      )}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor={palette[0]} />
            <stop offset="100%" stopColor={palette[1]} />
          </linearGradient>
          <radialGradient id={`${gradId}-glow`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={dot} stopOpacity="0.22" />
            <stop offset="100%" stopColor={dot} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gradId})`} />
        <rect width="100" height="100" fill={`url(#${gradId}-glow)`} />

        {/* synapse edges */}
        <g stroke={dot} strokeWidth="0.4" strokeOpacity="0.4">
          {nodes.map((n, i) => {
            const m = nodes[(i + 1) % nodes.length];
            return <line key={`l${i}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} />;
          })}
          {nodes.map((n, i) => {
            const m = nodes[(i + 2) % nodes.length];
            return (
              <line key={`l2${i}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} strokeOpacity="0.18" />
            );
          })}
        </g>
        {/* nodes */}
        <g fill={dot}>
          {nodes.map((n, i) => (
            <circle key={`c${i}`} cx={n.x} cy={n.y} r={i === 0 ? 1.6 : 1} fillOpacity="0.85" />
          ))}
        </g>
      </svg>

      {/* dot grid texture */}
      <div className="absolute inset-0 grid-dots opacity-40" aria-hidden="true" />

      {icon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl glass-strong">
            <span
              className="absolute inset-0 rounded-2xl"
              style={{ boxShadow: `0 0 40px -8px ${dot}` }}
              aria-hidden="true"
            />
            <Icon
              name={icon}
              className={cn("relative h-7 w-7 text-accent", iconClassName)}
              strokeWidth={1.5}
            />
          </div>
        </div>
      )}
    </div>
  );
}
