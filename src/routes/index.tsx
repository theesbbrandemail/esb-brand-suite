import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { LineSpark } from "@/components/esb/charts";
import { ChevronRight, Sparkles, Package, Camera, ChevronDown, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ESB Brand — Overview" },
      { name: "description", content: "ESB CEO AI Suite: branch overview with inventory, appointments, AI insights, and revenue." },
      { property: "og:title", content: "ESB Brand — Overview" },
      { property: "og:description", content: "Operational overview for beauty brand operations." },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3" /> Branch
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full bg-gold text-gold-foreground text-xs font-semibold flex items-center gap-1">
              Port Harcourt <ChevronDown className="h-3 w-3" />
            </button>
            <button className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground">
              Abuja
            </button>
            <button className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground">
              Lagos
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip-violet flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet animate-pulse" /> AI Orchestrator · Live
          </span>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-1">
        Good morning, <span className="gold-text">Adaeze</span>
      </h1>
      <p className="text-muted-foreground mb-8">Your suites generated <span className="text-foreground font-medium">12 actions</span> overnight — 9 auto-executed.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <InventoryCard />
        <AppointmentsCard />
        <AIInsightsCard />
        <RevenueCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <ActionsCard />
        <SubBrandsCard />
      </div>
    </Shell>
  );
}

function InventoryCard() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Inventory Status</div>
          <div className="text-2xl font-display font-semibold mt-1">75<span className="text-muted-foreground text-base">%</span></div>
        </div>
        <button className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]" style={{ width: "75%" }} />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-3">
        <span>23 SKUs low</span><span>4 reorder queued</span>
      </div>
    </div>
  );
}

function AppointmentsCard() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Today's Appointments</div>
          <div className="text-4xl font-display font-semibold mt-1">12</div>
        </div>
        <span className="chip-gold">Met</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {[
          { v: "4.1k", l: "Booked" },
          { v: "26k", l: "Repeat" },
          { v: "4.4k", l: "New" },
          { v: "12%", l: "No-show" },
        ].map((s) => (
          <div key={s.l} className="rounded-md bg-secondary/60 py-1.5">
            <div className="text-xs font-semibold">{s.v}</div>
            <div className="text-[9px] text-muted-foreground uppercase">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsightsCard() {
  return (
    <div className="card-elevated p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
      <div className="flex items-center justify-between mb-3 relative">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">AI Insights</div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet to-gold flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="font-display text-lg leading-tight mb-2">
        Skincare Kitchen demand <span className="gold-text">+18%</span> this week.
      </div>
      <p className="text-xs text-muted-foreground mb-3">Recommend boosting Serum Bar slots Wed–Fri PM.</p>
      <button className="text-xs chip-violet">Apply suggestion →</button>
    </div>
  );
}

function RevenueCard() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Revenue Overview</div>
          <div className="text-2xl font-display font-semibold mt-1">$245.8<span className="text-muted-foreground text-base">K</span></div>
        </div>
        <div className="h-8 w-8 rounded-full bg-violet/20 flex items-center justify-center">
          <Camera className="h-4 w-4 text-violet" />
        </div>
      </div>
      <LineSpark points={[20, 28, 24, 35, 42, 38, 55, 60, 72]} height={70} />
      <div className="text-[11px] text-muted-foreground mt-1">+12.5% vs last week</div>
    </div>
  );
}

function ActionsCard() {
  const actions = [
    { t: "Reorder Niacinamide 10%", d: "Skincare Kitchen · PH", tag: "Auto", color: "gold" },
    { t: "Reschedule 3 facials → Thursday", d: "Derma Aesthetics · ABJ", tag: "Pending", color: "violet" },
    { t: "Send payroll review", d: "All branches", tag: "Auto", color: "gold" },
    { t: "Approve marketing spend $4.2K", d: "ESB Brand HQ", tag: "Awaiting", color: "violet" },
  ];
  return (
    <div className="card-elevated p-5 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Orchestrator Actions</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground">View all →</button>
      </div>
      <div className="space-y-2">
        {actions.map((a, i) => (
          <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${a.color === "gold" ? "bg-gold/15 text-gold" : "bg-violet/15 text-violet"}`}>
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm truncate">{a.t}</div>
                <div className="text-[11px] text-muted-foreground truncate">{a.d}</div>
              </div>
            </div>
            <span className={a.color === "gold" ? "chip-gold" : "chip-violet"}>{a.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubBrandsCard() {
  const brands = [
    { name: "Skincare Kitchen", rev: "$112.4K", growth: "+18%", color: "gold" },
    { name: "Derma Aesthetics", rev: "$88.1K", growth: "+12.5%", color: "violet" },
    { name: "ESB Apothecary", rev: "$45.3K", growth: "+6%", color: "gold" },
  ];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Sub-brands</h3>
        <Package className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        {brands.map((b) => (
          <div key={b.name}>
            <div className="flex justify-between items-baseline">
              <span className="text-sm">{b.name}</span>
              <span className={b.color === "gold" ? "gold-text font-semibold text-sm" : "text-violet font-semibold text-sm"}>{b.growth}</span>
            </div>
            <div className="text-xs text-muted-foreground mb-1.5">{b.rev}</div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className={`h-full rounded-full ${b.color === "gold" ? "bg-gradient-to-r from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]" : "bg-gradient-to-r from-[oklch(0.4_0.15_285)] to-[oklch(0.7_0.18_295)]"}`} style={{ width: `${60 + Math.random() * 30}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
