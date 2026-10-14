import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { BrandDashboard } from "@/components/esb/BrandDashboard";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/ai/ceo")({
  head: () => ({
    meta: [
      { title: "CEO AI Suite — ESB Brand" },
      {
        name: "description",
        content:
          "Autonomous CEO Executive Command Center: connected to esbbrand1@gmail.com, multi-brain intelligence, cross-brand orchestration in Nigerian Naira (₦).",
      },
    ],
  }),
  component: CeoAiPage,
});

function CeoAiPage() {
  return (
    <Shell requireStaff>
      <BrandDashboard
        brandKey="ceo"
        name="CEO Executive AI Suite"
        tagline="Autonomous Multi-Brain Strategic Command & Board Operations"
        description="Highest clearance executive command hub: synthesizes operations across Skincare Kitchen, Derma Aesthetics, Skin Clinic, Dental Care, and Logistics. Executes real admin directives in Nigerian Naira (₦ NGN)."
        icon={Crown}
        gmail="esbbrand1@gmail.com"
        webStoreUrl="esbbrand.com"
        accent="gold"
        aiBotName="CEO Super Gemini Multi-Brain"
        aiBotRole="Executive Autonomous Strategist & Brand Director"
        aiSystemPrompt="You are the CEO Super Gemini Multi-Brain for ESB Brand Nigeria. Direct liaison to the CEO. You orchestrate operations across all 7 sub-brands, authorize high-value deals in Nigerian Naira (₦ NGN), supervise branch directors in Lagos & Abuja, and manage communications via esbbrand1@gmail.com."
        suggestedAiPrompts={[
          "Summarize total Q4 revenue across all ESB brands in Nigerian Naira",
          "Review confidential executive board communications in esbbrand1@gmail.com",
          "Issue 15% VIP festive voucher across all clinic web stores",
          "Check doctor & nurse GPS premises attendance compliance",
        ]}
        initialEmails={[
          {
            id: "em-ceo1",
            from: "Bank of Industry & Enterprise Credit <invest@boi.ng>",
            subject: "Facility Expansion Approval Notice: Lagos Automated Lab Line",
            snippet: "Dear Executive Director, the expansion facility for the Ikeja cosmetic formulation automated filling line has been granted final approval. Disbursement scheduled for November.",
            date: "Today, 06:45 AM",
            amountNaira: 120000000,
            unread: true,
            category: "order",
          },
          {
            id: "em-ceo2",
            from: "Ministry of Health & Clinical Council <compliance@health.gov.ng>",
            subject: "Aesthetics Medical Surgery & Laser Facility Re-accreditation",
            snippet: "Accreditation Certificate issued for Port Harcourt Flagship Suite and Abuja Wuse II clinic. 100% compliance score verified.",
            date: "Yesterday",
            unread: false,
            category: "feedback",
          },
          {
            id: "em-ceo3",
            from: "Dr. Farouk Bello (Chief Aesthetician) <farouk.bello@esbbrand.com>",
            subject: "Executive Clinical Briefing: New VIP Exosome Therapy Inflows",
            snippet: "Weekly patient retention reached 94.2%. High demand recorded for Saturday private surgical bookings. All doctor rosters verified.",
            date: "3 days ago",
            unread: false,
            category: "consultation",
          },
        ]}
        kpis={{
          revenueMonthlyNgn: 215000000,
          targetMonthlyNgn: 250000000,
          activeClients: 6420,
          stockUnits: 18900,
          rating: 4.98,
          growthPct: 35.6,
        }}
        popularProducts={[
          {
            name: "CEO Executive Black Diamond Annual Aesthetics Pass",
            priceNgn: 25000000,
            stock: 12,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
          },
          {
            name: "Bespoke Corporate VIP Board Aesthetics Retainer",
            priceNgn: 18500000,
            stock: 20,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
          },
        ]}
      />
    </Shell>
  );
}
