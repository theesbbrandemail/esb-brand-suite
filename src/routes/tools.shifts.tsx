import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ListPlus } from "lucide-react";
import { ToolWorkspace, BranchSelect } from "@/components/esb/ToolWorkspace";
import { listBranches, createReminder } from "@/lib/ops.functions";
import { runOpsTool } from "@/lib/tools.functions";

export const Route = createFileRoute("/tools/shifts")({
  head: () => ({
    meta: [
      { title: "Shift & Task Planner AI — ESB Brand" },
      { name: "description", content: "AI builds weekly staff rotas and daily task lists from upcoming ESB bookings." },
      { property: "og:title", content: "Shift & Task Planner AI — ESB Brand" },
      { property: "og:description", content: "Weekly rotas and task lists generated from real bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShiftsTool,
});

function ShiftsTool() {
  const branchesFn = useServerFn(listBranches);
  const run = useServerFn(runOpsTool);
  const addReminder = useServerFn(createReminder);
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => branchesFn() });
  const [branchId, setBranchId] = useState("");
  const [staffCount, setStaffCount] = useState(4);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string>();

  async function go() {
    setRunning(true); setError(undefined); setResult("");
    try {
      const r = await run({ data: { tool: "shifts", branchId: branchId || undefined, staffCount } });
      if (r.error) setError(r.error); else setResult(r.text);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setRunning(false); }
  }

  async function toReminders() {
    const section = result.split(/#+\s*Tasks/i)[1] ?? "";
    const tasks = section.split("\n").map((l) => l.replace(/^\s*(?:[-*]|\d+\.)\s+/, "").replace(/\*\*/g, "").trim()).filter((l) => l.length > 2).slice(0, 8);
    if (!tasks.length) { toast.error("No task list found in this plan"); return; }
    let ok = 0;
    for (const t of tasks) {
      try { await addReminder({ data: { title: t.slice(0, 120), category: "operations", priority: "medium" } }); ok++; } catch { /* skip */ }
    }
    toast.success(`${ok} task${ok === 1 ? "" : "s"} added to Manager reminders`);
  }

  return (
    <ToolWorkspace
      title="Shift & Task Planner"
      subtitle="Builds a 7-day rota and daily checklist from the next week of bookings."
      onRun={go}
      running={running}
      result={result}
      error={error}
      actions={<button onClick={toReminders} className="chip-gold inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"><ListPlus className="h-3.5 w-3.5" /> Add tasks to reminders</button>}
      controls={
        <>
          <BranchSelect value={branchId} onChange={setBranchId} branches={branches} />
          <label className="block text-xs text-muted-foreground">
            Staff per branch
            <input type="number" min={1} max={50} value={staffCount} onChange={(e) => setStaffCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} className="mt-1 w-full rounded-lg bg-secondary/60 border border-border px-3 py-2 text-sm text-foreground" />
          </label>
        </>
      }
    />
  );
}
