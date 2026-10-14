/**
 * ESB Brand Role-Based Access Control (RBAC) & CEO Approval Governance
 * Designed specifically for ESB Brand & Mrs. Elizabeth Umeh (CEO & Founder)
 */

export type StaffRole =
  | "ceo"            // Super Admin - Mrs. Elizabeth Umeh
  | "doctor"         // Lead Dermatologist / Surgeon
  | "nurse"          // Senior Aesthetic Registered Nurse
  | "sales"          // VIP Sales & Client Relations Director
  | "accountant"     // Chief Financial Officer & Corporate Accountant
  | "logistics"      // Operations & Inventory Controller
  | "manager"        // Branch Operations Manager
  | "public";        // Unregistered / Pending review

export type StaffApprovalStatus = "active" | "pending_ceo_approval" | "rejected";

export interface StaffAccount {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  status: StaffApprovalStatus;
  branch: "Port Harcourt" | "Abuja" | "All Branches";
  department: string;
  avatar?: string;
  phone?: string;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  clearanceLevel: 1 | 2 | 3 | 4 | 5; // 5 = Top Secret CEO
  notes?: string;
}

const STORAGE_KEYS = {
  STAFF_ACCOUNTS: "esb_staff_accounts_v2",
  CURRENT_USER_OVERRIDE: "esb_current_user_email",
};

export const ROLE_CONFIGS: Record<
  StaffRole,
  {
    title: string;
    description: string;
    clearance: number;
    badgeColor: string;
    accessibleRoutes: string[];
    allowedNavKeys: string[];
  }
