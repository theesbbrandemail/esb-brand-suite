import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Package, MessageCircle, Calendar, ShieldCheck, Clock, Check } from "lucide-react";
import { getCeoKpis, listReminders } from "@/lib/ops.functions";
import { useAuth } from "@/lib/auth";

type Alert = {
  id: string;
  text: string;
  to: "/inventory" | "/appointments" | "/whatsapp" | "/suite" | "/manager";
  icon: typeof Bell;
  tone: string;
};

export function NotificationsBell() {
  const { session, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const enabled = !!session && isStaff;

  const kpisFn = useServerFn(getCeoKpis);
  const remindersFn = useServerFn(listReminders);

  const kpisQ = useQuery({
    queryKey: ["ceo-kpis"],
    queryFn: () => kpisFn(),
    enabled,
    refetchInterval: 60_000,
    retry: false,
  });
  const remindersQ = useQuery({
    queryKey: ["ceo-reminders"],
    queryFn: () => remindersFn(),
    enabled,
    refetchInterval: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const alerts = useMemo<Alert[]>(() => {
    const k = kpisQ.data;
    const out: Alert[] = [];
    if (!k) return out;
    if (k.lowStockItems > 0)
      out.push({
        id: "low-stock",
        text: `${k.lowStockItems} item${k.lowStockItems > 1 ? "s" : ""} low on stock`,
        to: "/inventory",
        icon: Package,
        tone: "text-warning",
      });
    if (k.followUpsPending > 0)
      out.push({
        id: "follow-ups",
        text: `${k.followUpsPending} follow-up${k.followUpsPending > 1 ? "s" : ""} waiting to send`,
        to: "/whatsapp",
        icon: MessageCircle,
        tone: "text-[oklch(0.75_0.18_145)]",
      });
    if (k.appointmentsToday > 0)
      out.push({
        id: "appts-today",
        text: `${k.appointmentsToday} appointment${k.appointmentsToday > 1 ? "s" : ""} today`,
        to: "/appointments",
        icon: Calendar,
        tone: "text-gold",
      });
    if (k.pendingApprovals > 0)
      out.push({
        id: "approvals",
        text: `${k.pendingApprovals} AI action${k.pendingApprovals > 1 ? "s" : ""} awaiting approval`,
        to: "/suite",
        icon: ShieldCheck,
        tone: "text-violet",
      });
    const overdue = (remindersQ.data ?? []).filter(
      (r) => r.status !== "done" && r.due_at && new Date(r.due_at) < new Date(),
    );
    if (overdue.length > 0)
      out.push({
        id: "overdue",
        text: `${overdue.length} task${overdue.length > 1 ? "s" : ""} past due — "${overdue[0].title}"`,
        to: "/manager",
        icon: Clock,
        tone: "text-destructive",
      });
    return out;
  }, [kpisQ.data, remindersQ.data]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${alerts.length ? `, ${alerts.length} alerts` : ""}`}
        aria-expanded={open}
        className="relative h-9 w-9 rounded-full bg-card/60 border border-border flex items-center justify-center hover:bg-card transition"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {alerts.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-gold text-[9px] font-semibold text-background flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl p-2 z-50">
          <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            Notifications
          </div>
          {!enabled ? (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-secondary/60"
            >
              Sign in with a staff account to receive live operational alerts.
            </Link>
          ) : kpisQ.isLoading ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">Checking live signals…</div>
          ) : alerts.length === 0 ? (
            <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-[oklch(0.75_0.18_145)]" /> All clear — nothing needs you right now.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {alerts.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.id}>
                    <Link
                      to={a.to}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-secondary/60 transition"
                    >
                      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${a.tone}`} />
                      <span className="text-xs leading-snug">{a.text}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
