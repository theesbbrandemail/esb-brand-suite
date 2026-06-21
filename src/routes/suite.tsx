import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { DualBarChart, LineSpark } from "@/components/esb/charts";
import { Search, ChevronRight, Sparkles, Calendar, TrendingUp, Activity, Brain, Crown } from "lucide-react";
import { CeoGate } from "@/components/esb/CeoGate";
import { AutomationApprovalQueue } from "@/components/esb/AutomationApprovalQueue";

export const Route = createFileRoute("/suite")({
  head: () => ({
    meta: [
      { title: "CEO Intelligence Suite — ESB Brand" },
      { name: "description", content: "Biometric-secured CEO command center: KPIs, AI intelligence, automation approvals." },
      { property: "og:title", content: "CEO Intelligence Suite — ESB Brand" },
      { property: "og:description", content: "Biometric-secured CEO command center for ESB Brand operations." },
    ],
  }),
  component: SuitePage,
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const seriesA = months.map((m, i) => ({ label: m, gold: 12 + Math.round(Math.sin(i / 1.5) * 20 + 25), violet: 8 + Math.round(Math.cos(i / 1.3) * 15 + 20) }));
const seriesB = months.map((m, i) => ({ label: m, gold: 10 + Math.round(Math.cos(i) * 18 + 22), violet: 14 + Math.round(Math.sin(i / 2) * 12 + 18) }));

export default function SuitePage() {
  return (
    <Shell requireStaff>
      <CeoGate>
        <div className="relative">
          {/* Premium hero header */}
          <div
            className="relative overflow-hidden rounded-3xl p-8 mb-6"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.04 280 / 0.85), oklch(0.16 0.03 280 / 0.9)), radial-gradient(80% 60% at 0% 0%, oklch(0.82 0.13 82 / 0.15), transparent), radial-gradient(60% 50% at 100% 100%, oklch(0.62 0.2 295 / 0.2), transparent)",
              border: "1px solid oklch(0.82 0.13 82 / 0.2)",
              boxShadow: "0 30px 80px -30px oklch(0 0 0 / 0.6)",
            }}
          >
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gold opacity-10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet opacity-15 blur-3xl" />

            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold/90">
                    Biometric Vault · CEO Access
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-semibold leading-tight">
                  <span className="gold-text">Command</span> Intelligence
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Real-time operations, AI-orchestrated automations, multi-brand revenue intelligence.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    className="pl-9 pr-4 py-2.5 rounded-full bg-card/80 backdrop-blur border border-border text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ask intelligence…"
                  />
                </div>
                <button className="chip-gold flex items-center gap-1.5 px-4 py-2">
                  <Brain className="h-3.5 w-3.5" /> Ask AI
                </button>
              </div>
            </div>

            {/* KPI strip */}
            <div className="relative mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
              <HeroStat label="Revenue / 30d" value="$427.9K" delta="+14.2%" icon={TrendingUp} />
              <HeroStat label="AI Autonomy" value="86%" delta="+4.1%" icon={Brain} />
              <HeroStat label="Active Brands" value="2" delta="Stable" icon={Crown} muted />
              <HeroStat label="Health Score" value="A+" delta="92/100" icon={Activity} />
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <BrandPanel title="Skincare Kitchen" tag="Brand 01" data={seriesA} growth="+18.4%" revenue="$245.8K" />
            <KPIPanel />
            <RemindersPanel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <div className="lg:col-span-2">
              <AutomationApprovalQueue />
            </div>
            <AutomationStatsPanel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <BrandPanel title="Derma Aesthetics" tag="Brand 02" data={seriesB} growth="+12.5%" revenue="$182.1K" />
            <BusinessOverviewPanel />
            <IntelligencePanel />
          </div>
        </div>
      </CeoGate>
    </Shell>
  );
}

function HeroStat({
  label, value, delta, icon: Icon, muted,
}: { label: string; value: string; delta: string; icon: typeof TrendingUp; muted?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-card/40 backdrop-blur border border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-gold/70" />
      </div>
      <div className="mt-2 text-2xl font-display font-semibold">{value}</div>
      <div className={`text-[11px] mt-0.5 ${muted ? "text-muted-foreground" : "text-success"}`}>{delta}</div>
    </div>
  );
}

