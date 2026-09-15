import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shell } from "@/components/esb/Shell";
import { BranchCards } from "@/components/esb/BranchCards";
import {
  SuiteLayout,
  SuitePanel as Panel,
  SuiteLoading as Loading,
  SuiteEmpty as Empty,
} from "@/components/esb/SuiteLayout";
import { LineSpark } from "@/components/esb/charts";
import {
  getCeoKpis, listAppointments, listInventory, listReminders,
  updateAppointmentStatus, adjustStock, updateReminder,
  type Appointment, type InventoryRow, type Reminder,
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

type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

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
    mutationFn: (v: { id: string; status: AppointmentStatus }) => statusFn({ data: v }),
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
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["ceo-reminders"] });
      const prev = qc.getQueryData<Reminder[]>(["ceo-reminders"]);
      qc.setQueryData<Reminder[]>(["ceo-reminders"], (old) =>
        (old ?? []).map((r) => (r.id === v.id ? { ...r, status: v.status } : r)),
      );
      return { prev };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ceo-reminders"] });
      toast.success("Task updated");
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData<Reminder[]>(["ceo-reminders"], ctx.prev);
      toast.error("Task update failed", { description: e.message });
    },
  });

  const openTasks = (remindersQ.data ?? []).filter((r) => r.status !== "done");
  const overdueTasks = openTasks.filter((r) => r.due_at && new Date(r.due_at) < new Date());
  const pendingAppts = appts.filter((a) => a.status !== "completed" && a.status !== "cancelled");

  const suggestions = useMemo(() => {
    const out: {
      text: string;
      to: "/inventory" | "/manager" | "/whatsapp" | "/appointments" | "/suite";
      cta: string;
    }[] = [];
    if (lowStock.length > 0) {
      out.push({
        text: `${lowStock.length} item${lowStock.length > 1 ? "s are" : " is"} at or below threshold — lowest: ${lowStock[0].product?.name ?? "item"} (${lowStock[0].qty} left) at ${lowStock[0].branch?.name ?? "branch"}. Restock before the next peak.`,
        to: "/inventory",
        cta: "Open inventory",
      });
    }
    if (overdueTasks.length > 0) {
      out.push({
        text: `${overdueTasks.length} task${overdueTasks.length > 1 ? "s are" : " is"} past due — starting with "${overdueTasks[0].title}". Clear them to keep the branch on track.`,
        to: "/manager",
        cta: "Review tasks",
      });
    }
    if ((k?.followUpsPending ?? 0) > 0) {
      out.push({
        text: `${k?.followUpsPending} follow-up${(k?.followUpsPending ?? 0) > 1 ? "s" : ""} pending — send WhatsApp reminders to lift rebooking rate.`,
        to: "/whatsapp",
        cta: "Send follow-ups",
      });
    }
    if (pendingAppts.length > 0) {
      out.push({
        text: `${pendingAppts.length} appointment${pendingAppts.length > 1 ? "s" : ""} still open today — confirm arrivals and mark completions as they finish.`,
        to: "/appointments",
        cta: "Open appointments",
      });
    }
    if (out.length === 0) {
      out.push({
        text: `Operations are stable${k ? ` — $${(k.revenue30d / 1000).toFixed(1)}K revenue over 30 days` : ""}. Focus the team on upsell of retention services today.`,
        to: "/suite",
        cta: "Open CEO Suite",
      });
    }
    return out.slice(0, 3);
  }, [lowStock, overdueTasks, pendingAppts, k]);

  return (
    <Shell requireStaff>
      <SuiteLayout
        eyebrow="Manager Workspace"
        title={<>Branch <span className="gold-text">Operations</span></>}
        subtitle="Live schedule, stock health and team tasks across every ESB branch."
        actions={
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
        }
        stats={[
          { icon: Calendar, label: "Today's appts", value: k?.appointmentsToday, loading: kpisQ.isLoading },
          { icon: Users, label: "Staff", value: k?.staff, loading: kpisQ.isLoading },
          { icon: Package, label: "Low stock", value: k?.lowStockItems, loading: kpisQ.isLoading, danger: (k?.lowStockItems ?? 0) > 0 },
          { icon: TrendingUp, label: "Revenue / 30d", value: k ? `$${(k.revenue30d / 1000).toFixed(1)}K` : undefined, loading: kpisQ.isLoading },
        ]}
      >

        <BranchCards title="Branches" />

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
                      onClick={() => reminderM.mutate({ id: r.id, status: r.status === "done" ? "pending" : "done" })}
                      disabled={reminderM.isPending}
                      aria-pressed={r.status === "done"}
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border disabled:opacity-50 ${r.status === "done" ? "bg-gold border-gold" : "border-white/25"}`}
                      aria-label="Toggle task"
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
              {kpisQ.isLoading || invQ.isLoading || remindersQ.isLoading ? (
                <p className="relative mt-2 text-[11px] text-muted-foreground">Reading live branch data…</p>
              ) : (
                <ul className="relative mt-2 space-y-2.5">
                  {suggestions.map((s) => (
                    <li key={s.cta + s.text.slice(0, 12)}>
                      <p className="text-[11px] text-muted-foreground">{s.text}</p>
                      <Link to={s.to} className="mt-1.5 inline-flex items-center gap-1 chip-gold px-3 py-1.5 text-[10px]">
                        {s.cta} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </SuiteLayout>
    </Shell>
  );
}
