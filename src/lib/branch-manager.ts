/**
 * ESB Active Branch Management
 * Strict 2-Branch Operational Infrastructure:
 * 1. Port Harcourt Flagship Clinic & Depot (Port Harcourt)
 * 2. Abuja Executive Clinic & Lab (Abuja)
 */

export type ActiveBranchKey = "all" | "ph" | "abuja";
export type BranchName = "Port Harcourt" | "Abuja";

export interface BranchInfo {
  id: string;
  key: ActiveBranchKey;
  name: BranchName;
  displayName: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  openingHours: string;
  coordinates: { lat: number; lng: number };
  activeStaffCount: number;
  liveSurge: boolean;
}

export const ESB_ACTIVE_BRANCHES: Record<"ph" | "abuja", BranchInfo> = {
  ph: {
    id: "b-ph-01",
    key: "ph",
    name: "Port Harcourt",
    displayName: "Port Harcourt Flagship",
    state: "Rivers State",
    city: "Port Harcourt",
    address: "Plot 12, GRA Phase II, Port Harcourt, Rivers State",
    phone: "+234 803 123 4567",
    email: "ph@esbbrand.com",
    whatsapp: "+2348031234567",
    openingHours: "Mon - Sat: 8:30 AM - 6:30 PM",
    coordinates: { lat: 4.8156, lng: 7.0498 },
    activeStaffCount: 14,
    liveSurge: true,
  },
  abuja: {
    id: "b-abj-02",
    key: "abuja",
    name: "Abuja",
    displayName: "Abuja Executive Clinic",
    state: "FCT",
    city: "Abuja",
    address: "Maitama Diplomatic Zone, Abuja, FCT",
    phone: "+234 809 987 6543",
    email: "abuja@esbbrand.com",
    whatsapp: "+2348099876543",
    openingHours: "Mon - Sat: 9:00 AM - 7:00 PM",
    coordinates: { lat: 9.0765, lng: 7.3986 },
    activeStaffCount: 18,
    liveSurge: false,
  },
};

const STORAGE_KEY_BRANCH = "esb_selected_branch_v2";

export function getSelectedBranch(): ActiveBranchKey {
  if (typeof window === "undefined") return "all";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BRANCH);
    if (saved === "ph" || saved === "abuja" || saved === "all") {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return "all";
}

export function setSelectedBranch(branch: ActiveBranchKey): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_BRANCH, branch);
  } catch (e) {
    // ignore
  }
  // Dispatch global broadcast event for immediate re-render across all open tabs/pages
  window.dispatchEvent(
    new CustomEvent("esb_branch_changed", {
      detail: {
        branch,
        branchName: branch === "ph" ? "Port Harcourt" : branch === "abuja" ? "Abuja" : "All Branches",
        timestamp: new Date().toISOString(),
      },
    })
  );
}

export function normalizeBranchName(name?: string | null): BranchName | "All Branches" {
  if (!name) return "All Branches";
  const lower = name.toLowerCase();
  if (lower.includes("port") || lower.includes("harcourt") || lower.includes("ph") || lower.includes("gra")) {
    return "Port Harcourt";
  }
  if (lower.includes("abuja") || lower.includes("maitama") || lower.includes("fct")) {
    return "Abuja";
  }
  return "All Branches";
}

/**
 * Filter an array of items by the currently active branch
 */
export function matchesCurrentBranch(itemBranch?: string | null, activeBranch: ActiveBranchKey = getSelectedBranch()): boolean {
  if (activeBranch === "all") return true;
  if (!itemBranch) return true;
  const normalized = normalizeBranchName(itemBranch);
  if (activeBranch === "ph") return normalized === "Port Harcourt";
  if (activeBranch === "abuja") return normalized === "Abuja";
  return true;
}
