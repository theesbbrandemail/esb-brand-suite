import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { StubPage } from "@/components/esb/StubPage";
import { Truck, Activity, BarChart3, Package, Sparkles, Users, Bot } from "lucide-react";

export const Route = createFileRoute("/brands/logistics")({
  head: () => ({
    meta: [
      { title: "ESB Logistics — ESB Brand" },
      { name: "description", content: "Cross-branch sync, fleet & inventory transfers" },
      { property: "og:title", content: "ESB Logistics — ESB Brand" },
      { property: "og:description", content: "Cross-branch sync, fleet & inventory transfers" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Shell>
      <StubPage
        kind="Brand"
        name="ESB Logistics"
        tagline="Cross-branch sync, fleet & inventory transfers"
        description="Unified logistics: branch transfers between Port Harcourt and Abuja, fleet status, shipment tracking, supplier intake, real-time inventory sync."
        icon={Truck}
        accent="violet"
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
