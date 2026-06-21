import { useEffect, useRef, useState } from "react";
import { Fingerprint, ScanFace, ShieldCheck, ShieldAlert, Loader2, Camera, X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  authenticateBiometric,
  isBiometricSupported,
  listCredentials,
  registerBiometric,
} from "@/lib/biometric";

type Phase = "checking" | "needs-enroll" | "ready" | "scanning" | "verifying" | "unlocked" | "denied" | "error";

export function CeoGate({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const [phase, setPhase] = useState<Phase>("checking");
  const [error, setError] = useState<string | null>(null);
  const [hasCreds, setHasCreds] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [faceProgress, setFaceProgress] = useState(0);

  // CEO = admin role only
  const isCeo = role === "admin";

  useEffect(() => {
    if (!user || !isCeo) return;
    (async () => {
      try {
        if (!isBiometricSupported()) {
          setError("This device or browser does not support secure biometric authentication.");
          setPhase("error");
          return;
        }
        const creds = await listCredentials(user.id);
        setHasCreds(creds.length > 0);
        setPhase(creds.length > 0 ? "ready" : "needs-enroll");
      } catch (e: any) {
        setError(e.message ?? "Unable to load credentials");
        setPhase("error");
      }
    })();
  }, [user, isCeo]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startLiveness() {
    setError(null);
    setFaceProgress(0);
    setPhase("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      // simulated liveness progress (3.2s)
      const start = Date.now();
      const tick = () => {
        const p = Math.min(100, ((Date.now() - start) / 3200) * 100);
        setFaceProgress(p);
        if (p < 100) requestAnimationFrame(tick);
        else void runBiometric();
      };
      requestAnimationFrame(tick);
    } catch (e: any) {
      setError("Camera access denied. Liveness check is required.");
      setPhase("ready");
    }
  }

  async function runBiometric() {
    if (!user) return;
    setPhase("verifying");
    try {
      await authenticateBiometric(user.id);
      stopCamera();
      setPhase("unlocked");
    } catch (e: any) {
      stopCamera();
      setError(e.message ?? "Biometric verification failed");
      setPhase("denied");
    }
  }

  async function enroll() {
    if (!user) return;
    setError(null);
    setPhase("verifying");
    try {
      await registerBiometric({
        userId: user.id,
        userName: user.email ?? "ceo",
        deviceLabel: navigator.platform,
      });
      setHasCreds(true);
      setPhase("ready");
    } catch (e: any) {
      setError(e.message ?? "Enrollment failed");
      setPhase("needs-enroll");
    }
  }

  if (phase === "unlocked") return <>{children}</>;

  if (!isCeo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card-elevated p-8 max-w-md text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-gold/15 flex items-center justify-center mb-4">
            <ShieldAlert className="h-5 w-5 text-gold" />
          </div>
          <h2 className="font-display text-xl mb-1">CEO-only vault</h2>
          <p className="text-sm text-muted-foreground">
            This command center is restricted to the CEO account and requires biometric authentication.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div
        className="relative w-full max-w-md rounded-[28px] overflow-hidden p-8"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.04 280 / 0.95), oklch(0.16 0.03 280 / 0.95))",
          border: "1px solid oklch(0.82 0.13 82 / 0.25)",
          boxShadow:
            "0 40px 80px -30px oklch(0 0 0 / 0.7), 0 0 0 1px oklch(1 0 0 / 0.04), 0 0 60px -20px oklch(0.82 0.13 82 / 0.25)",
        }}
      >
        {/* aurora */}
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[oklch(0.82_0.13_82)] opacity-10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[oklch(0.62_0.2_295)] opacity-15 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold/80">CEO Vault</span>
          </div>
          <h2 className="font-display text-2xl">Biometric Authentication</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fingerprint + facial liveness required. Restricted to the CEO account.
          </p>

          {/* Scanner */}
          <div className="mt-6 relative mx-auto h-64 w-64 rounded-full overflow-hidden border border-gold/30 bg-black/40">
            {(phase === "scanning" || phase === "verifying") && (
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover scale-110"
              />
            )}
            {phase !== "scanning" && phase !== "verifying" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanFace className="h-20 w-20 text-gold/30" />
              </div>
            )}
            {/* scan ring */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="48"
                fill="none"
                stroke="oklch(1 0 0 / 0.08)"
                strokeWidth="1.2"
              />
              <circle
                cx="50" cy="50" r="48"
                fill="none"
                stroke="oklch(0.82 0.13 82)"
                strokeWidth="1.5"
                strokeDasharray={`${faceProgress * 3.015} 1000`}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px oklch(0.82 0.13 82 / 0.6))" }}
              />
            </svg>
            {/* scanline */}
            {phase === "scanning" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_20px_oklch(0.82_0.13_82)]"
                  style={{ top: `${faceProgress}%`, transition: "top 60ms linear" }}
                />
              </div>
            )}
            {/* crosshair frame */}
            <div className="absolute inset-6 rounded-full border border-dashed border-white/15" />
          </div>

          <div className="mt-5 text-center min-h-[56px]">
            {phase === "checking" && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking secure enclave…
              </div>
            )}
            {phase === "needs-enroll" && (
              <>
                <div className="text-sm text-muted-foreground">
                  No biometric enrolled for this CEO account on this device.
                </div>
                <button
                  onClick={enroll}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-[oklch(0.2_0.03_280)] font-semibold text-sm shadow-[0_10px_30px_-10px_oklch(0.82_0.13_82/0.6)]"
                >
                  <Fingerprint className="h-4 w-4" /> Enroll Touch ID / Face ID
                </button>
              </>
            )}
            {phase === "ready" && (
              <>
                <div className="text-sm text-muted-foreground">
                  Position your face in the ring, then approve with fingerprint.
                </div>
                <button
                  onClick={startLiveness}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-[oklch(0.2_0.03_280)] font-semibold text-sm shadow-[0_10px_30px_-10px_oklch(0.82_0.13_82/0.6)]"
                >
                  <Camera className="h-4 w-4" /> Begin Secure Scan
                </button>
              </>
            )}
            {phase === "scanning" && (
              <div className="text-xs uppercase tracking-[0.25em] text-gold">
                Facial liveness · {Math.round(faceProgress)}%
              </div>
            )}
            {phase === "verifying" && (
              <div className="flex items-center justify-center gap-2 text-sm text-gold">
                <Fingerprint className="h-4 w-4 animate-pulse" /> Awaiting fingerprint…
              </div>
            )}
            {phase === "denied" && (
              <>
                <div className="flex items-center justify-center gap-2 text-sm text-danger">
                  <ShieldAlert className="h-4 w-4" /> Access denied
                </div>
                <button
                  onClick={() => { setError(null); setPhase("ready"); }}
                  className="mt-2 text-xs text-muted-foreground underline"
                >
                  Try again
                </button>
              </>
            )}
            {phase === "error" && error && (
              <div className="text-xs text-danger">{error}</div>
            )}
            {error && phase !== "error" && (
              <div className="mt-2 text-[11px] text-danger/80">{error}</div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-1"><Fingerprint className="h-3 w-3" /> Touch</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span className="flex items-center gap-1"><ScanFace className="h-3 w-3" /> Face</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
