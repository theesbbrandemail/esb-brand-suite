import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { StubPage } from "@/components/esb/StubPage";
import { FlaskConical, Activity, BarChart3, Package, Sparkles, Users, Bot } from "lucide-react";

export const Route = createFileRoute("/brands/skincare-kitchen")({
  head: () => ({
    meta: [
      { title: "Skincare Kitchen — ESB Brand" },
      { name: "description", content: "Production, R&D, sales & aesthetics intelligence" },
      { property: "og:title", content: "Skincare Kitchen — ESB Brand" },
      { property: "og:description", content: "Production, R&D, sales & aesthetics intelligence" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Shell>
      <StubPage
        kind="Brand"
        name="Skincare Kitchen"
        tagline="Production, R&D, sales & aesthetics intelligence"
        description="End-to-end Skincare Kitchen orchestration: cosmetics production lines, aesthetics R&D, sales analytics and the AI scanning pipeline that powers mobile high-quality picture capture for product QA and customer skin AI."
        icon={FlaskConical}
        accent="gold"
        kpis={[
          { label: "Active Streams", value: "12" },
          { label: "Automations", value: "08", hint: "running" },
          { label: "Today", value: "₦ —", hint: "live revenue" },
          { label: "Health", value: "98%", hint: "AI confidence" },
        ]}
        modules={[
          { title: "Live Operations", body: "Real-time event feed across Port Harcourt and Abuja branches with cross-brand context.", icon: Activity },
          { title: "Inventory Sync", body: "Two-way sync with ESB inventory; auto-replenishment thresholds per SKU.", icon: Package },
          { title: "Performance", body: "KPI rollups vs. targets with weekly/monthly comparisons.", icon: BarChart3 },
          { title: "Team", body: "Branch staff roster, shifts and Records AI attendance.", icon: Users },
          { title: "AI Automation", body: "Connected to the ESB orchestrator queue for approve / auto-execute actions.", icon: Bot },
          { title: "Content Pipeline", body: "Daily Social AI assets queued per brand for approval.", icon: Sparkles },
        ]}
        actions={[{ label: "Open AI Suite", to: "/suite" }, { label: "Inventory", to: "/inventory" }]}
      />
    </Shell>
  );
}
