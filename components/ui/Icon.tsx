import {
  ScanLine,
  Brain,
  Activity,
  HeartPulse,
  FlaskConical,
  Boxes,
  ShieldCheck,
  Wrench,
  Truck,
  GraduationCap,
  Target,
  HeartHandshake,
  Sparkles,
  LifeBuoy,
  LayoutGrid,
  type LucideProps,
} from "lucide-react";

/** Registry mapping data string names → lucide icon component. */
const registry = {
  ScanLine,
  Brain,
  Activity,
  HeartPulse,
  FlaskConical,
  Boxes,
  ShieldCheck,
  Wrench,
  Truck,
  GraduationCap,
  Target,
  HeartHandshake,
  Sparkles,
  LifeBuoy,
  LayoutGrid,
} as const;

export type IconName = keyof typeof registry;

export function Icon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Cmp = registry[name as IconName] ?? Sparkles;
  return <Cmp {...props} />;
}
