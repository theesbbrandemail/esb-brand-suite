import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { StubPage } from "@/components/esb/StubPage";
import { Smartphone, Activity, Bot, ShieldCheck, ListChecks, Zap, BellRing } from "lucide-react";

export const Route = createFileRoute("/ai/client")({
  head: () => ({
    meta: [
      { title: "Client AI Suite — ESB Brand" },
      { name: "description", content: "WhatsApp-ready client experience" },
      { property: "og:title", content: "Client AI Suite — ESB Brand" },
      { property: "og:description", content: "WhatsApp-ready client experience" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Shell>
      <StubPage
        kind="AI Role"
        name="Client AI Suite"
        tagline="WhatsApp-ready client experience"
        description="Skin Analysis, routine builder, progress journal, loyalty XP, WhatsApp deep-link delivery of reports, product recommendations from ESB inventory, clinic booking."
        icon={Smartphone}
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
