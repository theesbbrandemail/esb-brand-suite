import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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

const BRANCHES = ["Port Harcourt", "Abuja", "Lagos"] as const;
type Branch = (typeof BRANCHES)[number];

function OverviewPage() {
  const [branch, setBranch] = useState<Branch>("Port Harcourt");
  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3" /> Branch
          </div>
          <div className="flex items-center gap-2">
            {BRANCHES.map((b) => {
              const active = branch === b;
              return (
                <button
                  key={b}
                  onClick={() => {
                    setBranch(b);
                    toast.success(`Switched to ${b}`, { description: "Live metrics refreshed for this branch." });
                  }}
                  className={
                    active
                      ? "px-3 py-1.5 rounded-full bg-gold text-gold-foreground text-xs font-semibold flex items-center gap-1"
                      : "px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-gold/40 transition"
                  }
                >
                  {b} {active && <ChevronDown className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/suite" className="chip-violet flex items-center gap-1.5 hover:opacity-90 transition">
            <span className="h-1.5 w-1.5 rounded-full bg-violet animate-pulse" /> AI Orchestrator · Live
          </Link>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-1">
        Good morning, <span className="gold-text">Adaeze</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Your suites generated <span className="text-foreground font-medium">12 actions</span> overnight — 9 auto-executed.
      </p>

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
    <Link to="/inventory" className="card-elevated p-5 block hover:border-gold/30 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Inventory Status</div>
          <div className="text-2xl font-display font-semibold mt-1">
            75<span className="text-muted-foreground text-base">%</span>
          </div>
        </div>
        <span className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]" style={{ width: "75%" }} />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-3">
        <span>23 SKUs low</span>
        <span>4 reorder queued</span>
      </div>
    </Link>
  );
}

function AppointmentsCard() {
  return (
    <Link to="/appointments" className="card-elevated p-5 block hover:border-gold/30 transition">
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
    </Link>
  );
}

function AIInsightsCard() {
  const nav = useNavigate();
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
      <button
        onClick={() => {
          toast.success("Suggestion applied", { description: "Serum Bar slots opened Wed–Fri PM. Review in Suite." });
          nav({ to: "/suite" });
        }}
        className="text-xs chip-violet hover:opacity-90 transition"
      >
        Apply suggestion →
      </button>
    </div>
  );
}

function RevenueCard() {
  return (
    <Link to="/suite" className="card-elevated p-5 block hover:border-gold/30 transition">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Revenue Overview</div>
          <div className="text-2xl font-display font-semibold mt-1">
            $245.8<span className="text-muted-foreground text-base">K</span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-violet/20 flex items-center justify-center">
          <Camera className="h-4 w-4 text-violet" />
        </div>
      </div>
      <LineSpark points={[20, 28, 24, 35, 42, 38, 55, 60, 72]} height={70} />
      <div className="text-[11px] text-muted-foreground mt-1">+12.5% vs last week</div>
    </Link>
  );
}

function ActionsCard() {
  const nav = useNavigate();
  const actions = [
    { t: "Reorder Niacinamide 10%", d: "Skincare Kitchen · PH", tag: "Auto", color: "gold", to: "/inventory" as const },
    { t: "Reschedule 3 facials → Thursday", d: "Derma Aesthetics · ABJ", tag: "Pending", color: "violet", to: "/appointments" as const },
    { t: "Send payroll review", d: "All branches", tag: "Auto", color: "gold", to: "/suite" as const },
    { t: "Approve marketing spend $4.2K", d: "ESB Brand HQ", tag: "Awaiting", color: "violet", to: "/suite" as const },
  ];
  return (
    <div className="card-elevated p-5 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Orchestrator Actions</h3>
        <Link to="/suite" className="text-xs text-muted-foreground hover:text-foreground">
          View all →
        </Link>
      </div>
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.t}
            onClick={() => {
              toast.success(a.t, { description: `${a.d} — opening in Suite…` });
              nav({ to: a.to });
            }}
            className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition"
          >
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
          </button>
        ))}
      </div>
    </div>
  );
}

function SubBrandsCard() {
  const brands = [
    { name: "Skincare Kitchen", rev: "$112.4K", growth: "+18%", color: "gold", to: "/brands/skincare-kitchen" as const, w: 82 },
    { name: "Derma Aesthetics", rev: "$88.1K", growth: "+12.5%", color: "violet", to: "/brands/derma" as const, w: 68 },
    { name: "ESB Apothecary", rev: "$45.3K", growth: "+6%", color: "gold", to: "/brands/skinclinic" as const, w: 54 },
  ];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Sub-brands</h3>
        <Package className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        {brands.map((b) => (
          <Link key={b.name} to={b.to} className="block hover:opacity-90 transition">
            <div className="flex justify-between items-baseline">
              <span className="text-sm">{b.name}</span>
              <span className={b.color === "gold" ? "gold-text font-semibold text-sm" : "text-violet font-semibold text-sm"}>{b.growth}</span>
            </div>
            <div className="text-xs text-muted-foreground mb-1.5">{b.rev}</div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${b.color === "gold" ? "bg-gradient-to-r from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]" : "bg-gradient-to-r from-[oklch(0.4_0.15_285)] to-[oklch(0.7_0.18_295)]"}`}
                style={{ width: `${b.w}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
