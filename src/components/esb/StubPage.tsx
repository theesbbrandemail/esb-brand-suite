import { type LucideIcon, Sparkles, ArrowUpRight, Activity, Calendar, Package, ShieldCheck, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCeoKpis } from "@/lib/ops.functions";
import { useAuth } from "@/lib/auth";

export type StubKpi = { label: string; value: string; hint?: string };
export type StubAction = { label: string; to?: string; href?: string };

export function StubPage(props: {
  kind: "Brand" | "AI Role";
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent?: "gold" | "violet" | "rose";
  kpis: StubKpi[];
  modules: { title: string; body: string; icon: LucideIcon }[];
  actions?: StubAction[];
}) {
  const { kind, name, tagline, description, icon: Icon, accent = "gold", kpis, modules, actions = [] } = props;
  const accentMap = {
    gold: "from-gold/30 to-gold/5 border-gold/30 text-gold",
    violet: "from-violet/30 to-violet/5 border-violet/30 text-violet",
    rose: "from-[oklch(0.78_0.13_15)]/30 to-[oklch(0.78_0.13_15)]/5 border-[oklch(0.78_0.13_15)]/30 text-[oklch(0.78_0.13_15)]",
  } as const;

  return (
    <div className="space-y-8">
      <div className={`card-elevated p-8 bg-gradient-to-br ${accentMap[accent]} relative overflow-hidden`}>
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
        <div className="relative flex items-start gap-5">
          <div className={`h-14 w-14 rounded-2xl border ${accentMap[accent]} bg-background/40 backdrop-blur flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{kind}</div>
            <h1 className="font-display text-3xl mt-1">{name}</h1>
            <div className="text-sm text-foreground/80 mt-1">{tagline}</div>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl leading-relaxed">{description}</p>
            {actions.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {actions.map((a) =>
                  a.to ? (
                    <Link
                      key={a.label}
                      to={a.to}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground/90 text-background text-xs font-medium hover:bg-foreground transition"
                    >
                      {a.label} <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span
                      key={a.label}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs text-muted-foreground"
                    >
                      {a.label}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="card-elevated p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="font-display text-2xl mt-1">{k.value}</div>
            {k.hint && <div className="text-[11px] text-muted-foreground mt-0.5">{k.hint}</div>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((m) => {
          const MIcon = m.icon;
          return (
            <div key={m.title} className="card-elevated p-5 hover:border-gold/30 transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-secondary/60 border border-border flex items-center justify-center">
                  <MIcon className="h-4 w-4 text-gold" />
                </div>
                <div className="font-medium text-sm">{m.title}</div>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full border border-violet/30 text-violet bg-violet/10 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.body}</p>
            </div>
          );
        })}
      </div>

      <LivePulse kind={kind} />
    </div>
  );
}

function LivePulse({ kind }: { kind: "Brand" | "AI Role" }) {
  const { session, isStaff } = useAuth();
  const kpisFn = useServerFn(getCeoKpis);
  const q = useQuery({
    queryKey: ["ceo-kpis", "stub-pulse"],
    queryFn: () => kpisFn(),
    enabled: !!session && isStaff,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const k = q.data;
  const pill = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-secondary/40 text-xs";
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Activity className="h-4 w-4 text-gold animate-pulse" />
        <span>Live signals from the ESB orchestrator</span>
        <Sparkles className="h-3.5 w-3.5 text-violet ml-auto" />
      </div>
      {q.isLoading && <div className="text-[11px] text-muted-foreground">Syncing live metrics…</div>}
      {!q.isLoading && !k && (
        <div className="text-[11px] text-muted-foreground">
          This {kind === "Brand" ? "brand" : "role"} module is wired to the ESB orchestrator. Sign in as staff to see live signals.
        </div>
      )}
      {k && (
        <div className="flex flex-wrap gap-2">
          <span className={pill}><Calendar className="h-3 w-3 text-gold" /> {k.appointmentsToday} appts today</span>
          <span className={pill}><Calendar className="h-3 w-3 text-violet" /> {k.upcomingAppointments} upcoming</span>
          <span className={pill}><MessageCircle className="h-3 w-3 text-[oklch(0.75_0.18_145)]" /> {k.followUpsPending} follow-ups pending</span>
          <span className={pill}><Package className="h-3 w-3 text-warning" /> {k.lowStockItems} low-stock</span>
          <span className={pill}><ShieldCheck className="h-3 w-3 text-gold" /> {k.pendingApprovals} awaiting approval</span>
          <span className={pill}><Sparkles className="h-3 w-3 text-violet" /> AI autonomy {Math.round(k.aiAutonomy)}%</span>
        </div>
      )}
    </div>
  );
}
