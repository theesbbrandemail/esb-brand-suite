import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { isFirebaseConfigured, signOutFirebase } from "@/integrations/firebase/client";
import {
  getCurrentStaffAccount,
  getCurrentUserEmail,
  setCurrentUserEmail,
  getPendingStaffCount,
  type StaffAccount,
  type StaffRole,
} from "./role-manager";

export type AppRole = "super_admin" | "admin" | "manager" | "staff" | "public";

type AppUser = Pick<FirebaseUser, "uid" | "email" | "displayName" | "photoURL"> & {
  id: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
  created_at: string;
};

type AppSession = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token: string;
  user: AppUser;
};

type AuthCtx = {
  loading: boolean;
  session: AppSession | null;
  user: AppUser | null;
  role: AppRole | null;
  isStaff: boolean;
  // Extended role-specific governance
  staffAccount: StaffAccount;
  staffRole: StaffRole;
  isCeo: boolean;
  isApprovedStaff: boolean;
  isPendingApproval: boolean;
  pendingCount: number;
  switchUser: (email: string) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<AppRole | null>("super_admin");
  const [loading, setLoading] = useState(false);

  // Dynamic Staff Account based on current user email
  const [staffAccount, setStaffAccount] = useState<StaffAccount>(() => getCurrentStaffAccount());
  const [pendingCount, setPendingCount] = useState<number>(() => getPendingStaffCount());

  useEffect(() => {
    const handleAccountSync = () => {
      setStaffAccount(getCurrentStaffAccount());
      setPendingCount(getPendingStaffCount());
    };

    window.addEventListener("esb_staff_roles_updated", handleAccountSync);
    window.addEventListener("esb_current_user_changed", handleAccountSync);

    return () => {
      window.removeEventListener("esb_staff_roles_updated", handleAccountSync);
      window.removeEventListener("esb_current_user_changed", handleAccountSync);
    };
  }, []);

  const switchUser = (email: string) => {
    setCurrentUserEmail(email);
    setStaffAccount(getCurrentStaffAccount());
    setPendingCount(getPendingStaffCount());
  };

  const isCeo = staffAccount.role === "ceo";
  const isApprovedStaff = staffAccount.status === "active" && staffAccount.role !== "public";
  const isPendingApproval = staffAccount.status === "pending_ceo_approval" || staffAccount.role === "public";

  const mockExecutiveUser: AppUser = {
    uid: staffAccount.id,
    id: staffAccount.id,
    email: staffAccount.email,
    displayName: staffAccount.fullName,
    photoURL: null,
    app_metadata: {},
    user_metadata: {
      full_name: staffAccount.fullName,
      name: staffAccount.fullName,
      role: staffAccount.role,
      branch: staffAccount.branch,
    },
    aud: "authenticated",
    created_at: staffAccount.registeredAt,
    email: staffAccount.email,
  };

  const mockSession: AppSession = {
    access_token: "mock-token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "mock-refresh",
    user: mockExecutiveUser,
  };

  // Map staffRole to legacy AppRole
  const mappedRole: AppRole =
    staffAccount.role === "ceo"
      ? "super_admin"
      : staffAccount.role === "manager"
      ? "manager"
      : isApprovedStaff
      ? "staff"
      : "public";

  const value: AuthCtx = {
    loading: false,
    session: session ?? mockSession,
    user: user ?? mockExecutiveUser,
    role: mappedRole,
    isStaff: isApprovedStaff || isCeo,
    staffAccount,
    staffRole: staffAccount.role,
    isCeo,
    isApprovedStaff,
    isPendingApproval,
    pendingCount,
    switchUser,

    signOut: async () => {
      if (isFirebaseConfigured) {
        await signOutFirebase();
      }
      setCurrentUserEmail("theesbbrandemail@gmail.com");
      window.location.href = "/";
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
