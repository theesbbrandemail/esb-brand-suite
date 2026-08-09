import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Brain, X, Send, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { listInventory, type CeoKpis } from "@/lib/ops.functions";


type Turn = { role: "user" | "assistant"; content: string };

/** Grounding data used when no live backend session is available (demo mode). */
const DEMO_SNAPSHOT = {
  kpis: {
    revenue30d: 41250,
    appointments30d: 224,
    appointmentsToday: 12,
    upcomingAppointments: 38,
    followUpsPending: 9,
    lowStockItems: 4,
    totalSkus: 86,
    activeBranches: 3,
    customers: 1482,
    staff: 24,
    pendingApprovals: 3,
    approvalRate: 92,
    tasksAutoRun: 168,
    aiAutonomy: 78,
  },
  branches: ["Lagos", "Abuja", "Port Harcourt"],
  inventory: [
    { product: "Vitamin C Brightening Serum", brand: "Skincare Kitchen", branch: "Lagos", qty: 4, reorder_at: 10, low: true },
    { product: "Retinol Night Repair", brand: "Derma Aesthetics", branch: "Abuja", qty: 6, reorder_at: 12, low: true },
    { product: "Hydrafacial Solution Kit", brand: "SkinClinic", branch: "Lagos", qty: 2, reorder_at: 8, low: true },
    { product: "Whitening Gel Pro", brand: "Dental Clinic", branch: "Port Harcourt", qty: 5, reorder_at: 10, low: true },
    { product: "Ceramide Barrier Cream", brand: "Skincare Kitchen", branch: "Abuja", qty: 48, reorder_at: 12, low: false },
    { product: "Chemical Peel Solution", brand: "Rejuvenating Aesthetics", branch: "Lagos", qty: 31, reorder_at: 10, low: false },
  ],
  inventory_low_count: 4,
  top_services_30d: ["Hydrafacial", "Chemical Peel", "Dental Scaling", "Skin Consultation"],
};

const SUGGESTIONS = [
  "What needs my attention today?",
  "Which SKUs are at risk of stock-out?",
  "Summarise appointment demand this month",
  "Give me the top 3 next actions",
];

