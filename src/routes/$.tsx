import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import {
  LayoutGrid, Users, HeartPulse, Building2, Package, Calendar,
  Crown, ClipboardList, ArrowRight, Sparkles, Home
} from "lucide-react";

export const Route = createFileRoute("/$")({
  component: NotFoundHubPage,
});

function NotFoundHubPage() {
  const links = [
    { to: "/", title: "Main Overview", desc: "Branch metrics, quick actions & activity feed", icon: Home, color: "gold" },
    { to: "/sales", title: "Sales Team Dashboard", desc: "Department pipelines, deals & rep targets", icon: Building2, color: "gold" },
    { to: "/followups", title: "Customer Follow-up", desc: "Post-care check-ins & WhatsApp outreach", icon: HeartPulse, color: "violet" },
    { to: "/clinical", title: "Doctor & Nurse Suite", desc: "Patient queues, vitals & procedure protocols", icon: HeartPulse, color: "gold" },
    { to: "/manager", title: "Manager Operations", desc: "Branch KPIs, shifts & inventory thresholds", icon: ClipboardList, color: "violet" },
    { to: "/crm", title: "Client 360 CRM", desc: "Client profiles, VIP tiers & WhatsApp notes", icon: Users, color: "gold" },
    { to: "/ceo", title: "CEO Executive Suite", desc: "Financial controls, payroll & AI orchestrator", icon: Crown, color: "violet" },
    { to: "/appointments", title: "Appointments & Schedule", desc: "Live scheduling & consultation bookings", icon: Calendar, color: "gold" },
    { to: "/inventory", title: "Inventory & Stock", desc: "SKU tracking & cross-branch replenishment", icon: Package, color: "violet" },
  ];

  return (
    <Shell>
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-gold/15 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-7 w-7 text-gold" />
        </div>
        <h1 className="text-3xl font-display font-semibold mb-2">
          Page Navigation Hub
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
          The requested page URL was not found or has been restructured. Use the directory below to jump directly to any active workspace in the ESB Brand Suite:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-left">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="card-elevated p-4 hover:border-gold/40 transition group block"
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2.5 ${
                  item.color === "gold" ? "bg-gold/15 text-gold" : "bg-violet/15 text-violet"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold text-foreground group-hover:text-gold transition flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="chip-gold px-6 py-2.5 text-xs font-semibold inline-flex items-center gap-2"
          >
            <Home className="h-4 w-4" /> Return to Overview
          </Link>
        </div>
      </div>
    </Shell>
  );
}
