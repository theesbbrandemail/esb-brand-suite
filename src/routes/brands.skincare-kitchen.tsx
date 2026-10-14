import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { BrandDashboard } from "@/components/esb/BrandDashboard";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/brands/skincare-kitchen")({
  head: () => ({
    meta: [
      { title: "Skincare Kitchen — ESB Brand Suite" },
      {
        name: "description",
        content:
          "Skincare Kitchen formulation laboratory dashboard: connected to skincarekitchen.com@gmail.com, skincarekitchen.com.ng web store, formulation AI bot, and Nigerian Naira (₦) revenue targets.",
      },
    ],
  }),
  component: SkincareKitchenPage,
});

function SkincareKitchenPage() {
  return (
    <Shell>
      <BrandDashboard
        brandKey="skincare-kitchen"
        name="Skincare Kitchen"
        tagline="Cosmetic Formulation Chemistry, Raw Actives & Bespoke Serum Bar"
        description="End-to-end cosmetics production facility: African botanical butter infusions, pure L-ascorbic acid batches, custom serum bars, and wholesale manufacturing in Lagos & Abuja."
        icon={FlaskConical}
        gmail="skincarekitchen.com@gmail.com"
        webStoreUrl="skincarekitchen.com.ng"
        accent="gold"
        aiBotName="Skincare Kitchen Formulation AI"
        aiBotRole="Cosmetic Formulation Chemist & Batch Stability Engineer"
        aiSystemPrompt="You are the Formulation AI for Skincare Kitchen Nigeria. Expert in cosmetic chemistry, active concentrations (Niacinamide, Vitamin C, Hyaluronic Acid, Shea Butter), raw materials procurement, batch QA testing, and Nigerian cosmetics regulations (NAFDAC compliance). Official Mailbox: skincarekitchen.com@gmail.com. Web Store: skincarekitchen.com.ng."
        suggestedAiPrompts={[
          "Calculate batch formula for 500L Vitamin C 20% serum",
          "Check raw shea & marula butter stock levels at Ikeja lab",
          "Review incoming supplier emails on skincarekitchen.com@gmail.com",
          "Issue batch safety certification for Q4 bespoke elixirs",
        ]}
        initialEmails={[
          {
            id: "em-sk1",
            from: "German Botanical Ingredients GmbH <exports@germanbotanicals.de>",
            subject: "Shipping Notice: Air Cargo LH8244 Dispense to MMIA Lagos",
            snippet: "Dear Skincare Kitchen Formulation Team, your shipment of 25kg cosmetic grade hyaluronic acid and 10,000 amber glass dropper bottles has arrived at Lagos cargo hub for clearance.",
            date: "Today, 09:12 AM",
            amountNaira: 18400000,
            unread: true,
            category: "supplier",
          },
          {
            id: "em-sk2",
            from: "Zainab Luxury Spa Abuja <zainab@luxuryspa.ng>",
            subject: "Bespoke Shea Glow Body Soufflé Wholesale Order — ₦3,850,000",
            snippet: "We wish to order 120 units of the Raw Whipped Shea & Golden Marula Body Soufflé for our Abuja spa guests. Proof of transfer attached. Please confirm dispatch date.",
            date: "Yesterday",
            amountNaira: 3850000,
            unread: false,
            category: "order",
          },
          {
            id: "em-sk3",
            from: "NAFDAC Cosmetics Registration Portal <notifications@nafdac.gov.ng>",
            subject: "Batch Certification Renewal Approval — ESB Skincare Kitchen",
            snippet: "Your product laboratory audit and stability documentation for the 2026 formulations have been marked as fully compliant under Good Manufacturing Practices.",
            date: "3 days ago",
            unread: false,
            category: "feedback",
          },
        ]}
        kpis={{
          revenueMonthlyNgn: 58400000,
          targetMonthlyNgn: 65000000,
          activeClients: 1890,
          stockUnits: 5120,
          rating: 4.95,
          growthPct: 31.8,
        }}
        popularProducts={[
          {
            name: "Vitamin C 20% + Niacinamide Radiance Elixir",
            priceNgn: 48500,
            stock: 650,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
          },
          {
            name: "Raw Whipped Shea & Golden Marula Body Soufflé",
            priceNgn: 32500,
            stock: 480,
            image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&q=80",
          },
          {
            name: "Bespoke Ceramide Barrier Lipid Restoration Oil",
            priceNgn: 58000,
            stock: 310,
            image: "https://images.unsplash.com/photo-1608248597359-5975459392e2?w=400&q=80",
          },
        ]}
      />
    </Shell>
  );
}