> = {
  ceo: {
    title: "Chief Executive Officer & Founder",
    description: "Highest executive clearance (Level 5). Unrestricted oversight across all clinical units, classified board vaults, financial P&Ls, and AI operations.",
    clearance: 5,
    badgeColor: "bg-gold text-black border-gold font-bold",
    accessibleRoutes: ["*"], // Complete access
    allowedNavKeys: ["all"],
  },
  doctor: {
    title: "Lead Dermatologist & Aesthetic Surgeon",
    description: "Clinical patient procedures, laser calibrations, prescription approvals, and medical treatment records.",
    clearance: 4,
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accessibleRoutes: ["/", "/clinical", "/crm", "/brands/derma", "/brands/skinclinic", "/store", "/guide"],
    allowedNavKeys: ["dashboard", "clinical", "crm", "brands", "store", "guide"],
  },
  nurse: {
    title: "Senior Aesthetic Registered Nurse",
    description: "Patient room allocations, autoclave sterilization verification, procedure consents, and post-care monitoring.",
    clearance: 3,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    accessibleRoutes: ["/", "/clinical", "/crm", "/store", "/guide"],
    allowedNavKeys: ["dashboard", "clinical", "crm", "store", "guide"],
  },
  sales: {
    title: "VIP Commercial & Client Relations Director",
    description: "High-value sales pipeline, lead conversion, customer objections, WhatsApp & Gmail client correspondence, and collection receipts.",
    clearance: 3,
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    accessibleRoutes: ["/", "/sales", "/crm", "/social", "/store", "/guide"],
    allowedNavKeys: ["dashboard", "sales", "crm", "social", "store", "guide"],
  },
  accountant: {
    title: "Chief Financial Officer & Accountant",
    description: "Multi-branch bank reconciliations (Zenith / GTBank), Naira inflows, tax compliance, payroll auditing, and invoice approvals.",
    clearance: 4,
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    accessibleRoutes: ["/", "/crm", "/ai/accountant", "/sales", "/store", "/guide"],
    allowedNavKeys: ["dashboard", "crm", "finance", "sales", "store", "guide"],
  },
  logistics: {
    title: "Operations & Inventory Supply Controller",
    description: "Real-time stock monitoring, Google Maps fleet dispatch between Port Harcourt and Abuja, and supplier purchase orders.",
    clearance: 3,
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    accessibleRoutes: ["/", "/inventory", "/store", "/guide"],
    allowedNavKeys: ["dashboard", "inventory", "store", "guide"],
  },
  manager: {
    title: "Branch General Operations Manager",
    description: "Daily premise shift logs, GPS staff attendance verification, worklists dispatch, and staff scorecards.",
    clearance: 4,
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    accessibleRoutes: ["/", "/staff", "/inventory", "/sales", "/crm", "/clinical", "/store", "/guide"],
    allowedNavKeys: ["dashboard", "staff", "inventory", "sales", "crm", "clinical", "store", "guide"],
  },
  public: {
    title: "Pending Role Confirmation",
    description: "Awaiting CEO verification by Mrs. Elizabeth Umeh. Restricted to public catalog and application status holding room.",
    clearance: 1,
    badgeColor: "bg-secondary text-muted-foreground border-border",
    accessibleRoutes: ["/", "/store", "/pending-approval", "/guide"],
    allowedNavKeys: ["store", "guide"],
  },
};

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: "staff-ceo",
    email: "theesbbrandemail@gmail.com",
    fullName: "Mrs. Elizabeth Umeh",
    role: "ceo",
    status: "active",
    branch: "All Branches",
    department: "Executive Board",
    phone: "+234 803 000 0001",
    clearanceLevel: 5,
    registeredAt: "2026-01-01T00:00:00Z",
    approvedAt: "2026-01-01T00:00:00Z",
    approvedBy: "Founder Authority",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    notes: "Founder & Chief Executive Officer of ESB Brand Suite Nigeria.",
  },
  {
    id: "staff-ceo-aux",
    email: "esbbrand1@gmail.com",
    fullName: "Mrs. Elizabeth Umeh (Official Mailbox)",
    role: "ceo",
    status: "active",
    branch: "All Branches",
    department: "Executive Office",
    clearanceLevel: 5,
    registeredAt: "2026-01-01T00:00:00Z",
    approvedAt: "2026-01-01T00:00:00Z",
    approvedBy: "Founder Authority",
  },
  {
    id: "staff-doc-1",
    email: "dr.eze@esb-aesthetics.ng",
    fullName: "Dr. Ngozi Eze",
    role: "doctor",
    status: "active",
    branch: "Port Harcourt",
    department: "Clinical & Aesthetics",
    phone: "+234 803 111 2233",
    clearanceLevel: 4,
    registeredAt: "2026-02-10T08:00:00Z",
    approvedAt: "2026-02-10T09:30:00Z",
    approvedBy: "Mrs. Elizabeth Umeh",
    avatar: "https://images.unsplash.com/photo-1594824813580-c11456d2cf99?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "staff-nurse-1",
    email: "nurse.amina@esb-aesthetics.ng",
    fullName: "Nurse Amina Bello",
    role: "nurse",
    status: "active",
    branch: "Port Harcourt",
    department: "Clinical Nursing",
    phone: "+234 802 444 5566",
    clearanceLevel: 3,
    registeredAt: "2026-02-12T08:00:00Z",
    approvedAt: "2026-02-12T10:15:00Z",
    approvedBy: "Mrs. Elizabeth Umeh",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "staff-sales-1",
    email: "chioma.okeke@esb-aesthetics.ng",
    fullName: "Chioma Okeke",
    role: "sales",
    status: "active",
    branch: "Abuja",
    department: "VIP Client Relations",
    phone: "+234 809 777 8899",
    clearanceLevel: 3,
    registeredAt: "2026-02-15T08:00:00Z",
    approvedAt: "2026-02-15T11:00:00Z",
    approvedBy: "Mrs. Elizabeth Umeh",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "staff-ops-1",
    email: "zainab.aliyu@esb-aesthetics.ng",
    fullName: "Zainab Aliyu",
    role: "logistics",
    status: "active",
    branch: "Abuja",
    department: "Supply Chain & Logistics",
    phone: "+234 805 333 4411",
    clearanceLevel: 3,
    registeredAt: "2026-02-18T08:00:00Z",
    approvedAt: "2026-02-18T10:00:00Z",
    approvedBy: "Mrs. Elizabeth Umeh",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "staff-pharm-1",
    email: "pharm.emeka@esb-aesthetics.ng",
    fullName: "Pharm. Emeka Obi",
    role: "doctor", // Clinical Formulation Head
    status: "active",
    branch: "Port Harcourt",
    department: "Skincare Kitchen Formulations",
    phone: "+234 812 999 1000",
    clearanceLevel: 4,
    registeredAt: "2026-02-20T08:00:00Z",
    approvedAt: "2026-02-20T12:00:00Z",
    approvedBy: "Mrs. Elizabeth Umeh",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "staff-pending-1",
    email: "kareem.adeleke@gmail.com",
    fullName: "Kareem Adeleke",
    role: "sales",
    status: "pending_ceo_approval",
    branch: "Port Harcourt",
    department: "Sales & Client Onboarding",
    phone: "+234 803 555 1290",
    clearanceLevel: 1,
    registeredAt: "2026-10-12T14:20:00Z",
    notes: "Applied for Port Harcourt aesthetic sales representative role. Awaiting CEO Elizabeth Umeh interview confirmation.",
  },
  {
    id: "staff-pending-2",
    email: "fatima.bello.nurse@gmail.com",
    fullName: "Nurse Fatima Bello",
    role: "nurse",
    status: "pending_ceo_approval",
    branch: "Abuja",
    department: "Aesthetic Nursing & Laser",
    phone: "+234 814 888 2341",
    clearanceLevel: 1,
    registeredAt: "2026-10-13T09:15:00Z",
    notes: "Certified Laser Practitioner applying for Abuja Maitama laser suite.",
  },
];

