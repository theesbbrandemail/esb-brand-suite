import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PlayCircle, X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Step = {
  route: "/" | "/content" | "/manager" | "/mobile" | "/whatsapp";
  title: string;
  body: string;
  tip?: string;
};

const STEPS: Step[] = [
  {
    route: "/",
    title: "1 · Home KPIs",
    body: "Switch branches (Port Harcourt / Abuja / Lagos) and tap any KPI card — Inventory, Appointments, AI Insights, Revenue — to drill in.",
    tip: "Try: click 'Apply suggestion' on the AI Insights card.",
  },
  {
    route: "/content",
    title: "2 · Content · Create → Approve → Post",
    body: "Use the ✨ Wand to draft an AI caption, Approve it, then Post. Regenerate cycles a fresh draft instantly.",
    tip: "Try: Wand → Approve → Post.",
  },
  {
    route: "/manager",
    title: "3 · Manager · Sign in / out",
    body: "Managers clock shifts, review the staff roster, and read AI financial suggestions for the branch.",
    tip: "Try: tap Sign In/Out to start a shift.",
  },
  {
    route: "/mobile",
    title: "4 · Mobile experience",
    body: "The customer-facing mobile view: skin AI, appointments, and WhatsApp deep-links — all in a phone frame preview.",
    tip: "Try: bottom nav chips for quick actions.",
  },
  {
    route: "/whatsapp",
    title: "5 · WhatsApp AI Concierge",
    body: "Chat with the AI concierge — it suggests in-app features and can deep-link into real WhatsApp with wa.me.",
    tip: "Try: ask 'book a facial in Abuja'.",
  },
];

const KEY = "esb.demo.tour.seen";

export function DemoTour() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const step = STEPS[i];
    if (pathname !== step.route) nav({ to: step.route });
  }, [open, i, nav, pathname]);

  function start() {
    setI(0);
    setOpen(true);
    toast.success("Demo walkthrough started", { description: "5 quick stops across the suite." });
  }

  function next() {
    if (i < STEPS.length - 1) {
      setI(i + 1);
    } else {
      close(true);
      toast.success("Walkthrough complete", { description: "You've seen the core flows. Explore freely!" });
    }
  }

  function prev() {
    if (i > 0) setI(i - 1);
  }

  function close(seen = false) {
    setOpen(false);
    if (seen && typeof window !== "undefined") localStorage.setItem(KEY, "1");
  }

  return (
    <>
      <button
        onClick={start}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-br from-gold to-[oklch(0.72_0.14_70)] text-gold-foreground text-xs font-semibold shadow-[0_10px_40px_-10px_oklch(0.82_0.13_82/0.6)] hover:scale-105 transition"
        aria-label="Start demo walkthrough"
      >
        <PlayCircle className="h-4 w-4" /> Demo Tour
      </button>

      {open && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] pointer-events-auto" onClick={() => close(true)} />
          <div className="absolute bottom-24 right-5 max-w-sm w-[92vw] sm:w-[380px] pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="rounded-2xl border border-gold/30 bg-card/95 backdrop-blur-xl shadow-[0_30px_80px_-20px_oklch(0_0_0/0.6)] overflow-hidden">
              <div className="h-1 bg-secondary">
                <div
                  className="h-full bg-gradient-to-r from-gold to-violet transition-all"
                  style={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-violet flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Step {i + 1} of {STEPS.length}
                    </div>
                  </div>
                  <button
                    onClick={() => close(true)}
                    className="h-7 w-7 rounded-full hover:bg-secondary/60 flex items-center justify-center text-muted-foreground"
                    aria-label="Close tour"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="font-display text-lg mb-1">{STEPS[i].title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{STEPS[i].body}</p>
                {STEPS[i].tip && (
                  <div className="text-xs chip-violet inline-block mb-4">💡 {STEPS[i].tip}</div>
                )}
                <div className="flex items-center justify-between gap-2 mt-3">
                  <button
                    onClick={prev}
                    disabled={i === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div className="flex items-center gap-1">
                    {STEPS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-gold" : "w-1.5 bg-secondary"}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={next}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gold text-gold-foreground text-xs font-semibold hover:opacity-90 transition"
                  >
                    {i === STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
