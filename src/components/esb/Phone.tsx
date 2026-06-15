import type { ReactNode } from "react";

export function Phone({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" | "pink" }) {
  const inner =
    tone === "light"
      ? "bg-gradient-to-b from-[oklch(0.95_0.02_20)] to-[oklch(0.88_0.04_15)]"
      : tone === "pink"
      ? "bg-gradient-to-b from-[oklch(0.2_0.03_300)] to-[oklch(0.14_0.02_300)]"
      : "bg-gradient-to-b from-[oklch(0.2_0.03_280)] to-[oklch(0.13_0.02_280)]";
  return (
    <div className="relative w-[360px] h-[760px] rounded-[44px] p-[10px] bg-gradient-to-b from-[oklch(0.3_0.03_280)] to-[oklch(0.1_0.02_280)] shadow-[0_60px_120px_-30px_oklch(0_0_0/0.7)] border border-white/10">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-32 rounded-full bg-black z-20" />
      <div className={`relative h-full w-full rounded-[36px] overflow-hidden ${inner}`}>
        {children}
      </div>
    </div>
  );
}

export function PhoneScroll({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full overflow-y-auto px-4 pt-10 pb-6">
      {children}
    </div>
  );
}
