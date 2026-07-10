import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Wand2, Hash, Clock, Check, Send, Trash2, CalendarClock, Loader2, Lock } from "lucide-react";

const PINK = "oklch(0.65 0.25 5)";
const STORAGE_KEY = "esb.content.scheduled";

type Scheduled = {
  id: string;
  caption: string;
  hashtags: string[];
  scheduledAt: number; // epoch ms
  status: "queued" | "published";
};

const CAPTION_TEMPLATES = [
  "✨ Glow rituals for Wed–Fri. Book your Serum Bar slot in-app.",
  "Your skin's new best friend just dropped 💧 Collagen Boost — now in-clinic.",
  "Behind the glow ✨ Meet the science of Hydrating Serum. Pre-order today.",
  "Weekend reset 🧖🏽‍♀️ Book a Rejuvenating facial + get 15% off Derma products.",
  "That post-treatment glow is worth every second 💫 Tap to book.",
  "Real results. Real skin. Zero filters. Swipe to see the Week-4 transformation.",
];

const HASHTAG_SETS = [
  ["#SkincareKitchen", "#GlowUp", "#PortHarcourt", "#SelfCareSunday", "#ESBBrand"],
  ["#DermaAesthetics", "#SkinScience", "#CollagenBoost", "#PreOrderNow", "#SkinGoals"],
  ["#SkinClinic", "#FacialTreatment", "#RejuvenatingAesthetics", "#Glowing", "#BookNow"],
  ["#BeautyRoutine", "#ClinicalSkincare", "#RadiantSkin", "#NigeriaBeauty", "#LuxeSkin"],
];

const POSTING_SUGGESTIONS = [
  { label: "Today · 6:30 PM", desc: "Peak IG engagement window (Wed)", offsetMin: 60 * 6 },
  { label: "Tomorrow · 12:15 PM", desc: "Lunch scroll — high save rate", offsetMin: 60 * 24 },
  { label: "Sat · 9:00 AM", desc: "Weekend booking spike", offsetMin: 60 * 60 },
];

