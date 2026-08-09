import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CalendarClock, Clock, Image as ImageIcon, Play, X, CheckCircle2, Send, Hourglass } from "lucide-react";

const PINK = "oklch(0.65 0.25 5)";
const STORAGE_KEY = "esb.content.scheduled";

type Scheduled = {
  id: string;
  caption: string;
  hashtags: string[];
  scheduledAt: number;
  status: "queued" | "published";
};

function loadQueue(): Scheduled[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Scheduled[]) : [];
  } catch {
    return [];
  }
}

function statusLabel(q: Scheduled) {
  if (q.status === "published") return { text: "Published", icon: CheckCircle2, color: "text-emerald-300", bg: "bg-emerald-500/15" };
  const relMin = Math.round((q.scheduledAt - Date.now()) / 60000);
  if (relMin <= 0) return { text: "Publishing now", icon: Send, color: "text-pink-300", bg: "bg-pink-500/20" };
  return { text: "Scheduled", icon: Hourglass, color: "text-amber-300", bg: "bg-amber-500/15" };
}

function formatTime(when: number) {
  const date = new Date(when);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(when: number) {
  const relMin = Math.round((when - Date.now()) / 60000);
  if (relMin <= 0) return "now";
  if (relMin < 60) return `in ${relMin}m`;
  const relH = Math.round(relMin / 60);
  if (relH < 24) return `in ${relH}h`;
  const relD = Math.round(relH / 24);
  return `in ${relD}d`;
}

export function ScheduledPreviewDrawer() {
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<Scheduled[]>([]);

  useEffect(() => {
    setQueue(loadQueue());
  }, [open]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setQueue(loadQueue());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const queuedCount = queue.filter((q) => q.status === "queued").length;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium hover:border-white/30 transition"
          title="Preview scheduled posts"
        >
          <CalendarClock className="h-3.5 w-3.5" style={{ color: PINK }} />
          Scheduled
          {queuedCount > 0 && (
            <span className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: PINK, color: "white" }}>
              {queuedCount}
            </span>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-white/10 bg-[oklch(0.12_0.02_300)]">
        <DrawerHeader className="flex items-start justify-between">
          <div>
            <DrawerTitle className="font-display text-xl">Scheduled preview</DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Exact post text, media, time and publish status before publishing.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
          {queue.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <CalendarClock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium">No scheduled posts yet</div>
              <div className="text-xs text-muted-foreground mt-1">
                Use the AI Assistant panel to queue captions and hashtags.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((q) => {
                const status = statusLabel(q);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[oklch(0.65_0.22_5)] to-[oklch(0.45_0.2_340)] flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-white/60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm leading-relaxed line-clamp-3">{q.caption}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {q.hashtags.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                              style={{ color: PINK }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl bg-black/30 px-3 py-2 border border-white/10">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatTime(q.scheduledAt)}</span>
                        {q.status !== "published" && (
                          <span className="text-[10px] text-muted-foreground">({relativeTime(q.scheduledAt)})</span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${status.color} ${status.bg}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{queuedCount} queued</span>
            <span>{queue.filter((q) => q.status === "published").length} published</span>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
