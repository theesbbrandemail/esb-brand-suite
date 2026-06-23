import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { StubPage } from "@/components/esb/StubPage";
import { Smile, Activity, BarChart3, Package, Sparkles, Users, Bot } from "lucide-react";

export const Route = createFileRoute("/brands/dental")({
  head: () => ({
    meta: [
      { title: "Dental Clinic — ESB Brand" },
      { name: "description", content: "Oral & dental care, products and services" },
      { property: "og:title", content: "Dental Clinic — ESB Brand" },
      { property: "og:description", content: "Oral & dental care, products and services" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Shell>
      <StubPage
        kind="Brand"
        name="Dental Clinic"
        tagline="Oral & dental care, products and services"
        description="Dental services management: chair scheduling, treatment plans, oral care product stock and recall reminders, integrated with the Records AI."
        icon={Smile}
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
