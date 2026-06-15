import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Sparkles, Smartphone, Bell } from "lucide-react";
import { EsbLogo } from "./Logo";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/suite", label: "AI Suite", icon: Sparkles },
  { to: "/mobile", label: "Mobile", icon: Smartphone },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/40 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <EsbLogo />
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-card/60 border border-border">
            {tabs.map((t) => {
              const active = pathname === t.to;
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all ${
                    active
                      ? "bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-primary-foreground font-medium shadow-[0_4px_20px_-4px_oklch(0.82_0.13_82/0.4)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <button className="relative h-9 w-9 rounded-full bg-card/60 border border-border flex items-center justify-center hover:bg-card transition">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet to-gold border border-border" />
          </div>
        </div>
        {/* mobile tabs */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                  active
                    ? "bg-gold text-gold-foreground border-transparent font-medium"
                    : "border-border text-muted-foreground"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
