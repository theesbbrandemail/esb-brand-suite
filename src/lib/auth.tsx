import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/lib/demo";
import {
  isFirebaseConfigured,
  subscribeFirebaseAuth,
  signOutFirebase,
  getFirebaseIdToken,
} from "@/integrations/firebase/client";

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

/** Minimal User-shaped object when only Firebase is signed in (Path B). */
function firebaseUserAsSupabaseUser(fb: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): User {
  return {
    id: fb.uid,
    email: fb.email ?? undefined,
    app_metadata: {},
    user_metadata: {
      full_name: fb.displayName,
      avatar_url: fb.photoURL,
      name: fb.displayName,
    },
    aud: "authenticated",
    created_at: "",
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

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

    // Path B: Firebase Auth drives identity; Supabase uses Firebase JWT via accessToken
    if (isFirebaseConfigured) {
      const unsub = subscribeFirebaseAuth(async (fbUser) => {
        if (!mounted) return;
        if (!fbUser) {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        const mapped = firebaseUserAsSupabaseUser(fbUser);
        setUser(mapped);
        // Synthetic session so existing UI that checks `session` keeps working
        setSession({
          access_token: (await getFirebaseIdToken(false)) ?? "",
          refresh_token: "",
          expires_in: 3600,
          token_type: "bearer",
          user: mapped,
        } as Session);
        await fetchRole(fbUser.uid);
        if (mounted) setLoading(false);
      });
      return () => {
        mounted = false;
        unsub();
      };
    }

    // Default: Supabase / Lovable Auth
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (event === "SIGNED_OUT") {
        setRole(null);
      } else if (s?.user) {
        setTimeout(() => fetchRole(s.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchRole(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const [demo] = useDemoMode();

  const value: AuthCtx = {
    loading,
    session,
    user,
    role,
    isStaff: role === "staff" || role === "admin" || demo,

    signOut: async () => {
      if (isFirebaseConfigured) {
        await signOutFirebase();
      }
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore when using Firebase-only tokens
      }
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