export function CeoAssistant({
  kpis,
  open,
  onOpenChange,
}: {
  kpis: CeoKpis | undefined;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const inventoryFn = useServerFn(listInventory);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const invQ = useQuery({
    queryKey: ["ceo-assistant-inventory"],
    queryFn: () => inventoryFn({ data: {} }),
    enabled: open,
    retry: false,
    staleTime: 60_000,
  });

  const snapshot = useMemo(() => {
    const inv = (invQ.data ?? []).slice(0, 40).map((r) => ({
      product: r.product?.name ?? "Unknown",
      sku: r.product?.sku ?? null,
      brand: r.product?.brand ?? null,
      branch: r.branch?.name ?? null,
      qty: r.qty,
      reorder_at: r.low_stock_threshold,
      low: r.qty <= r.low_stock_threshold,
    }));
    const usingDemo = !kpis && inv.length === 0;
    const payload = usingDemo
      ? { ...DEMO_SNAPSHOT, mode: "demo" as const }
      : {
          mode: "live" as const,
          kpis: kpis ?? null,
          inventory: inv,
          inventory_low_count: inv.filter((i) => i.low).length,
        };
    return JSON.stringify({ generated_at: new Date().toISOString(), ...payload }).slice(0, 11500);
  }, [kpis, invQ.data]);

  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, streaming, busy]);

  async function submit(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setError(null);
    const next: Turn[] = [...turns, { role: "user", content: t }];
    setTurns(next);
    setBusy(true);
    setStreaming("");

    let acc = "";
    try {
      const res = await fetch("/api/ceo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, snapshot }),
      });
      if (!res.ok || !res.body) {
        throw new Error((await res.text().catch(() => "")) || "The AI assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      if (!acc.trim()) throw new Error("The AI returned an empty response. Please try again.");
      setTurns((prev) => [...prev, { role: "assistant", content: acc }]);
    } catch (e) {
      if (acc.trim()) setTurns((prev) => [...prev, { role: "assistant", content: acc }]);
      else setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setStreaming("");
      setBusy(false);
    }
  }


  return (
    <>
      {/* Floating dock trigger */}
      <button
        onClick={() => onOpenChange(!open)}
        aria-label="Open CEO AI assistant"
        className="fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full flex items-center justify-center glow-gold transition-transform duration-300 hover:scale-110 active:scale-95"
        style={{ background: "var(--gradient-gold)", color: "var(--gold-foreground)" }}
      >
        {open ? <X className="h-5 w-5" /> : <Brain className="h-6 w-6 animate-breathe" />}
      </button>

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-[420px] p-3 sm:p-4 pb-20 transition-all duration-500 ease-out ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="card-elevated h-full flex flex-col overflow-hidden relative">
          <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet/15 blur-3xl" />

          <header className="relative flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl flex items-center justify-center bg-secondary/70 shimmer-gold">
                <Brain className="h-4 w-4 text-gold" />
              </span>
              <div>
                <div className="text-sm font-display font-semibold gold-text">Command Intelligence</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Executive AI analyst
                </div>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {turns.length === 0 && (
              <div className="space-y-3 animate-fade-up">
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Ask about inventory, KPIs, appointments or what to do next. Answers are grounded in the
                  live dashboard snapshot.
                </div>
                <div className="grid gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="animate-fade-up text-left text-xs px-3 py-2.5 rounded-xl bg-secondary/40 border border-border/60 hover:border-gold/40 hover:bg-secondary/70 transition-all duration-300"
                    >
                      <Sparkles className="inline h-3 w-3 text-gold mr-1.5" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((t, i) => (
              <div
                key={i}
                className={`animate-fade-up text-sm leading-relaxed ${
                  t.role === "user"
                    ? "ml-auto max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm bg-[var(--gradient-gold)] text-gold-foreground font-medium"
                    : "max-w-full text-foreground/90 whitespace-pre-wrap"
                }`}
                style={t.role === "user" ? { background: "var(--gradient-gold)", color: "var(--gold-foreground)" } : undefined}
              >
                {t.role === "assistant" ? renderLite(t.content) : t.content}
              </div>
            ))}

            {streaming && (
              <div className="animate-fade-up text-sm leading-relaxed max-w-full text-foreground/90 whitespace-pre-wrap">
                {renderLite(streaming)}
                <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-gold animate-pulse rounded-sm" />
              </div>
            )}

            {busy && !streaming && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-up">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" /> Analysing operations…
              </div>
            )}


            {error && (
              <div className="flex items-start gap-2 text-xs text-danger p-3 rounded-xl bg-danger/10 border border-danger/30 animate-fade-up">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="relative p-3 border-t border-border/60 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask intelligence…"
              className="flex-1 px-3 py-2.5 rounded-full bg-card/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className="h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-40 transition-transform hover:scale-105 active:scale-95"
              style={{ background: "var(--gradient-gold)", color: "var(--gold-foreground)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}

            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/** Minimal markdown-lite renderer: **bold** and leading bullets. */
function renderLite(text: string) {
  return text.split("\n").map((line, i) => {
    const clean = line.replace(/^\s*[*-]\s+/, "");
    const isBullet = clean !== line.trim() || /^\s*[*-]\s/.test(line);
    const parts = clean.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    const body = parts.map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={j} className="text-gold font-semibold">{p.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{p}</span>
      ),
    );
    if (!clean.trim()) return <div key={i} className="h-2" />;
    return (
      <div key={i} className={isBullet ? "flex gap-2 mb-1" : "mb-1"}>
        {isBullet && <span className="text-gold mt-[2px]">•</span>}
        <span>{body}</span>
      </div>
    );
  });
}
