import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { BrandDashboard } from "@/components/esb/BrandDashboard";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/brands/skinclinic")({
  head: () => ({
    meta: [
      { title: "Skin Clinic — ESB Brand Suite" },
      {
        name: "description",
        content:
          "Skin Clinic medical procedures dashboard: connected to skinclinic815@gmail.com, clinical AI bot, doctor appointment pipeline, and Nigerian Naira (₦) revenue targets.",
      },
    ],
  }),
  component: SkinClinicPage,
});

function SkinClinicPage() {
  return (
    <Shell>
      <BrandDashboard
        brandKey="skinclinic"
        name="ESB Skin Clinic"
        tagline="Doctor-Led Medical Aesthetics, Exosomes & Laser Resurfacing"
        description="Clinical procedures facility: Fractional CO2 laser, medical microneedling, exosome infusion therapy, chemical peels, and dermatological pre-consultations."
        icon={Stethoscope}
        gmail="skinclinic815@gmail.com"
        webStoreUrl="esbbrand.com/clinical"
        accent="emerald"
        aiBotName="Skin Clinic Procedures AI"
        aiBotRole="Medical Aesthetics Protocol & Post-Care Clinical Specialist"
        aiSystemPrompt="You are the Procedures AI for ESB Skin Clinic Nigeria. Expert in clinical protocols (fractional lasers, RF microneedling, exosome therapies, medical chemical peels), doctor consultation scheduling, contraindications, and patient recovery tracking in Nigerian Naira (₦ NGN). Official Mailbox: skinclinic815@gmail.com."
        suggestedAiPrompts={[
          "Book VIP Laser Resurfacing consultation for Saturday",
          "Check exosome cold-storage inventory (4°C) at Port Harcourt clinic",
          "Review clinical patient inquiries in skinclinic815@gmail.com",
          "Generate post-treatment homecare guideline for chemical peel patient",
        ]}
        initialEmails={[
          {
            id: "em-sc1",
            from: "Barrister Funke Akindele <funke.akindele@chambers.ng>",
            subject: "Appointment Request: Fractional Laser Resurfacing & Exosome Care",
            snippet: "Good morning Doctor Bello, I would like to schedule my second session of laser resurfacing this Friday afternoon at the Port Harcourt clinic. Please confirm Dr. Farouk's availability.",
            date: "Today, 10:14 AM",
            amountNaira: 450000,
            unread: true,
            category: "consultation",
          },
          {
            id: "em-sc2",
            from: "Zenith Bank Corporate Inflow <alerts@zenithbank.com>",
            subject: "CREDIT ALERT: NGN 1,850,000.00 / Annual VIP Clinical Membership",
            snippet: "Transaction Ref ZEN-MED-3910: Payment received from Chief Adeleke for comprehensive aesthetics clinical procedure package.",
            date: "Yesterday",
            amountNaira: 1850000,
            unread: false,
            category: "order",
          },
          {
            id: "em-sc3",
            from: "Dermal Supply Europe <support@dermasupply.eu>",
            subject: "Cold-Chain Quality Certificate: Medical Grade Exosome Vials",
            snippet: "Certificate of analysis for Batch EXO-2026-NG. Stored continuously at 4°C during air transit. NAFDAC compliance verified.",
            date: "2 days ago",
            unread: false,
            category: "supplier",
          },
        ]}
        kpis={{
          revenueMonthlyNgn: 49500000,
          targetMonthlyNgn: 55000000,
          activeClients: 840,
          stockUnits: 1280,
          rating: 4.98,
          growthPct: 28.2,
        }}
        popularProducts={[
          {
            name: "Post-Procedure Exosome Intensive Repair Cream",
            priceNgn: 62000,
            stock: 140,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80",
          },
          {
            name: "Medical Grade Hyaluronic Recovery Sheet Masks (Box of 5)",
            priceNgn: 38000,
            stock: 220,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
          },
          {
            name: "Clinical Gentle Enzyme Cleansing Foam",
            priceNgn: 29500,
            stock: 310,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
          },
        ]}
      />
    </Shell>
  );
}
