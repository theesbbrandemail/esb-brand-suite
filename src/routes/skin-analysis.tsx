import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { Camera, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/skin-analysis")({
  head: () => ({
    meta: [
      { title: "AI Skin Analysis — Skincare Kitchen" },
      { name: "description", content: "Skincare Kitchen AI scans your skin and recommends a personalized routine." },
      { property: "og:title", content: "AI Skin Analysis — Skincare Kitchen" },
      { property: "og:description", content: "Skincare Kitchen AI scans your skin and recommends a personalized routine." },
    ],
  }),
  component: SkinPage,
});

function SkinPage() {
  return (
    <Shell>
      <div className="flex justify-center">
        <div className="relative w-full max-w-[420px] rounded-[44px] overflow-hidden p-8 pb-12" style={{ background: "radial-gradient(120% 80% at 50% 0%, oklch(0.92 0.03 20), oklch(0.78 0.06 350))" }}>
          <div className="text-center mb-2">
            <div className="font-display font-black tracking-[0.3em] text-[oklch(0.25_0.02_280)] text-2xl">SKINCARE</div>
            <div className="font-display font-light tracking-[0.5em] text-[oklch(0.35_0.02_280)] text-sm">KITCHEN</div>
          </div>
          <div className="text-center mb-6">
            <div className="font-serif italic text-3xl text-[oklch(0.2_0.02_280)] tracking-wider">AI SKIN ANALYSIS</div>
          </div>

          {/* device frame */}
          <div className="relative mx-auto w-full max-w-[300px] rounded-[36px] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-white z-10" />
            <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[oklch(0.85_0.06_20)] to-[oklch(0.7_0.08_15)] pt-8">
              {/* Camera UI */}
              <div className="px-3 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <button className="h-8 w-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                  <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border-2 border-white/60">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-[1.4fr_1fr] gap-2">
                  {/* Face scan */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-[oklch(0.75_0.04_25)] to-[oklch(0.6_0.06_15)]">
                    <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(oklch(1 0 0 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                    {/* face shape */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-[3/4] rounded-[50%] bg-gradient-to-b from-[oklch(0.85_0.05_25)] to-[oklch(0.7_0.07_15)] opacity-90" />
                    {/* scan frame */}
                    <div className="absolute inset-4 border border-dashed border-white/80 rounded-md" />
                    {/* scan ring */}
                    <div className="absolute top-[35%] left-[55%] h-10 w-10 rounded-full border border-white/80 animate-pulse" />
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <Stat label="SKIN TYPE" value="Satin" sub="35m" />
                    <Stat label="CONCERNS" value="40k" />
                    <Bar label="OILY %" value={62} />
                    <Bar label="DRY %" value={28} sub="1k" />
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-3 rounded-2xl bg-white/70 backdrop-blur p-3">
                  <div className="text-center text-[9px] font-bold tracking-widest text-[oklch(0.3_0.02_280)] mb-2">PERSONALIZED RECOMMENDATIONS</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { g: "from-[oklch(0.85_0.05_60)] to-[oklch(0.65_0.08_50)]" },
                      { g: "from-[oklch(0.8_0.04_20)] to-[oklch(0.6_0.06_10)]" },
                      { g: "from-[oklch(0.78_0.05_15)] to-[oklch(0.55_0.07_5)]" },
                    ].map((p, i) => (
                      <div key={i} className="relative">
                        <div className={`aspect-square rounded-xl bg-gradient-to-br ${p.g} flex items-center justify-center`}>
                          <div className="h-8 w-5 rounded-sm bg-white/70" />
                        </div>
                        <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[oklch(0.45_0.13_295)] text-white text-[8px] font-bold flex items-center justify-center">$4</span>
                        <div className="text-[8px] text-center mt-1 text-[oklch(0.25_0.02_280)] font-medium">Add To Cart</div>
                        <button className="w-full mt-1 py-1 rounded-md bg-[oklch(0.5_0.13_295)] text-white text-[8px] font-bold tracking-wider flex items-center justify-center gap-0.5">
                          <ShoppingBag className="h-2 w-2" /> ADD
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[oklch(0.7_0.12_350)] opacity-40 blur-3xl" />
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/50 backdrop-blur p-1.5">
      <div className="text-[8px] font-bold tracking-widest text-[oklch(0.3_0.02_280)]">{label}</div>
      <div className="text-xs font-semibold text-[oklch(0.2_0.02_280)]">{value}</div>
      {sub && <div className="text-[9px] text-[oklch(0.45_0.02_280)]">{sub}</div>}
    </div>
  );
}

function Bar({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/50 backdrop-blur p-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[8px] font-bold tracking-widest text-[oklch(0.3_0.02_280)]">{label}</span>
        <span className="text-[9px] font-semibold text-[oklch(0.45_0.13_295)]">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/60 mt-1 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[oklch(0.6_0.2_5)] to-[oklch(0.5_0.18_340)]" style={{ width: `${value}%` }} />
      </div>
      {sub && <div className="text-[9px] text-[oklch(0.45_0.02_280)] mt-0.5">{sub}</div>}
    </div>
  );
}
