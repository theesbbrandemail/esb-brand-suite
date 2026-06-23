import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { StubPage } from "@/components/esb/StubPage";
import { Truck, Activity, Bot, ShieldCheck, ListChecks, Zap, BellRing } from "lucide-react";

export const Route = createFileRoute("/ai/logistics")({
  head: () => ({
    meta: [
      { title: "Logistics AI — ESB Brand" },
      { name: "description", content: "Inventory, transfer & fleet automation" },
      { property: "og:title", content: "Logistics AI — ESB Brand" },
      { property: "og:description", content: "Inventory, transfer & fleet automation" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Shell requireStaff>
      <StubPage
        kind="AI Role"
        name="Logistics AI"
        tagline="Inventory, transfer & fleet automation"
        description="Forecasts stockouts, auto-creates transfer orders Port Harcourt ↔ Abuja, routes deliveries, flags supplier risk."
        icon={Truck}
        accent="violet"
        kpis={[
          { label: "Tasks Today", value: "—", hint: "auto-generated" },
          { label: "Pending Approval", value: "—" },
          { label: "Executed", value: "—", hint: "24h" },
          { label: "Confidence", value: "97%" },
        ]}
        modules={[
          { title: "Auto Task Queue", body: "AI-generated daily tasks routed to the right humans with deadlines and risk scoring.", icon: ListChecks },
          { title: "Auto Execute", body: "Low-risk actions execute automatically; high-risk items wait in the CEO approval vault.", icon: Zap },
          { title: "Live Signals", body: "Streaming events from connected brands & branches.", icon: Activity },
          { title: "Smart Alerts", body: "Proactive reminders, anomaly detection and follow-up nudges.", icon: BellRing },
          { title: "Compliance", body: "Audit log of every AI decision with rationale and inputs.", icon: ShieldCheck },
          { title: "Model Routing", body: "Best-fit model per task (fast / balanced / precise) with fallback.", icon: Bot },
        ]}
        actions={[{ label: "Approval Queue", to: "/suite" }]}
      />
    </Shell>
  );
}
