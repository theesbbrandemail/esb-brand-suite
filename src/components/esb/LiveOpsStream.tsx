import { useState, useEffect } from "react";
import {
  Activity, Zap, CheckCircle2, TrendingUp, DollarSign,
  ShieldCheck, Sparkles, MapPin, ArrowRight
} from "lucide-react";
import { formatNaira } from "@/lib/currency";

export interface SimulatedEvent {
  id: string;
  type: "payment" | "procedure" | "ai_exec" | "geo_attendance" | "lead";
  message: string;
  amountNgn?: number;
  branch: string;
  timeAgo: string;
}

const SEED_EVENTS: SimulatedEvent[] = [
  {
    id: "ev-1",
    type: "payment",
    message: "Monnify Settlement: ₦1,850,000 credited for Bespoke Skincare annual regimen",
    amountNgn: 1850000,
    branch: "Port Harcourt Flagship",
    timeAgo: "12s ago",
  },
  {
    id: "ev-2",
    type: "procedure",
    message: "Dr. Ngozi Eze completed Stem Cell Infusion procedure in Suite 2",
    branch: "Port Harcourt Flagship",
    timeAgo: "45s ago",
  },
  {
    id: "ev-3",
    type: "ai_exec",
    message: "Super Gemini 3.8 Flash auto-dispatched batch #48 reorder to Formulation Depot",
    branch: "Port Harcourt Depot",
    timeAgo: "1m ago",
  },
  {
    id: "ev-4",
    type: "geo_attendance",
    message: "GPS Geofence confirmed: Nurse Amina Bello on duty at Port Harcourt (24m perimeter)",
    branch: "Port Harcourt Flagship",
    timeAgo: "2m ago",
  },
  {
    id: "ev-5",
    type: "lead",
    message: "New VIP Lead: Chief Adeleke requested ₦2,450,000 protocol consultation",
    amountNgn: 2450000,
    branch: "Maitama Abuja",
    timeAgo: "3m ago",
  },
];

export function LiveOpsStream() {
  const [events, setEvents] = useState<SimulatedEvent[]>(SEED_EVENTS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  // Automatically cycle and generate new live telemetry events
  useEffect(() => {
    if (!isProcessing) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % events.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [events.length, isProcessing]);

  const current = events[activeIdx] || events[0];

  return (
    <div className="w-full card-elevated p-2.5 sm:px-4 rounded-xl border border-gold/30 bg-background/90 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md relative overflow-hidden">
      {/* Background Pulse Glow */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-gold via-yellow-400 to-amber-600" />

      {/* Left indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
        </span>
        <span className="font-mono text-[10px] tracking-wider uppercase text-gold font-bold flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Auto Data Engine Active
        </span>
        <span className="text-muted-foreground text-[10px] hidden md:inline">· NGN (₦) Cloud Sync</span>
      </div>

      {/* Center Event Ticker */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-2 text-center sm:text-left">
        <div className="truncate text-xs text-foreground/90 flex items-center gap-2 animate-fade-in key={current.id}">
          <span className="text-muted-foreground text-[11px] font-mono shrink-0">[{current.branch}]</span>
          <span className="font-medium text-foreground truncate">{current.message}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">{current.timeAgo}</span>
        </div>
      </div>

      {/* Right Action / Toggle */}
      <div className="flex items-center gap-2 shrink-0 text-[11px]">
        <button
          onClick={() => {
            const nextIdx = (activeIdx + 1) % events.length;
            setActiveIdx(nextIdx);
          }}
          className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
        >
          <span>Next Stream</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
