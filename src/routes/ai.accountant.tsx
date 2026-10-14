import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { BrandDashboard } from "@/components/esb/BrandDashboard";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/ai/accountant")({
  head: () => ({
    meta: [
      { title: "Accountant AI Suite — ESB Brand" },
      {
        name: "description",
        content:
          "Financial Controller & Accountant AI: connected to esbbrandadmin@gmail.com, multi-branch Nigerian Naira (₦) ledger audit, bank reconciliation and payroll.",
      },
    ],
  }),
  component: AccountantAiPage,
});

function AccountantAiPage() {
  return (
    <Shell requireStaff>
      <BrandDashboard
        brandKey="accountant"
        name="ESB Financial & Accounting AI"
        tagline="Multi-Branch P&L Ledger, Bank Reconciliations & Audit in ₦ NGN"
        description="Autonomous corporate financial controller: monitors real-time revenue inflows, reconciles Zenith Bank and GTBank corporate accounts, audits staff payroll, and maintains Nigerian tax compliance."
        icon={Calculator}
        gmail="esbbrandadmin@gmail.com"
        webStoreUrl="esbbrand.com/finance"
        accent="gold"
        aiBotName="Accountant AI Controller"
        aiBotRole="Chief Financial Officer & Corporate Audit Specialist"
        aiSystemPrompt="You are the Accountant AI Controller for ESB Brand Nigeria. Expert in corporate finance, Nigerian Naira (₦ NGN) ledger balances, VAT/WHT tax compliance, multi-branch P&L statements (Port Harcourt & Abuja), and banking reconciliation (Zenith Bank, GTBank). Official Mailbox: esbbrandadmin@gmail.com."
        suggestedAiPrompts={[
          "Reconcile today's Zenith Bank corporate inflows in Nigerian Naira",
          "Audit Q4 staff payroll across Port Harcourt & Abuja branches",
          "Calculate monthly P&L comparison between Skincare Kitchen & Derma",
          "Check incoming invoice emails in esbbrandadmin@gmail.com",
        ]}
        initialEmails={[
          {
            id: "em-acc1",
            from: "Zenith Bank Corporate Banking <e-statement@zenithbank.com>",
            subject: "Daily Consolidated Credit Summary: NGN 28,450,000.00",
            snippet: "Consolidated automated corporate inflow alert for account 1018992451. All point-of-sale and direct client transfers for Port Harcourt & Abuja clinics reconciled.",
            date: "Today, 07:00 AM",
            amountNaira: 28450000,
            unread: true,
            category: "order",
          },
          {
            id: "em-acc2",
            from: "Federal Inland Revenue Service (FIRS) <e-tax@firs.gov.ng>",
            subject: "Corporate Income & VAT Filing Compliance Certificate",
            snippet: "ESB Brand Aesthetics Nigeria Ltd tax clearance status: Verified in good standing. Monthly returns acknowledged.",
            date: "Yesterday",
            unread: false,
            category: "feedback",
          },
          {
            id: "em-acc3",
            from: "Dr. Farouk Bello <farouk.bello@esbbrand.com>",
            subject: "Aesthetic Doctor Monthly Performance Commission Invoice",
            snippet: "Submitted clinical commission report for 84 VIP procedures handled in October. Commission total: ₦750,000. Please review for payout.",
            date: "2 days ago",
            amountNaira: 750000,
            unread: false,
            category: "supplier",
          },
        ]}
        kpis={{
          revenueMonthlyNgn: 184500000,
          targetMonthlyNgn: 200000000,
          activeClients: 4210,
          stockUnits: 12400,
          rating: 4.99,
          growthPct: 29.4,
        }}
        popularProducts={[
          {
            name: "Enterprise Clinical Membership Annual Retainer",
            priceNgn: 15000000,
            stock: 25,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
          },
          {
            name: "VIP Bespoke Serum Bar Annual Regimen Retainer",
            priceNgn: 4800000,
            stock: 60,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
          },
        ]}
      />
    </Shell>
  );
}
