import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";
import { ContentAssistant } from "@/components/esb/ContentAssistant";
import { ScheduledPreviewDrawer } from "@/components/esb/ScheduledPreviewDrawer";
import { BranchCards } from "@/components/esb/BranchCards";
import { useAuth } from "@/lib/auth";
import { listInventory, getCeoKpis, type InventoryRow } from "@/lib/ops.functions";
import {
  Bell, Search, Wand2, Play, Image as ImageIcon, Sparkles, Lock, Loader2,
  TrendingUp, Heart, Share2, Eye,
} from "lucide-react";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Content Studio — ESB Brand" },
      { name: "description", content: "Live content studio: AI captions, product-led posts and scheduling across every ESB branch." },
      { property: "og:title", content: "Content Studio — ESB Brand" },
      { property: "og:description", content: "Live content studio: AI captions, product-led posts and scheduling across every ESB branch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContentPage,
});

const PINK = "oklch(0.65 0.25 5)";

const GRADIENTS = [
  "from-[oklch(0.7_0.16_5)] to-[oklch(0.55_0.2_350)]",
  "from-[oklch(0.65_0.22_5)] to-[oklch(0.45_0.2_340)]",
  "from-[oklch(0.55_0.2_350)] to-[oklch(0.35_0.18_330)]",
  "from-[oklch(0.7_0.2_10)] to-[oklch(0.5_0.22_355)]",
  "from-[oklch(0.45_0.18_340)] to-[oklch(0.3_0.15_320)]",
  "from-[oklch(0.6_0.2_355)] to-[oklch(0.4_0.18_335)]",
];

