import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { Phone, PhoneScroll } from "@/components/esb/Phone";
import { Bell, Search, AlertTriangle, Truck, Warehouse, CalendarDays, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — ESB Brand" },
      { name: "description", content: "Track skincare and aesthetics inventory across branches with low-stock alerts." },
      { property: "og:title", content: "Inventory — ESB Brand" },
      { property: "og:description", content: "Track inventory across branches with low-stock alerts." },
    ],
  }),
  component: InventoryPage,
});

const products = [
  { name: "Hydrating Cream", branch: "Branch Aleun", a: "10 cm", b: "12 cm", swatch: "from-[oklch(0.55_0.18_320)] to-[oklch(0.35_0.18_300)]" },
  { name: "Firming Serum", branch: "Port Harcourt", a: "10 cm", b: "10 cm", swatch: "from-[oklch(0.55_0.18_300)] to-[oklch(0.3_0.18_290)]" },
];

function InventoryPage() {
  return (
    <Shell requireStaff>
      <div className="flex justify-center">
        <Phone>
          <PhoneScroll>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="font-display text-3xl gold-text leading-none">ESB</div>
                <div className="text-[10px] text-muted-foreground tracking-widest mt-1">SKINCARE · AESTHETICS</div>
              </div>
              <button className="h-10 w-10 rounded-full bg-gradient-to-br from-gold to-[oklch(0.6_0.13_60)] flex items-center justify-center shadow-[0_8px_20px_-6px_oklch(0.82_0.13_82/0.5)]">
                <Bell className="h-4 w-4 text-gold-foreground" />
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs placeholder:text-muted-foreground/70 focus:outline-none" placeholder="Search inventory..." />
              </div>
              <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Search className="h-4 w-4 gold-text" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl">Inventory</h2>
              <button className="text-[11px] gold-text flex items-center gap-1">Filter <ChevronRight className="h-3 w-3" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {products.map((p) => (
                <div key={p.name} className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                  <div className={`h-24 rounded-xl bg-gradient-to-br ${p.swatch} flex items-center justify-center relative overflow-hidden`}>
                    <div className="h-14 w-10 rounded-md bg-gradient-to-b from-white/30 to-white/5 backdrop-blur-sm border border-white/20" />
                    <span className="absolute bottom-1 text-[8px] gold-text font-bold tracking-widest">ESB</span>
                  </div>
                  <div className="text-xs font-medium mt-2">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.branch}</div>
                  <div className="flex justify-between text-[10px] mt-1.5 text-muted-foreground">
                    <span>{p.a}</span><span>{p.b}</span>
                  </div>
                </div>
              ))}

              {/* Low stock alert card */}
              <div className="rounded-2xl p-3 bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.65_0.14_60)] text-gold-foreground">
                <div className="h-24 rounded-xl border-2 border-gold-foreground/30 flex flex-col items-center justify-center">
                  <AlertTriangle className="h-7 w-7" strokeWidth={2.5} />
                  <div className="text-xs font-bold mt-1">Low Stock</div>
                </div>
                <div className="text-[11px] font-medium mt-2">Branch</div>
                <div className="mt-1.5 space-y-1">
                  <div className="h-1 rounded-full bg-gold-foreground/30 overflow-hidden"><div className="h-full bg-gold-foreground/80" style={{ width: "30%" }} /></div>
                  <div className="h-1 rounded-full bg-gold-foreground/30 overflow-hidden"><div className="h-full bg-gold-foreground/80" style={{ width: "55%" }} /></div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <div className="h-24 rounded-xl bg-gradient-to-br from-[oklch(0.9_0.04_80)] to-[oklch(0.7_0.06_70)] flex items-center justify-center">
                  <div className="h-14 w-10 rounded-md bg-white/80 border border-white" />
                </div>
                <div className="text-xs font-medium mt-2">Firming Serum</div>
                <div className="text-[10px] text-muted-foreground">Port Harcourt</div>
                <div className="flex justify-between text-[10px] mt-1.5 text-muted-foreground">
                  <span>12 cm</span><span>Abuja</span>
                </div>
              </div>
            </div>

            <h2 className="font-display text-xl mb-3">Logistics</h2>
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 grid grid-cols-3 gap-2">
              {[
                { icon: Truck, l: "Total Products", v: "245" },
                { icon: Warehouse, l: "In Transit", v: "45" },
                { icon: CalendarDays, l: "Expected", v: "12 items" },
              ].map((s) => (
                <div key={s.l} className="flex flex-col items-center text-center">
                  <s.icon className="h-7 w-7 gold-text mb-1.5" strokeWidth={1.5} />
                  <div className="text-[10px] text-muted-foreground">{s.l}</div>
                  <div className="text-xs font-semibold mt-0.5">{s.v}</div>
                </div>
              ))}
            </div>
          </PhoneScroll>
        </Phone>
      </div>
    </Shell>
  );
}
