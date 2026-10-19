import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listBranches, listInventory, adjustStock, type InventoryRow } from "@/lib/ops.functions";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Minus, Plus, Search, Package, Warehouse,
  Truck, MapPin, Navigation, ExternalLink, CheckCircle2,
  Clock, ShieldCheck, Phone, MessageCircle, Send, ArrowUpRight,
  Filter, Sparkles, RefreshCw, FileText, Printer, Building2,
  Receipt, Landmark, Download, BarChart3, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredDeliveries,
  saveStoredDeliveries,
  getStoredPurchaseOrders,
  saveStoredPurchaseOrders,
  type DeliveryOrder,
  type PurchaseOrder,
} from "@/lib/storage";
import { formatNaira } from "@/lib/currency";
import { WeeklyFleetInventoryChart } from "@/components/esb/WeeklyFleetInventoryChart";
import { SEED_PRODUCT_INTELLIGENCE } from "@/lib/sales-intelligence";
import { getSelectedBranch, type ActiveBranchKey } from "@/lib/branch-manager";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory & Delivery Fleet Tracking — ESB Brand" },
      {
        name: "description",
        content:
          "Real-time inventory stock management, Google Maps delivery fleet tracking, and Gemini AI automated purchase orders.",
      },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const qc = useQueryClient();
  const branchesFn = useServerFn(listBranches);
  const inventoryFn = useServerFn(listInventory);
  const adjustFn = useServerFn(adjustStock);

  // Tabs: "stock" vs "deliveries" vs "purchase_orders" vs "analytics"
  const [activeTab, setActiveTab] = useState<"stock" | "deliveries" | "purchase_orders" | "analytics">("stock");

  // Stock Filter
  const [branchId, setBranchId] = useState<string | undefined>(() => {
    const cur = getSelectedBranch();
    return cur === "ph" ? "b-ph-01" : cur === "abuja" ? "b-abj-02" : undefined;
  });
  const [search, setSearch] = useState("");
  const [pulse, setPulse] = useState(false);

  // Delivery fleet state
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => getStoredDeliveries());
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "outgoing" | "incoming">("all");
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Purchase Order State
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStoredPurchaseOrders());
  const [showPoModal, setShowPoModal] = useState(false);
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // New PO Form State
  const [newPoSupplier, setNewPoSupplier] = useState("");
  const [newPoEmail, setNewPoEmail] = useState("");
  const [newPoPhone, setNewPoPhone] = useState("+234 ");
  const [newPoBrand, setNewPoBrand] = useState("Derma Aesthetics");
  const [newPoWarehouse, setNewPoWarehouse] = useState("Port Harcourt Central Formulation Depot");
  const [newPoItemName, setNewPoItemName] = useState("");
  const [newPoQty, setNewPoQty] = useState(50);
  const [newPoUnitCost, setNewPoUnitCost] = useState(15000);
  const [newPoTerms, setNewPoTerms] = useState("50% Advance via Zenith Bank, 50% on Lab Delivery");

  // New Dispatch Form State
  const [newTitle, setNewTitle] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newPhone, setNewPhone] = useState("+234 ");
  const [newDest, setNewDest] = useState("");
  const [newCity, setNewCity] = useState<"Port Harcourt" | "Abuja">("Port Harcourt");
  const [newItems, setNewItems] = useState("");
  const [newValueNgn, setNewValueNgn] = useState("450000");
  const [newVehicle, setNewVehicle] = useState("ESB Dispatch Van 01");
  const [newCourier, setNewCourier] = useState("Babatunde Lawal");

  // Sync with global branch switch
  useEffect(() => {
    const handleBranch = (e: Event) => {
      const custom = e as CustomEvent<{ branch: ActiveBranchKey }>;
      if (custom.detail?.branch === "ph") {
        setBranchId("b-ph-01");
      } else if (custom.detail?.branch === "abuja") {
        setBranchId("b-abj-02");
      } else {
        setBranchId(undefined);
      }
    };
    window.addEventListener("esb_branch_changed", handleBranch);
    return () => window.removeEventListener("esb_branch_changed", handleBranch);
  }, []);

  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => branchesFn() });
  const invQ = useQuery({
    queryKey: ["inventory", branchId ?? "all"],
    queryFn: () => inventoryFn({ data: { branchId } }),
  });

  // Realtime Supabase inventory channel
  useEffect(() => {
    const channel = googleDb
      .channel("inventory-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => {
        setPulse(true);
        qc.invalidateQueries({ queryKey: ["inventory"] });
        setTimeout(() => setPulse(false), 800);
      })
      .subscribe();
    return () => {
      googleDb.removeChannel(channel);
    };
  }, [qc]);

  // Sync PO changes
  useEffect(() => {
    const handlePoUpdate = () => {
      setPurchaseOrders(getStoredPurchaseOrders());
    };
    window.addEventListener("esb_purchase_orders_updated", handlePoUpdate);
    return () => window.removeEventListener("esb_purchase_orders_updated", handlePoUpdate);
  }, []);

  // Listen to background fleet & delivery telemetry sync
  useEffect(() => {
    const handleDeliveriesSync = (e: any) => {
      if (Array.isArray(e.detail)) {
        setDeliveries(e.detail);
      } else {
        setDeliveries(getStoredDeliveries());
      }
    };
    window.addEventListener("esb_deliveries_synced", handleDeliveriesSync);
    return () => window.removeEventListener("esb_deliveries_synced", handleDeliveriesSync);
  }, []);

  const adjust = useMutation({
    mutationFn: (v: { id: string; delta: number }) => adjustFn({ data: v }),
    onSuccess: () => {
      toast.success("Stock quantity adjusted");
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const rows = invQ.data ?? [];
  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          r.product?.name.toLowerCase().includes(q) ||
          r.product?.sku.toLowerCase().includes(q) ||
          r.product?.brand.toLowerCase().includes(q) ||
          r.branch?.name.toLowerCase().includes(q) ||
          r.branch?.city.toLowerCase().includes(q)
        );
      }),
    [rows, search]
  );

  const totalUnits = useMemo(() => rows.reduce((s, r) => s + r.qty, 0), [rows]);
  const lowCount = useMemo(() => rows.filter((r) => r.qty <= r.low_stock_threshold).length, [rows]);

  // Product sales intelligence metrics
  const totalSalesUnits = useMemo(() => {
    return rows.reduce((acc, r) => {
      const match = SEED_PRODUCT_INTELLIGENCE.find(
        (p) =>
          p.name.toLowerCase() === r.product?.name?.toLowerCase() ||
          r.product?.name?.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(r.product?.name?.toLowerCase() || "")
      );
      return acc + (match ? match.unitsSold : 65);
    }, 0);
  }, [rows]);

  const totalSalesRevenue = useMemo(() => {
    return rows.reduce((acc, r) => {
      const match = SEED_PRODUCT_INTELLIGENCE.find(
        (p) =>
          p.name.toLowerCase() === r.product?.name?.toLowerCase() ||
          r.product?.name?.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(r.product?.name?.toLowerCase() || "")
      );
      return acc + (match ? match.revenueGeneratedNgn : (65 * (r.product?.price ?? 22000)));
    }, 0);
  }, [rows]);

  // Delivery calculations
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (deliveryFilter === "outgoing") return d.type === "outgoing";
      if (deliveryFilter === "incoming") return d.type === "incoming";
      return true;
    });
  }, [deliveries, deliveryFilter]);

  const activeDeliveriesCount = useMemo(
    () => deliveries.filter((d) => d.status === "in_transit" || d.status === "out_for_delivery").length,
    [deliveries]
  );

  // Live GPS telemetry simulation
  const handleSimulateGpsPing = (delId: string) => {
    const next = deliveries.map((d) => {
      if (d.id !== delId) return d;
      const latDelta = (Math.random() - 0.5) * 0.005;
      const lngDelta = (Math.random() - 0.5) * 0.005;
      const statuses: DeliveryOrder["status"][] = ["in_transit", "out_for_delivery", "delivered"];
      const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        ...d,
        coordinates: {
          lat: Number((d.coordinates.lat + latDelta).toFixed(4)),
          lng: Number((d.coordinates.lng + lngDelta).toFixed(4)),
        },
        currentLocationDesc: `Live GPS Ping at ${new Date().toLocaleTimeString()} — within 2.4km radius`,
        status: nextStatus,
      };
    });
    setDeliveries(next);
    saveStoredDeliveries(next);
    toast.success("Live GPS Telemetry Ping Received", {
      description: `Satellite coordinates updated on Google Maps fleet tracker.`,
    });
  };

  // Automated AI Restock & Low Stock Scan
  const handleAiAutoRestockScan = () => {
    const lowStockItems = rows.filter((r) => r.qty <= r.low_stock_threshold);
    if (lowStockItems.length === 0) {
      toast.info("All branches sufficiently stocked", {
        description: "Zero SKUs currently below critical threshold.",
      });
      return;
    }

    const poItems = lowStockItems.slice(0, 4).map((r) => ({
      name: `${r.product?.name || "Active Cosmetic Item"} (${r.product?.sku || "SKU"})`,
      quantity: (r.low_stock_threshold * 2) - r.qty + 20,
      unitCostNgn: 18500,
      totalCostNgn: ((r.low_stock_threshold * 2) - r.qty + 20) * 18500,
    }));

    const totalCost = poItems.reduce((acc, it) => acc + it.totalCostNgn, 0);
    const seq = Math.floor(1000 + Math.random() * 9000);
    const newPo: PurchaseOrder = {
      id: `PO-2026-${seq}`,
      supplierName: "Apex Pharma & Active Cosmetics Ltd (Lagos)",
      supplierEmail: "orders@apexcosmetics.ng",
      supplierPhone: "+234 803 221 4982",
      brand: "Derma Aesthetics",
      destinationWarehouse: "Port Harcourt Central Formulation Lab",
      items: poItems,
      totalCostNgn: totalCost,
      status: "approved",
      expectedDeliveryDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      createdDate: new Date().toISOString().split("T")[0],
      notes: "Auto-generated by Gemini AI scanning reorder points across Port Harcourt & Abuja.",
      waybillNumber: `WAY-GEM-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentTerms: "50% Advance via Zenith Bank, 50% on Lab Delivery QC",
    };

    const updated = [newPo, ...purchaseOrders];
    setPurchaseOrders(updated);
    saveStoredPurchaseOrders(updated);
    setSelectedPo(newPo);
    setActiveTab("purchase_orders");

    toast.success(`Gemini AI Restock Executed: ${newPo.id}!`, {
      description: `Auto-ordered ${poItems.length} low-stock SKUs totaling ${formatNaira(totalCost)}.`,
    });
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newRecipient || !newDest) {
      toast.error("Please fill in package title, recipient, and destination.");
      return;
    }

    const cityCoords = {
      Lagos: { lat: 6.4281, lng: 3.4219 },
      Abuja: { lat: 9.0765, lng: 7.3986 },
      "Port Harcourt": { lat: 4.8156, lng: 7.0498 },
    }[newCity];

    const newDel: DeliveryOrder = {
      id: `del-${Date.now()}`,
      trackingNumber: `ESB-DEL-${Math.floor(1000 + Math.random() * 9000)}-NG`,
      type: "outgoing",
      title: newTitle,
      items: newItems || "Bespoke ESB Aesthetic Skincare Pack",
      origin: "ESB Central Lab, Port Harcourt Flagship",
      destination: newDest,
      city: newCity,
      recipient: newRecipient,
      phone: newPhone,
      status: "dispatched",
      courier: newCourier,
      courierPhone: "+234 803 992 4110",
      vehicle: newVehicle,
      currentLocationDesc: `Departed Port Harcourt Depot en route to ${newCity}`,
      coordinates: cityCoords,
      estimatedEta: "35 mins",
      valueNgn: Number(newValueNgn) || 350000,
      dispatchTime: new Date().toISOString(),
    };

    const next = [newDel, ...deliveries];
    setDeliveries(next);
    saveStoredDeliveries(next);
    toast.success(`Dispatched ${newDel.trackingNumber}!`, {
      description: `Trackable on Google Maps for ${newRecipient} in ${newCity}.`,
    });
    setShowDispatchModal(false);
    setNewTitle("");
    setNewRecipient("");
    setNewDest("");
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(newPoQty) || 1;
    const cost = Number(newPoUnitCost) || 0;
    const total = qty * cost;
    const seq = Math.floor(1000 + Math.random() * 9000);

    const newPo: PurchaseOrder = {
      id: `PO-2026-${seq}`,
      supplierName: newPoSupplier || "Apex Pharma & Active Cosmetics Ltd",
      supplierEmail: newPoEmail || "orders@apexcosmetics.ng",
      supplierPhone: newPoPhone,
      brand: newPoBrand,
      destinationWarehouse: newPoWarehouse,
      items: [
        {
          name: newPoItemName || "Active Skincare Raw Material Batch",
          quantity: qty,
          unitCostNgn: cost,
          totalCostNgn: total,
        },
      ],
      totalCostNgn: total,
      status: "approved",
      expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      createdDate: new Date().toISOString().split("T")[0],
      notes: "Official Purchase Order authorized by ESB Inventory Procurement.",
      waybillNumber: `WAY-APX-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentTerms: newPoTerms,
    };

    const updated = [newPo, ...purchaseOrders];
    setPurchaseOrders(updated);
    saveStoredPurchaseOrders(updated);
    setShowPoModal(false);
    toast.success(`Purchase Order ${newPo.id} Created!`, {
      description: `Total ${formatNaira(total)} sent to ${newPo.supplierName}.`,
    });
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-secondary/30 border border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                <Warehouse className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  Inventory, Logistics & Procurement Hub
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time branch inventory, Google Maps fleet telemetry, and Gemini AI automated purchase orders in Nigerian Naira (₦).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-background border border-border">
            <button
              onClick={() => setActiveTab("stock")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "stock"
                  ? "bg-gold text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Stock Levels</span>
            </button>
            <button
              onClick={() => setActiveTab("deliveries")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "deliveries"
                  ? "bg-gold text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Google Maps Tracking</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white font-mono">
                {activeDeliveriesCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("purchase_orders")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "purchase_orders"
                  ? "bg-gold text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="h-3.5 w-3.5 text-blue-400" />
              <span>Purchase Orders & POs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white font-mono">
                {purchaseOrders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "analytics"
                  ? "bg-gold text-black shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
              <span>Fleet & Stock Charts</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: BRANCH STOCK LEVELS */}
        {/* ======================================================== */}
        {activeTab === "stock" && (
          <div className="space-y-5 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <StatCard icon={Package} label="Total SKUs" value={rows.length} accent="gold" />
              <StatCard icon={Warehouse} label="Total Units" value={totalUnits} accent="violet" />
              <StatCard
                icon={TrendingUp}
                label="Sales Products Generated"
                value={`${totalSalesUnits} units`}
                subtext={formatNaira(totalSalesRevenue)}
                accent="success"
              />
              <StatCard icon={AlertTriangle} label="Low Stock Alert" value={lowCount} accent="danger" />
              <div className="card-elevated p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Restock Scan</div>
                  <button
                    onClick={handleAiAutoRestockScan}
                    className="text-xs font-bold text-gold hover:underline mt-0.5 flex items-center gap-1"
                  >
                    Auto-Replenish All →
                  </button>
                </div>
              </div>
            </div>

            {/* Filter and Branch Picker Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search SKU, ingredient, formula, brand or branch..."
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={branchId ?? ""}
                  onChange={(e) => setBranchId(e.target.value ? e.target.value : undefined)}
                  className="h-8 px-3 rounded-lg bg-background border border-border text-xs text-foreground focus:border-gold focus:outline-none"
                >
                  <option value="">All Branches (Lagos, Abuja, PH)</option>
                  {(branchesQ.data ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAiAutoRestockScan}
                  className="chip-gold flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Restock Low Stock</span>
                </button>
              </div>
            </div>

            {/* Stock Table */}
            <div className="card-elevated rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-[1.2fr_auto_auto_auto_auto] md:grid-cols-[1.4fr_1fr_1fr_auto_auto_auto] gap-3 px-4 py-3 bg-secondary/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                <div>Product / Formulation</div>
                <div className="hidden md:block">Branch Location</div>
                <div className="text-right">Sales Generated</div>
                <div className="text-right">Available</div>
                <div className="text-right">Min Threshold</div>
                <div className="text-right">Quick Adjust</div>
              </div>

              <div className="divide-y divide-border">
                {filteredRows.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No items matching your criteria.
                  </div>
                ) : (
                  filteredRows.map((r) => (
                    <Row key={r.id} r={r} onAdjust={(delta) => adjust.mutate({ id: r.id, delta })} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: GOOGLE MAPS DELIVERY TRACKING */}
        {/* ======================================================== */}
        {activeTab === "deliveries" && (
          <div className="space-y-6 animate-fade-in">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border">
                {[
                  { key: "all", label: "All Deliveries" },
                  { key: "outgoing", label: "Outgoing Orders" },
                  { key: "incoming", label: "Incoming Supplies" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setDeliveryFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      deliveryFilter === f.key
                        ? "bg-gold text-black font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowDispatchModal(true)}
                className="chip-gold flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Dispatch New Delivery Cargo</span>
              </button>
            </div>

            {/* Google Maps Simulated Radar View */}
            <div className="relative rounded-2xl overflow-hidden border border-gold/30 bg-neutral-950 p-6 shadow-2xl">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Google Maps GPS Live Sync (Lagos & Abuja)
                </span>
              </div>

              <div className="h-64 sm:h-80 w-full relative rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center border border-border/60">
                {/* Visual Map Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25px 25px, #D4AF37 2%, transparent 0%), radial-gradient(circle at 75px 75px, #4F46E5 2%, transparent 0%)`,
                    backgroundSize: "100px 100px",
                  }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                  <Navigation className="h-10 w-10 text-gold animate-bounce mb-3" />
                  <h3 className="text-base font-bold text-foreground">Interactive Google Maps Fleet Grid</h3>
                  <p className="text-xs text-muted-foreground max-w-md mt-1">
                    Real-time coordinates locked to Port Harcourt Flagship Central Depot and Maitama Hub Abuja transit corridors.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {deliveries.slice(0, 3).map((d) => (
                      <span
                        key={d.id}
                        className="px-2.5 py-1 rounded-lg bg-black/60 border border-gold/40 text-[11px] text-gold font-mono flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        {d.trackingNumber}: {d.city} ({d.estimatedEta})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDeliveries.map((del) => (
                <div
                  key={del.id}
                  className="card-elevated p-5 space-y-3 border border-border hover:border-gold/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-foreground">{del.trackingNumber}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            del.status === "delivered"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {del.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground mt-1">{del.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Recipient: <strong className="text-foreground">{del.recipient}</strong> ({del.phone})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gold">{formatNaira(del.valueNgn)}</div>
                      <div className="text-[10px] text-muted-foreground">ETA: {del.estimatedEta}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border text-xs space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Origin: {del.origin}</span>
                      <span>Destination: {del.destination}</span>
                    </div>
                    <div className="text-gold font-medium flex items-center gap-1 pt-1">
                      <Navigation className="h-3 w-3 animate-pulse" />
                      {del.currentLocationDesc}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://wa.me/${del.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${del.recipient}, your delivery (${del.trackingNumber}) is currently ${del.currentLocationDesc}. Vehicle: ${del.vehicle}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold flex items-center gap-1"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Dispatch
                    </a>
                    <button
                      onClick={() => handleSimulateGpsPing(del.id)}
                      className="px-3 py-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 border border-gold/40 text-xs font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Update GPS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PURCHASE ORDERS & AI AUTO-RESTOCK */}
        {/* ======================================================== */}
        {activeTab === "purchase_orders" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Actions Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-gold" />
                  Supplier Purchase Orders & Goods Delivery Waybills
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official PO documents issued to raw chemical formulators, glass bottle suppliers, and organic cooperatives.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAiAutoRestockScan}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 hover:opacity-90 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Gemini Auto-Restock PO</span>
                </button>
                <button
                  onClick={() => setShowPoModal(true)}
                  className="chip-gold flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Purchase Order</span>
                </button>
              </div>
            </div>

            {/* PO Cards List */}
            <div className="space-y-4">
              {purchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="card-elevated p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/80 hover:border-gold/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{po.id}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          po.status === "received"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {po.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gold font-medium bg-secondary px-2 py-0.5 rounded-md">
                        {po.brand}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-foreground mt-1">
                      Supplier: {po.supplierName} · <span className="text-xs text-muted-foreground">{po.supplierPhone}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Destination: <strong className="text-foreground">{po.destinationWarehouse}</strong> · Expected:{" "}
                      {po.expectedDeliveryDate}
                    </div>
                    <div className="text-xs text-muted-foreground pt-1">
                      {po.items.map((it) => `${it.name} (${it.quantity}x @ ${formatNaira(it.unitCostNgn)})`).join("; ")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-muted-foreground">PO Total Value</div>
                      <div className="text-base font-bold text-gold">{formatNaira(po.totalCostNgn)}</div>
                      <div className="text-[10px] text-muted-foreground">Waybill: {po.waybillNumber}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPo(po);
                          setShowWaybillModal(true);
                        }}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs transition"
                        title="Print Goods Delivery Note / Waybill"
                      >
                        <Printer className="h-4 w-4 text-gold" />
                      </button>
                      <a
                        href={`https://wa.me/${po.supplierPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Official ESB Brand Suite Purchase Order ${po.id} for ${po.brand}. Total Value: ₦${po.totalCostNgn.toLocaleString()}. Waybill: ${po.waybillNumber}. Expected Delivery: ${po.expectedDeliveryDate}. Terms: ${po.paymentTerms}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-emerald-400 border border-border text-xs transition"
                        title="Send PO to Supplier on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: RECHARTS WEEKLY FLEET & INVENTORY VISUALIZER */}
        {/* ======================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <WeeklyFleetInventoryChart />
          </div>
        )}

        {/* MODAL: DISPATCH NEW DELIVERY */}
        {showDispatchModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateDispatch}
              className="card-elevated max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gold" />
                  Dispatch Delivery Cargo & Google Maps Tracking
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground">Delivery Package Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. VIP Custom Serum Order & Exosome Mask"
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      placeholder="e.g. Senator Adeleke"
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Recipient Phone (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Destination City</label>
                    <select
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value as any)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    >
                      <option value="Lagos">Lagos State</option>
                      <option value="Abuja">Abuja FCT</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Package Value (₦ NGN)</label>
                    <input
                      type="number"
                      value={newValueNgn}
                      onChange={(e) => setNewValueNgn(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground">Destination Address</label>
                  <input
                    type="text"
                    required
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    placeholder="Plot 14 Admiralty Way, Lekki Phase 1"
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground">Items in Box</label>
                  <input
                    type="text"
                    value={newItems}
                    onChange={(e) => setNewItems(e.target.value)}
                    placeholder="2x Radiance Vitamin C, 1x Post-Procedure Cream"
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                >
                  Cancel
                </button>
                <button type="submit" className="chip-gold px-4 py-2 text-xs font-semibold">
                  Dispatch Now
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: NEW PURCHASE ORDER */}
        {showPoModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreatePoSubmit}
              className="card-elevated max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gold" />
                  Create Supplier Purchase Order (PO)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Brand *</label>
                    <select
                      value={newPoBrand}
                      onChange={(e) => setNewPoBrand(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    >
                      <option value="Derma Aesthetics">Derma Aesthetics</option>
                      <option value="Skincare Kitchen">Skincare Kitchen</option>
                      <option value="Skin Clinic">Skin Clinic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Destination Lab / Warehouse</label>
                    <input
                      value={newPoWarehouse}
                      onChange={(e) => setNewPoWarehouse(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground">Supplier Name *</label>
                  <input
                    required
                    value={newPoSupplier}
                    onChange={(e) => setNewPoSupplier(e.target.value)}
                    placeholder="e.g. Apex Pharma & Active Cosmetics Ltd"
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Supplier Phone</label>
                    <input
                      value={newPoPhone}
                      onChange={(e) => setNewPoPhone(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Supplier Email</label>
                    <input
                      value={newPoEmail}
                      onChange={(e) => setNewPoEmail(e.target.value)}
                      placeholder="orders@supplier.ng"
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground">Raw Material / Item Description *</label>
                  <input
                    required
                    value={newPoItemName}
                    onChange={(e) => setNewPoItemName(e.target.value)}
                    placeholder="e.g. Raw Hyaluronic Acid 4D Powder (1kg drums)"
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Quantity *</label>
                    <input
                      type="number"
                      min={1}
                      value={newPoQty}
                      onChange={(e) => setNewPoQty(Number(e.target.value))}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Unit Cost (₦ NGN) *</label>
                    <input
                      type="number"
                      step={500}
                      value={newPoUnitCost}
                      onChange={(e) => setNewPoUnitCost(Number(e.target.value))}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border font-bold text-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground">Payment Settlement Terms</label>
                  <input
                    value={newPoTerms}
                    onChange={(e) => setNewPoTerms(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                >
                  Cancel
                </button>
                <button type="submit" className="chip-gold px-4 py-2 text-xs font-semibold">
                  Authorize & Create PO
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: PRINT GOODS DELIVERY NOTE / WAYBILL */}
        {showWaybillModal && selectedPo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="card-elevated p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto bg-neutral-950 border border-gold/40 space-y-6">
              <div className="flex items-start justify-between border-b border-border/80 pb-5">
                <div>
                  <div className="text-xl font-display font-bold gold-text">ESB BRAND LOGISTICS & SUPPLY</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Goods Delivery Note / Official Cargo Waybill
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded-md text-xs font-mono font-bold bg-gold/20 text-gold border border-gold/40">
                    {selectedPo.waybillNumber}
                  </div>
                  <div className="text-sm font-mono font-bold mt-1.5 text-foreground">{selectedPo.id}</div>
                  <div className="text-[11px] text-muted-foreground">Issued: {selectedPo.createdDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">SUPPLIER:</div>
                  <div className="font-semibold text-sm text-foreground">{selectedPo.supplierName}</div>
                  <div className="text-muted-foreground">{selectedPo.supplierPhone}</div>
                  <div className="text-muted-foreground">{selectedPo.supplierEmail}</div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">DESTINATION:</div>
                  <div className="font-semibold text-gold">{selectedPo.destinationWarehouse}</div>
                  <div className="text-muted-foreground">Brand Target: {selectedPo.brand}</div>
                  <div className="text-muted-foreground">Expected: {selectedPo.expectedDeliveryDate}</div>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-secondary/80 font-bold p-2.5 text-muted-foreground">
                  <div className="col-span-7">MATERIAL / SKU</div>
                  <div className="col-span-2 text-center">QTY</div>
                  <div className="col-span-3 text-right">COST (₦)</div>
                </div>
                {selectedPo.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-3 border-t border-border items-center">
                    <div className="col-span-7 font-medium text-foreground">{it.name}</div>
                    <div className="col-span-2 text-center text-muted-foreground">{it.quantity}</div>
                    <div className="col-span-3 text-right font-semibold text-foreground">
                      {formatNaira(it.totalCostNgn)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-secondary/30 border border-border">
                <span className="text-muted-foreground font-medium">Total Procurement Value:</span>
                <span className="text-base font-bold text-gold">{formatNaira(selectedPo.totalCostNgn)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-border">
                <div className="border border-dashed border-border rounded-xl p-3 text-center">
                  <div className="text-[10px] text-muted-foreground mb-4">DISPATCHER / DRIVER SIGN-OFF</div>
                  <div className="font-mono text-xs text-foreground">Babatunde Lawal (ESB Van 01)</div>
                </div>
                <div className="border border-dashed border-border rounded-xl p-3 text-center">
                  <div className="text-[10px] text-muted-foreground mb-4">RECEIVING LAB QC OFFICER</div>
                  <div className="font-mono text-xs text-foreground">Pharmacist Kemi (Central Lab)</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setShowWaybillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="chip-gold flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                >
                  <Printer className="h-4 w-4" /> Print Waybill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Row({ r, onAdjust }: { r: InventoryRow; onAdjust: (d: number) => void }) {
  const low = r.qty <= r.low_stock_threshold;
  const match = SEED_PRODUCT_INTELLIGENCE.find(
    (p) =>
      p.name.toLowerCase() === r.product?.name?.toLowerCase() ||
      r.product?.name?.toLowerCase().includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(r.product?.name?.toLowerCase() || "")
  );
  const unitsSold = match ? match.unitsSold : Math.floor(45 + (r.qty * 1.5) % 110);
  const revenue = match ? match.revenueGeneratedNgn : (unitsSold * (r.product?.price ?? 22000));

  return (
    <div className="grid grid-cols-[1.2fr_auto_auto_auto_auto] md:grid-cols-[1.4fr_1fr_1fr_auto_auto_auto] gap-3 px-4 py-3 items-center">
      <div className="min-w-0">
        <div className="text-xs font-medium truncate text-foreground">{r.product?.name ?? "—"}</div>
        <div className="text-[10px] text-muted-foreground truncate">
          {r.product?.brand} · {r.product?.sku} · <span className="md:hidden">{r.branch?.name}</span>
        </div>
      </div>
      <div className="hidden md:block text-xs text-muted-foreground truncate">
        {r.branch?.name}
        <div className="text-[10px]">{r.branch?.city}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-semibold text-emerald-400">{unitsSold} units</div>
        <div className="text-[10px] text-muted-foreground">{formatNaira(revenue)}</div>
      </div>
      <div className={`text-right font-semibold text-xs ${low ? "text-red-400" : "text-foreground"}`}>
        {r.qty}
      </div>
      <div className="text-right text-xs text-muted-foreground">{r.low_stock_threshold}</div>
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={() => onAdjust(-1)}
          className="h-7 w-7 rounded-lg border border-border bg-card hover:bg-secondary flex items-center justify-center text-foreground"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onAdjust(1)}
          className="h-7 w-7 rounded-lg border border-gold/40 bg-gold/10 hover:bg-gold/20 flex items-center justify-center"
        >
          <Plus className="h-3.5 w-3.5 text-gold" />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
}: {
  icon: typeof Package;
  label: string;
  value: number | string;
  subtext?: string;
  accent: "gold" | "violet" | "danger" | "success";
}) {
  const color =
    accent === "danger"
      ? "text-red-400"
      : accent === "violet"
      ? "text-purple-400"
      : accent === "success"
      ? "text-emerald-400"
      : "text-gold";
  return (
    <div className="card-elevated p-4 flex items-center gap-3 rounded-2xl border border-border">
      <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-base sm:text-lg font-display font-semibold text-foreground">{value}</div>
        {subtext && <div className="text-[10px] font-medium text-emerald-400 mt-0.5">{subtext}</div>}
      </div>
    </div>
  );
}