function ContentPage() {
  const [caption, setCaption] = useState("");
  const [query, setQuery] = useState("");
  const { isStaff, role, session } = useAuth();

  const invFn = useServerFn(listInventory);
  const kpisFn = useServerFn(getCeoKpis);
  const invQ = useQuery({
    queryKey: ["inventory", "content"],
    queryFn: () => invFn({ data: {} }),
    enabled: !!session,
    refetchInterval: 60_000,
  });
  const kpisQ = useQuery({
    queryKey: ["ceo-kpis"],
    queryFn: () => kpisFn(),
    enabled: !!session && isStaff,
    refetchInterval: 60_000,
  });

  const items = useMemo(() => {
    const rows = (invQ.data ?? []) as InventoryRow[];
    const seen = new Set<string>();
    const unique = rows.filter((r) => {
      const key = r.product?.name ?? r.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const q = query.trim().toLowerCase();
    return (q
      ? unique.filter((r) =>
          [r.product?.name, r.product?.brand, r.product?.category, r.branch?.name]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)),
        )
      : unique
    ).slice(0, 12);
  }, [invQ.data, query]);

  const denyPublic = (action: string) => {
    toast.error("Staff only", {
      description: `${action} is restricted to staff accounts. You're signed in as ${role ?? "public"}.`,
    });
  };

  const k = kpisQ.data;

  return (
    <Shell>
      <div className="space-y-5">
        {!isStaff && (
          <div className="rounded-2xl border border-violet/30 bg-violet/10 px-4 py-3 flex items-center gap-3">
            <Lock className="h-4 w-4 text-violet shrink-0" />
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Read-only preview.</span> Scheduling,
              approving and publishing are limited to Staff accounts.
            </div>
          </div>
        )}

        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full blur-3xl" style={{ background: PINK, opacity: 0.25 }} />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold/90 mb-1">Content Studio</div>
              <h1 className="truncate font-display text-2xl sm:text-4xl font-semibold">
                Brand <span className="gold-text">Content</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Product-led posts generated from live catalogue and branch performance.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ScheduledPreviewDrawer />
              <button
                onClick={() => toast("3 new alerts", { description: "Approval queue, scheduled post, engagement spike." })}
                className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
                aria-label="Alerts"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat icon={ImageIcon} label="Catalogue assets" value={((invQ.data ?? []) as InventoryRow[]).length} loading={invQ.isLoading} />
            <Stat icon={TrendingUp} label="Appointments / 30d" value={k?.appointments30d} loading={kpisQ.isLoading} />
            <Stat icon={Heart} label="Today's bookings" value={k?.appointmentsToday} loading={kpisQ.isLoading} />
            <Stat icon={Share2} label="Follow-ups pending" value={k?.followUpsPending} loading={kpisQ.isLoading} />
          </div>
        </header>

        <BranchCards title="Publish by Branch" />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            {/* Search + generate */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs focus:outline-none"
                    placeholder="Search products, brands or branches"
                  />
                </div>
                <button
                  onClick={() =>
                    isStaff
                      ? toast.success("AI generating…", { description: "New caption + 4 image variants queued." })
                      : denyPublic("AI generation")
                  }
                  disabled={!isStaff}
                  title={isStaff ? "Generate" : "Staff only"}
                  className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${PINK}, oklch(0.45 0.2 340))` }}
                >
                  {isStaff ? <Wand2 className="h-4 w-4 text-white" /> : <Lock className="h-4 w-4 text-white" />}
                </button>
              </div>

              <div className="mt-4">
                {invQ.isLoading ? (
                  <div className="flex items-center gap-2 py-8 justify-center text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading live catalogue…
                  </div>
                ) : items.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    {session ? "No matching products in the live catalogue." : "Sign in to load live catalogue content."}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map((r, i) => (
                      <ContentTile
                        key={r.id}
                        title={r.product?.name ?? "Product"}
                        sub={r.product?.brand ?? r.branch?.name ?? "ESB"}
                        image={r.product?.image_url ?? null}
                        gradient={GRADIENTS[i % GRADIENTS.length]!}
                        onPick={() =>
                          setCaption(
                            `✨ ${r.product?.name ?? "New drop"} — now at ${r.branch?.name ?? "ESB"}. Book your slot in-app.`,
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Composer */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 gold-text" />
                <h2 className="font-display text-sm sm:text-base">Composer</h2>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs placeholder:text-muted-foreground focus:outline-none"
                placeholder="Write a caption..."
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      isStaff
                        ? toast.success("Approved", { description: "Sent to publishing queue." })
                        : denyPublic("Approving posts")
                    }
                    disabled={!isStaff}
                    className="text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                    style={{ color: PINK }}
                  >
                    {!isStaff && <Lock className="h-3 w-3" />}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      if (!isStaff) return denyPublic("Regenerating captions");
                      setCaption("✨ Glow rituals for Wed–Fri. Book your Serum Bar slot in-app.");
                      toast("Regenerated", { description: "New AI caption drafted." });
                    }}
                    disabled={!isStaff}
                    className="text-xs px-3 py-1 rounded-full border border-white/15 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Regenerate
                  </button>
                </div>
                <button
                  onClick={() =>
                    isStaff
                      ? toast.success("Posted", {
                          description: caption ? `“${caption.slice(0, 40)}…” live on IG + WhatsApp.` : "Draft posted to IG + WhatsApp.",
                        })
                      : denyPublic("Publishing")
                  }
                  disabled={!isStaff}
                  className="px-5 py-2 rounded-full text-white font-semibold text-xs inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${PINK}, oklch(0.5 0.22 350))`, boxShadow: `0 10px 30px -10px ${PINK}` }}
                >
                  {!isStaff && <Lock className="h-3 w-3" />}
                  {isStaff ? "Post" : "Post (staff)"}
                </button>
              </div>
            </section>

            <EngagementCard kpi={k} />
          </div>

          <div className="xl:col-span-1">
            <ContentAssistant caption={caption} onApplyCaption={setCaption} canPublish={isStaff} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ContentTile({
  title, sub, image, gradient, onPick,
}: { title: string; sub: string; image: string | null; gradient: string; onPick: () => void }) {
  return (
    <button onClick={onPick} className="rounded-2xl overflow-hidden relative text-left w-full group">
      <div className={`aspect-[4/5] bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        {image ? (
          <img src={image} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="h-20 w-12 rounded-lg bg-white/30 backdrop-blur-sm border border-white/40" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition">
            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <div className="truncate text-xs font-semibold text-white">{title}</div>
        <div className="truncate text-[10px] text-white/70">{sub}</div>
      </div>
    </button>
  );
}

function Stat({
  icon: Icon, label, value, loading,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value?: number | string; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 gold-text" />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 font-display text-xl font-semibold">
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (value ?? "—")}
      </div>
    </div>
  );
}

function EngagementCard({ kpi }: { kpi?: { brandSeries?: { gold: number }[] } }) {
  const series = kpi?.brandSeries?.map((b) => b.gold) ?? [];
  const max = Math.max(1, ...series);
  const pts = series.length
    ? series.map((v, i) => `${(i / Math.max(1, series.length - 1)) * 100},${50 - (v / max) * 42}`).join(" L")
    : "0,40 L20,30 L40,32 L60,18 L80,20 L100,8";
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-base">Engagement trend</div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" style={{ color: PINK }} />Reach</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-success" />Views</span>
          </div>
        </div>
        <span className="chip-violet text-[10px]">Live</span>
      </div>
      <svg viewBox="0 0 100 50" className="w-full h-28 mt-3" preserveAspectRatio="none">
        <path d={`M${pts}`} fill="none" stroke={PINK} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </section>
  );
}
