import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { Phone, PhoneScroll } from "@/components/esb/Phone";
import { Menu, Search, Sparkles, ChevronRight, Home, Calendar, MessageCircle, Bell, User } from "lucide-react";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — ESB Brand" },
      { name: "description", content: "Patient appointments dashboard with AI-scheduled follow-ups." },
      { property: "og:title", content: "Appointments — ESB Brand" },
      { property: "og:description", content: "Patient appointments dashboard with AI-scheduled follow-ups." },
    ],
  }),
  component: AppointmentsPage,
});

const days = [
  { d: "Su", n: 24 }, { d: "Mo", n: 25 }, { d: "Tu", n: 26 },
  { d: "We", n: 27, active: true }, { d: "Th", n: 28 }, { d: "Fr", n: 29 }, { d: "Sa", n: 30 },
];
const appts = [
  { name: "Dr. Sarah Johnson", sub: "Facial Treatment", time: "09:00" },
  { name: "Emily Chen", sub: "Skin Consultation", time: "10:30" },
  { name: "Emily Chen", sub: "Skin Consultation", time: "11:30", expanded: true },
  { name: "Aaliyah Bello", sub: "Microneedling", time: "13:00" },
  { name: "Funke Adeyemi", sub: "Skin Consultation", time: "14:00" },
  { name: "Zara Okafor", sub: "Skin Consultation", time: "15:00" },
];

function AppointmentsPage() {
  return (
    <Shell>
      <div className="flex justify-center">
        <Phone>
          <PhoneScroll>
            <div className="flex items-center justify-between mb-4">
              <button className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Menu className="h-4 w-4" />
              </button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold to-violet border border-white/20" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h1 className="font-display text-2xl">Sehelics</h1>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input className="pl-7 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] w-40 focus:outline-none" placeholder="Search patients..." />
              </div>
            </div>

            <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-violet/20 to-gold/10 border border-violet/30 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-violet flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium">AI Follow-up</div>
                  <div className="text-[10px] text-muted-foreground">3 patients scheduled</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="text-sm font-display mb-2">Today's Appointments</div>
            <div className="flex gap-1.5 mb-4 overflow-x-auto">
              {days.map((d) => (
                <div key={d.n} className={`flex flex-col items-center justify-center min-w-[40px] py-1.5 rounded-xl border ${d.active ? "bg-gold text-gold-foreground border-transparent font-semibold" : "border-white/10 text-muted-foreground"}`}>
                  <span className="text-[9px] uppercase">{d.d}</span>
                  <span className="text-sm">{d.n}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground mb-2">With services</div>
            <div className="space-y-2 pb-20">
              {appts.map((a, i) => (
                <div key={i} className={`rounded-2xl border border-white/10 p-3 ${a.expanded ? "bg-gradient-to-br from-gold/15 to-violet/10 border-gold/30" : "bg-white/[0.04]"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[oklch(0.6_0.1_30)] to-[oklch(0.45_0.08_20)] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{a.sub}</div>
                      </div>
                    </div>
                    <button className="chip-gold text-[10px] shrink-0">Confirm</button>
                  </div>
                  {a.expanded && (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                      <Stat k="Serum" v="1.90m" />
                      <Stat k="Mask" v="1:00m" />
                      <Stat k="Massage" v="0:50m" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PhoneScroll>

          <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-10">
            <div className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-around py-2.5">
              {[
                { i: Home, l: "Home" },
                { i: Calendar, l: "Calendar", a: true },
                { i: MessageCircle, l: "Chat" },
                { i: Bell, l: "Alerts", dot: true },
                { i: User, l: "Profile" },
              ].map((t, i) => (
                <button key={i} className="flex flex-col items-center gap-0.5 relative">
                  <t.i className={`h-4 w-4 ${t.a ? "gold-text" : "text-muted-foreground"}`} />
                  <span className={`text-[9px] ${t.a ? "gold-text" : "text-muted-foreground"}`}>{t.l}</span>
                  {t.dot && <span className="absolute -top-0.5 right-1 h-1.5 w-1.5 rounded-full bg-danger" />}
                  {t.a && <span className="h-0.5 w-4 rounded-full bg-gold mt-0.5" />}
                </button>
              ))}
            </div>
          </div>
        </Phone>
      </div>
    </Shell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-muted-foreground">{k}</div>
      <div className="text-xs font-semibold">{v}</div>
    </div>
  );
}
