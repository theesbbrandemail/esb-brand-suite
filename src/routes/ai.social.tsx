import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { StubPage } from "@/components/esb/StubPage";
import { Megaphone, Activity, Bot, ShieldCheck, ListChecks, Zap, BellRing } from "lucide-react";

export const Route = createFileRoute("/ai/social")({
  head: () => ({
    meta: [
      { title: "Social Media / Content AI — ESB Brand" },
      { name: "description", content: "Daily viral content engine for every sub-brand" },
      { property: "og:title", content: "Social Media / Content AI — ESB Brand" },
      { property: "og:description", content: "Daily viral content engine for every sub-brand" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Shell requireStaff>
      <StubPage
        kind="AI Role"
        name="Social Media / Content AI"
        tagline="Daily viral content engine for every sub-brand"
        description="Generates trend-aware images, videos and captions per brand, queues for approve/regenerate/auto-post, replies to comments and grows pages with engagement loops and lead capture."
        icon={Megaphone}
        accent="rose"
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
