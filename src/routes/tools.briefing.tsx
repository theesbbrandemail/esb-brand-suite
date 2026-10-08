import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ToolWorkspace, BranchSelect } from "@/components/esb/ToolWorkspace";
import { listBranches } from "@/lib/ops.functions";
import { runOpsTool } from "@/lib/tools.functions";

export const Route = createFileRoute("/tools/briefing")({
  head: () => ({
    meta: [
      { title: "Daily Ops Briefing AI — ESB Brand" },
      { name: "description", content: "A morning AI summary per branch: bookings, no-show risk, low stock, revenue and top actions." },
      { property: "og:title", content: "Daily Ops Briefing AI — ESB Brand" },
      { property: "og:description", content: "Morning operations briefing for every ESB branch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BriefingTool,
});

function BriefingTool() {
  const branchesFn = useServerFn(listBranches);
  const run = useServerFn(runOpsTool);
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => branchesFn() });
  const [branchId, setBranchId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string>();

  async function go() {
    setRunning(true); setError(undefined); setResult("");
    try {
      const r = await run({ data: { tool: "briefing", branchId: branchId || undefined } });
      if (r.error) setError(r.error); else setResult(r.text);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setRunning(false); }
  }

  return (
    <ToolWorkspace
      title="Daily Ops Briefing"
      subtitle="Today's bookings, no-show risk, stock risks, 30-day revenue and your top 3 actions."
      onRun={go}
      running={running}
      result={result}
      error={error}
      controls={<BranchSelect value={branchId} onChange={setBranchId} branches={branches} />}
    />
  );
}
