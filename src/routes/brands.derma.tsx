import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { BrandDashboard } from "@/components/esb/BrandDashboard";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/brands/derma")({
  head: () => ({
    meta: [
      { title: "Derma Aesthetics — ESB Brand Suite" },
      {
        name: "description",
        content:
          "Derma Aesthetics flagship dashboard: connected to dermaaesthetics.ng@gmail.com, dermaaesthetics.ng web store, clinical AI bot, and Nigerian Naira (₦) revenue targets.",
      },
    ],
  }),
  component: DermaPage,
});

function DermaPage() {
  return (
    <Shell>
      <BrandDashboard
        brandKey="derma"
        name="Derma Aesthetics"
        tagline="Clinical Skincare Retail, Sun Protection & Pre-Orders"
        description="Medical-grade skincare retail, high-protection SPF 50+ invisible fluid, hyperpigmentation regimens, and wholesale aesthetic clinic pre-orders across Nigeria."
        icon={ShoppingBag}
        gmail="dermaaesthetics.ng@gmail.com"
        webStoreUrl="dermaaesthetics.ng"
        accent="violet"
        aiBotName="Derma Clinical AI"
        aiBotRole="Dermatological Retail & Prescription Protocol Assistant"
        aiSystemPrompt="You are the Derma Clinical AI for Derma Aesthetics Nigeria. Specializing in clinical sunscreens (SPF 50+), hyperpigmentation protocols for African skin, wholesale clinic supplies, and client recommendations in Nigerian Naira (₦ NGN). Official Mailbox: dermaaesthetics.ng@gmail.com. Web store: dermaaesthetics.ng."
        suggestedAiPrompts={[
          "Draft wholesale quote for 50x SPF 50+ bottles in Nigerian Naira",
          "Create hyperpigmentation regimen for VIP client with oily skin",
          "Check stock reorder threshold for Retinol 0.5% Serum",
          "Summarize unread client emails in dermaaesthetics.ng@gmail.com",
        ]}
        initialEmails={[
          {
            id: "em-d1",
            from: "Chief (Mrs) Bukola Doherty <bukola@lagoslaw.ng>",
            subject: "Urgent Reorder: 6x SPF 50+ Invisible Fluid for Holiday Travel",
            snippet: "Hello Derma Aesthetics team, please dispatch 6 bottles of the SPF 50+ Invisible Fluid to our Banana Island residence today. Total ₦216,000 transferred to Zenith Bank.",
            date: "Today, 08:35 AM",
            amountNaira: 216000,
            unread: true,
            category: "order",
          },
          {
            id: "em-d2",
            from: "Derma Clinic Wuse II Abuja <wuse@esbbrand.com>",
            subject: "Weekly Wholesale Restock Confirmation — ₦2.4M",
            snippet: "Confirmed receipt of batch 44A Derma active elixirs. Client pre-orders for Retinol 0.5% have increased 40% this week. Requesting 30 additional units.",
            date: "Yesterday",
            amountNaira: 2400000,
            unread: false,
            category: "supplier",
          },
          {
            id: "em-d3",
            from: "Dr. Somtochukwu Obi <somto.dermatology@gmail.com>",
            subject: "Product Collaboration Inquiry: Barrier Recovery Cream",
            snippet: "I would like to stock your Derma Barrier Repair creams in our Lekki aesthetics practice for our post-laser patients. Please share wholesale price list.",
            date: "2 days ago",
            unread: false,
            category: "consultation",
          },
        ]}
        kpis={{
          revenueMonthlyNgn: 42800000,
          targetMonthlyNgn: 50000000,
          activeClients: 1240,
          stockUnits: 3450,
          rating: 4.9,
          growthPct: 24.5,
        }}
        popularProducts={[
          {
            name: "Advanced Cellular Protection SPF 50+ Invisible Fluid",
            priceNgn: 36000,
            stock: 420,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
          },
          {
            name: "Clarifying Salicylic & Zinc BHA Cleansing Gel",
            priceNgn: 28500,
            stock: 290,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80",
          },
          {
            name: "Micro-Encapsulated Retinol 0.5% Midnight Restorative",
            priceNgn: 54000,
            stock: 180,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
          },
        ]}
      />
    </Shell>
  );
}
