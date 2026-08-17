import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shell } from "@/components/esb/Shell";
import { LineSpark } from "@/components/esb/charts";
import {
  getCeoKpis, listAppointments, listInventory, listReminders,
  updateAppointmentStatus, adjustStock, updateReminder,
  type Appointment, type InventoryRow,
} from "@/lib/ops.functions";
import {
  Users, CheckSquare, Package, Calendar, Sparkles, TrendingUp, AlertTriangle,
  Minus, Plus, Loader2, ArrowRight, Clock, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/manager")({
  head: () => ({
    meta: [
      { title: "Manager Suite — ESB Brand" },
      { name: "description", content: "Live manager workspace: branch KPIs, today's schedule, low-stock alerts, tasks and AI suggestions." },
      { property: "og:title", content: "Manager Suite — ESB Brand" },
      { property: "og:description", content: "Live manager workspace: branch KPIs, today's schedule, low-stock alerts and tasks." },
    ],
  }),
  component: ManagerPage,
});

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

function ManagerPage() {
  const qc = useQueryClient();
  const kpisFn = useServerFn(getCeoKpis);
  const apptsFn = useServerFn(listAppointments);
  const invFn = useServerFn(listInventory);
  const remindersFn = useServerFn(listReminders);
  const statusFn = useServerFn(updateAppointmentStatus);
  const stockFn = useServerFn(adjustStock);
  const reminderFn = useServerFn(updateReminder);

  const range = useMemo(todayRange, []);
  const kpisQ = useQuery({ queryKey: ["ceo-kpis"], queryFn: () => kpisFn(), refetchInterval: 60_000 });
  const apptsQ = useQuery({ queryKey: ["appointments", "today"], queryFn: () => apptsFn({ data: range }), refetchInterval: 60_000 });
  const invQ = useQuery({ queryKey: ["inventory", "all"], queryFn: () => invFn({ data: {} }) });
  const remindersQ = useQuery({ queryKey: ["ceo-reminders"], queryFn: () => remindersFn(), refetchInterval: 60_000 });

  const k = kpisQ.data;
  const appts = (apptsQ.data ?? []) as Appointment[];
  const lowStock = ((invQ.data ?? []) as InventoryRow[])
    .filter((r) => r.qty <= (r.low_stock_threshold ?? 0))
    .slice(0, 6);

  const [shiftOn, setShiftOn] = useState(false);

  const statusM = useMutation({
    mutationFn: (v: { id: string; status: string }) => statusFn({ data: v as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["ceo-kpis"] });
      toast.success("Appointment updated");
    },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  const stockM = useMutation({
    mutationFn: (v: { id: string; delta: number }) => stockFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Stock updated");
    },
    onError: (e: Error) => toast.error("Stock update failed", { description: e.message }),
  });

  const reminderM = useMutation({
    mutationFn: (v: { id: string; done: boolean }) => reminderFn({ data: v as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ceo-reminders"] });
      toast.success("Task updated");
    },
    onError: (e: Error) => toast.error("Task update failed", { description: e.message }),
  });

  return (
    <Shell requireStaff>
      <div className="space-y-5">
        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-violet/20 blur-3xl" />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold/90 mb-1">Manager Workspace</div>
              <h1 className="truncate font-display text-2xl sm:text-4xl font-semibold">
                Branch <span className="gold-text">Operations</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Live schedule, stock health and team tasks across every ESB branch.
              </p>
            </div>
            <button
              onClick={() => {
                setShiftOn((s) => !s);
                toast.success(shiftOn ? "Signed out" : "Signed in", {
                  description: shiftOn ? "Shift ended" : "Shift started",
                });
              }}
              className="chip-gold shrink-0 px-4 py-2 text-xs hover:scale-105 transition-transform"
            >
              {shiftOn ? "Sign Out" : "Sign In"}
            </button>
          </div>

          <div className="relative mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat icon={Calendar} label="Today's appts" value={k?.appointmentsToday} loading={kpisQ.isLoading} />
            <Stat icon={Users} label="Staff" value={k?.staff} loading={kpisQ.isLoading} />
            <Stat icon={Package} label="Low stock" value={k?.lowStockItems} loading={kpisQ.isLoading} danger={(k?.lowStockItems ?? 0) > 0} />
            <Stat icon={TrendingUp} label="Revenue / 30d" value={k ? `$${(k.revenue30d / 1000).toFixed(1)}K` : undefined} loading={kpisQ.isLoading} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's schedule */}
          <Panel title="Today's Schedule" icon={Calendar} className="lg:col-span-2">
            {apptsQ.isLoading ? (
              <Loading />
            ) : appts.length === 0 ? (
              <Empty text="No appointments scheduled for today." />
            ) : (
              <ul className="divide-y divide-white/5">
                {appts.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.patient_name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {a.service} · {a.branch?.name ?? "—"}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] gold-text font-semibold">
                        {new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{a.status}</div>
                    </div>
                    {a.status !== "completed" && (
                      <button
                        onClick={() => statusM.mutate({ id: a.id, status: "completed" })}
                        disabled={statusM.isPending}
                        className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10 disabled:opacity-50"
                        aria-label="Mark completed"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Link to="/appointments" className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              Open appointments <ArrowRight className="h-3 w-3" />
            </Link>
          </Panel>

          {/* Tasks */}
          <Panel title="Manager Tasks" icon={CheckSquare}>
            {remindersQ.isLoading ? (
              <Loading />
            ) : (remindersQ.data ?? []).length === 0 ? (
              <Empty text="No open tasks. You're all caught up." />
            ) : (
              <ul className="space-y-2">
                {(remindersQ.data ?? []).slice(0, 8).map((r) => (
                  <li key={r.id} className="flex items-start gap-2">
                    <button
                      onClick={() => reminderM.mutate({ id: r.id, done: !r.done })}
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${r.done ? "bg-gold border-gold" : "border-white/25"}`}
                      aria-label="Toggle task"
                    />
                    <div className="min-w-0">
                      <div className={`text-xs ${r.done ? "line-through text-muted-foreground" : ""}`}>{r.title}</div>
                      {r.due_at && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(r.due_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Low stock */}
          <Panel title="Low Stock Alerts" icon={AlertTriangle} className="lg:col-span-2">
            {invQ.isLoading ? (
              <Loading />
            ) : lowStock.length === 0 ? (
              <Empty text="All branches are well stocked." />
            ) : (
              <ul className="divide-y divide-white/5">
                {lowStock.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{r.product?.name ?? "Item"}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{r.branch?.name ?? "—"} · SKU {r.product?.sku ?? "—"}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] text-destructive">{r.qty} left</span>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => stockM.mutate({ id: r.id, delta: -1 })} className="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10" aria-label="Decrease">
                        <Minus className="h-3 w-3" />
                      </button>
                      <button onClick={() => stockM.mutate({ id: r.id, delta: 10 })} className="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10" aria-label="Restock 10">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/inventory" className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              Open inventory <ArrowRight className="h-3 w-3" />
            </Link>
          </Panel>

          {/* Performance + AI */}
          <div className="space-y-5">
            <Panel title="Branch Performance" icon={TrendingUp}>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-semibold">
                  {k ? `$${(k.revenue30d / 1000).toFixed(1)}K` : "—"}
                </span>
                <span className="text-[11px] text-muted-foreground">last 30 days</span>
              </div>
              <LineSpark points={(k?.brandSeries ?? []).map((b) => b.gold)} height={80} />
            </Panel>

            <div className="relative overflow-hidden rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/25 to-violet/5 p-4">
              <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-violet/40 blur-2xl" />
              <div className="relative flex items-center gap-2 text-xs font-display">
                <Sparkles className="h-3.5 w-3.5 gold-text" /> Suggestions <span className="text-violet">by AI</span>
              </div>
              <p className="relative mt-2 text-[11px] text-muted-foreground">
                {k && k.lowStockItems > 0
                  ? `Restock ${k.lowStockItems} low item${k.lowStockItems > 1 ? "s" : ""} before the weekend peak to protect service uptime.`
                  : k && k.followUpsPending > 0
                  ? `${k.followUpsPending} follow-ups pending — send WhatsApp reminders to lift rebooking rate.`
                  : "Operations are stable. Focus the team on upsell of retention services today."}
              </p>
              <Link to="/suite" className="relative mt-3 inline-flex items-center gap-1 chip-gold px-3 py-1.5 text-[10px]">
                Open CEO Suite <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Panel({ title, icon: Icon, children, className = "" }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 gold-text" />
        <h2 className="font-display text-sm sm:text-base">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, label, value, loading, danger }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: number | string; loading?: boolean; danger?: boolean }) {
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

function Loading() {
  return (
    <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading live data…
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-xs text-muted-foreground">{text}</p>;
}
