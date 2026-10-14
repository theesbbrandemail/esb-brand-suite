import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  LineChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Truck,
  Package,
  Layers,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Download,
  Filter,
  BarChart3,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/currency";
import { getStoredDeliveries } from "@/lib/storage";

// ============================================================================
// COLOR PALETTE — LUXURY GOLD & VIOLET THEME
// ============================================================================
export const CHART_COLORS = {
  goldPrimary: "#D4AF37",
  goldLight: "#F5D061",
  goldDark: "#9A7B1C",
  goldGlow: "rgba(212, 175, 55, 0.25)",

  violetPrimary: "#8B5CF6",
  violetLight: "#C084FC",
  violetDark: "#6D28D9",
  violetGlow: "rgba(139, 92, 246, 0.25)",

  accentRose: "#F43F5E",
  accentEmerald: "#10B981",
  accentAmber: "#F59E0B",
  cardBg: "rgba(26, 22, 43, 0.85)",
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  gridStroke: "rgba(255, 255, 255, 0.06)",
};

// ============================================================================
// DATA MODELS & PRE-CONFIGURED TELEMETRY
// ============================================================================
export type SubBrandFilter = "all" | "derma" | "skincare-kitchen" | "skinclinic";

export interface DayFleetTelemetry {
  day: string;
  dayFull: string;
  date: string;
  totalDeliveries: number;
  onTimeRate: number; // Percentage
  avgTransitHours: number;
  dermaDeliveries: number;
  kitchenDeliveries: number;
  clinicDeliveries: number;
  sprinterVans: number;
  expressBikes: number;
  fleetEfficiency: number; // Out of 100
}

export interface SubBrandStockItem {
  id: string;
  name: string;
  subBrand: "derma" | "skincare-kitchen" | "skinclinic";
  subBrandLabel: string;
  category: string;
  currentStock: number;
  safetyThreshold: number;
  maxCapacity: number;
  unitCostNgn: number;
  hub: "Port Harcourt Depot" | "Maitama Abuja Hub";
  turnoverDays: number;
  status: "optimal" | "healthy" | "low_stock";
}

// 7-day weekly telemetry for the fleet
const WEEKLY_FLEET_DATA: DayFleetTelemetry[] = [
  {
    day: "Mon",
    dayFull: "Monday",
    date: "Oct 07",
    totalDeliveries: 54,
    onTimeRate: 98.1,
    avgTransitHours: 2.5,
    dermaDeliveries: 24,
    kitchenDeliveries: 18,
    clinicDeliveries: 12,
    sprinterVans: 6,
    expressBikes: 14,
    fleetEfficiency: 96,
  },
  {
    day: "Tue",
    dayFull: "Tuesday",
    date: "Oct 08",
    totalDeliveries: 68,
    onTimeRate: 97.4,
    avgTransitHours: 2.8,
    dermaDeliveries: 31,
    kitchenDeliveries: 23,
    clinicDeliveries: 14,
    sprinterVans: 8,
    expressBikes: 16,
    fleetEfficiency: 95,
  },
  {
    day: "Wed",
    dayFull: "Wednesday",
    date: "Oct 09",
    totalDeliveries: 75,
    onTimeRate: 99.2,
    avgTransitHours: 2.2,
    dermaDeliveries: 34,
    kitchenDeliveries: 26,
    clinicDeliveries: 15,
    sprinterVans: 8,
    expressBikes: 18,
    fleetEfficiency: 98,
  },
  {
    day: "Thu",
    dayFull: "Thursday",
    date: "Oct 10",
    totalDeliveries: 82,
    onTimeRate: 98.8,
    avgTransitHours: 2.4,
    dermaDeliveries: 38,
    kitchenDeliveries: 28,
    clinicDeliveries: 16,
    sprinterVans: 9,
    expressBikes: 19,
    fleetEfficiency: 97,
  },
  {
    day: "Fri",
    dayFull: "Friday",
    date: "Oct 11",
    totalDeliveries: 96,
    onTimeRate: 97.9,
    avgTransitHours: 3.1,
    dermaDeliveries: 42,
    kitchenDeliveries: 34,
    clinicDeliveries: 20,
    sprinterVans: 10,
    expressBikes: 22,
    fleetEfficiency: 94,
  },
  {
    day: "Sat",
    dayFull: "Saturday",
    date: "Oct 12",
    totalDeliveries: 88,
    onTimeRate: 99.5,
    avgTransitHours: 1.9,
    dermaDeliveries: 36,
    kitchenDeliveries: 32,
    clinicDeliveries: 20,
    sprinterVans: 9,
    expressBikes: 20,
    fleetEfficiency: 99,
  },
  {
    day: "Sun",
    dayFull: "Sunday",
    date: "Oct 13",
    totalDeliveries: 45,
    onTimeRate: 100.0,
    avgTransitHours: 1.6,
    dermaDeliveries: 18,
    kitchenDeliveries: 16,
    clinicDeliveries: 11,
    sprinterVans: 5,
    expressBikes: 10,
    fleetEfficiency: 100,
  },
];

