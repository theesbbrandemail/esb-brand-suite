import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listBranches, listInventory, adjustStock, type InventoryRow } from "@/lib/ops.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Minus, Plus, Search, Radio, Package, Warehouse, Truck } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — ESB Brand" },
      { name: "description", content: "Real-time inventory across all ESB branches with low-stock alerts and cross-branch sync." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const qc = useQueryClient();
  const branchesFn = useServerFn(listBranches);
  const inventoryFn = useServerFn(listInventory);
  const adjustFn = useServerFn(adjustStock);

  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [pulse, setPulse] = useState(false);

  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => branchesFn() });
  const invQ = useQuery({
    queryKey: ["inventory", branchId ?? "all"],
    queryFn: () => inventoryFn({ data: { branchId } }),
  });

  // Realtime: refetch on any inventory change (cross-branch sync)
  useEffect(() => {
    const channel = supabase
      .channel("inventory-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => {
        setPulse(true);
        qc.invalidateQueries({ queryKey: ["inventory"] });
        setTimeout(() => setPulse(false), 800);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const adjust = useMutation({
    mutationFn: (v: { id: string; delta: number }) => adjustFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });

  const rows = invQ.data ?? [];
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          r.product?.name.toLowerCase().includes(q) ||
          r.product?.sku?.toLowerCase().includes(q) ||
          r.branch?.name.toLowerCase().includes(q)
        );
      }),
    [rows, search],
  );

  const lowCount = rows.filter((r) => r.qty <= r.low_stock_threshold).length;
  const totalUnits = rows.reduce((s, r) => s + r.qty, 0);

  return (
    <Shell requireStaff>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] gold-text">Real-Time Stock</div>
            <h1 className="text-3xl font-display font-semibold mt-1">
              <span className="gold-text">Inventory</span> Control
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Radio className={`h-3 w-3 ${pulse ? "text-success animate-pulse" : "text-success"}`} />
              Cross-branch live sync · {rows.length} SKU rows
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU, product…"
                className="pl-9 pr-3 py-2 rounded-full bg-card border border-border text-sm w-64 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select
              value={branchId ?? ""}
              onChange={(e) => setBranchId(e.target.value || undefined)}
              className="px-3 py-2 rounded-full bg-card border border-border text-sm"
            >
              <option value="">All branches</option>
              {(branchesQ.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard icon={Package} label="Total units" value={totalUnits} accent="gold" />
          <StatCard icon={Warehouse} label="Tracked SKUs" value={rows.length} accent="violet" />
          <StatCard icon={AlertTriangle} label="Low stock" value={lowCount} accent={lowCount > 0 ? "danger" : "gold"} />
          <StatCard icon={Truck} label="Branches" value={branchesQ.data?.length ?? 0} accent="violet" />
        </div>

        {lowCount > 0 && (
          <div className="mb-4 p-4 rounded-2xl border border-danger/40 bg-danger/5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-danger">{lowCount}</span>{" "}
              <span className="text-muted-foreground">item{lowCount > 1 ? "s" : ""} at or below reorder threshold. Cross-branch transfer or restock recommended.</span>
            </div>
          </div>
        )}

        <div className="card-elevated overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1.4fr_1fr_auto_auto_auto] gap-3 px-4 py-3 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            <div>Product</div>
            <div className="hidden md:block">Branch</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Min</div>
            <div className="text-right">Adjust</div>
          </div>
          {invQ.isLoading && (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading inventory…</div>
          )}
          {!invQ.isLoading && filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No matching items.</div>
          )}
          <div className="divide-y divide-border/60">
            {filtered.map((r) => (
              <Row key={r.id} r={r} onAdjust={(delta) => adjust.mutate({ id: r.id, delta })} />
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Row({ r, onAdjust }: { r: InventoryRow; onAdjust: (d: number) => void }) {
  const low = r.qty <= r.low_stock_threshold;
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1.4fr_1fr_auto_auto_auto] gap-3 px-4 py-3 items-center">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{r.product?.name ?? "—"}</div>
        <div className="text-[10px] text-muted-foreground truncate">
          {r.product?.brand} · {r.product?.sku} · <span className="md:hidden">{r.branch?.name}</span>
        </div>
      </div>
      <div className="hidden md:block text-xs text-muted-foreground truncate">
        {r.branch?.name}
        <div className="text-[10px]">{r.branch?.city}</div>
      </div>
      <div className={`text-right font-semibold ${low ? "text-danger" : ""}`}>{r.qty}</div>
      <div className="text-right text-xs text-muted-foreground">{r.low_stock_threshold}</div>
      <div className="flex items-center gap-1 justify-end">
        <button onClick={() => onAdjust(-1)} className="h-7 w-7 rounded-lg border border-border bg-card hover:bg-secondary flex items-center justify-center">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onAdjust(1)} className="h-7 w-7 rounded-lg border border-gold/40 bg-gold/10 hover:bg-gold/20 flex items-center justify-center">
          <Plus className="h-3.5 w-3.5 gold-text" />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, accent,
}: { icon: typeof Package; label: string; value: number; accent: "gold" | "violet" | "danger" }) {
  const color = accent === "danger" ? "text-danger" : accent === "violet" ? "text-violet" : "gold-text";
  return (
    <div className="card-elevated p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-xl font-display font-semibold">{value}</div>
      </div>
    </div>
  );
}
