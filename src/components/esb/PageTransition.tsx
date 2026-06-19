import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { useRef, type ReactNode } from "react";

// Mobile-style slide transitions for the phone-mockup routes.
const ORDER = ["/inventory", "/appointments", "/content", "/skin-analysis", "/manager"];

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prev = useRef(pathname);

  const prevIdx = ORDER.indexOf(prev.current);
  const nextIdx = ORDER.indexOf(pathname);
  const bothInSet = prevIdx !== -1 && nextIdx !== -1;
  const direction = bothInSet ? (nextIdx > prevIdx ? 1 : -1) : 0;

  prev.current = pathname;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: direction === 0 ? 0 : direction * 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction === 0 ? 0 : direction * -24 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
