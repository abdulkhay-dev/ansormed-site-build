import { PageTransition } from "@/components/motion/PageTransition";

/**
 * template.tsx re-mounts on every navigation (unlike layout.tsx), so it is the
 * right place to run an entrance animation for smooth page transitions.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
