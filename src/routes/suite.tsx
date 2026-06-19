import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { DualBarChart, LineSpark } from "@/components/esb/charts";
import { Search, ChevronRight, Sparkles, Calendar, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/suite")({
  head: () => ({
    meta: [
      { title: "CEO AI Suite — ESB Brand" },
      { name: "description", content: "Full operational suite for beauty brand CEOs: KPIs, reminders, AI automation." },
      { property: "og:title", content: "CEO AI Suite — ESB Brand" },
      { property: "og:description", content: "Full operational suite for beauty brand CEOs." },
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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">CEO Workspace</div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold mt-1">CEO <span className="gold-text">AI Suite</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="pl-9 pr-4 py-2 rounded-full bg-card border border-border text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search suite..."
            />
          </div>
          <button className="chip-gold flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Search Suite</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <BrandPanel title="Skincare Kitchen" tag="Brand 01" data={seriesA} growth="+18.4%" revenue="$245.8K" />
        <KPIPanel />
        <RemindersPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <BrandPanel title="Derma Aesthetics" tag="Brand 02" data={seriesB} growth="+12.5%" revenue="$182.1K" />
        <BusinessOverviewPanel />
        <AutomationPanel />
      </div>
    </Shell>
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
    { t: "Team Meeting", time: "10:00 AM", sub: "Review Quarterly Goals", tag: "Auto-Execute" },
    { t: "Review Quarterly Report", time: "1:30 PM", sub: "Send to board", tag: "Pending" },
    { t: "Client Call · Mrs Okafor", time: "3:00 PM", sub: "Skincare consultation", tag: "Confirmed" },
  ];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Reminders</h3>
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

function AutomationPanel() {
  return (
    <div className="card-elevated p-5 relative overflow-hidden">
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-violet/20 blur-3xl" />
      <div className="flex items-center justify-between mb-4 relative">
        <h3 className="font-display text-lg">AI Automation</h3>
        <span className="chip-gold">Auto-Execute</span>
      </div>
      <LineSpark points={[14, 22, 19, 30, 28, 40, 52, 48, 65, 72]} height={90} />
      <div className="grid grid-cols-2 gap-3 mt-4 relative">
        <Stat label="Tasks auto-run" value="248" />
        <Stat label="Hours saved" value="62h" />
      </div>
      <div className="mt-4 p-3 rounded-xl bg-violet/10 border border-violet/30 flex items-start gap-2 relative">
        <CheckCircle2 className="h-4 w-4 text-violet shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-medium">Optimize Marketing Spend</div>
          <div className="text-muted-foreground">Reallocate $2.4K from display to retention emails.</div>
        </div>
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
