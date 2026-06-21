import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Loader2,
  Zap,
  ShieldCheck,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  risk: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  impact_estimate: string | null;
  created_at: string;
};

const riskColor: Record<Task["risk"], string> = {
  low: "text-success border-success/40 bg-success/10",
  medium: "text-warning border-warning/40 bg-warning/10",
  high: "text-gold border-gold/40 bg-gold/10",
  critical: "text-danger border-danger/40 bg-danger/10",
};

export function AutomationApprovalQueue() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("ai_automation_tasks")
      .select("id,title,description,category,risk,status,impact_estimate,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setTasks((data ?? []) as Task[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, action: "approve" | "reject" | "execute") {
    if (!user) return;
    setBusy(id);
    try {
      if (action === "approve") {
        await supabase
          .from("ai_automation_tasks")
          .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
          .eq("id", id);
      } else if (action === "reject") {
        await supabase.from("ai_automation_tasks").update({ status: "rejected" }).eq("id", id);
      } else if (action === "execute") {
        await supabase
          .from("ai_automation_tasks")
          .update({ status: "executed", executed_at: new Date().toISOString() })
          .eq("id", id);
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  const pending = tasks.filter((t) => t.status === "pending");
  const approved = tasks.filter((t) => t.status === "approved");

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-gold to-violet flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.2_0.03_280)]" />
            </div>
            <h3 className="font-display text-lg">AI Intelligence · Approval Queue</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            High-intelligence automations require CEO authorization before execution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip-gold flex items-center gap-1">
            <Zap className="h-3 w-3" /> {pending.length} Pending
          </span>
          <span className="chip-violet">{approved.length} Cleared</span>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex items-center justify-center text-muted-foreground gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading queue…
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">No tasks yet.</div>
      ) : (
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-secondary/30 border border-border/60 hover:border-gold/30 transition"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg border flex items-center justify-center text-[10px] font-bold uppercase ${riskColor[t.risk]}`}
                  title={`Risk: ${t.risk}`}
                >
                  {t.risk[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{t.title}</div>
                      {t.category && (
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t.category}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{t.description}</p>
                  )}
                  {t.impact_estimate && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] gold-text font-semibold">
                      <ShieldCheck className="h-3 w-3 text-gold" /> {t.impact_estimate}
                    </div>
                  )}

                  {isAdmin && t.status === "pending" && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        disabled={busy === t.id}
                        onClick={() => decide(t.id, "approve")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-[oklch(0.2_0.03_280)] disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        disabled={busy === t.id}
                        onClick={() => decide(t.id, "reject")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      {t.risk === "critical" && (
                        <span className="flex items-center gap-1 text-[10px] text-danger">
                          <AlertTriangle className="h-3 w-3" /> Critical · double-verify
                        </span>
                      )}
                    </div>
                  )}
                  {isAdmin && t.status === "approved" && (
                    <button
                      disabled={busy === t.id}
                      onClick={() => decide(t.id, "execute")}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet/20 border border-violet/40 text-violet hover:bg-violet/30 disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5" /> Execute Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Task["status"] }) {
  const map: Record<Task["status"], string> = {
    pending: "bg-gold/15 text-gold border-gold/30",
    approved: "bg-violet/15 text-violet border-violet/30",
    executed: "bg-success/15 text-success border-success/30",
    rejected: "bg-secondary text-muted-foreground border-border",
    failed: "bg-danger/15 text-danger border-danger/30",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}
