import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "staff" | "public";

type AuthCtx = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  isStaff: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Register listener FIRST to catch SIGNED_IN during OAuth callback
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s);
      if (event === "SIGNED_OUT") {
        setRole(null);
      } else if (s?.user) {
        // Defer DB call to avoid deadlock with auth listener
        setTimeout(() => fetchRole(s.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        fetchRole(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    async function fetchRole(userId: string) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (!mounted) return;
      const roles = (data ?? []).map((r) => r.role as AppRole);
      const best: AppRole =
        roles.includes("admin") ? "admin" : roles.includes("staff") ? "staff" : "public";
      setRole(best);
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthCtx = {
    loading,
    session,
    user: session?.user ?? null,
    role,
    isStaff: role === "staff" || role === "admin",
    signOut: async () => {
      await supabase.auth.signOut();
      window.location.href = "/auth";
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