// Rich inventory stock items across the three sub-brands
const SUB_BRAND_INVENTORY: SubBrandStockItem[] = [
  // Derma Aesthetics
  {
    id: "DA-01",
    name: "Exosome Cell Serum 30ml",
    subBrand: "derma",
    subBrandLabel: "Derma Aesthetics",
    category: "Active Serums",
    currentStock: 1450,
    safetyThreshold: 500,
    maxCapacity: 2000,
    unitCostNgn: 45000,
    hub: "Port Harcourt Depot",
    turnoverDays: 14,
    status: "healthy",
  },
  {
    id: "DA-02",
    name: "TCA 20% Clinical Peel Vials",
    subBrand: "derma",
    subBrandLabel: "Derma Aesthetics",
    category: "Chemical Peels",
    currentStock: 820,
    safetyThreshold: 400,
    maxCapacity: 1200,
    unitCostNgn: 65000,
    hub: "Maitama Abuja Hub",
    turnoverDays: 18,
    status: "healthy",
  },
  {
    id: "DA-03",
    name: "Hyaluronic Nano-Infusion",
    subBrand: "derma",
    subBrandLabel: "Derma Aesthetics",
    category: "Active Serums",
    currentStock: 2100,
    safetyThreshold: 800,
    maxCapacity: 2500,
    unitCostNgn: 32000,
    hub: "Port Harcourt Depot",
    turnoverDays: 10,
    status: "optimal",
  },
  {
    id: "DA-04",
    name: "Liposomal Vitamin C 25%",
    subBrand: "derma",
    subBrandLabel: "Derma Aesthetics",
    category: "Antioxidants",
    currentStock: 480,
    safetyThreshold: 450,
    maxCapacity: 1500,
    unitCostNgn: 38000,
    hub: "Port Harcourt Depot",
    turnoverDays: 6,
    status: "low_stock",
  },
  {
    id: "DA-05",
    name: "Peptide Barrier Cream 50ml",
    subBrand: "derma",
    subBrandLabel: "Derma Aesthetics",
    category: "Moisturizers",
    currentStock: 1650,
    safetyThreshold: 600,
    maxCapacity: 2200,
    unitCostNgn: 28000,
    hub: "Port Harcourt Depot",
    turnoverDays: 15,
    status: "healthy",
  },

  // Skincare Kitchen
  {
    id: "SK-01",
    name: "Whipped Shea Cocoa Souffle",
    subBrand: "skincare-kitchen",
    subBrandLabel: "Skincare Kitchen",
    category: "Body Care",
    currentStock: 3400,
    safetyThreshold: 1200,
    maxCapacity: 4500,
    unitCostNgn: 18500,
    hub: "Port Harcourt Depot",
    turnoverDays: 8,
    status: "optimal",
  },
  {
    id: "SK-02",
    name: "Turmeric Papaya Polish",
    subBrand: "skincare-kitchen",
    subBrandLabel: "Skincare Kitchen",
    category: "Exfoliants",
    currentStock: 2650,
    safetyThreshold: 900,
    maxCapacity: 3500,
    unitCostNgn: 22000,
    hub: "Maitama Abuja Hub",
    turnoverDays: 11,
    status: "healthy",
  },
  {
    id: "SK-03",
    name: "Cold-Pressed Rosehip Elixir",
    subBrand: "skincare-kitchen",
    subBrandLabel: "Skincare Kitchen",
    category: "Facial Oils",
    currentStock: 1950,
    safetyThreshold: 750,
    maxCapacity: 2600,
    unitCostNgn: 27000,
    hub: "Port Harcourt Depot",
    turnoverDays: 13,
    status: "healthy",
  },
  {
    id: "SK-04",
    name: "African Black Soap Wash",
    subBrand: "skincare-kitchen",
    subBrandLabel: "Skincare Kitchen",
    category: "Cleansers",
    currentStock: 3100,
    safetyThreshold: 1000,
    maxCapacity: 4000,
    unitCostNgn: 14500,
    hub: "Port Harcourt Depot",
    turnoverDays: 7,
    status: "optimal",
  },
  {
    id: "SK-05",
    name: "Hibiscus Glow Mist 100ml",
    subBrand: "skincare-kitchen",
    subBrandLabel: "Skincare Kitchen",
    category: "Toners",
    currentStock: 720,
    safetyThreshold: 650,
    maxCapacity: 2000,
    unitCostNgn: 16000,
    hub: "Port Harcourt Depot",
    turnoverDays: 5,
    status: "low_stock",
  },

  // Skin Clinic
  {
    id: "SC-01",
    name: "Sterile Cartridges (36-Pin)",
    subBrand: "skinclinic",
    subBrandLabel: "Skin Clinic",
    category: "Procedures",
    currentStock: 980,
    safetyThreshold: 450,
    maxCapacity: 1500,
    unitCostNgn: 52000,
    hub: "Port Harcourt Depot",
    turnoverDays: 12,
    status: "healthy",
  },
  {
    id: "SC-02",
    name: "Topical Lidocaine Gel 30g",
    subBrand: "skinclinic",
    subBrandLabel: "Skin Clinic",
    category: "Clinical Consumables",
    currentStock: 420,
    safetyThreshold: 400,
    maxCapacity: 1000,
    unitCostNgn: 34000,
    hub: "Maitama Abuja Hub",
    turnoverDays: 4,
    status: "low_stock",
  },
  {
    id: "SC-03",
    name: "PRP Centrifuge Tubes (Gold)",
    subBrand: "skinclinic",
    subBrandLabel: "Skin Clinic",
    category: "Clinical Consumables",
    currentStock: 860,
    safetyThreshold: 350,
    maxCapacity: 1300,
    unitCostNgn: 48000,
    hub: "Port Harcourt Depot",
    turnoverDays: 16,
    status: "healthy",
  },
  {
    id: "SC-04",
    name: "Post-Laser Recovery Balm",
    subBrand: "skinclinic",
    subBrandLabel: "Skin Clinic",
    category: "Aftercare",
    currentStock: 1250,
    safetyThreshold: 400,
    maxCapacity: 1800,
    unitCostNgn: 39000,
    hub: "Port Harcourt Depot",
    turnoverDays: 14,
    status: "healthy",
  },
  {
    id: "SC-05",
    name: "Chemical Peel Neutralizer",
    subBrand: "skinclinic",
    subBrandLabel: "Skin Clinic",
    category: "Procedures",
    currentStock: 740,
    safetyThreshold: 300,
    maxCapacity: 1100,
    unitCostNgn: 30000,
    hub: "Port Harcourt Depot",
    turnoverDays: 19,
    status: "healthy",
  },
];