let memStaffAccounts = INITIAL_STAFF_ACCOUNTS;

export function getStoredStaffAccounts(): StaffAccount[] {
  if (typeof window === "undefined") return memStaffAccounts;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STAFF_ACCOUNTS, JSON.stringify(INITIAL_STAFF_ACCOUNTS));
      return INITIAL_STAFF_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return memStaffAccounts;
  }
}

export function saveStoredStaffAccounts(accounts: StaffAccount[]) {
  memStaffAccounts = accounts;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_ACCOUNTS, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent("esb_staff_roles_updated", { detail: { accounts } }));
    } catch (e) {
      console.warn("Failed saving staff accounts", e);
    }
  }
}

export function getCurrentUserEmail(): string {
  if (typeof window === "undefined") return "theesbbrandemail@gmail.com";
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_OVERRIDE) || "theesbbrandemail@gmail.com";
  } catch {
    return "theesbbrandemail@gmail.com";
  }
}

export function setCurrentUserEmail(email: string) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_OVERRIDE, email);
      window.dispatchEvent(new CustomEvent("esb_current_user_changed", { detail: { email } }));
    } catch (e) {
      console.warn("Failed setting current user email", e);
    }
  }
}

export function getCurrentStaffAccount(): StaffAccount {
  const email = getCurrentUserEmail().toLowerCase().trim();
  const accounts = getStoredStaffAccounts();

  // If matching account exists:
  const found = accounts.find((a) => a.email.toLowerCase().trim() === email);
  if (found) return found;

  // If it's the CEO email or admin keyword:
  if (email.includes("theesbbrandemail") || email.includes("esbbrand1") || email.includes("elizabeth")) {
    return accounts[0];
  }

  // Otherwise, default to pending public user
  return {
    id: `guest-${Date.now()}`,
    email,
    fullName: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    role: "public",
    status: "pending_ceo_approval",
    branch: "Port Harcourt",
    department: "Pending Verification",
    clearanceLevel: 1,
    registeredAt: new Date().toISOString(),
  };
}

export function getPendingStaffCount(): number {
  const accounts = getStoredStaffAccounts();
  return accounts.filter((a) => a.status === "pending_ceo_approval").length;
}

export function approveStaffAccount(
  staffId: string,
  confirmedRole: StaffRole,
  confirmedBranch: "Port Harcourt" | "Abuja" = "Port Harcourt"
): StaffAccount | null {
  const accounts = getStoredStaffAccounts();
  let updatedAccount: StaffAccount | null = null;

  const next = accounts.map((acc) => {
    if (acc.id !== staffId) return acc;
    updatedAccount = {
      ...acc,
      role: confirmedRole,
      status: "active",
      branch: confirmedBranch,
      clearanceLevel: (ROLE_CONFIGS[confirmedRole]?.clearance || 3) as any,
      approvedAt: new Date().toISOString(),
      approvedBy: "Mrs. Elizabeth Umeh (CEO)",
    };
    return updatedAccount;
  });

  if (updatedAccount) {
    saveStoredStaffAccounts(next);
  }
  return updatedAccount;
}

export function rejectStaffAccount(staffId: string) {
  const accounts = getStoredStaffAccounts();
  const next = accounts.map((acc) => (acc.id === staffId ? { ...acc, status: "rejected" as const } : acc));
  saveStoredStaffAccounts(next);
}

export function registerNewStaffRequest(
  email: string,
  fullName: string,
  requestedRole: StaffRole,
  branch: "Port Harcourt" | "Abuja",
  phone?: string,
  notes?: string
): StaffAccount {
  const accounts = getStoredStaffAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    return existing;
  }

  const newAcc: StaffAccount = {
    id: `staff-${Date.now()}`,
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    role: requestedRole,
    status: "pending_ceo_approval",
    branch,
    department: ROLE_CONFIGS[requestedRole]?.title || "General",
    phone,
    clearanceLevel: 1,
    registeredAt: new Date().toISOString(),
    notes,
  };

  saveStoredStaffAccounts([newAcc, ...accounts]);
  return newAcc;
}

export function isRouteAllowedForRole(role: StaffRole, pathname: string): boolean {
  if (role === "ceo") return true; // CEO sees everything
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  if (config.accessibleRoutes.includes("*")) return true;

  // Check exact or prefix match
  return config.accessibleRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}
