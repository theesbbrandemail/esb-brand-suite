import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shell } from "@/components/esb/Shell";
import { BranchCards } from "@/components/esb/BranchCards";
import { LineSpark } from "@/components/esb/charts";
import {
  getCeoKpis, listAppointments, listInventory, listReminders,
  updateAppointmentStatus, adjustStock, updateReminder,
  type Appointment, type InventoryRow,
} from "@/lib/ops.functions";
import {
  Bell, Sparkles, ArrowRight, Calendar, Package, TrendingUp, AlertTriangle,
  CheckSquare, CheckCircle2, Clock, Loader2, Minus, Plus,
} from "lucide-react";

export const Route = createFileRoute("/mobile")({
  head: () => ({
    meta: [
      { title: "Mobile CEO Suite — ESB Brand" },
      { name: "description", content: "Live mobile CEO suite: real revenue KPIs, today's schedule, low-stock alerts and reminders across ESB branches." },
      { property: "og:title", content: "Mobile CEO Suite — ESB Brand" },
      { property: "og:description", content: "Live mobile CEO suite: KPIs, today's schedule and low-stock alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MobilePage,
});

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

function MobilePage() {
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
  const reminders = remindersQ.data ?? [];
  const lowStock = ((invQ.data ?? []) as InventoryRow[])
    .filter((r) => r.qty <= (r.low_stock_threshold ?? 0))
    .slice(0, 6);

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
    mutationFn: (v: { id: string; status: "pending" | "done" }) => reminderFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ceo-reminders"] });
      toast.success("Reminder updated");
    },
    onError: (e: Error) => toast.error("Reminder update failed", { description: e.message }),
  });

  const pendingReminders = reminders.filter((r) => r.status !== "done").length;

  return (
    <Shell requireStaff>
      <SuiteLayout
        eyebrow={new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
        title={<>CEO <span className="gold-text">AI Suite</span></>}
        subtitle="Live group performance across every ESB brand — on any screen."
        actions={
          <button
            onClick={() =>
              toast(`${pendingReminders} open reminder${pendingReminders === 1 ? "" : "s"}`, {
                description: `${k?.lowStockItems ?? 0} low-stock items · ${k?.followUpsPending ?? 0} follow-ups pending`,
              })
            }
            className="relative shrink-0 h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
            {pendingReminders > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-gold px-1 text-[9px] font-semibold leading-4 text-black">
                {pendingReminders}
              </span>
            )}
          </button>
        }
        stats={[
          { icon: TrendingUp, label: "Revenue / 30d", value: k ? `$${(k.revenue30d / 1000).toFixed(1)}K` : undefined, loading: kpisQ.isLoading },
          { icon: Calendar, label: "Today's appts", value: k?.appointmentsToday, loading: kpisQ.isLoading },
          { icon: Package, label: "Low stock", value: k?.lowStockItems, loading: kpisQ.isLoading, danger: (k?.lowStockItems ?? 0) > 0 },
          { icon: CheckSquare, label: "Follow-ups", value: k?.followUpsPending, loading: kpisQ.isLoading },
        ]}
      >

        {/* Trend */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Group appointments trend</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl font-semibold">{k?.appointments30d ?? "—"}</span>
                <span className="text-[11px] text-muted-foreground">last 30 days</span>
              </div>
            </div>
            <span className="chip-violet text-[10px]">Live</span>
          </div>
          <LineSpark points={(k?.brandSeries ?? []).map((b) => b.gold)} height={90} />
        </section>

        <BranchCards title="Branch Network" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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

          <Panel title="Reminders" icon={CheckSquare}>
            {remindersQ.isLoading ? (
              <Loading />
            ) : reminders.length === 0 ? (
              <Empty text="No reminders. You're all caught up." />
            ) : (
              <ul className="space-y-2">
                {reminders.slice(0, 8).map((r) => (
                  <li key={r.id} className="flex items-start gap-2">
                    <button
                      onClick={() => reminderM.mutate({ id: r.id, status: r.status === "done" ? "pending" : "done" })}
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${r.status === "done" ? "bg-gold border-gold" : "border-white/25"}`}
                      aria-label="Toggle reminder"
                    />
                    <div className="min-w-0">
                      <div className={`text-xs ${r.status === "done" ? "line-through text-muted-foreground" : ""}`}>{r.title}</div>
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

          <div className="relative overflow-hidden rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/25 to-violet/5 p-4">
            <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-violet/40 blur-2xl" />
            <div className="relative flex items-center gap-2 text-xs font-display">
              <Sparkles className="h-3.5 w-3.5 gold-text" /> AI Suggestion
            </div>
            <p className="relative mt-2 text-[11px] text-muted-foreground">
              {k && k.lowStockItems > 0
                ? `Restock ${k.lowStockItems} low item${k.lowStockItems > 1 ? "s" : ""} now — stockouts are the fastest way to lose today's ${k.appointmentsToday} bookings.`
                : k && k.followUpsPending > 0
                ? `${k.followUpsPending} follow-ups pending — send WhatsApp reminders to lift rebooking rate.`
                : "Operations are stable. Push retention upsells across branches today."}
            </p>
            <Link to="/suite" className="relative mt-3 inline-flex items-center gap-1 chip-gold px-3 py-1.5 text-[10px]">
              Open full CEO Suite <ArrowRight className="h-3 w-3" />
            </Link>
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
