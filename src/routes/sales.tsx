import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp, DollarSign, Users, ShoppingBag, Target, ArrowUpRight,
  Filter, Search, Plus, MessageCircle, Phone, CheckCircle2, Clock,
  Sparkles, Award, ArrowRight, BarChart3, ChevronDown, Download, Building2,
  AlertTriangle, ShieldCheck, FileText, Send, Printer, ExternalLink,
  Layers, Package, RefreshCw, Star, HelpCircle, Check, X, UserCheck,
  Mail
} from "lucide-react";
import { Shell } from "@/components/esb/Shell";
import { formatNaira } from "@/lib/currency";
import { SendClientGmailModal } from "@/components/esb/SendClientGmailModal";
import { GlobalBranchSwitch } from "@/components/esb/GlobalBranchSwitch";
import { getSelectedBranch, setSelectedBranch, type ActiveBranchKey } from "@/lib/branch-manager";
import {
  SEED_PRODUCT_INTELLIGENCE,
  SEED_UNMET_DEMAND_PRODUCTS,
  SEED_PRODUCT_COMPLAINTS,
  SEED_CUSTOMER_QUESTIONS,
  SEED_MARKETING_OPPORTUNITIES,
  SEED_SALES_REPS_SCORECARDS,
  BRAND_WHATSAPP_CONFIG,
  BRAND_CUSTOMER_STATS,
  buildWhatsAppLink,
  type ProductIntelligenceItem,
  type ProductComplaintRecord,
  type CustomerQuestionReferral,
  type MarketingContentOpportunity,
  type SalesRepScorecard,
  type MonthlySalesKpiReport,
} from "@/lib/sales-intelligence";
import { getStoredDeals } from "@/lib/storage";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales Intelligence, Product Demand & KPI Operations — ESB Brand" },
      {
        name: "description",
        content:
          "Executive Sales Dashboard, Product Demand Intelligence, ESB-SALES-KPI-001 Monthly Reporting, Client Workflow, and Multi-Brand WhatsApp API Hub.",
      },
    ],
  }),
  component: SalesDashboardPage,
});

type MainTab =
  | "pipeline"
  | "product_demand"
  | "monthly_report"
  | "scorecard"
  | "brand_stats"
  | "whatsapp_hub";

interface LeadDeal {
  id: string;
  clientName: string;
  phone: string;
  brand: string;
  packageName: string;
  value: number; // in NGN
  stage: "Inquiry" | "Qualified Lead" | "Booking" | "Attended" | "Completed Sale" | "Cash Collected";
  rep: string;
  branch: "Abuja" | "Port Harcourt";
  updatedAt: string;
  notes?: string;
  email?: string;
}

const INITIAL_DEALS: LeadDeal[] = [
  {
    id: "deal-101",
    clientName: "Dr. Amara Okonjo",
    phone: "+2348023341122",
    email: "amara.okonjo@gmail.com",
    brand: "Skin Clinic",
    packageName: "Hydra-Glow 6-Session Annual Protocol",
    value: 1080000,
    stage: "Cash Collected",
    rep: "Blessing Okon",
    branch: "Port Harcourt",
    updatedAt: "10 mins ago",
    notes: "Payment verified via Zenith Bank virtual account.",
  },
  {
    id: "deal-102",
    clientName: "Senator Fatima Aliyu",
    phone: "+2348091118899",
    email: "f.aliyu@gov.ng",
    brand: "Rejuvenating",
    packageName: "Executive Exosome & RF Anti-Aging Course",
    value: 2850000,
    stage: "Completed Sale",
    rep: "Chioma Nwosu",
    branch: "Abuja",
    updatedAt: "25 mins ago",
    notes: "Deposit paid. Procedure scheduled for Saturday.",
  },
  {
    id: "deal-103",
    clientName: "Chinedu Eke",
    phone: "+2348189987766",
    email: "c.eke@investcorp.ng",
    brand: "Skincare Kitchen",
    packageName: "Custom Peptide Serum Bulk Order (25 units)",
    value: 850000,
    stage: "Booking",
    rep: "Kareem Adeleke",
    branch: "Port Harcourt",
    updatedAt: "1 hour ago",
    notes: "Consultation booked for formulation approval.",
  },
  {
    id: "deal-104",
    clientName: "Hauwa Bello",
    phone: "+2348035552345",
    email: "hauwa.bello@gmail.com",
    brand: "Dental Clinic",
    packageName: "Hollywood Laser Whitening + Guard Kit",
    value: 620000,
    stage: "Qualified Lead",
    rep: "Zainab Mohammed",
    branch: "Abuja",
    updatedAt: "2 hours ago",
    notes: "Qualified on WhatsApp; requested weekend slot.",
  },
  {
    id: "deal-105",
    clientName: "Tunde Bakare",
    phone: "+2348074441234",
    email: "tunde.bakare@gmail.com",
    brand: "Derma Aesthetics",
    packageName: "Post-Peel Cellular Recovery Box",
    value: 390000,
    stage: "Inquiry",
    rep: "Blessing Okon",
    branch: "Port Harcourt",
    updatedAt: "3 hours ago",
    notes: "Inquired via Instagram ad; waiting for callback.",
  },
  {
    id: "deal-106",
    clientName: "Chief Adewale Adeleke",
    phone: "+2348034528891",
    email: "adeleke.adewale@gmail.com",
    brand: "Derma Aesthetics",
    packageName: "Stem Cell Anti-Aging Full Protocol",
    value: 2450000,
    stage: "Attended",
    rep: "Chioma Nwosu",
    branch: "Abuja",
    updatedAt: "Today 11:15 AM",
    notes: "Attended in-person consultation with Dr. Ngozi Eze.",
  },
];

function SalesDashboardPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("pipeline");
  const [selectedBranch, setSelectedBranchState] = useState<"All Branches" | "Abuja" | "Port Harcourt">(() => {
    const cur = getSelectedBranch();
    return cur === "ph" ? "Port Harcourt" : cur === "abuja" ? "Abuja" : "All Branches";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [deals, setDeals] = useState<LeadDeal[]>(INITIAL_DEALS);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Gmail direct compose modal state
  const [gmailModal, setGmailModal] = useState<{
    open: boolean;
    clientName: string;
    clientEmail: string;
    brand: string;
    packageName: string;
    value: number;
    phone?: string;
  }>({
    open: false,
    clientName: "",
    clientEmail: "",
    brand: "Derma Aesthetics",
    packageName: "",
    value: 0,
  });

  // Listen for global branch switcher changes
  useEffect(() => {
    const onBranchChange = (e: Event) => {
      const custom = e as CustomEvent<{ branch: ActiveBranchKey }>;
      if (custom.detail?.branch === "ph") {
        setSelectedBranchState("Port Harcourt");
      } else if (custom.detail?.branch === "abuja") {
        setSelectedBranchState("Abuja");
      } else {
        setSelectedBranchState("All Branches");
      }
    };
    window.addEventListener("esb_branch_changed", onBranchChange);
    return () => window.removeEventListener("esb_branch_changed", onBranchChange);
  }, []);

  const handleBranchSelect = (b: "All Branches" | "Port Harcourt" | "Abuja") => {
    setSelectedBranchState(b);
    setSelectedBranch(b === "Port Harcourt" ? "ph" : b === "Abuja" ? "abuja" : "all");
  };

  // New deal state
  const [newClient, setNewClient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBrand, setNewBrand] = useState("Derma Aesthetics");
  const [newPackage, setNewPackage] = useState("");
  const [newValueNgn, setNewValueNgn] = useState("");
  const [newRep, setNewRep] = useState("Blessing Okon");

  // Product Demand state
  const [productsList, setProductsList] = useState<ProductIntelligenceItem[]>(SEED_PRODUCT_INTELLIGENCE);
  const [complaintsList, setComplaintsList] = useState<ProductComplaintRecord[]>(SEED_PRODUCT_COMPLAINTS);
  const [questionsList, setQuestionsList] = useState<CustomerQuestionReferral[]>(SEED_CUSTOMER_QUESTIONS);
  const [marketingList, setMarketingList] = useState<MarketingContentOpportunity[]>(SEED_MARKETING_OPPORTUNITIES);
  const [productSearch, setProductSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");

  // WhatsApp quick-message state
  const [selectedWaBrand, setSelectedWaBrand] = useState<string>("derma");
  const [customWaClient, setCustomWaClient] = useState("");
  const [customWaMsg, setCustomWaMsg] = useState("");

  // Sync with background task manager
  useEffect(() => {
    const handleSync = () => {
      const stored = getStoredDeals();
      if (stored && stored.length > 0) {
        setDeals((prev) => {
          const map = new Map(prev.map((d) => [d.id, d]));
          for (const s of stored) {
            if (!map.has(s.id)) {
              map.set(s.id, {
                id: s.id,
                clientName: s.clientName,
                phone: s.phone,
                brand:
                  s.department === "derma"
                    ? "Derma Aesthetics"
                    : s.department === "skincare-kitchen"
                    ? "Skincare Kitchen"
                    : "Skin Clinic",
                packageName: s.packageName,
                value: s.value,
                stage: s.stage === "paid" ? "Cash Collected" : s.stage === "closed" ? "Completed Sale" : "Qualified Lead",
                rep: s.assignedRep,
                branch: (s.notes?.toLowerCase().includes("abuja") ? "Abuja" : "Port Harcourt") as "Port Harcourt" | "Abuja",
                updatedAt: "Just now",
                notes: s.notes,
              });
            }
          }
          return Array.from(map.values());
        });
      }
    };
    handleSync();
    window.addEventListener("esb_crm_synced", handleSync);
    window.addEventListener("esb_background_sync_tick", handleSync);
    return () => {
      window.removeEventListener("esb_crm_synced", handleSync);
      window.removeEventListener("esb_background_sync_tick", handleSync);
    };
  }, []);

  // Pipeline Metrics (Non-inflated, distinct stages)
  const pipelineMetrics = useMemo(() => {
    const branchDeals = deals.filter(
      (d) => selectedBranch === "All Branches" || d.branch === selectedBranch
    );

    const inquiries = branchDeals.filter((d) => d.stage === "Inquiry");
    const qualified = branchDeals.filter((d) => d.stage === "Qualified Lead");
    const bookings = branchDeals.filter((d) => d.stage === "Booking");
    const attended = branchDeals.filter((d) => d.stage === "Attended");
    const sales = branchDeals.filter((d) => d.stage === "Completed Sale");
    const cashCollected = branchDeals.filter((d) => d.stage === "Cash Collected");

    const totalCollectedNgn = cashCollected.reduce((acc, d) => acc + d.value, 0);
    const totalPotentialNgn = branchDeals.reduce((acc, d) => acc + d.value, 0);

    return {
      inquiriesCount: inquiries.length,
      qualifiedCount: qualified.length,
      bookingsCount: bookings.length,
      attendedCount: attended.length,
      salesCount: sales.length,
      cashCount: cashCollected.length,
      totalCollectedNgn,
      totalPotentialNgn,
      conversionPct: branchDeals.length > 0 ? Math.round(((sales.length + cashCollected.length) / branchDeals.length) * 100) : 0,
    };
  }, [deals, selectedBranch]);

  // Handle stage update
  const handleUpdateDealStage = (id: string, nextStage: LeadDeal["stage"]) => {
    setDeals(
      deals.map((d) => (d.id === id ? { ...d, stage: nextStage, updatedAt: "Just now" } : d))
    );
    toast.success(`Deal updated to ${nextStage}`, {
      description: "Client workflow stage updated across CRM and Accounting audit trail.",
    });
  };

  const handleCreateDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newValueNgn) {
      toast.error("Please enter client name and deal value");
      return;
    }

    const created: LeadDeal = {
      id: `deal-${Date.now()}`,
      clientName: newClient.trim(),
      phone: newPhone.trim() || "+2348000000000",
      brand: newBrand,
      packageName: newPackage.trim() || "Custom Skincare Protocol",
      value: parseFloat(newValueNgn) || 150000,
      stage: "Inquiry",
      rep: newRep,
      branch: selectedBranch === "All Branches" ? "Abuja" : selectedBranch,
      updatedAt: "Just now",
      notes: "Logged directly via Sales Suite.",
    };

    setDeals([created, ...deals]);
    toast.success(`Lead logged for ${newClient}!`, {
      description: `${formatNaira(created.value)} placed in ${newBrand} pipeline.`,
    });

    setNewClient("");
    setNewPhone("");
    setNewPackage("");
    setNewValueNgn("");
    setShowAddDealModal(false);
  };

  // Submit Monthly Intelligence Report
  const handleSubmitMonthlyReport = () => {
    toast.success("Document ESB-SALES-KPI-001 Submitted!", {
      description: "Report forwarded to Operations Manager & CEO. Audit ID: #REP-2026-10-OCT",
    });
    setShowReportModal(false);
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* ================================================================== */}
        {/* HEADER SECTION & REPORT CODE */}
        {/* ================================================================== */}
        <div className="p-6 rounded-3xl bg-secondary/30 border border-gold/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gold uppercase tracking-wider mb-1 font-semibold">
              <Building2 className="h-4 w-4" /> ESB Brand Commercial Suite • Document: ESB-SALES-KPI-001
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Sales Intelligence & Commercial Operations
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
              Demand analytics, non-inflated client workflows, salesperson scorecard ratings, and unified WhatsApp + Gmail API connectivity across Port Harcourt & Abuja facilities.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Branch Filter */}
            <div className="flex bg-background rounded-xl p-1 border border-border text-xs">
              {(["All Branches", "Port Harcourt", "Abuja"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => handleBranchSelect(b)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    selectedBranch === b ? "bg-gold text-black font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setGmailModal({
                  open: true,
                  clientName: "Valued Client",
                  clientEmail: "",
                  brand: "Derma Aesthetics",
                  packageName: "Clinical Consultation",
                  value: 150000,
                })
              }
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 flex items-center gap-1.5 shadow-sm transition"
              title="Compose message to client Gmail inbox"
            >
              <Mail className="h-3.5 w-3.5" /> Client Gmail
            </button>

            <button
              onClick={() => setShowAddDealModal(true)}
              className="chip-gold px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Log Inquiry
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* TOP LEVEL NAVIGATION TABS */}
        {/* ================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 p-1 rounded-2xl bg-secondary/30 border border-border">
          {[
            { key: "pipeline", label: "Client Workflow & Pipeline", icon: Layers },
            { key: "product_demand", label: "Product Demand & Reasons KPI", icon: Package },
            { key: "monthly_report", label: "Monthly Intelligence Report (ESB-001)", icon: FileText },
            { key: "scorecard", label: "Sales Rep Scorecards & Commissions", icon: Award },
            { key: "brand_stats", label: "Brand Customer Statistics", icon: BarChart3 },
            { key: "whatsapp_hub", label: "WhatsApp Multi-Brand API Hub", icon: MessageCircle },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as MainTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                  active
                    ? "bg-gold text-black shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================================== */}
        {/* TAB 1: CLIENT WORKFLOW & PIPELINE */}
        {/* ================================================================== */}
        {activeTab === "pipeline" && (
          <div className="space-y-6 animate-fade-in">
            {/* Workflow Stages Ribbon (Strict distinction to avoid inflated numbers) */}
            <div className="p-4 rounded-2xl bg-secondary/40 border border-gold/30">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Client Workflow Integrity Pipeline
                </span>
                <span className="text-muted-foreground font-mono">
                  Distinguishes inquiries from bookings, bookings from attended, & sales from collected cash.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: "1. Inquiries", count: pipelineMetrics.inquiriesCount, sub: "Raw leads received", color: "text-blue-400" },
                  { label: "2. Qualified", count: pipelineMetrics.qualifiedCount, sub: "Buying potential verified", color: "text-cyan-400" },
                  { label: "3. Bookings", count: pipelineMetrics.bookingsCount, sub: "Appointment reserved", color: "text-violet-400" },
                  { label: "4. Attended", count: pipelineMetrics.attendedCount, sub: "Patient at clinic/lab", color: "text-amber-400" },
                  { label: "5. Sales Closed", count: pipelineMetrics.salesCount, sub: "Order authorized", color: "text-emerald-400" },
                  { label: "6. Cash Collected", count: pipelineMetrics.cashCount, sub: formatNaira(pipelineMetrics.totalCollectedNgn), color: "text-gold font-bold" },
                ].map((st, i) => (
                  <div key={i} className="p-3 rounded-xl bg-background/80 border border-white/5 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground">{st.label}</div>
                    <div className={`text-lg sm:text-xl font-display font-bold ${st.color}`}>
                      {typeof st.count === "number" ? st.count : st.count}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{st.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Deals List */}
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Active Client Deals & Inquiries ({deals.length})</h3>
                  <p className="text-xs text-muted-foreground">Advance deals through the clinical and sales stages with real-time audit logging.</p>
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by client or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {deals
                  .filter((d) => {
                    const matchesBranch = selectedBranch === "All Branches" || d.branch === selectedBranch;
                    const matchesQ =
                      d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      d.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      d.brand.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesBranch && matchesQ;
                  })
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 rounded-xl bg-[#1C172E] border border-white/5 hover:border-gold/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{deal.clientName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-medium">
                            {deal.brand}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                            {deal.branch}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {formatNaira(deal.value)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{deal.packageName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                          <span>Rep: <strong className="text-foreground">{deal.rep}</strong></span>
                          <span>•</span>
                          <span>{deal.updatedAt}</span>
                          {deal.notes && (
                            <>
                              <span>•</span>
                              <span className="italic text-amber-200/80">{deal.notes}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stage Progression & WhatsApp Action */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border text-[11px]">
                          {(["Inquiry", "Qualified Lead", "Booking", "Attended", "Completed Sale", "Cash Collected"] as const).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateDealStage(deal.id, st)}
                                className={`px-2 py-1 rounded-lg transition-all ${
                                  deal.stage === st
                                    ? "bg-gold text-black font-bold shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
                        </div>

                        {/* WhatsApp Contact */}
                        <a
                          href={buildWhatsAppLink(
                            deal.phone,
                            `Hello ${deal.clientName}! This is ${deal.rep} from ${deal.brand}. Following up on your ${deal.packageName} inquiry.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                          title="Contact on WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>

                        {/* Gmail Contact */}
                        <button
                          type="button"
                          onClick={() =>
                            setGmailModal({
                              open: true,
                              clientName: deal.clientName,
                              clientEmail: deal.email || `${deal.clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
                              brand: deal.brand,
                              packageName: deal.packageName,
                              value: deal.value,
                              phone: deal.phone,
                            })
                          }
                          className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                          title="Send Message to Client Gmail Inbox"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: PRODUCT DEMAND INTELLIGENCE & REASONS ANALYSIS */}
        {/* ================================================================== */}
        {activeTab === "product_demand" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header explanation */}
            <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gold flex items-center gap-2">
                  <Package className="h-4 w-4" /> Section B: Product Demand Intelligence & Barrier Analysis
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aggregated from CRM, WhatsApp, phone, and in-person records. Evaluates customer interest, lost sale reasons, stockouts, and necessary department interventions.
                </p>
              </div>

              {/* Brand Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {["All", "Derma Aesthetics", "Skincare Kitchen", "Skin Clinic"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilterBrand(b)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                      filterBrand === b ? "bg-gold text-black font-bold" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Top 10 Product Demand Intelligence Table */}
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-display font-bold text-sm text-foreground">
                  Product Demand Intelligence Matrix (Top SKUs)
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Showing {productsList.length} monitored SKUs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1C172E] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Product & Brand</th>
                      <th className="p-3.5 text-center">Inquiries</th>
                      <th className="p-3.5 text-center">Units Sold</th>
                      <th className="p-3.5 text-right">Revenue (₦)</th>
                      <th className="p-3.5 text-center">Stock</th>
                      <th className="p-3.5">Main Lost Reason</th>
                      <th className="p-3.5">Recommended Action</th>
                      <th className="p-3.5">Dept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {productsList
                      .filter((p) => filterBrand === "All" || p.brand === filterBrand)
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-3.5">
                            <div className="font-bold text-foreground text-sm">{prod.name}</div>
                            <div className="text-[10px] text-gold font-medium">{prod.brand} • {prod.category}</div>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-foreground">
                            {prod.inquiriesCount}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                            {prod.unitsSold}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-gold">
                            {formatNaira(prod.revenueGeneratedNgn)}
                          </td>
                          <td className="p-3.5 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.stockAvailable === 0
                                  ? "bg-rose-500/20 text-rose-400"
                                  : prod.stockAvailable < 15
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-emerald-500/20 text-emerald-400"
                              }`}
                            >
                              {prod.stockAvailable} units
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-[11px] font-medium text-amber-200">
                              {prod.mainLostReason} ({prod.lostSalesCount} lost)
                            </span>
                          </td>
                          <td className="p-3.5 max-w-xs text-[11px] text-muted-foreground leading-snug">
                            {prod.recommendedAction}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-foreground font-mono">
                              {prod.responsibleDept}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unmet Demand: Products Customers Request That ESB Does Not Stock */}
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Unmet Customer Demand: Products Requested but Not Currently Stocked</span>
                </h4>
                <span className="text-xs text-gold font-mono">Procurement & R&D Log</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Documented directly from customer conversations to guide future formulation batches and pharmaceutical stocking.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {SEED_UNMET_DEMAND_PRODUCTS.map((unmet, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#1C172E] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{unmet.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                        {unmet.inquiriesCount} inquiries
                      </span>
                    </div>
                    <div className="text-[10px] text-gold">{unmet.category}</div>
                    <div className="text-[11px] text-muted-foreground">{unmet.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: MONTHLY INTELLIGENCE REPORT (ESB-SALES-KPI-001) */}
        {/* ================================================================== */}
        {activeTab === "monthly_report" && (
          <div className="space-y-6 animate-fade-in">
            {/* Document Header Card */}
            <div className="p-6 rounded-3xl bg-secondary/40 border border-gold/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase">
                  <span>Code: ESB-SALES-KPI-001</span>
                  <span>•</span>
                  <span>Frequency: Monthly Submission</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mt-1">
                  Monthly Sales Performance & Customer Intelligence Report
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consolidated management report compiled by Sales Lead & Operations. Covers Sections A through J.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border text-foreground flex items-center gap-1.5 transition"
                >
                  <Printer className="h-3.5 w-3.5 text-gold" />
                  <span>View Printable Form</span>
                </button>
                <button
                  onClick={handleSubmitMonthlyReport}
                  className="chip-gold px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit to Management</span>
                </button>
              </div>
            </div>

            {/* SECTION A & C & E HIGHLIGHTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section C: Product Complaints Register */}
              <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-rose-400" />
                    <span>Section C: Product Complaints Register</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono uppercase font-bold">
                    Strict Escalation
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sales staff must not diagnose reactions or promise unauthorized refunds. Immediate escalation to Pharmacist or Doctor.
                </p>

                <div className="space-y-2.5 pt-2">
                  {complaintsList.map((comp) => (
                    <div key={comp.id} className="p-3 rounded-xl bg-[#1C172E] border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{comp.productName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          {comp.complaintType}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground italic">
                        "{comp.customerDescription}"
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-white/5">
                        <span>Batch: <strong className="text-foreground">{comp.batchLot}</strong></span>
                        <span>Action: <strong className="text-emerald-400">{comp.actionTaken}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section E: Customer Questions for Professional Review */}
              <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-cyan-400" />
                    <span>Section E: Questions Forwarded to Doctor/Nurse/Pharmacist</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    Professional Queue
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sales gathers information; qualified clinicians & pharmacists provide approved technical guidance.
                </p>

                <div className="space-y-2.5 pt-2">
                  {questionsList.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-[#1C172E] border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">"{q.question}"</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-gold font-bold">
                          To {q.referredTo}
                        </span>
                      </div>
                      {q.approvedResponse && (
                        <div className="p-2 rounded bg-background/60 text-[11px] text-emerald-300 border border-emerald-500/20">
                          <strong>Approved Response:</strong> {q.approvedResponse}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground">
                        Asked {q.timesAsked} times • Action: {q.furtherActionRequired}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section H: Marketing Opportunities Identified by Sales */}
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span>Section H: Marketing Content Opportunities (From Actual Inquiries)</span>
                </h4>
                <span className="text-xs text-muted-foreground font-mono">Monthly Feedback Loop</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {marketingList.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-[#1C172E] border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{m.topic}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-mono">
                        {m.inquiriesCount} Inquiries
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{m.customerConcernOrGap}</div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-white/5">
                      <span>Format: <strong className="text-foreground">{m.suggestedFormat}</strong></span>
                      <span>Reviewer: <strong className="text-cyan-300">{m.requiredReview}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: SALES REP SCORECARDS & COMMISSIONS */}
        {/* ================================================================== */}
        {activeTab === "scorecard" && (
          <div className="space-y-6 animate-fade-in">
            {/* Scorecard Methodology Banner */}
            <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-1">
                Section 8: Monthly Sales KPI Scorecard Methodology (100% Total)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sales staff are measured across five balanced areas rather than judging on revenue alone:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-gold">35% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Revenue vs Target</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-cyan-400">20% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Lead Conversion</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-violet-400">20% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Customer Intelligence</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-emerald-400">15% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Retention & Repeat</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-amber-300">10% Weight</div>
                  <div className="text-[10px] text-muted-foreground">CRM Discipline</div>
                </div>
              </div>
            </div>

            {/* Sales Rep Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SEED_SALES_REPS_SCORECARDS.map((sc, i) => (
                <div key={i} className="card-elevated p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold text-foreground">{sc.repName}</div>
                      <div className="text-xs text-muted-foreground">{sc.department} • {sc.branch}</div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold font-mono ${
                        sc.totalScore >= 90
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-gold/20 text-gold border border-gold/30"
                      }`}
                    >
                      {sc.totalScore}% • {sc.grade}
                    </span>
                  </div>

                  {/* Progress bars for the 5 categories */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Revenue Achievement (35% max)</span>
                        <span className="font-mono text-gold font-bold">{sc.revenueScore} / 35</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${(sc.revenueScore / 35) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Lead Conversion & Follow-up (20% max)</span>
                        <span className="font-mono text-cyan-400 font-bold">{sc.conversionScore} / 20</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(sc.conversionScore / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Customer Intelligence Reporting (20% max)</span>
                        <span className="font-mono text-violet-400 font-bold">{sc.intelligenceScore} / 20</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-violet-400 rounded-full" style={{ width: `${(sc.intelligenceScore / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Retention & Repeat Purchases (15% max)</span>
                        <span className="font-mono text-emerald-400 font-bold">{sc.retentionScore} / 15</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(sc.retentionScore / 15) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">CRM Discipline & Timely Escalations (10% max)</span>
                        <span className="font-mono text-amber-300 font-bold">{sc.crmDisciplineScore} / 10</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(sc.crmDisciplineScore / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Summary & Verified Commission */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Eligible Collected Sales</div>
                      <div className="font-mono font-bold text-foreground">{formatNaira(sc.actualRevenueNgn)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground">Approved Commission (2%)</div>
                      <div className="font-mono font-bold text-emerald-400">
                        {formatNaira(Math.round(sc.actualRevenueNgn * 0.02))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: BRAND CUSTOMER STATISTICS */}
        {/* ================================================================== */}
        {activeTab === "brand_stats" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-1">
                Sub-Brand Customer Intelligence & Retention Analytics
              </h3>
              <p className="text-xs text-muted-foreground">
                Live customer cohort analysis across Derma Aesthetics, Skincare Kitchen, Skin Clinic, Dental Clinic, and Rejuvenating Suite.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BRAND_CUSTOMER_STATS.map((b) => (
                <div key={b.brandKey} className="card-elevated p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-base text-foreground">{b.name}</h4>
                    <span className="text-xs text-amber-300 flex items-center gap-1 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{b.satisfactionRating} / 5.0</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-background/60">
                      <div className="text-[10px] text-muted-foreground">Total Customers</div>
                      <div className="text-base font-bold text-foreground font-mono">{b.totalCustomers}</div>
                      <div className="text-[9px] text-gold">{b.vipCustomers} VIPs</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background/60">
                      <div className="text-[10px] text-muted-foreground">Conversion Rate</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">{b.conversionRatePct}%</div>
                      <div className="text-[9px] text-muted-foreground">{b.monthlyInquiries} inquiries/mo</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-white/5">
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Average Order Value:</span>
                      <span className="font-mono font-bold text-gold">{formatNaira(b.avgOrderValueNgn)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Repeat Return Rate:</span>
                      <span className="font-mono text-cyan-300 font-semibold">{b.returnCustomerRatePct}%</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1C172E] text-[11px] space-y-1">
                    <div className="text-[10px] text-gold font-semibold uppercase">Top Customer Inquiries:</div>
                    <div className="text-foreground italic">"{b.topInquiryQuestion}"</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 6: WHATSAPP MULTI-BRAND API HUB */}
        {/* ================================================================== */}
        {activeTab === "whatsapp_hub" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-1">
                Multi-Brand WhatsApp Click-to-Chat API & Escalation Desk
              </h3>
              <p className="text-xs text-muted-foreground">
                Direct WhatsApp integration for each specialized sub-brand with approved compliance templates and clinical forwarding.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Brand Cards */}
              <div className="lg:col-span-2 space-y-4">
                {Object.values(BRAND_WHATSAPP_CONFIG).map((b) => (
                  <div
                    key={b.key}
                    className={`card-elevated p-5 rounded-2xl border transition-all ${
                      selectedWaBrand === b.key ? "border-gold bg-[#1D1730]" : "border-white/10"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-foreground">{b.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                            {b.formattedPhone}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Category: <strong className="text-gold">{b.leadCategory}</strong> • Officer: {b.responsibleStaff}
                        </div>
                      </div>

                      <a
                        href={buildWhatsAppLink(b.phoneNumber, b.defaultMessage)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-md shrink-0"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Open Brand WhatsApp</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Quick Templates */}
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                      <div className="text-[10px] text-muted-foreground font-semibold uppercase">Approved Quick Message Templates:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {b.quickTemplates.map((t, idx) => (
                          <a
                            key={idx}
                            href={buildWhatsAppLink(b.phoneNumber, t.text)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground border border-border flex items-center gap-1 transition"
                          >
                            <span>{t.label}</span>
                            <ArrowUpRight className="h-3 w-3 text-gold" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Custom Message Composer */}
              <div className="card-elevated p-5 rounded-2xl border border-white/10 space-y-4 h-fit">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Send className="h-4 w-4 text-gold" />
                  <span>Custom WhatsApp Dispatcher</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Send personalized inquiries, payment reminders, or lab dispatch notifications directly to client WhatsApp.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-muted-foreground">Select Sub-Brand</label>
                    <select
                      value={selectedWaBrand}
                      onChange={(e) => setSelectedWaBrand(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                    >
                      {Object.values(BRAND_WHATSAPP_CONFIG).map((b) => (
                        <option key={b.key} value={b.key}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground">Recipient Phone Number (+234)</label>
                    <input
                      type="text"
                      placeholder="+234 803 000 0000"
                      value={customWaClient}
                      onChange={(e) => setCustomWaClient(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground">Message Body</label>
                    <textarea
                      rows={4}
                      placeholder="Type custom dispatch message..."
                      value={customWaMsg}
                      onChange={(e) => setCustomWaMsg(e.target.value)}
                      className="w-full mt-1 p-3 rounded-xl bg-secondary border border-border text-foreground text-xs"
                    />
                  </div>

                  <a
                    href={buildWhatsAppLink(customWaClient || "2348032214982", customWaMsg || "Hello from ESB Brand Suite!")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full chip-gold py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md block text-center"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Send via WhatsApp API</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODAL: LOG NEW DEAL */}
        {/* ================================================================== */}
        {showAddDealModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateDealSubmit}
              className="card-elevated max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4 text-gold" /> Log New Client Inquiry
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground">Client Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Folashade Adeleke"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 803 123 4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground">Sub-Brand Pipeline</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    <option value="Derma Aesthetics">Derma Aesthetics</option>
                    <option value="Skincare Kitchen">Skincare Kitchen</option>
                    <option value="Skin Clinic">Skin Clinic</option>
                    <option value="Dental Clinic">Dental Clinic</option>
                    <option value="Rejuvenating">Rejuvenating Aesthetics</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground">Package / Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Exosome Cellular Protocol"
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground">Estimated Deal Value (₦ NGN)</label>
                  <input
                    type="number"
                    required
                    placeholder="450000"
                    value={newValueNgn}
                    onChange={(e) => setNewValueNgn(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground">Assigned Sales Representative</label>
                  <select
                    value={newRep}
                    onChange={(e) => setNewRep(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    <option value="Blessing Okon">Blessing Okon (Skin Clinic & Derma)</option>
                    <option value="Chioma Nwosu">Chioma Nwosu (Rejuvenating Suite)</option>
                    <option value="Kareem Adeleke">Kareem Adeleke (Skincare Kitchen)</option>
                    <option value="Zainab Mohammed">Zainab Mohammed (Dental Aesthetics)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                >
                  Cancel
                </button>
                <button type="submit" className="chip-gold px-4 py-2 text-xs font-semibold">
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODAL: PRINTABLE MONTHLY REPORT FORM (ESB-SALES-KPI-001) */}
        {/* ================================================================== */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="card-elevated max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 bg-[#120E20] border border-gold/40 max-h-[90vh] overflow-y-auto">
              {/* Official Header */}
              <div className="border-b-2 border-gold/60 pb-4 text-center space-y-1">
                <div className="text-xs uppercase tracking-widest text-gold font-bold">ESB Brand Suite • Commercial Division</div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  MONTHLY SALES PERFORMANCE & CUSTOMER INTELLIGENCE REPORT
                </h2>
                <div className="text-xs font-mono text-muted-foreground">
                  Document Code: <strong>ESB-SALES-KPI-001</strong> | Reporting Frequency: Monthly Submission
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-secondary/30 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Reporting Month:</span>
                  <span className="font-bold text-foreground">October 2026</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Branch:</span>
                  <span className="font-bold text-foreground">{selectedBranch}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Prepared By:</span>
                  <span className="font-bold text-foreground">Blessing Okon (Lead Rep)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Sales Team Lead:</span>
                  <span className="font-bold text-foreground">Chioma Okeke (Director)</span>
                </div>
              </div>

              {/* Section A Summary */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-sm text-gold border-b border-white/10 pb-1">
                  SECTION A — SALES PERFORMANCE
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-background/50 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Total Inquiries:</span>
                    <strong className="text-foreground">248 Inquiries</strong>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Qualified Leads:</span>
                    <strong className="text-foreground">185 Leads (74.5%)</strong>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Completed Sales:</span>
                    <strong className="text-foreground">92 Transactions</strong>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Product Sales Revenue:</span>
                    <strong className="text-gold font-mono">{formatNaira(18450000)}</strong>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Service Sales Revenue:</span>
                    <strong className="text-gold font-mono">{formatNaira(24800000)}</strong>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Total Revenue Collected:</span>
                    <strong className="text-emerald-400 font-mono font-bold">{formatNaira(43250000)}</strong>
                  </div>
                </div>
              </div>

              {/* Section G: Lost Sales Analysis */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-sm text-gold border-b border-white/10 pb-1">
                  SECTION G — LOST SALES ANALYSIS
                </h4>
                <table className="w-full text-left">
                  <thead className="text-[10px] text-muted-foreground uppercase">
                    <tr>
                      <th className="py-1">Primary Reason</th>
                      <th className="py-1 text-center">Number of Leads</th>
                      <th className="py-1 text-right">Estimated Lost Value (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    <tr>
                      <td className="py-1 text-foreground">Out of stock / unavailable</td>
                      <td className="py-1 text-center text-amber-300">42 leads</td>
                      <td className="py-1 text-right text-rose-400">{formatNaira(3800000)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-foreground">Price sensitivity / too expensive</td>
                      <td className="py-1 text-center text-amber-300">35 leads</td>
                      <td className="py-1 text-right text-rose-400">{formatNaira(4200000)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-foreground">Customer needs doctor/nurse consult</td>
                      <td className="py-1 text-center text-amber-300">28 leads</td>
                      <td className="py-1 text-right text-rose-400">{formatNaira(2900000)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-foreground">Uncertain about results / education gap</td>
                      <td className="py-1 text-center text-amber-300">19 leads</td>
                      <td className="py-1 text-right text-rose-400">{formatNaira(1450000)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section I: Recommendations to Management */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-sm text-gold border-b border-white/10 pb-1">
                  SECTION I — RECOMMENDATIONS TO MANAGEMENT
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li><strong>Replenish Stock:</strong> Immediate bulk restock for Liposomal Vitamin C and Exosome Serums in Abuja hub to recover ₦3.8M in lost sales.</li>
                  <li><strong>Doctor/Nurse Consultation Routing:</strong> Implement instant WhatsApp handover for clinical procedure inquiries instead of raw quote drops.</li>
                  <li><strong>Marketing Education:</strong> Release video FAQ explaining exosome recovery timeline to address price objections.</li>
                </ul>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Document</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl text-muted-foreground"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSubmitMonthlyReport}
                    className="chip-gold px-4 py-2 font-semibold flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Authorize & Submit Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Client Gmail Modal */}
        <SendClientGmailModal
          open={gmailModal.open}
          onOpenChange={(open) => setGmailModal((prev) => ({ ...prev, open }))}
          clientName={gmailModal.clientName}
          clientEmail={gmailModal.clientEmail}
          clientPhone={gmailModal.phone}
          brand={gmailModal.brand}
          defaultSubject={`Inquiry Follow-up: ${gmailModal.packageName} — ${gmailModal.brand}`}
          defaultMessage={`Dear ${gmailModal.clientName},\n\nThank you for reaching out regarding the ${gmailModal.packageName} with ${gmailModal.brand}.\n\nWe have reserved your inquiry in our system for our ${selectedBranch === "All Branches" ? "executive clinics" : selectedBranch + " facility"}.\n\nPlease let us know if you would like to proceed with your formal booking.\n\nWarm regards,\nCommercial & Client Relations Desk\n${gmailModal.brand}`}
          contextType="general"
          amountNgn={gmailModal.value}
        />
      </div>
    </Shell>
  );
}