// ============================================================================
// CUSTOM TOOLTIP COMPONENT FOR RECHARTS
// ============================================================================
function CustomFleetTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const data: DayFleetTelemetry = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl border border-[#D4AF37]/50 bg-[#141024]/95 p-3.5 shadow-2xl backdrop-blur-md text-xs text-foreground min-w-[240px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
        <div className="font-display font-bold text-sm text-[#F5D061] flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{data.dayFull} ({data.date})</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
          {data.onTimeRate}% On-Time
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3 w-3 text-[#D4AF37]" />
            Total Deliveries:
          </span>
          <span className="font-bold text-foreground font-mono">{data.totalDeliveries} runs</span>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/5 text-[10px]">
          <div className="p-1 rounded bg-[#D4AF37]/10 text-center">
            <span className="block text-[#D4AF37] font-bold">{data.dermaDeliveries}</span>
            <span className="text-[9px] text-muted-foreground">Derma</span>
          </div>
          <div className="p-1 rounded bg-[#8B5CF6]/15 text-center">
            <span className="block text-[#C084FC] font-bold">{data.kitchenDeliveries}</span>
            <span className="text-[9px] text-muted-foreground">Kitchen</span>
          </div>
          <div className="p-1 rounded bg-[#A855F7]/15 text-center">
            <span className="block text-[#E9D5FF] font-bold">{data.clinicDeliveries}</span>
            <span className="text-[9px] text-muted-foreground">Clinic</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[#C084FC]" />
            Avg Transit Time:
          </span>
          <span className="font-mono text-[#C084FC] font-semibold">{data.avgTransitHours} hrs</span>
        </div>

        <div className="flex justify-between items-center text-muted-foreground">
          <span>Active Fleet Assets:</span>
          <span className="font-mono text-foreground">
            {data.sprinterVans} Vans | {data.expressBikes} Bikes
          </span>
        </div>
      </div>
    </div>
  );
}

function CustomInventoryTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const item: SubBrandStockItem = payload[0]?.payload;
  if (!item) return null;

  const totalValueNgn = item.currentStock * item.unitCostNgn;
  const bufferPercent = Math.round(((item.currentStock - item.safetyThreshold) / item.safetyThreshold) * 100);

  return (
    <div className="rounded-xl border border-[#8B5CF6]/50 bg-[#141024]/95 p-3.5 shadow-2xl backdrop-blur-md text-xs text-foreground min-w-[260px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
        <div>
          <div className="font-display font-bold text-sm text-[#F5D061]">{item.name}</div>
          <div className="text-[10px] text-[#C084FC] font-medium">{item.subBrandLabel} • {item.category}</div>
        </div>
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
            item.status === "low_stock"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : item.status === "healthy"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/30"
          }`}
        >
          {item.status.replace("_", " ")}
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current Stock:</span>
          <span className="font-bold text-[#F5D061] font-mono text-sm">{item.currentStock.toLocaleString()} units</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Safety Reorder Point:</span>
          <span className="font-mono text-[#C084FC]">{item.safetyThreshold.toLocaleString()} units</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Safety Buffer:</span>
          <span className={`font-mono ${bufferPercent < 15 ? "text-rose-400 font-bold" : "text-emerald-400"}`}>
            {bufferPercent > 0 ? `+${bufferPercent}%` : `${bufferPercent}%`} above buffer
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-white/5 pt-1.5">
          <span className="text-muted-foreground">Storage Hub:</span>
          <span className="text-foreground font-medium text-[10px]">{item.hub}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Valuation (₦):</span>
          <span className="font-mono text-emerald-400 font-semibold">{formatNaira(totalValueNgn)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================
export interface WeeklyFleetInventoryChartProps {
  initialSubBrand?: SubBrandFilter;
  compact?: boolean;
  className?: string;
}

export function WeeklyFleetInventoryChart({
  initialSubBrand = "all",
  compact = false,
  className = "",
}: WeeklyFleetInventoryChartProps) {
  const [selectedSubBrand, setSelectedSubBrand] = useState<SubBrandFilter>(initialSubBrand);
  const [activeTab, setActiveTab] = useState<"fleet" | "inventory" | "combined" | "hubs">("combined");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter stock data based on active brand
  const filteredStock = useMemo(() => {
    if (selectedSubBrand === "all") return SUB_BRAND_INVENTORY;
    return SUB_BRAND_INVENTORY.filter((i) => i.subBrand === selectedSubBrand);
  }, [selectedSubBrand]);

  // Aggregate stats
  const totalFleetDeliveries = useMemo(() => {
    return WEEKLY_FLEET_DATA.reduce((acc, d) => {
      if (selectedSubBrand === "derma") return acc + d.dermaDeliveries;
      if (selectedSubBrand === "skincare-kitchen") return acc + d.kitchenDeliveries;
      if (selectedSubBrand === "skinclinic") return acc + d.clinicDeliveries;
      return acc + d.totalDeliveries;
    }, 0);
  }, [selectedSubBrand]);

  const avgWeeklyOnTime = useMemo(() => {
    const sum = WEEKLY_FLEET_DATA.reduce((acc, d) => acc + d.onTimeRate, 0);
    return (sum / WEEKLY_FLEET_DATA.length).toFixed(1);
  }, []);

  const totalStockUnits = useMemo(() => {
    return filteredStock.reduce((acc, item) => acc + item.currentStock, 0);
  }, [filteredStock]);

  const totalStockValuation = useMemo(() => {
    return filteredStock.reduce((acc, item) => acc + item.currentStock * item.unitCostNgn, 0);
  }, [filteredStock]);

  const lowStockCount = useMemo(() => {
    return filteredStock.filter((i) => i.status === "low_stock").length;
  }, [filteredStock]);

  // Regional warehouse distribution rollup
  const hubDistribution = useMemo(() => {
    const hubs: Record<string, { hub: string; units: number; itemsCount: number; valueNgn: number }> = {
      "Port Harcourt Depot": { hub: "Port Harcourt Depot", units: 0, itemsCount: 0, valueNgn: 0 },
      "Maitama Abuja Hub": { hub: "Maitama Abuja Hub", units: 0, itemsCount: 0, valueNgn: 0 },
    };

    filteredStock.forEach((it) => {
      if (hubs[it.hub]) {
        hubs[it.hub].units += it.currentStock;
        hubs[it.hub].itemsCount += 1;
        hubs[it.hub].valueNgn += it.currentStock * it.unitCostNgn;
      }
    });

    return Object.values(hubs);
  }, [filteredStock]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Telemetry Synced!", {
        description: "Google Maps GPS fleet velocity and live branch inventories updated.",
      });
    }, 600);
  };

  const handleExportCsv = () => {
    const headers = "Day,Date,TotalDeliveries,OnTimePct,AvgTransitHours,Derma,Kitchen,Clinic\n";
    const rows = WEEKLY_FLEET_DATA.map(
      (d) =>
        `${d.dayFull},${d.date},${d.totalDeliveries},${d.onTimeRate}%,${d.avgTransitHours}h,${d.dermaDeliveries},${d.kitchenDeliveries},${d.clinicDeliveries}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ESB-Weekly-Fleet-Inventory-${selectedSubBrand}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Fleet & Inventory Telemetry Exported", {
      description: "Downloaded CSV report for executive performance review.",
    });
  };

  return (
    <div
      className={`rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#1E1933]/90 via-[#181428]/90 to-[#120E20]/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden ${className}`}
    >
      {/* Decorative Gold & Violet Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#8B5CF6]/15 blur-3xl pointer-events-none" />

      {/* ==================================================================== */}
      {/* HEADER SECTION & CONTROLS */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#F5D061] shadow-md">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-display font-bold text-foreground tracking-tight">
                  Weekly Delivery Fleet & Inventory Visualizer
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE RECHARTS
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sub-brand fleet dispatches across Lagos & Abuja paired with active stock buffers in Nigerian Naira (₦).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Refresh, CSV Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/60 hover:bg-secondary border border-border text-foreground flex items-center gap-1.5 transition-all"
            title="Refresh live telemetry stream"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#F5D061] ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#F5D061] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUB-BRAND SELECTION PILLS & VIEW MODE TABS */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4">
        {/* Sub-Brand Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All Sub-Brands (Consolidated)" },
            { key: "derma", label: "Derma Aesthetics" },
            { key: "skincare-kitchen", label: "Skincare Kitchen" },
            { key: "skinclinic", label: "Skin Clinic" },
          ].map((brand) => {
            const active = selectedSubBrand === brand.key;
            return (
              <button
                key={brand.key}
                onClick={() => setSelectedSubBrand(brand.key as SubBrandFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-black font-bold shadow-md shadow-[#D4AF37]/20"
                    : "bg-[#1C172E]/80 text-muted-foreground hover:text-foreground hover:bg-[#251F3D] border border-white/5"
                }`}
              >
                {brand.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141024] border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("combined")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "combined"
                ? "bg-[#8B5CF6] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dual View
          </button>
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "fleet"
                ? "bg-[#D4AF37] text-black font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fleet Performance
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "inventory"
                ? "bg-[#8B5CF6] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setActiveTab("hubs")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "hubs"
                ? "bg-[#D4AF37] text-black font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hubs Distribution
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TOP KPI PERFORMANCE TILES WITH GOLD & VIOLET STYLING */}
      {/* ==================================================================== */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
        {/* Fleet Runs */}
        <div className="p-3.5 rounded-2xl bg-[#1D1730]/70 border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between text-[11px] text-[#F5D061] font-medium uppercase tracking-wider">
            <span>Weekly Dispatches</span>
            <Truck className="h-3.5 w-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-foreground mt-1">
            {totalFleetDeliveries} <span className="text-xs text-muted-foreground font-normal">runs</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{avgWeeklyOnTime}% on-time SLA</span>
          </div>
        </div>

        {/* Active Stock Units */}
        <div className="p-3.5 rounded-2xl bg-[#1D1730]/70 border border-[#8B5CF6]/30 shadow-md">
          <div className="flex items-center justify-between text-[11px] text-[#C084FC] font-medium uppercase tracking-wider">
            <span>Current Stock</span>
            <Package className="h-3.5 w-3.5 text-[#8B5CF6]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-foreground mt-1">
            {totalStockUnits.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">units</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {filteredStock.length} monitored SKUs
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="p-3.5 rounded-2xl bg-[#1D1730]/70 border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between text-[11px] text-[#F5D061] font-medium uppercase tracking-wider">
            <span>Inventory Valuation</span>
            <span className="font-mono text-[#D4AF37]">₦ NGN</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-display text-[#F5D061] mt-1 truncate">
            {formatNaira(totalStockValuation)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Lagos, Abuja & PH Warehouses
          </div>
        </div>

        {/* Critical Reorder Warnings */}
        <div className="p-3.5 rounded-2xl bg-[#1D1730]/70 border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            <span>Reorder Attention</span>
            <AlertTriangle className={`h-3.5 w-3.5 ${lowStockCount > 0 ? "text-amber-400" : "text-emerald-400"}`} />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-foreground mt-1">
            {lowStockCount}{" "}
            <span className="text-xs text-muted-foreground font-normal">
              {lowStockCount === 1 ? "SKU low" : "SKUs low"}
            </span>
          </div>
          <div className="text-[10px] text-amber-300 mt-0.5">
            {lowStockCount > 0 ? "Reorder scan recommended" : "All SKUs above buffer"}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHART SECTION: COMBINED OR INDIVIDUAL VIEWS */}
      {/* ==================================================================== */}
      <div className="relative z-10 pt-6 space-y-6">
        {/* VIEW 1: FLEET PERFORMANCE (ComposedChart with Gold Bars + Violet On-Time Line) */}
        {(activeTab === "combined" || activeTab === "fleet") && (
          <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-sm font-display font-bold text-[#F5D061] flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#D4AF37]" />
                  <span>Weekly Delivery Fleet Telemetry (Mon – Sun)</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Daily dispatched shipments (Gold & Violet bars) paired with on-time delivery success rate % (Gold trend line).
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#D4AF37]" />
                  <span>Derma Aesthetics</span>
                </span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#8B5CF6]" />
                  <span>Skincare Kitchen</span>
                </span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#C084FC]" />
                  <span>Skin Clinic</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#F5D061] font-semibold">
                  <span className="h-1.5 w-3 rounded-full bg-[#F5D061]" />
                  <span>On-Time Rate %</span>
                </span>
              </div>
            </div>

            <div className="w-full h-[300px] sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={WEEKLY_FLEET_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldFleetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5D061" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="violetFleetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="lightVioletGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#9333EA" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="fleetAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridStroke} vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    tick={{ fill: "#9E9E9E", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#D4AF37"
                    tick={{ fill: "#D4AF37", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[90, 100]}
                    stroke="#C084FC"
                    tick={{ fill: "#C084FC", fontSize: 10 }}
                    unit="%"
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomFleetTooltip />} />

                  {/* If "all" is selected, render stacked bars for the three sub-brands */}
                  {selectedSubBrand === "all" ? (
                    <>
                      <Bar
                        yAxisId="left"
                        dataKey="dermaDeliveries"
                        name="Derma Aesthetics"
                        stackId="a"
                        fill="url(#goldFleetGrad)"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="kitchenDeliveries"
                        name="Skincare Kitchen"
                        stackId="a"
                        fill="url(#violetFleetGrad)"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="clinicDeliveries"
                        name="Skin Clinic"
                        stackId="a"
                        fill="url(#lightVioletGrad)"
                        radius={[4, 4, 0, 0]}
                      />
                    </>
                  ) : (
                    <Bar
                      yAxisId="left"
                      dataKey={
                        selectedSubBrand === "derma"
                          ? "dermaDeliveries"
                          : selectedSubBrand === "skincare-kitchen"
                            ? "kitchenDeliveries"
                            : "clinicDeliveries"
                      }
                      name="Sub-Brand Dispatches"
                      fill="url(#goldFleetGrad)"
                      radius={[4, 4, 0, 0]}
                    />
                  )}

                  {/* On-Time Rate Line plotted on right axis */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="onTimeRate"
                    name="On-Time Rate %"
                    stroke="#F5D061"
                    strokeWidth={3}
                    dot={{ fill: "#D4AF37", r: 4, strokeWidth: 2, stroke: "#120E20" }}
                    activeDot={{ r: 6, fill: "#FFFFFF", stroke: "#D4AF37" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 2: SUB-BRAND INVENTORY LEVELS (BarChart Current vs Safety Threshold) */}
        {(activeTab === "combined" || activeTab === "inventory") && (
          <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-sm font-display font-bold text-[#C084FC] flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#8B5CF6]" />
                  <span>
                    Sub-Brand Stock Levels vs Reorder Thresholds ({filteredStock.length} SKUs)
                  </span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Available inventory units in Gold (<span className="text-[#F5D061]">■</span>) compared against minimum safe reorder point in Violet (<span className="text-[#8B5CF6]">■</span>).
                </p>
              </div>

              {/* Threshold Indicators */}
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#D4AF37]" />
                  <span>Current Available Stock</span>
                </span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#8B5CF6]" />
                  <span>Safety Reorder Point</span>
                </span>
              </div>
            </div>

            <div className="w-full h-[320px] sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredStock} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <defs>
                    <linearGradient id="invGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5D061" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.65} />
                    </linearGradient>
                    <linearGradient id="invVioletGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridStroke} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    tick={{ fill: "#A3A3A3", fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={50}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    stroke="#D4AF37"
                    tick={{ fill: "#D4AF37", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomInventoryTooltip />} />

                  {/* Safety Buffer Reference Line */}
                  <ReferenceLine
                    y={500}
                    stroke="#F43F5E"
                    strokeDasharray="4 4"
                    label={{
                      value: "Critical Alert Buffer (500 units)",
                      fill: "#F43F5E",
                      fontSize: 10,
                      position: "insideTopRight",
                    }}
                  />

                  <Bar
                    dataKey="currentStock"
                    name="Current Available Units"
                    fill="url(#invGoldGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="safetyThreshold"
                    name="Safety Reorder Point"
                    fill="url(#invVioletGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: REGIONAL HUBS DISTRIBUTION (Victoria Island, Maitama Abuja, Lekki, Port Harcourt) */}
        {(activeTab === "hubs" || activeTab === "combined") && (
          <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-sm font-display font-bold text-[#F5D061] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  <span>Regional Warehouse Stock Distribution</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Inventory units decentralized across Port Harcourt Flagship Depot and Maitama Abuja Hub.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
              {/* Bar Chart of Hubs */}
              <div className="lg:col-span-2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hubDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hubGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C084FC" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridStroke} vertical={false} />
                    <XAxis
                      dataKey="hub"
                      stroke="#888888"
                      tick={{ fill: "#A3A3A3", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                      stroke="#C084FC"
                      tick={{ fill: "#C084FC", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        `${Number(val).toLocaleString()} units`,
                        name === "units" ? "Stock on Hand" : name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#141024",
                        borderColor: "#D4AF37",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="units" name="Stock Units" fill="url(#hubGrad)" radius={[6, 6, 0, 0]}>
                      {hubDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? "url(#goldFleetGrad)" : "url(#violetFleetGrad)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Hub Detail Cards */}
              <div className="space-y-2">
                {hubDistribution.map((h, i) => (
                  <div
                    key={h.hub}
                    className="p-2.5 rounded-xl bg-[#1C172E] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          i % 2 === 0 ? "bg-[#D4AF37]" : "bg-[#8B5CF6]"
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-foreground">{h.hub}</div>
                        <div className="text-[10px] text-muted-foreground">{h.itemsCount} SKUs stocked</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#F5D061]">{h.units.toLocaleString()} units</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{formatNaira(h.valueNgn)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* FOOTER INTELLIGENCE BAR */}
      {/* ==================================================================== */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#F5D061]" />
          <span>
            Connected to <strong>Gemini AI Auto-Restock</strong> & Real-Time Google Maps Fleet API.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span>Active Sub-Brand: <strong className="text-[#F5D061]">{selectedSubBrand.toUpperCase()}</strong></span>
          <span>•</span>
          <span>SLA Target: <strong className="text-emerald-400">&gt;98%</strong></span>
        </div>
      </div>
    </div>
  );
}
