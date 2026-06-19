import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { EsbLogo } from "@/components/esb/Logo";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — ESB Brand" },
      { name: "description", content: "Sign in to the ESB Brand AI Suite." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  async function signIn() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      setError(result.error.message || "Sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
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
              <Sparkles className="h-3 w-3" /> AI Suite
            </span>
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">
            Welcome to <span className="gold-text">ESB Brand</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 mb-7">
            Sign in with Google to access your dashboard. Staff and management get extended tools automatically.
          </p>

          <button
            onClick={signIn}
            disabled={busy}
            className="w-full h-12 rounded-xl bg-white text-neutral-900 font-medium flex items-center justify-center gap-3 hover:bg-white/90 transition disabled:opacity-60"
          >
            <GoogleIcon />
            {busy ? "Redirecting…" : "Continue with Google"}
          </button>

          {error && (
            <p className="text-xs text-destructive mt-4 text-center">{error}</p>
          )}

          <p className="text-[11px] text-muted-foreground mt-6 text-center leading-relaxed">
            By continuing, you agree to ESB Brand's terms. New visitors get a general dashboard; staff emails are upgraded automatically.
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