function BrandPanel({ title, tag, data, growth, revenue }: { title: string; tag: string; data: { label: string; gold: number; violet: number }[]; growth: string; revenue: string }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg">{title}</h3>
        <span className="chip-violet">{tag}</span>
      </div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-display font-semibold gold-text">{revenue}</span>
        <span className="text-success text-xs font-semibold">{growth}</span>
      </div>
      <DualBarChart data={data} height={150} />
    </div>
  );
}

function KPIPanel() {
  const kpis = [
    { label: "Operational Efficiency", value: 92, color: "gold" },
    { label: "Operational Conversion", value: 78, color: "violet" },
    { label: "Customer Retention", value: 84, color: "gold" },
    { label: "Service Utilization", value: 67, color: "violet" },
  ];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">KPIs · <span className="text-muted-foreground font-normal text-sm">This Quarter</span></h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {kpis.map((k) => (
          <div key={k.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{k.label}</span>
              <span className="font-semibold">{k.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className={`h-full rounded-full ${k.color === "gold" ? "bg-gradient-to-r from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]" : "bg-gradient-to-r from-[oklch(0.4_0.15_285)] to-[oklch(0.7_0.18_295)]"}`} style={{ width: `${k.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RemindersPanel() {
  const items = [
    { t: "Board Briefing", time: "10:00 AM", sub: "Q3 strategic review", tag: "Auto-prep" },
    { t: "Investor Call", time: "1:30 PM", sub: "Series A follow-up", tag: "Pending" },
    { t: "Skincare Kitchen Launch", time: "3:00 PM", sub: "Press embargo lifts", tag: "Confirmed" },
  ];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Today's Agenda</h3>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.t} className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-medium text-sm">{r.t}</div>
              <span className="text-[10px] gold-text font-semibold">{r.time}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mb-2">{r.sub}</div>
            <span className="chip-gold inline-block">{r.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessOverviewPanel() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">Business Overview</h3>
        <span className="chip-violet">Brand HQ</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Real-time pulse across operations</p>
      <div className="space-y-3">
        {[
          { l: "Revenue", v: "$427.9K", g: "+14%" },
          { l: "Customer Engagement", v: "8,420", g: "+22%" },
          { l: "Avg. Ticket", v: "$184", g: "+3%" },
        ].map((m) => (
          <div key={m.l} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
            <span className="text-sm text-muted-foreground">{m.l}</span>
            <div className="text-right">
              <div className="text-sm font-semibold">{m.v}</div>
              <div className="text-[10px] text-success">{m.g}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutomationStatsPanel() {
  return (
    <div className="card-elevated p-5 relative overflow-hidden">
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-violet/20 blur-3xl" />
      <div className="flex items-center justify-between mb-4 relative">
        <h3 className="font-display text-lg">AI Run Metrics</h3>
        <span className="chip-gold">Live</span>
      </div>
      <LineSpark points={[14, 22, 19, 30, 28, 40, 52, 48, 65, 72]} height={90} />
      <div className="grid grid-cols-2 gap-3 mt-4 relative">
        <Stat label="Tasks auto-run" value="248" />
        <Stat label="Hours saved" value="62h" />
        <Stat label="Approval rate" value="94%" />
        <Stat label="Avg. precision" value="98.2%" />
      </div>
    </div>
  );
}

function IntelligencePanel() {
  const insights = [
    { t: "Retention spike", d: "Skincare Kitchen +18% repeat rate after AI-routine launch.", k: "Trend" },
    { t: "Inventory risk", d: "Vitamin C serum 14 days to stockout at current velocity.", k: "Alert" },
    { t: "Pricing opportunity", d: "HydraFacial conversion peaks at $185 — test +$10 lift.", k: "Action" },
  ];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">AI Intelligence Briefs</h3>
        <Sparkles className="h-4 w-4 text-gold" />
      </div>
      <div className="space-y-2.5">
        {insights.map((i) => (
          <div key={i.t} className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">{i.t}</div>
              <span className="text-[10px] uppercase tracking-wider text-gold">{i.k}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">{i.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="text-xl font-display font-semibold gold-text">{value}</div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  );
}
