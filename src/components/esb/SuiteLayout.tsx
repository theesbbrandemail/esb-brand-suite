import type { ComponentType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

export type SuiteStatItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: number | string;
  loading?: boolean;
  danger?: boolean;
};

type Accent = "gold" | "pink";

const PINK = "oklch(0.65 0.25 5)";

/**
 * Shared full-page suite shell used by /suite-style pages
 * (/manager, /mobile, /content) so all suites stay visually in sync.
 */
export function SuiteLayout({
  eyebrow,
  title,
  subtitle,
  actions,
  stats,
  banner,
  accent = "gold",
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  stats?: SuiteStatItem[];
  banner?: ReactNode;
  accent?: Accent;
  children: ReactNode;
}) {
  return (
    <div className="w-full space-y-5">
      {banner}

      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        {accent === "pink" ? (
          <div
            className="absolute -top-16 -right-10 h-48 w-48 rounded-full blur-3xl"
            style={{ background: PINK, opacity: 0.25 }}
          />
        ) : (
          <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
        )}
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-violet/20 blur-3xl" />

        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gold/90">{eyebrow}</div>
            <h1 className="truncate font-display text-2xl font-semibold sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>

        {stats && stats.length > 0 && (
          <div className="relative mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <SuiteStat key={s.label} {...s} />
            ))}
          </div>
        )}
      </header>

      {children}
    </div>
  );
}

export function SuiteStat({ icon: Icon, label, value, loading, danger }: SuiteStatItem) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-3 w-3 ${danger ? "text-destructive" : "gold-text"}`} />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 font-display text-xl font-semibold">
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (value ?? "—")}
      </div>
    </div>
  );
}

export function SuitePanel({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 gold-text" />}
          <h2 className="truncate font-display text-sm sm:text-base">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SuiteLoading({ text = "Loading live data…" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> {text}
    </div>
  );
}

export function SuiteEmpty({ text }: { text: string }) {
  return <p className="py-6 text-xs text-muted-foreground">{text}</p>;
}

export function SuiteAiCard({
  title = "AI Suggestion",
  children,
  linkTo,
  linkLabel,
}: {
  title?: string;
  children: ReactNode;
  linkTo?: "/suite" | "/manager" | "/mobile" | "/inventory" | "/appointments" | "/content";
  linkLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/25 to-violet/5 p-4">
      <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-violet/40 blur-2xl" />
      <div className="relative flex items-center gap-2 font-display text-xs">
        <Sparkles className="h-3.5 w-3.5 gold-text" /> {title}
      </div>
      <p className="relative mt-2 text-[11px] text-muted-foreground">{children}</p>
      {linkTo && (
        <Link to={linkTo} className="chip-gold relative mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-[10px]">
          {linkLabel ?? "Open"} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
