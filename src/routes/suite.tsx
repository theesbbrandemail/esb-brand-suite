import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { DualBarChart, LineSpark } from "@/components/esb/charts";
import {
  Search, ChevronRight, Sparkles, Calendar, TrendingUp, Activity, Brain, Crown,
  Plus, CheckCircle2, AlertTriangle, Package, Users, Bell, Loader2,
} from "lucide-react";
import { CeoGate } from "@/components/esb/CeoGate";
import { AutomationApprovalQueue } from "@/components/esb/AutomationApprovalQueue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCeoKpis, listReminders, createReminder, updateReminder,
  type Reminder, type CeoKpis,
} from "@/lib/ops.functions";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/suite")({
  head: () => ({
    meta: [
      { title: "CEO Intelligence Suite — ESB Brand" },
      { name: "description", content: "Biometric-secured CEO command center: KPIs, AI intelligence, automation approvals." },
    ],
  }),
  component: SuitePage,
});

export default function SuitePage() {
  const kpisFn = useServerFn(getCeoKpis);
  const remindersFn = useServerFn(listReminders);

  const kpisQ = useQuery({
    queryKey: ["ceo-kpis"],
    queryFn: () => kpisFn(),
    refetchInterval: 60_000,
  });
  const remindersQ = useQuery({
    queryKey: ["ceo-reminders"],
    queryFn: () => remindersFn(),
    refetchInterval: 60_000,
  });

  const k = kpisQ.data;

  return (
    <Shell requireStaff>
      <CeoGate>
        <div className="relative">
          {/* Premium hero */}
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

            <div className="relative mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
              <HeroStat label="Revenue / 30d" value={k ? `$${(k.revenue30d / 1000).toFixed(1)}K` : "—"} delta={k ? `${k.appointments30d} bookings` : "loading"} icon={TrendingUp} loading={kpisQ.isLoading} />
              <HeroStat label="AI Autonomy" value={k ? `${Math.round(k.aiAutonomy)}%` : "—"} delta={k ? `${k.tasksAutoRun} auto-run` : "loading"} icon={Brain} loading={kpisQ.isLoading} />
              <HeroStat label="Active Branches" value={k ? String(k.activeBranches) : "—"} delta={k ? `${k.staff} staff` : "loading"} icon={Crown} muted loading={kpisQ.isLoading} />
              <HeroStat label="Health Score" value={k ? scoreGrade(k) : "—"} delta={k ? `${k.followUpsPending} pending follow-ups` : "loading"} icon={Activity} loading={kpisQ.isLoading} />
            </div>
          </div>

          {/* Real KPI tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <KpiTile icon={Calendar} label="Today's appts" value={k?.appointmentsToday} accent="gold" loading={kpisQ.isLoading} />
            <KpiTile icon={Bell} label="Upcoming" value={k?.upcomingAppointments} accent="violet" loading={kpisQ.isLoading} />
            <KpiTile icon={Package} label="Low-stock items" value={k?.lowStockItems} accent={k && k.lowStockItems > 0 ? "danger" : "gold"} loading={kpisQ.isLoading} />
            <KpiTile icon={Users} label="Customers" value={k?.customers} accent="violet" loading={kpisQ.isLoading} />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <BrandPanel title="ESB Operations" tag="Live" data={k?.brandSeries ?? []} growth={k ? `${k.appointments30d} appts/30d` : "—"} revenue={k ? `$${(k.revenue30d / 1000).toFixed(1)}K` : "$—"} />
            <KPIPanel k={k} />
            <RemindersPanel
              reminders={remindersQ.data ?? []}
              loading={remindersQ.isLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <div className="lg:col-span-2">
              <AutomationApprovalQueue />
            </div>
            <AutomationStatsPanel k={k} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <BusinessOverviewPanel k={k} />
            <IntelligencePanel k={k} />
            <OperationsPulsePanel k={k} />
          </div>
        </div>
      </CeoGate>
    </Shell>
  );
}

function scoreGrade(k: CeoKpis) {
  const score = 100 - k.lowStockItems * 4 - k.followUpsPending * 2 - k.pendingApprovals * 3;
  if (score > 92) return "A+";
  if (score > 85) return "A";
  if (score > 75) return "B+";
  if (score > 65) return "B";
  return "C";
}

function HeroStat({
  label, value, delta, icon: Icon, muted, loading,
}: { label: string; value: string; delta: string; icon: typeof TrendingUp; muted?: boolean; loading?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-card/40 backdrop-blur border border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-gold/70" />
      </div>
      <div className="mt-2 text-2xl font-display font-semibold">{loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : value}</div>
      <div className={`text-[11px] mt-0.5 ${muted ? "text-muted-foreground" : "text-success"}`}>{delta}</div>
    </div>
  );
}

function KpiTile({
  icon: Icon, label, value, accent, loading,
}: { icon: typeof Calendar; label: string; value: number | undefined; accent: "gold" | "violet" | "danger"; loading?: boolean }) {
  const color = accent === "danger" ? "text-danger" : accent === "violet" ? "text-violet" : "gold-text";
  return (
    <div className="card-elevated p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-xl font-display font-semibold">{loading ? "…" : value ?? 0}</div>
      </div>
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
      {data.length > 0 ? <DualBarChart data={data} height={150} /> : <div className="h-[150px] flex items-center justify-center text-xs text-muted-foreground">No data yet</div>}
    </div>
  );
}

function KPIPanel({ k }: { k: CeoKpis | undefined }) {
  const kpis = k
    ? [
        { label: "Approval Rate", value: k.approvalRate, color: "gold" as const },
        { label: "AI Autonomy", value: Math.round(k.aiAutonomy), color: "violet" as const },
        { label: "Stock Health", value: Math.max(0, 100 - k.lowStockItems * 5), color: "gold" as const },
        { label: "Follow-up Speed", value: Math.max(0, 100 - k.followUpsPending * 4), color: "violet" as const },
      ]
    : [];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">KPIs · <span className="text-muted-foreground font-normal text-sm">Live</span></h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {kpis.map((kp) => (
          <div key={kp.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{kp.label}</span>
              <span className="font-semibold">{kp.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${kp.color === "gold" ? "bg-gradient-to-r from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]" : "bg-gradient-to-r from-[oklch(0.4_0.15_285)] to-[oklch(0.7_0.18_295)]"}`}
                style={{ width: `${kp.value}%` }}
              />
            </div>
          </div>
        ))}
        {!k && <div className="text-xs text-muted-foreground">Loading metrics…</div>}
      </div>
    </div>
  );
}

function RemindersPanel({ reminders, loading }: { reminders: Reminder[]; loading: boolean }) {
  const qc = useQueryClient();
  const create = useServerFn(createReminder);
  const update = useServerFn(updateReminder);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

  const addM = useMutation({
    mutationFn: () =>
      create({ data: { title, due_at: due ? new Date(due).toISOString() : undefined, priority } }),
    onSuccess: () => {
      setTitle(""); setDue(""); setOpen(false);
      qc.invalidateQueries({ queryKey: ["ceo-reminders"] });
    },
  });
  const doneM = useMutation({
    mutationFn: (id: string) => update({ data: { id, status: "done" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ceo-reminders"] }),
  });

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Actionable Agenda</h3>
        <button onClick={() => setOpen((v) => !v)} className="chip-gold inline-flex items-center gap-1 px-2.5 py-1">
          <Plus className="h-3 w-3" /> New
        </button>
      </div>

      {open && (
        <div className="mb-3 p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder title…"
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-xs"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="px-3 py-2 rounded-lg bg-card border border-border text-xs"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button
            disabled={!title.trim() || addM.isPending}
            onClick={() => addM.mutate()}
            className="chip-gold w-full py-1.5 disabled:opacity-50"
          >
            {addM.isPending ? "Saving…" : "Save reminder"}
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
        {!loading && reminders.length === 0 && (
          <div className="text-xs text-muted-foreground p-3 rounded-xl bg-secondary/30 border border-border/40">
            No reminders. Add board briefs, investor calls, or operational follow-ups.
          </div>
        )}
        {reminders.map((r) => (
          <div key={r.id} className={`p-3 rounded-xl border ${r.status === "done" ? "bg-secondary/20 border-border/40 opacity-60" : "bg-secondary/40 border-border/60"}`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className={`font-medium text-sm ${r.status === "done" ? "line-through" : ""}`}>{r.title}</div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.priority === "critical" || r.priority === "high" ? "text-danger border-danger/40 bg-danger/10" : "text-gold border-gold/40 bg-gold/10"}`}>
                {r.priority}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[10px] text-muted-foreground">
                {r.due_at ? `Due ${formatDistanceToNow(new Date(r.due_at), { addSuffix: true })}` : "No due date"}
              </div>
              {r.status !== "done" && (
                <button
                  onClick={() => doneM.mutate(r.id)}
                  className="text-[11px] gold-text inline-flex items-center gap-1 hover:underline"
                >
                  <CheckCircle2 className="h-3 w-3" /> Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessOverviewPanel({ k }: { k: CeoKpis | undefined }) {
  const items = k
    ? [
        { l: "Revenue (30d)", v: `$${(k.revenue30d / 1000).toFixed(1)}K`, g: `${k.appointments30d} bookings` },
        { l: "Avg. ticket", v: `$184`, g: "Operational" },
        { l: "Customers", v: String(k.customers), g: `${k.staff} staff` },
      ]
    : [];
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">Business Overview</h3>
        <span className="chip-violet">Brand HQ</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Real-time pulse across operations</p>
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.l} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
            <span className="text-sm text-muted-foreground">{m.l}</span>
            <div className="text-right">
              <div className="text-sm font-semibold">{m.v}</div>
              <div className="text-[10px] text-success">{m.g}</div>
            </div>
          </div>
        ))}
        {!k && <div className="text-xs text-muted-foreground">Loading…</div>}
      </div>
    </div>
  );
}

function AutomationStatsPanel({ k }: { k: CeoKpis | undefined }) {
  const pts = (k?.brandSeries ?? []).map((s) => s.gold + s.violet);
  return (
    <div className="card-elevated p-5 relative overflow-hidden">
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-violet/20 blur-3xl" />
      <div className="flex items-center justify-between mb-4 relative">
        <h3 className="font-display text-lg">AI Run Metrics</h3>
        <span className="chip-gold">Live</span>
      </div>
      <LineSpark points={pts.length ? pts : [14, 22, 19, 30, 28, 40, 52, 48, 65, 72]} height={90} />
      <div className="grid grid-cols-2 gap-3 mt-4 relative">
        <Stat label="Tasks auto-run" value={k ? String(k.tasksAutoRun) : "…"} />
        <Stat label="Pending approvals" value={k ? String(k.pendingApprovals) : "…"} />
        <Stat label="Approval rate" value={k ? `${k.approvalRate}%` : "…"} />
        <Stat label="AI autonomy" value={k ? `${Math.round(k.aiAutonomy)}%` : "…"} />
      </div>
    </div>
  );
}

function IntelligencePanel({ k }: { k: CeoKpis | undefined }) {
  const insights: { t: string; d: string; kind: string; tone: "alert" | "info" | "trend" }[] = [];
  if (k) {
    if (k.lowStockItems > 0)
      insights.push({ t: "Inventory risk", d: `${k.lowStockItems} SKU${k.lowStockItems > 1 ? "s" : ""} at/under reorder threshold across branches.`, kind: "Alert", tone: "alert" });
    if (k.followUpsPending > 0)
      insights.push({ t: "Patient follow-ups", d: `${k.followUpsPending} scheduled follow-ups pending — WhatsApp-ready in the patient queue.`, kind: "Action", tone: "info" });
    if (k.pendingApprovals > 0)
      insights.push({ t: "Automation queue", d: `${k.pendingApprovals} high-intelligence task${k.pendingApprovals > 1 ? "s" : ""} awaiting CEO approval.`, kind: "Action", tone: "info" });
    if (k.appointmentsToday > 0)
      insights.push({ t: "Today's volume", d: `${k.appointmentsToday} appointment${k.appointmentsToday > 1 ? "s" : ""} on schedule.`, kind: "Trend", tone: "trend" });
    if (insights.length === 0)
      insights.push({ t: "All systems healthy", d: "No active alerts, queue is clear and inventory is on target.", kind: "OK", tone: "trend" });
  }
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
              <div className="text-sm font-medium flex items-center gap-1.5">
                {i.tone === "alert" && <AlertTriangle className="h-3.5 w-3.5 text-danger" />}
                {i.t}
              </div>
              <span className={`text-[10px] uppercase tracking-wider ${i.tone === "alert" ? "text-danger" : "text-gold"}`}>{i.kind}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">{i.d}</div>
          </div>
        ))}
        {!k && <div className="text-xs text-muted-foreground">Loading insights…</div>}
      </div>
    </div>
  );
}

function OperationsPulsePanel({ k }: { k: CeoKpis | undefined }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Operations Pulse</h3>
        <span className="chip-violet">Cross-Branch</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Branches live" value={k ? String(k.activeBranches) : "…"} />
        <Stat label="Active SKUs" value={k ? String(k.totalSkus) : "…"} />
        <Stat label="Today's appts" value={k ? String(k.appointmentsToday) : "…"} />
        <Stat label="Follow-ups due" value={k ? String(k.followUpsPending) : "…"} />
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        Inventory, appointments and follow-ups sync in real-time across Lagos, Abuja and Port Harcourt.
      </p>
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
