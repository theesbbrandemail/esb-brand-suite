import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { firebaseExchange } from "@/lib/firebase-auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { EsbLogo } from "@/components/esb/Logo";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, RefreshCw, WifiOff } from "lucide-react";
import {
  isFirebaseConfigured,
  signInWithGoogleFirebase,
  completeFirebaseRedirectIfAny,
} from "@/integrations/firebase/client";

function safeNext(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({ next: safeNext(s.next) }),
  head: () => ({
    meta: [
      { title: "Sign in — ESB Brand" },
      { name: "description", content: "Sign in to the ESB Brand AI Suite." },
    ],
  }),
  component: AuthPage,
});

type Phase = "idle" | "starting" | "redirecting" | "returning" | "success" | "error";

type FriendlyError = {
  title: string;
  message: string;
  hint?: string;
  retry: boolean;
};

function classifyError(raw: string): FriendlyError {
  const msg = raw.toLowerCase();

  if (msg.includes("popup") && (msg.includes("closed") || msg.includes("blocked"))) {
    return {
      title: "Sign-in window was closed",
      message: "The Google sign-in window closed before you finished.",
      hint: "Try again and complete the Google prompt. If a popup was blocked, allow popups for this site.",
      retry: true,
    };
  }
  if (msg.includes("access_denied") || msg.includes("denied") || msg.includes("cancel")) {
    return {
      title: "Sign-in cancelled",
      message: "You declined access on the Google consent screen.",
      hint: "Continue with Google and approve the requested permissions to sign in.",
      retry: true,
    };
  }
  if (msg.includes("network") || msg.includes("failed to fetch") || msg.includes("fetch")) {
    return {
      title: "Network problem",
      message: "We couldn't reach Google to complete sign-in.",
      hint: "Check your internet connection and try again.",
      retry: true,
    };
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return {
      title: "Sign-in timed out",
      message: "Google took too long to respond.",
      hint: "Please try again in a moment.",
      retry: true,
    };
  }
  if (msg.includes("invalid") && msg.includes("state")) {
    return {
      title: "Session expired",
      message: "The sign-in link expired before you returned.",
      hint: "Start a fresh sign-in below.",
      retry: true,
    };
  }
  if (msg.includes("unsupported provider") || msg.includes("provider is not enabled")) {
    return {
      title: "Google sign-in unavailable",
      message: "Google sign-in is not enabled for this workspace yet.",
      hint: "Please contact an ESB Brand administrator.",
      retry: false,
    };
  }
  if (msg.includes("403") || msg.includes("forbidden")) {
    return {
      title: "Access blocked",
      message: "Your Google account isn't permitted to access this app.",
      hint: "If you believe this is a mistake, contact an ESB Brand administrator.",
      retry: false,
    };
  }
  if (msg.includes("firebase is not configured")) {
    return {
      title: "Firebase not configured",
      message: "Firebase Auth env vars are missing on this deployment.",
      hint: "Add VITE_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, and APP_ID on Vercel, then redeploy.",
      retry: false,
    };
  }
  if (msg.includes("redirect_uri") || msg.includes("redirect uri") || msg.includes("404")) {
    return {
      title: "Redirect configuration issue",
      message: "Google returned an invalid redirect after sign-in.",
      hint: "Add this site to Firebase → Authentication → Authorized domains.",
      retry: true,
    };
  }
  return {
    title: "Sign-in failed",
    message: raw || "Something went wrong while signing you in.",
    hint: "Please try again. If the problem persists, contact support.",
    retry: true,
  };
}

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const exchange = useServerFn(firebaseExchange);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<FriendlyError | null>(null);
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  // Finish Firebase redirect flow if we landed back on /auth
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    (async () => {
      const result = await completeFirebaseRedirectIfAny();
      if (cancelled || !result) return;
      if (result.error) {
        setError(classifyError(result.error.message));
        setPhase("error");
        return;
      }
      if (result.idToken) await finishFirebase(result.idToken);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Detect legacy OAuth callback (?code=... or #access_token=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isFirebaseConfigured) return;
    const search = window.location.search;
    const hash = window.location.hash;
    const hasCallback =
      search.includes("code=") ||
      search.includes("error=") ||
      hash.includes("access_token=") ||
      hash.includes("error=");
    if (hasCallback) {
      setPhase("returning");
      const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
      const oauthErr = params.get("error_description") || params.get("error");
      if (oauthErr) {
        setError(classifyError(decodeURIComponent(oauthErr)));
        setPhase("error");
      }
    }
  }, []);

  useEffect(() => {
    function on() { setOnline(true); }
    function off() { setOnline(false); }
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!loading && session) {
      setPhase("success");
      const t = setTimeout(() => {
        if (next && next !== "/") window.location.href = next;
        else navigate({ to: "/" });
      }, 450);
      return () => clearTimeout(t);
    }
  }, [loading, session, navigate, next]);

  async function finishFirebase(idToken: string) {
    setPhase("returning");
    const res = await exchange({ data: { idToken } });
    if (res.error || !res.tokenHash) {
      setError(classifyError(res.error ?? "sign-in failed"));
      setPhase("error");
      return;
    }
    const { error: otpErr } = await supabase.auth.verifyOtp({ token_hash: res.tokenHash, type: "magiclink" });
    if (otpErr) {
      setError(classifyError(otpErr.message));
      setPhase("error");
      return;
    }
    setPhase("success");
  }

  async function signIn() {
    setError(null);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError(classifyError("network"));
      setPhase("error");
      return;
    }

    setPhase("starting");
    try {
      // Path B: Firebase Google Auth
      if (isFirebaseConfigured) {
        const result = await signInWithGoogleFirebase();
        if (result.error) {
          if (result.error.message === "redirecting") {
            setPhase("redirecting");
            return;
          }
          setError(classifyError(result.error.message));
          setPhase("error");
          return;
        }
        await finishFirebase(result.idToken);
        return;
      }

      // Default: Lovable / Supabase OAuth
      const nextQs = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
      const returnTo = `${window.location.origin}/auth/callback${nextQs}`;
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: returnTo,
      });
      if (result.error) {
        setError(classifyError(result.error.message || ""));
        setPhase("error");
        return;
      }
      if (result.redirected) {
        setPhase("redirecting");
        return;
      }
      setPhase("success");
      if (next && next !== "/") window.location.href = next;
      else navigate({ to: "/" });
    } catch (e) {
      setError(classifyError(e instanceof Error ? e.message : String(e)));
      setPhase("error");
    }
  }

  const busy = phase === "starting" || phase === "redirecting" || phase === "returning";
  const buttonLabel =
    phase === "starting" ? "Opening Google…"
    : phase === "redirecting" ? "Redirecting to Google…"
    : phase === "returning" ? "Finishing sign-in…"
    : phase === "success" ? "Signed in"
    : "Continue with Google";

  if (loading && phase === "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your session…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <EsbLogo />
        </div>

        <div className="card-elevated p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="chip-violet flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> ESB Brand Suite · Staff
            </span>
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">
            Welcome to <span className="gold-text">ESB Brand</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 mb-5">
            Staff sign-in only. Use your ESB Brand Google account — access and role come from the staff list.
          </p>

          {!online && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
            >
              <WifiOff className="h-4 w-4 mt-0.5 shrink-0" />
              <span>You appear to be offline. Reconnect to sign in.</span>
            </div>
          )}

          <button
            onClick={signIn}
            disabled={busy || !online || phase === "success"}
            aria-busy={busy}
            className="w-full h-12 rounded-xl bg-white text-neutral-900 font-medium flex items-center justify-center gap-3 hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {phase === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {buttonLabel}
          </button>

          {(phase === "redirecting" || phase === "returning") && (
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              {phase === "redirecting"
                ? "Don't close this tab — Google will bring you back here."
                : "Almost done — preparing your dashboard."}
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error.title}</p>
                  <p className="text-xs text-destructive/90 mt-0.5">{error.message}</p>
                  {error.hint && (
                    <p className="text-xs text-muted-foreground mt-1.5">{error.hint}</p>
                  )}
                  {error.retry && (
                    <button
                      onClick={signIn}
                      disabled={busy || !online}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-gold transition"
                    >
                      <RefreshCw className="h-3 w-3" /> Try again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground mt-6 text-center leading-relaxed">
            Internal system for authorised ESB Brand employees. Unauthorised access is not permitted.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
