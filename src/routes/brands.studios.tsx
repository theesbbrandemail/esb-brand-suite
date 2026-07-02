import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { StubPage } from "@/components/esb/StubPage";
import { Clapperboard, Camera, Video, Mic, Sparkles, Users, Bot } from "lucide-react";

export const Route = createFileRoute("/brands/studios")({
  head: () => ({
    meta: [
      { title: "ESB Studios — ESB Brand" },
      { name: "description", content: "Studio services: photo, video, content and campaigns" },
      { property: "og:title", content: "ESB Studios — ESB Brand" },
      { property: "og:description", content: "Studio services: photo, video, content and campaigns" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Shell>
      <StubPage
        kind="Brand"
        name="ESB Studios"
        tagline="Studio services · photo · video · campaigns"
        description="In-house creative studio for all ESB brands: product photography, treatment demos, patient testimonials, ad campaigns, UGC production and brand films."
        icon={Clapperboard}
        accent="violet"
        kpis={[
          { label: "Active Shoots", value: "—" },
          { label: "Assets Delivered", value: "—", hint: "this week" },
          { label: "Booked", value: "—", hint: "next 14d" },
          { label: "Health", value: "98%" },
        ]}
        modules={[
          { title: "Photo Studio", body: "Product & lifestyle photography with lighting presets per brand.", icon: Camera },
          { title: "Video Suite", body: "Short-form reels, treatment demos, ad edits and long-form brand stories.", icon: Video },
          { title: "Podcast & Voiceover", body: "Voiceover booth for radio spots, WhatsApp voice notes and podcast eps.", icon: Mic },
          { title: "Talent Roster", body: "In-house talent, staff features and paid UGC creators managed centrally.", icon: Users },
          { title: "Content Pipeline", body: "Social AI queues studio outputs into the daily approval pipeline.", icon: Sparkles },
          { title: "AI Automation", body: "Auto-cut reels, subtitle burn-in, aspect-ratio variants for every platform.", icon: Bot },
        ]}
        actions={[{ label: "Content Pipeline", to: "/content" }, { label: "Open AI Suite", to: "/suite" }]}
      />
    </Shell>
  );
}
