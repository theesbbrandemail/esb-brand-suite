import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeSkin, type SkinAnalysis } from "@/lib/skin.functions";
import {
  Camera, Upload, Loader2, Sparkles, ShieldCheck,
  X, RefreshCcw, AlertCircle, ScanFace, Zap, Gauge, Brain,
} from "lucide-react";

type Tier = "fast" | "balanced" | "precise";
type ErrorInfo = { code: string; message: string; retryable: boolean; retryAfterMs?: number };


export const Route = createFileRoute("/skin-analysis")({
  head: () => ({
    meta: [
      { title: "AI Skin Analysis — ESB Brand" },
      { name: "description", content: "Upload or snap a selfie for an instant deep AI skin analysis: type, concerns, scores, and a personalized routine." },
      { property: "og:title", content: "AI Skin Analysis — ESB Brand" },
      { property: "og:description", content: "Deep AI scan of your skin in seconds." },
    ],
  }),
  component: SkinPage,
});

type Phase = "idle" | "camera" | "preview" | "analyzing" | "result" | "error";

function SkinPage() {
  const analyze = useServerFn(analyzeSkin);
  const [phase, setPhase] = useState<Phase>("idle");
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<SkinAnalysis | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [tier, setTier] = useState<Tier>("fast");
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function openCamera() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1024, height: 1024 },
        audio: false,
      });
      streamRef.current = s;
      setPhase("camera");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      setError({ code: "camera_denied", message: "Camera permission was denied. You can upload a photo instead.", retryable: false });
      setPhase("error");
    }

  }

  function snap() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    const size = Math.min(v.videoWidth, v.videoHeight, 1024);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    ctx.drawImage(v, sx, sy, size, size, 0, 0, size, size);
    const data = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    setImageData(data);
    setPhase("preview");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      setError({ code: "too_large", message: "Image must be under 8MB.", retryable: false });
      setPhase("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result));
      setPhase("preview");
    };
    reader.readAsDataURL(f);
  }

  async function runAnalysis() {
    if (!imageData) return;
    setError(null);
    setRetryCountdown(0);
    setPhase("analyzing");
    try {
      const r = await analyze({ data: { imageDataUrl: imageData, tier } });
      if ("ok" in r && r.ok) {
        setResult(r as SkinAnalysis);
        setPhase("result");
      } else {
        const err = r as { code: string; message: string; retryable: boolean; retryAfterMs?: number };
        setError({ code: err.code, message: err.message, retryable: err.retryable, retryAfterMs: err.retryAfterMs });
        if (err.retryAfterMs) {
          const secs = Math.ceil(err.retryAfterMs / 1000);
          setRetryCountdown(secs);
          const iv = setInterval(() => {
            setRetryCountdown((s) => {
              if (s <= 1) { clearInterval(iv); return 0; }
              return s - 1;
            });
          }, 1000);
        }
        setPhase("error");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError({ code: "client_error", message: msg || "Analysis failed. Please try again.", retryable: true });
      setPhase("error");
    }
  }


  function reset() {
    stopCamera();
    setImageData(null);
    setResult(null);
    setError(null);
    setPhase("idle");
  }

  return (
    <Shell>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold/90">
            <ScanFace className="h-3 w-3" /> AI Skin Intelligence
          </div>
          <h1 className="font-display text-3xl md:text-4xl mt-2">
            Deep <span className="gold-text">skin analysis</span> in seconds
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Powered by advanced AI vision. Snap or upload a clear selfie — no makeup, even lighting.
          </p>
        </div>

        <div
          className="rounded-3xl p-6 md:p-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.24 0.03 280 / 0.9), oklch(0.18 0.03 280 / 0.9))",
            border: "1px solid oklch(1 0 0 / 0.06)",
            boxShadow: "0 30px 60px -30px oklch(0 0 0 / 0.6)",
          }}
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold opacity-10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet opacity-15 blur-3xl" />

          <div className="relative">
            {phase === "idle" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={openCamera}
                  className="group rounded-2xl p-6 bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-[oklch(0.2_0.03_280)] text-left transition hover:scale-[1.01]"
                >
                  <Camera className="h-7 w-7 mb-3" />
                  <div className="font-display text-lg font-semibold">Snap a selfie</div>
                  <div className="text-xs opacity-80 mt-1">Use your front camera in good light.</div>
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="group rounded-2xl p-6 bg-secondary/60 border border-border text-left transition hover:border-gold/40"
                >
                  <Upload className="h-7 w-7 mb-3 text-gold" />
                  <div className="font-display text-lg font-semibold">Upload a photo</div>
                  <div className="text-xs text-muted-foreground mt-1">JPG or PNG, under 8MB.</div>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              </div>
            )}

            {phase === "camera" && (
              <div>
                <div className="relative mx-auto aspect-square max-w-md rounded-3xl overflow-hidden bg-black border border-gold/30">
                  <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-6 rounded-[50%] border-2 border-dashed border-white/50" />
                  <button
                    onClick={reset}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-center mt-5">
                  <button
                    onClick={snap}
                    className="h-16 w-16 rounded-full bg-white flex items-center justify-center border-4 border-gold/60 shadow-[0_0_30px_oklch(0.82_0.13_82/0.4)]"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)]" />
                  </button>
                </div>
              </div>
            )}

            {phase === "preview" && imageData && (
              <div>
                <div className="relative mx-auto aspect-square max-w-md rounded-3xl overflow-hidden border border-border">
                  <img src={imageData} alt="Selfie preview" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="mt-5 max-w-md mx-auto">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 text-center">
                    AI Model
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "fast", label: "Fast", icon: Zap, hint: "Seconds" },
                      { id: "balanced", label: "Balanced", icon: Gauge, hint: "Recommended" },
                      { id: "precise", label: "Precise", icon: Brain, hint: "Deepest" },
                    ] as const).map((t) => {
                      const Icon = t.icon;
                      const active = tier === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTier(t.id)}
                          className={`rounded-xl p-2.5 border text-left transition ${
                            active
                              ? "border-gold bg-gold/10"
                              : "border-border bg-secondary/40 hover:border-gold/40"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 mb-1 ${active ? "text-gold" : "text-muted-foreground"}`} />
                          <div className="text-xs font-semibold">{t.label}</div>
                          <div className="text-[10px] text-muted-foreground">{t.hint}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-5 flex-wrap">
                  <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground">
                    <RefreshCcw className="h-3.5 w-3.5" /> Retake
                  </button>
                  <button
                    onClick={runAnalysis}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-[oklch(0.2_0.03_280)] font-semibold text-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Run AI Analysis
                  </button>
                </div>
              </div>
            )}


            {phase === "analyzing" && (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gold/10 border border-gold/30 mb-4">
                  <Loader2 className="h-8 w-8 text-gold animate-spin" />
                </div>
                <div className="font-display text-lg">Scanning your skin…</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Deep AI vision analyzing texture, tone, pores, hydration, redness…
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className="py-10 text-center max-w-md mx-auto">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-danger/15 border border-danger/30 mb-3">
                  <AlertCircle className="h-5 w-5 text-danger" />
                </div>
                <div className="font-medium">{error?.message ?? "Something went wrong"}</div>
                {error?.code && (
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                    Error code: {error.code}
                  </div>
                )}
                <div className="flex justify-center gap-3 mt-5 flex-wrap">
                  {error?.retryable && imageData && (
                    <button
                      onClick={runAnalysis}
                      disabled={retryCountdown > 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-[oklch(0.2_0.03_280)] font-semibold text-sm disabled:opacity-50"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      {retryCountdown > 0 ? `Retry in ${retryCountdown}s` : "Retry analysis"}
                    </button>
                  )}
                  <button onClick={reset} className="text-sm text-gold underline">Start over</button>
                </div>
              </div>
            )}


            {phase === "result" && result && (
              <ResultView result={result} imageData={imageData} onReset={reset} />
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ResultView({
  result, imageData, onReset,
}: { result: SkinAnalysis; imageData: string | null; onReset: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold/90">Your skin report</div>
          <h2 className="font-display text-2xl mt-1">
            Type: <span className="gold-text capitalize">{result.skin_type}</span>
          </h2>
        </div>
        <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs">
          <RefreshCcw className="h-3 w-3" /> New scan
        </button>
      </div>

      <div className="grid md:grid-cols-[180px_1fr] gap-4 mb-5">
        {imageData && (
          <div className="aspect-square rounded-2xl overflow-hidden border border-border">
            <img src={imageData} alt="Your scan" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Scores grid */}
      <div className="mb-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Skin Scores</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.entries(result.scores ?? {}).map(([k, v]) => (
            <ScoreBar key={k} label={k} value={Number(v) || 0} />
          ))}
        </div>
      </div>

      {/* Concerns */}
      <div className="mb-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Concerns Detected</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {(result.concerns ?? []).map((c, i) => (
            <div key={i} className="p-3 rounded-xl bg-secondary/40 border border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-sm">{c.name}</div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    c.severity === "high"
                      ? "text-danger border-danger/40 bg-danger/10"
                      : c.severity === "moderate"
                      ? "text-warning border-warning/40 bg-warning/10"
                      : "text-success border-success/40 bg-success/10"
                  }`}
                >
                  {c.severity}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">{c.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Routine */}
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Personalized Routine
        </div>
        <div className="space-y-2">
          {(result.routine ?? []).map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gold to-violet flex items-center justify-center text-[oklch(0.2_0.03_280)] font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm">{r.step}</div>
                  <span className="text-[10px] gold-text font-semibold">{r.when}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {r.product_type} · <span className="text-foreground/80">{r.ingredient_focus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3 w-3" /> AI guidance only — not a medical diagnosis.
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{label}</span>
        <span className="text-xs font-semibold gold-text">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
