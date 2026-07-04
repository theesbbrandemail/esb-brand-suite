import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";
import { Phone, PhoneScroll } from "@/components/esb/Phone";
import { Bell, Search, Wand2, Play, Image as ImageIcon, Home, Sparkles, User } from "lucide-react";


export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Content Studio — ESB Brand" },
      { name: "description", content: "AI-generated content studio for skincare product videos and captions." },
      { property: "og:title", content: "Content Studio — ESB Brand" },
      { property: "og:description", content: "AI-generated content studio for skincare product videos and captions." },
    ],
  }),
  component: ContentPage,
});

const PINK = "oklch(0.65 0.25 5)";

const tiles = [
  { t: "Hydrating Serum", s: "Cream", g: "from-[oklch(0.7_0.16_5)] to-[oklch(0.55_0.2_350)]" },
  { t: "Hydrating Serum", s: "Cream", g: "from-[oklch(0.65_0.22_5)] to-[oklch(0.45_0.2_340)]" },
  { t: "Collagen Boost", s: "Cream", g: "from-[oklch(0.55_0.2_350)] to-[oklch(0.35_0.18_330)]" },
  { t: "Collagen Boost", s: "Cream", g: "from-[oklch(0.7_0.2_10)] to-[oklch(0.5_0.22_355)]" },
  { t: "Hydrating Serum", s: "Cream", g: "from-[oklch(0.45_0.18_340)] to-[oklch(0.3_0.15_320)]" },
];

function ContentPage() {
  const [caption, setCaption] = useState("");
  const [tab, setTab] = useState("Home");
  return (
    <Shell requireStaff>

      <div className="flex justify-center">
        <Phone tone="pink">
          <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full blur-3xl" style={{ background: PINK, opacity: 0.25 }} />
          <PhoneScroll>
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-display text-3xl font-bold">Content</h1>
              <button className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs focus:outline-none" placeholder="Search content" />
              </div>
              <button className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PINK}, oklch(0.45 0.2 340))` }}>
                <Wand2 className="h-4 w-4 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {tiles.slice(0, 4).map((t, i) => (
                <ContentTile key={i} {...t} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <ContentTile {...tiles[4]} />
              <EngagementCard />
            </div>

            <div className="rounded-2xl p-3 bg-white/[0.04] border border-white/10 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <input className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none" placeholder="Write a caption..." />
                <button className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="text-xs font-semibold" style={{ color: PINK }}>Approve</button>
                  <button className="text-xs px-3 py-1 rounded-full border border-white/15 text-muted-foreground">Regenerate</button>
                </div>
                <button className="px-5 py-2 rounded-full text-white font-semibold text-xs" style={{ background: `linear-gradient(135deg, ${PINK}, oklch(0.5 0.22 350))`, boxShadow: `0 10px 30px -10px ${PINK}` }}>
                  Post
                </button>
              </div>
            </div>
            <div className="h-20" />
          </PhoneScroll>

          <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-10">
            <div className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-around py-2.5 relative">
              {[
                { i: Home, l: "Home" },
                { i: Search, l: "Search" },
                { create: true as const },
                { i: Bell, l: "Alerts" },
                { i: User, l: "Profile" },
              ].map((t, i) => {
                if ("create" in t) {
                  return (
                    <button key={i} className="h-12 w-12 rounded-full flex items-center justify-center -mt-6 border-4 border-[oklch(0.14_0.02_300)]" style={{ background: `linear-gradient(135deg, ${PINK}, oklch(0.45 0.22 340))`, boxShadow: `0 10px 30px -8px ${PINK}` }}>
                      <Sparkles className="h-5 w-5 text-white" />
                    </button>
                  );
                }
                const Icon = t.i;
                return (
                  <button key={i} className="flex flex-col items-center gap-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">{t.l}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Phone>
      </div>
    </Shell>
  );
}

function ContentTile({ t, s, g }: { t: string; s: string; g: string }) {
  return (
    <div className="rounded-2xl overflow-hidden relative">
      <div className={`aspect-[4/5] bg-gradient-to-br ${g} relative flex items-center justify-center`}>
        <div className="h-20 w-12 rounded-lg bg-white/30 backdrop-blur-sm border border-white/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <div className="text-xs font-semibold text-white">{t}</div>
        <div className="text-[10px] text-white/70">{s}</div>
      </div>
    </div>
  );
}

function EngagementCard() {
  return (
    <div className="rounded-2xl p-3 bg-white/[0.04] border border-white/10 flex flex-col">
      <div className="font-display text-lg font-semibold">Engagement</div>
      <div className="flex items-center gap-3 text-[10px] mb-2">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: PINK }} />Likes</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />Shares</span>
      </div>
      <svg viewBox="0 0 100 50" className="w-full flex-1" preserveAspectRatio="none">
        <path d="M0,40 L20,30 L40,32 L60,18 L80,20 L100,8" fill="none" stroke={PINK} strokeWidth="2" />
        <path d="M0,45 L20,38 L40,40 L60,28 L80,30 L100,18" fill="none" stroke="oklch(0.72 0.15 155)" strokeWidth="2" />
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
        <span>Likes</span><span>Shares</span><span>Views</span>
      </div>
    </div>
  );
}
