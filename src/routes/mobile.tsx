import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";
import { LineSpark } from "@/components/esb/charts";
import { Bell, Sparkles, ChevronRight, Home, Calendar, Settings, User } from "lucide-react";


export const Route = createFileRoute("/mobile")({
  head: () => ({
    meta: [
      { title: "Mobile CEO Suite — ESB Brand" },
      { name: "description", content: "Beauty business CEO dashboard on the go — revenue, reminders, AI suggestions." },
      { property: "og:title", content: "Mobile CEO Suite — ESB Brand" },
      { property: "og:description", content: "Beauty business CEO dashboard on the go." },
    ],
  }),
  component: MobilePage,
});

function MobilePage() {
  return (
    <Shell>
      <div className="flex justify-center">
        <Phone />
      </div>
    </Shell>
  );
}

function Phone() {
  return (
    <div className="relative w-[360px] h-[760px] rounded-[44px] p-[10px] bg-gradient-to-b from-[oklch(0.28_0.03_280)] to-[oklch(0.12_0.02_280)] shadow-[0_60px_120px_-30px_oklch(0_0_0/0.7)] border border-white/10">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-32 rounded-full bg-black z-10" />
      <div className="relative h-full w-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[oklch(0.18_0.025_280)] to-[oklch(0.14_0.02_280)]">
        <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet/20 blur-3xl" />

        <div className="relative h-full overflow-y-auto px-4 pt-10 pb-20 space-y-4">
          {/* Status / brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-gold to-violet" />
              <span className="text-sm font-display gold-text">ESB Brand</span>
            </div>
            <button onClick={() => toast("3 alerts", { description: "Payroll, restock, marketing sync" })} className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </button>

          </div>

          <div>
            <div className="text-xs text-muted-foreground">Tuesday · Jun 15</div>
            <h2 className="text-2xl font-display font-semibold mt-1">CEO <span className="gold-text">AI Suite</span></h2>
          </div>

          {/* Revenue card */}
          <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Skincare Kitchen</span>
              <span className="chip-violet text-[10px]">Live</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-semibold">$245.8K</span>
              <span className="text-xs text-success font-semibold">+18.4%</span>
            </div>
            <LineSpark points={[12, 18, 15, 22, 30, 26, 40, 55, 48, 62]} height={80} />
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Derma Aesthetics</div>
              <div className="text-lg font-display font-semibold mt-1">+12.5%</div>
              <div className="flex items-end gap-1 h-10 mt-2">
                {[5, 8, 6, 10, 9, 12, 14].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-violet-soft to-violet" style={{ height: `${(h / 14) * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Reminders</div>
              <div className="text-lg font-display font-semibold mt-1">3</div>
              <div className="text-[11px] text-muted-foreground mt-2 leading-snug">
                Client meeting · 10:00 AM<br />Review report · 1:30 PM
              </div>
            </div>
          </div>

          {/* AI suggestion */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-violet/20 to-gold/10 border border-violet/30 relative overflow-hidden">
            <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gradient-to-br from-gold to-violet flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-violet font-semibold mb-1">AI Suggestion</div>
            <div className="font-display text-sm leading-snug pr-10">
              Optimize Marketing Spend — shift <span className="gold-text font-semibold">$2.4K</span> from display to retention.
            </div>
            <div className="flex items-center justify-between mt-3">
              <button onClick={() => toast("Dismissed")} className="text-[11px] text-muted-foreground">Dismiss</button>
              <button onClick={() => toast.success("AI details", { description: "Shift $2.4K to retention. Est. +6% LTV." })} className="chip-gold text-[11px] flex items-center gap-1">Details <ChevronRight className="h-3 w-3" /></button>
            </div>

          </div>

          {/* Reminders list */}
          <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display">Today</span>
              <button onClick={() => toast("Today's agenda", { description: "3 items due" })} className="text-[11px] text-muted-foreground">View all</button>

            </div>
            {[
              { t: "Team Meeting", s: "Quarterly review", time: "10:00", tag: "Auto" },
              { t: "Payroll Approval", s: "Skincare Kitchen", time: "12:30", tag: "Pending" },
              { t: "Marketing Sync", s: "Derma Aesthetics", time: "15:00", tag: "Auto" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-t border-white/5 first:border-0">
                <div>
                  <div className="text-xs font-medium">{r.t}</div>
                  <div className="text-[10px] text-muted-foreground">{r.s}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] gold-text font-semibold">{r.time}</div>
                  <div className="text-[9px] text-muted-foreground">{r.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-4">
          <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-around py-3">
            {[
              { Icon: Home, l: "Home" },
              { Icon: Calendar, l: "Agenda" },
              { Icon: Sparkles, l: "AI Suite" },
              { Icon: Settings, l: "Settings" },
              { Icon: User, l: "Profile" },
            ].map(({ Icon, l }, i) => (
              <button
                key={l}
                onClick={() => toast(l, { description: `Opened ${l}` })}
                className={`h-9 w-9 rounded-xl flex items-center justify-center ${i === 2 ? "bg-gradient-to-br from-gold to-violet text-white" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
