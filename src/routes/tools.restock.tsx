import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ToolWorkspace, BranchSelect } from "@/components/esb/ToolWorkspace";
import { listBranches } from "@/lib/ops.functions";
import { runOpsTool, type RestockRow } from "@/lib/tools.functions";

export const Route = createFileRoute("/tools/restock")({
  head: () => ({
    meta: [
      { title: "Smart Restock Forecaster — ESB Brand" },
      { name: "description", content: "Forecast days until each stock item runs out and get an AI-drafted purchase order." },
      { property: "og:title", content: "Smart Restock Forecaster — ESB Brand" },
      { property: "og:description", content: "Stock run-out forecasts and AI purchase orders for ESB branches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RestockTool,
});

function RestockTool() {
  const branchesFn = useServerFn(listBranches);
  const run = useServerFn(runOpsTool);
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => branchesFn() });
  const [branchId, setBranchId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");
  const [rows, setRows] = useState<RestockRow[]>([]);
  const [error, setError] = useState<string>();

  async function go() {
    setRunning(true); setError(undefined); setResult("");
    try {
      const r = await run({ data: { tool: "restock", branchId: branchId || undefined } });
      setRows(r.restock ?? []);
      if (r.error) setError(r.error); else setResult(r.text);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setRunning(false); }
  }

  return (
    <ToolWorkspace
      title="Smart Restock Forecaster"
      subtitle="Estimates days of stock left from booking volume, then drafts a purchase order."
      onRun={go}
      running={running}
      result={result}
      error={error}
      actions={<Link to="/inventory" className="chip-gold inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">Open inventory to restock</Link>}
      controls={<BranchSelect value={branchId} onChange={setBranchId} branches={branches} />}
    >
      {rows.length > 0 && (
        <div className="card-elevated p-5 overflow-x-auto">
          <h2 className="font-display text-base mb-3">Run-out forecast</h2>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground text-left">
              <tr><th className="py-1.5">Item</th><th>Branch</th><th>In stock</th><th>Use/day</th><th>Days left</th></tr>
            </thead>
            <tbody>
              {rows.slice(0, 25).map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-1.5">{r.product}</td>
                  <td>{r.branch}</td>
                  <td>{r.qty}</td>
                  <td>{r.dailyUse}</td>
                  <td className={r.daysLeft <= 7 || r.qty <= r.threshold ? "text-destructive font-semibold" : r.daysLeft <= 21 ? "text-warning" : ""}>{r.daysLeft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolWorkspace>
  );
}
