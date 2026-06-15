import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { Phone, PhoneScroll } from "@/components/esb/Phone";
import { Menu, LayoutDashboard, CheckSquare, ClipboardList, FileBarChart, Users, Settings, User as UserIcon, ChevronLeft, Sparkles, Info } from "lucide-react";

export const Route = createFileRoute("/manager")({
  head: () => ({
    meta: [
      { title: "Manager Dashboard — ESB Brand" },
      { name: "description", content: "Manager workspace with staff roster, tasks, and AI financial suggestions." },
      { property: "og:title", content: "Manager Dashboard — ESB Brand" },
      { property: "og:description", content: "Manager workspace with staff roster, tasks, and AI financial suggestions." },
    ],
  }),
  component: ManagerPage,
});

function ManagerPage() {
  return (
    <Shell>
      <div className="flex justify-center">
        <Phone>
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet/20 blur-3xl" />

          {/* Glass sidebar */}
          <div className="absolute top-16 left-3 z-20 w-[120px] rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-2 space-y-1 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
            <div className="h-10 w-10 mx-auto rounded-full bg-gradient-to-br from-gold to-violet/60 flex items-center justify-center mb-2">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <SideItem icon={LayoutDashboard} label="Dashboard" active />
            <SideItem icon={CheckSquare} label="Tasks" />
            <SideItem icon={ClipboardList} label="Tasks" />
            <SideItem icon={FileBarChart} label="Reports" />
            <SideItem icon={Users} label="Staff" />
            <SideItem icon={Settings} label="Settings" />
          </div>

          <PhoneScroll>
            <div className="flex items-center justify-between mb-4 pl-[130px]">
              <h1 className="font-display text-2xl">Dashboard</h1>
              <button className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Menu className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tasks for Manager glass card */}
            <div className="relative rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl p-3 mb-4 pl-[130px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium">Tasks for Manager</span>
                <button className="chip-gold text-[10px]">Sign In/Out</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
                  <div className="text-[11px] font-display mb-2">Staff Roster</div>
                  <div className="space-y-1 text-[10px] text-muted-foreground">
                    <div>Approve Q1 Budget</div>
                    <div>Review Sales Report</div>
                    <div>Review Sales Report</div>
                    <div>Approve Sales Report</div>
                    <div>Review Sales Report</div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
                  <div className="text-[11px] font-display mb-2">Staff Roster</div>
                  <div className="space-y-1.5">
                    {["John Doe", "Jane Smith", "Jane Smith", "Jane Smith"].map((n, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[oklch(0.6_0.1_30)] to-[oklch(0.4_0.08_20)]" />
                        <span className="text-[9px]">{n}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-2 chip-gold text-[9px]">Sign In/Out</button>
                </div>
              </div>
              <button className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-gold text-gold-foreground flex items-center justify-center shadow-lg">
                <ChevronLeft className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3 mt-6 pl-[130px]">
              <h2 className="font-display text-base">Quick Financial Reports</h2>
              <div className="flex gap-1">
                <IconChip><Info className="h-2.5 w-2.5" /></IconChip>
                <IconChip><Info className="h-2.5 w-2.5" /></IconChip>
                <IconChip>«»</IconChip>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1.2fr] gap-2 pl-[130px]">
              <div className="space-y-2">
                <MetricCard label="Revenue" value="$50,000" />
                <MetricCard label="Expenses" value="$30,000" />
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-violet/25 to-violet/5 border border-violet/30 relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-violet/40 blur-2xl" />
                <div className="text-xs font-display relative">Suggestions <span className="text-violet">by AI</span></div>
                <div className="h-7 w-7 rounded-lg bg-gold/20 flex items-center justify-center my-2 relative">
                  <Sparkles className="h-3.5 w-3.5 gold-text" />
                </div>
                <div className="text-[10px] text-muted-foreground relative">Optimize spending for Marketing — reallocate $4.2K to retention.</div>
              </div>
            </div>
          </PhoneScroll>
        </Phone>
      </div>
    </Shell>
  );
}

function SideItem({ icon: Icon, label, active }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] ${active ? "bg-gold/90 text-gold-foreground font-semibold" : "text-muted-foreground hover:bg-white/5"}`}>
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/10 p-2.5 flex items-center justify-between">
      <div>
        <div className="text-[9px] text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
      <UserIcon className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}

function IconChip({ children }: { children: React.ReactNode }) {
  return <span className="h-5 w-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] text-muted-foreground">{children}</span>;
}