function loadQueue(): Scheduled[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Scheduled[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(q: Scheduled[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
}

export function ContentAssistant({
  caption,
  onApplyCaption,
  canPublish = true,
}: {
  caption: string;
  onApplyCaption: (c: string) => void;
  canPublish?: boolean;
}) {
  const denyPublic = (action: string) => {
    toast.error("Staff only", { description: `${action} is limited to staff accounts.` });
  };
  const [generating, setGenerating] = useState(false);
  const [draftCaption, setDraftCaption] = useState(CAPTION_TEMPLATES[0]);
  const [tags, setTags] = useState<string[]>(HASHTAG_SETS[0]);
  const [queue, setQueue] = useState<Scheduled[]>([]);

  useEffect(() => {
    setQueue(loadQueue());
  }, []);

  // Auto-publish scheduled posts whose time has come
  useEffect(() => {
    const t = setInterval(() => {
      setQueue((prev) => {
        const now = Date.now();
        let changed = false;
        const next = prev.map((p) => {
          if (p.status === "queued" && p.scheduledAt <= now) {
            changed = true;
            toast.success("Auto-published", {
              description: `"${p.caption.slice(0, 44)}${p.caption.length > 44 ? "…" : ""}" is live on IG + WhatsApp.`,
            });
            return { ...p, status: "published" as const };
          }
          return p;
        });
        if (changed) saveQueue(next);
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  function regenerate() {
    if (!canPublish) return denyPublic("Regenerating drafts");
    setGenerating(true);
    setTimeout(() => {
      const c = CAPTION_TEMPLATES[Math.floor(Math.random() * CAPTION_TEMPLATES.length)];
      const h = HASHTAG_SETS[Math.floor(Math.random() * HASHTAG_SETS.length)];
      setDraftCaption(c);
      setTags(h);
      setGenerating(false);
      toast("New draft ready", { description: "Fresh caption + hashtag set generated." });
    }, 600);
  }

  function applyCaption() {
    if (!canPublish) return denyPublic("Applying to composer");
    onApplyCaption(draftCaption);
    toast.success("Applied to composer", { description: "Caption inserted — tap Post or schedule." });
  }

  function applyAll() {
    if (!canPublish) return denyPublic("Applying to composer");
    onApplyCaption(`${draftCaption}\n\n${tags.join(" ")}`);
    toast.success("Applied caption + hashtags", { description: "Ready to Post or Schedule." });
  }

  function schedule(offsetMin: number, label: string) {
    if (!canPublish) return denyPublic("Scheduling posts");
    const text = (caption || draftCaption).trim();
    if (!text) {
      toast.error("Nothing to schedule", { description: "Type or apply a caption first." });
      return;
    }
    const entry: Scheduled = {
      id: Math.random().toString(36).slice(2, 10),
      caption: text,
      hashtags: tags,
      scheduledAt: Date.now() + offsetMin * 60 * 1000,
      status: "queued",
    };
    const next = [entry, ...queue].slice(0, 20);
    setQueue(next);
    saveQueue(next);
    toast.success("Scheduled", { description: `Will auto-publish ${label}.` });
  }

  function removeFromQueue(id: string) {
    if (!canPublish) return denyPublic("Editing the queue");
    const next = queue.filter((q) => q.id !== id);
    setQueue(next);
    saveQueue(next);
  }

  function publishNow(id: string) {
    if (!canPublish) return denyPublic("Publishing");
    const next = queue.map((q) =>
      q.id === id ? { ...q, status: "published" as const, scheduledAt: Date.now() } : q,
    );
    setQueue(next);
    saveQueue(next);
    toast.success("Published now", { description: "Live on IG + WhatsApp." });
  }

  return (
    <aside className="w-full lg:w-[380px] shrink-0">
      <div className="rounded-3xl p-5 bg-white/[0.04] border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PINK}, oklch(0.45 0.2 340))` }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-tight">AI Assistant</div>
              <div className="text-[10px] text-muted-foreground">Captions · Hashtags · Timing</div>
            </div>
          </div>
          <button
            onClick={regenerate}
            disabled={generating}
            className="text-[11px] px-3 py-1.5 rounded-full border border-white/15 hover:border-white/30 transition flex items-center gap-1.5 disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
            {generating ? "Drafting…" : "Regenerate"}
          </button>
        </div>

        {/* Caption draft */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Caption draft</div>
          <div className="rounded-2xl p-3 bg-black/30 border border-white/10 text-sm leading-relaxed">
            {draftCaption}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={applyCaption}
              className="flex-1 text-xs font-semibold py-2 rounded-full border border-white/15 hover:border-white/30 transition flex items-center justify-center gap-1.5"
            >
              <Check className="h-3 w-3" /> Apply caption
            </button>
            <button
              onClick={applyAll}
              className="flex-1 text-xs font-semibold py-2 rounded-full text-white flex items-center justify-center gap-1.5"
              style={{ background: `linear-gradient(135deg, ${PINK}, oklch(0.45 0.2 340))` }}
            >
              <Sparkles className="h-3 w-3" /> Apply all
            </button>
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Hash className="h-3 w-3" /> Suggested hashtags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => {
                  navigator.clipboard?.writeText(t);
                  toast(`Copied ${t}`);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-pink-400/50 transition"
                style={{ color: PINK }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Posting suggestions */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Best posting times
          </div>
          <div className="space-y-1.5">
            {POSTING_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => schedule(s.offsetMin, s.label)}
                className="w-full text-left rounded-xl px-3 py-2 bg-white/[0.03] border border-white/10 hover:border-white/25 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                </div>
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick schedule */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Quick schedule composer</div>
          <div className="flex gap-1.5">
            {[
              { l: "In 1 min", m: 1 },
              { l: "+15 min", m: 15 },
              { l: "+1 hr", m: 60 },
              { l: "+24 hr", m: 60 * 24 },
            ].map((o) => (
              <button
                key={o.l}
                onClick={() => schedule(o.m, o.l)}
                className="flex-1 text-[10px] font-medium py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/25 transition"
              >
                {o.l}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1.5">
            Uses the caption from the phone composer (or the draft above if empty).
          </div>
        </div>

        {/* Queue */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
            <span>Scheduled queue</span>
            <span className="text-[10px] text-muted-foreground normal-case">
              {queue.filter((q) => q.status === "queued").length} queued
            </span>
          </div>
          {queue.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-white/10 rounded-xl">
              No scheduled posts yet.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {queue.map((q) => {
                const when = new Date(q.scheduledAt);
                const relMin = Math.round((q.scheduledAt - Date.now()) / 60000);
                return (
                  <div
                    key={q.id}
                    className="rounded-xl px-3 py-2 bg-white/[0.03] border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs line-clamp-2">{q.caption}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {q.status === "published"
                            ? `Published · ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : relMin <= 0
                            ? "Publishing…"
                            : relMin < 60
                            ? `in ${relMin}m · ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : `${when.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
                          {q.status === "published" && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[9px]">
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {q.status === "queued" && (
                          <button
                            onClick={() => publishNow(q.id)}
                            className="h-6 w-6 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center"
                            title="Publish now"
                          >
                            <Send className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => removeFromQueue(q.id)}
                          className="h-6 w-6 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center"
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
