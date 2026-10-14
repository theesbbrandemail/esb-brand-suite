import { useEffect, useState } from "react";
import { Building2, MapPin, ChevronDown, Check, Zap } from "lucide-react";
import {
  getSelectedBranch,
  setSelectedBranch,
  ESB_ACTIVE_BRANCHES,
  type ActiveBranchKey,
} from "@/lib/branch-manager";
import { toast } from "sonner";

export function GlobalBranchSwitch({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [currentBranch, setCurrentBranch] = useState<ActiveBranchKey>(() => getSelectedBranch());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleBranchChange = (e: Event) => {
      const custom = e as CustomEvent<{ branch: ActiveBranchKey }>;
      if (custom.detail?.branch) {
        setCurrentBranch(custom.detail.branch);
      } else {
        setCurrentBranch(getSelectedBranch());
      }
    };
    window.addEventListener("esb_branch_changed", handleBranchChange);
    return () => window.removeEventListener("esb_branch_changed", handleBranchChange);
  }, []);

  const handleSelect = (b: ActiveBranchKey) => {
    setSelectedBranch(b);
    setCurrentBranch(b);
    setIsOpen(false);
    const branchLabel = b === "ph" ? "Port Harcourt Flagship" : b === "abuja" ? "Abuja Executive Clinic" : "All Branches (Port Harcourt & Abuja)";
    toast.success(`Active Branch Switched: ${branchLabel}`, {
      description: "All client pipelines, inventory feeds, live staff telemetry, and metrics updated.",
    });
  };

  const branchTitle =
    currentBranch === "ph"
      ? "Port Harcourt"
      : currentBranch === "abuja"
      ? "Abuja"
      : "All Branches";

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {compact ? (
        // Compact pill toggle
        <div className="flex items-center p-0.5 rounded-full bg-secondary/80 border border-border text-xs">
          <button
            type="button"
            onClick={() => handleSelect("all")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              currentBranch === "all"
                ? "bg-gold text-black font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="View both Port Harcourt & Abuja"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handleSelect("ph")}
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-all ${
              currentBranch === "ph"
                ? "bg-emerald-500 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Switch to Port Harcourt Flagship"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            PH
          </button>
          <button
            type="button"
            onClick={() => handleSelect("abuja")}
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-all ${
              currentBranch === "abuja"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Switch to Abuja Executive Clinic"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
            Abuja
          </button>
        </div>
      ) : (
        // Full interactive dropdown button
        <>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/80 border border-border hover:border-gold/40 text-foreground transition-all shadow-sm"
            aria-label="Switch active clinic branch"
          >
            <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
            <span className="max-w-[100px] sm:max-w-none truncate font-medium">{branchTitle}</span>
            <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-muted-foreground font-mono">
              2 Active
            </span>
            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-border/80 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gold uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Operational Branches
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live GPS
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Select active branch to filter live stock, appointments, CRM & sales.
                  </p>
                </div>

                {/* Option 1: All Branches */}
                <button
                  type="button"
                  onClick={() => handleSelect("all")}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                    currentBranch === "all"
                      ? "bg-gold/15 text-gold border border-gold/40 font-semibold"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gold/20 flex items-center justify-center text-gold font-bold">
                      ALL
                    </div>
                    <div>
                      <div className="font-semibold text-xs">All Branches Unified</div>
                      <div className="text-[10px] text-muted-foreground">Port Harcourt + Abuja consolidated</div>
                    </div>
                  </div>
                  {currentBranch === "all" && <Check className="h-4 w-4 text-gold" />}
                </button>

                {/* Option 2: Port Harcourt */}
                <button
                  type="button"
                  onClick={() => handleSelect("ph")}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all mt-1 ${
                    currentBranch === "ph"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      PH
                    </div>
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        {ESB_ACTIVE_BRANCHES.ph.name}
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                          GRA II
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{ESB_ACTIVE_BRANCHES.ph.address}</div>
                    </div>
                  </div>
                  {currentBranch === "ph" && <Check className="h-4 w-4 text-emerald-400" />}
                </button>

                {/* Option 3: Abuja */}
                <button
                  type="button"
                  onClick={() => handleSelect("abuja")}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all mt-1 ${
                    currentBranch === "abuja"
                      ? "bg-blue-500/15 text-blue-300 border border-blue-500/40 font-semibold"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      ABJ
                    </div>
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        {ESB_ACTIVE_BRANCHES.abuja.name}
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                          Maitama
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{ESB_ACTIVE_BRANCHES.abuja.address}</div>
                    </div>
                  </div>
                  {currentBranch === "abuja" && <Check className="h-4 w-4 text-blue-400" />}
                </button>

                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-2 text-[10px] text-muted-foreground font-mono">
                  <span>2 Active Branches</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" /> 100% Synced
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
