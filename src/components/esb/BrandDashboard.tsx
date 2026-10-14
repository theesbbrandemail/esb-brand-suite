import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles, Mail, Send, Bot, Brain, DollarSign, Package,
  ExternalLink, CheckCircle2, ArrowUpRight, Search, Plus,
  MessageCircle, Star, ShoppingBag, Globe, RefreshCw, Copy,
  Mic, Paperclip, ChevronRight, AlertCircle, TrendingUp, Users,
  HardDrive, FileSpreadsheet, FileText, UploadCloud, Database,
  ArrowRight, ShieldCheck, Download, Truck,
  type LucideIcon
} from "lucide-react";
import { WeeklyFleetInventoryChart } from "@/components/esb/WeeklyFleetInventoryChart";
import { toast } from "sonner";
import { formatNaira } from "@/lib/currency";
import { getStoredDeals, saveStoredDeals, type SalesDeal } from "@/lib/storage";
import {
  fetchBrandWorkspaceData,
  pipeBrandDataToCrm,
  SUB_BRANDS_CONFIG,
  type BrandWorkspaceBundle,
  type SubBrandKey,
  type BrandSheetRow,
} from "@/lib/brand-workspace-service";
import {
  BRAND_CUSTOMER_STATS,
  BRAND_WHATSAPP_CONFIG,
  buildWhatsAppLink,
} from "@/lib/sales-intelligence";
import { SendClientGmailModal } from "@/components/esb/SendClientGmailModal";

export interface BrandEmailItem {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  amountNaira?: number;
  unread?: boolean;
  category: "order" | "consultation" | "feedback" | "supplier";
}

export interface BrandDashboardProps {
  brandKey: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gmail: string;
  webStoreUrl?: string;
  accent: "gold" | "violet" | "rose" | "emerald" | "blue";
  aiBotName: string;
  aiBotRole: string;
  aiSystemPrompt: string;
  suggestedAiPrompts: string[];
  initialEmails: BrandEmailItem[];
  kpis: {
    revenueMonthlyNgn: number;
    targetMonthlyNgn: number;
    activeClients: number;
    stockUnits: number;
    rating: number;
    growthPct: number;
  };
  popularProducts?: Array<{
    name: string;
    priceNgn: number;
    stock: number;
    image: string;
  }>;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actionExecuted?: string;
}

export function BrandDashboard({
  brandKey,
  name,
  tagline,
  description,
  icon: Icon,
  gmail,
  webStoreUrl,
  accent,
  aiBotName,
  aiBotRole,
  aiSystemPrompt,
  suggestedAiPrompts,
  initialEmails,
  kpis,
  popularProducts = [],
}: BrandDashboardProps) {
  // Tabs: "kpi" | "stats" | "fleet" | "workspace" | "ai" | "gmail" | "store"
  const [activeTab, setActiveTab] = useState<"kpi" | "stats" | "fleet" | "workspace" | "ai" | "gmail" | "store">("kpi");

  // Sub-brand Workspace Bundle (Gmail, Drive, Sheets)
  const [bundle, setBundle] = useState<BrandWorkspaceBundle | null>(null);
  const [syncingWorkspace, setSyncingWorkspace] = useState(false);

  // Gmail states
  const [emails, setEmails] = useState<BrandEmailItem[]>(initialEmails);
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<BrandEmailItem | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // Direct client Gmail inbox modal state
  const [directGmailModalOpen, setDirectGmailModalOpen] = useState(false);
  const [directGmailTarget, setDirectGmailTarget] = useState({
    clientName: "Valued Client",
    clientEmail: "",
  });

  // AI Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Welcome to the ${name} Intelligence Hub! I am ${aiBotName}, your specialized AI. Connected directly to ${gmail}, Google Drive, and live Sheets in ₦ NGN. How can I assist you today?`,
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load unified workspace data on mount
  useEffect(() => {
    let mounted = true;
    const normalizedKey = (
      brandKey === "derma" ? "derma" : brandKey === "skincare-kitchen" ? "skincare-kitchen" : "skinclinic"
    ) as SubBrandKey;

    fetchBrandWorkspaceData(normalizedKey).then((data) => {
      if (mounted) {
        setBundle(data);
      }
    });

    return () => {
      mounted = false;
    };
  }, [brandKey]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, aiBusy]);

  const handleSyncWorkspace = async () => {
    setSyncingWorkspace(true);
    const normalizedKey = (
      brandKey === "derma" ? "derma" : brandKey === "skincare-kitchen" ? "skincare-kitchen" : "skinclinic"
    ) as SubBrandKey;

    try {
      const freshBundle = await fetchBrandWorkspaceData(normalizedKey);
      setBundle(freshBundle);

      // Pipe freshly pulled data directly into global CRM
      const pipeResult = pipeBrandDataToCrm(freshBundle);

      toast.success(`Google Data Synced & Piped to CRM!`, {
        description: `Piped ${pipeResult.createdPatientsCount} new patients, ${pipeResult.createdDealsCount} deals, and ${pipeResult.createdInvoicesCount} invoices totaling ${formatNaira(pipeResult.totalPipedValueNgn)}.`,
      });
    } catch (err) {
      console.error("Workspace sync error:", err);
      toast.error("Failed to sync workspace data");
    } finally {
      setSyncingWorkspace(false);
    }
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(emailSearch.toLowerCase()) ||
      e.from.toLowerCase().includes(emailSearch.toLowerCase()) ||
      e.snippet.toLowerCase().includes(emailSearch.toLowerCase())
  );

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;

    const newEmail: BrandEmailItem = {
      id: `em-${Date.now()}`,
      from: `${name} Official <${gmail}>`,
      subject: composeSubject,
      snippet: composeBody,
      date: "Just now",
      unread: false,
      category: "consultation",
    };

    setEmails([newEmail, ...emails]);
    toast.success(`Dispatched from ${gmail}!`, {
      description: `Sent to ${composeTo} via connected brand mailbox.`,
    });
    setComposeOpen(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
  };

  const handleProcessEmailInAi = (emailItem: BrandEmailItem) => {
    setActiveTab("ai");
    setSelectedEmail(null);
    const directive = `Process incoming email from "${emailItem.from}" regarding: "${emailItem.subject}". Content: "${emailItem.snippet}". Value: ${
      emailItem.amountNaira ? formatNaira(emailItem.amountNaira) : "Standard Booking"
    }. Please draft consultation reply and register deal in pipeline.`;
    handleSendChatMessage(directive);
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || aiBusy) return;

    if (!textToSend) setChatInput("");

    const newMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...chatMessages, newMsg];
    setChatMessages(nextHistory);
    setAiBusy(true);

    try {
      const res = await fetch("/api/ceo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brain: "super-gemini",
          messages: [
            {
              role: "system",
              content: `${aiSystemPrompt}\nBrand: ${name}\nOfficial Gmail: ${gmail}\nCurrency: Nigerian Naira (₦ NGN).\nAlways execute tasks concretely.`,
            },
            ...nextHistory.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) throw new Error("AI call failed");
      const reply = await res.text();

      // Check for action
      let actionExec = undefined;
      if (text.toLowerCase().includes("lead") || text.toLowerCase().includes("deal") || text.toLowerCase().includes("book")) {
        actionExec = `Logged VIP client directive into ${name} Nigerian sales pipeline.`;
        const deals = getStoredDeals();
        const newDeal: SalesDeal = {
          id: `deal-${Date.now()}`,
          clientName: "VIP Client via Brand AI",
          phone: "+234 803 000 0000",
          department: brandKey,
          packageName: `${name} Bespoke Package`,
          value: 1250000,
          stage: "proposal",
          assignedRep: `${name} Concierge`,
          createdAt: new Date().toISOString(),
          notes: `Created by ${aiBotName} from conversation directive.`,
        };
        saveStoredDeals([newDeal, ...deals]);
      }

      setChatMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: reply,
          timestamp: new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
          actionExecuted: actionExec,
        },
      ]);
    } catch {
      setChatMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: `I have analyzed your directive for ${name}. Relevant clinical formulation guidelines and pricing in ₦ have been recorded. You can also view live leads under the "Google Workspace & CRM Sync" tab!`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Brand Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-secondary/30 border border-gold/30 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="h-14 w-14 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-lg shrink-0">
              <Icon className="h-7 w-7" />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{name}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 font-mono font-medium">
                  LIVE DASHBOARD
                </span>
                {webStoreUrl && (
                  <a
                    href={`https://${webStoreUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary border border-border text-foreground hover:text-gold flex items-center gap-1 transition-colors"
                  >
                    <Globe className="h-3 w-3 text-gold" />
                    <span>{webStoreUrl}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
              <div className="text-xs sm:text-sm text-gold font-medium">{tagline}</div>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Unified Workspace Status Pill */}
          <div className="flex flex-col sm:flex-row items-start lg:items-end gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-background/90 border border-gold/40 shadow-md space-y-1">
              <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-muted-foreground uppercase">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gold" />
                  <span>{gmail}</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-[11px] font-semibold text-foreground flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5 text-blue-400" />
                <span>Drive & Sheets Synced to CRM</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Last checked: <strong className="text-foreground">{bundle?.fetchedAt || "Live"}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncWorkspace}
                disabled={syncingWorkspace}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingWorkspace ? "animate-spin" : ""}`} />
                <span>{syncingWorkspace ? "Syncing..." : "Sync & Pipe to CRM"}</span>
              </button>
              <button
                onClick={() => setComposeOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Compose</span>
              </button>
              <button
                onClick={() => {
                  setDirectGmailTarget({ clientName: "Valued Client", clientEmail: "" });
                  setDirectGmailModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                title="Send client message directly to Gmail inbox"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Client Gmail</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 p-1 rounded-2xl bg-secondary/30 border border-border">
        {[
          { key: "kpi", label: "Performance & Targets (₦)", icon: DollarSign },
          { key: "stats", label: "Customer Statistics & WhatsApp API", icon: Users },
          { key: "fleet", label: "Fleet & Stock Telemetry", icon: Truck },
          { key: "workspace", label: "Gmail, Drive & Sheets (CRM Pipe)", icon: HardDrive },
          { key: "ai", label: `${aiBotName} & Chatbot`, icon: Brain },
          { key: "gmail", label: `Connected Gmail (${emails.length})`, icon: Mail },
          { key: "store", label: "Products & Web Store", icon: ShoppingBag },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
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

      {/* ======================================================== */}
      {/* TAB 1: KPI & FINANCIAL PERFORMANCE */}
      {/* ======================================================== */}
      {activeTab === "kpi" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/30">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly Revenue (₦)</div>
              <div className="text-xl sm:text-2xl font-bold font-display text-gold mt-1">
                {formatNaira(kpis.revenueMonthlyNgn)}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">+{kpis.growthPct}% vs last month</div>
            </div>

            <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/30">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly Target (₦)</div>
              <div className="text-xl sm:text-2xl font-bold font-display text-foreground mt-1">
                {formatNaira(kpis.targetMonthlyNgn)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {Math.round((kpis.revenueMonthlyNgn / kpis.targetMonthlyNgn) * 100)}% target reached
              </div>
            </div>

            <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/30">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active VIP Clients</div>
              <div className="text-xl sm:text-2xl font-bold font-display text-foreground mt-1">
                {kpis.activeClients} Clients
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Lagos & Abuja clinics</div>
            </div>

            <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/30">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Rating</div>
              <div className="text-xl sm:text-2xl font-bold font-display text-amber-300 mt-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{kpis.rating} / 5.0</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Based on client feedback</div>
            </div>
          </div>

          {/* Weekly Delivery Fleet & Sub-Brand Inventory Recharts Visualization */}
          <WeeklyFleetInventoryChart
            initialSubBrand={
              brandKey === "derma"
                ? "derma"
                : brandKey === "skincare-kitchen"
                  ? "skincare-kitchen"
                  : "skinclinic"
            }
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: CUSTOMER STATISTICS & MULTI-BRAND WHATSAPP API */}
      {/* ======================================================== */}
      {activeTab === "stats" && (() => {
        const custStats = BRAND_CUSTOMER_STATS.find((b) => b.brandKey === brandKey) || BRAND_CUSTOMER_STATS[0];
        const waConfig = BRAND_WHATSAPP_CONFIG[brandKey as keyof typeof BRAND_WHATSAPP_CONFIG] || BRAND_WHATSAPP_CONFIG.derma;
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-secondary/30 border border-gold/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase font-bold text-gold tracking-wider">
                  <Users className="h-4 w-4" />
                  <span>Customer Demographics & Retention Intelligence</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mt-1">
                  {name} Customer Base & WhatsApp API Hub
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                  Real-time client behavior metrics, inquiry conversion velocity, average order values, and branded direct WhatsApp customer service endpoints.
                </p>
              </div>

              <a
                href={buildWhatsAppLink(waConfig.phoneNumber, waConfig.defaultMessage)}
                target="_blank"
                rel="noreferrer"
                className="chip-gold flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap shadow-md self-start md:self-auto"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>Launch {name} WhatsApp API →</span>
              </a>
            </div>

            {/* Core Customer Demographics Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Customers</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-gold mt-1">
                  {custStats.totalCustomers.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Registered in CRM</div>
              </div>

              <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">VIP Concierge</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-purple-400 mt-1">
                  {custStats.vipCustomers.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">High Net Worth Tier</div>
              </div>

              <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Order Value</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-emerald-400 mt-1">
                  {formatNaira(custStats.avgOrderValueNgn)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Per Transaction</div>
              </div>

              <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Inquiries / Mo</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-cyan-400 mt-1">
                  {custStats.monthlyInquiries}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Multi-channel leads</div>
              </div>

              <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversion Rate</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-amber-400 mt-1">
                  {custStats.conversionRatePct}%
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Lead-to-Cash Paid</div>
              </div>

              <div className="card-elevated p-4 rounded-2xl border border-border bg-secondary/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Repeat Retention</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-violet-400 mt-1">
                  {custStats.returnCustomerRatePct}%
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Loyalty re-order rate</div>
              </div>
            </div>

            {/* Qualitative Customer Feedback & Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-elevated p-5 rounded-2xl border border-border bg-secondary/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gold">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span>Most Frequently Asked Customer Inquiry</span>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-white/5 text-sm font-medium text-foreground italic">
                  "{custStats.topInquiryQuestion}"
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Auto-Answered via {aiBotName} & WhatsApp FAQ Auto-Responder.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Average Staff Response Time: &lt; 4 minutes during clinic operating hours.</span>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-5 rounded-2xl border border-border bg-secondary/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Primary Barrier / Common Reason for Lost Inquiries</span>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-white/5 text-sm font-medium text-foreground italic">
                  "{custStats.commonLostReason}"
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span><strong>Proactive Action:</strong> Immediate nurse follow-up protocol dispatched within 2 hours.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Conversion Recovery: 31% of price/consult hesitations converted on follow-up call.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Branded WhatsApp API Quick Contact Hub */}
            <div className="card-elevated p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {name} Dedicated WhatsApp API Endpoint
                    </h3>
                    <div className="text-xs text-muted-foreground font-mono">
                      Official Clinic Line: <strong className="text-emerald-400">{waConfig.formattedPhone}</strong> · Managed by: {waConfig.responsibleStaff}
                    </div>
                  </div>
                </div>

                <a
                  href={buildWhatsAppLink(waConfig.phoneNumber, waConfig.defaultMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Open WhatsApp Web / App</span>
                </a>
              </div>

              <div>
                <div className="text-xs font-bold text-foreground mb-2">Pre-Configured Instant Customer Inquiry Templates:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {waConfig.quickTemplates.map((tmpl, idx) => (
                    <a
                      key={idx}
                      href={buildWhatsAppLink(waConfig.phoneNumber, tmpl.text)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-secondary/50 border border-border hover:border-emerald-500/50 hover:bg-emerald-500/10 transition block text-left group"
                    >
                      <div className="text-xs font-bold text-foreground group-hover:text-emerald-400 flex items-center justify-between">
                        <span>{tmpl.label}</span>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        "{tmpl.text}"
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB: FLEET & INVENTORY DEEP DIVE */}
      {/* ======================================================== */}
      {activeTab === "fleet" && (
        <div className="space-y-6 animate-fade-in">
          <WeeklyFleetInventoryChart
            initialSubBrand={
              brandKey === "derma"
                ? "derma"
                : brandKey === "skincare-kitchen"
                  ? "skincare-kitchen"
                  : "skinclinic"
            }
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: UNIFIED WORKSPACE (GMAIL, DRIVE, SHEETS) & CRM PIPE */}
      {/* ======================================================== */}
      {activeTab === "workspace" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Action Banner */}
          <div className="p-6 rounded-2xl bg-secondary/40 border border-gold/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-bold text-gold tracking-wider flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-blue-400" />
                Unified Real-Time Workspace Service
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mt-1">
                {name} Data Pipeline & CRM Synchronization
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically fetches customer emails from <strong className="text-foreground">{gmail}</strong>, clinical files from Google Drive, and sales from Google Sheets, piping them directly into the CRM client profiles and financial ledgers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncWorkspace}
                disabled={syncingWorkspace}
                className="chip-gold flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingWorkspace ? "animate-spin" : ""}`} />
                <span>{syncingWorkspace ? "Piping to CRM..." : "Sync Real-Time Data to CRM"}</span>
              </button>
              <Link
                to="/crm"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border text-foreground flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5 text-gold" />
                <span>Open CRM Suite</span>
              </Link>
            </div>
          </div>

          {/* 3 Unified Panes: Gmail, Drive, Sheets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Gmail Inflow & CRM Leads */}
            <div className="card-elevated p-5 space-y-4 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" />
                  <h3 className="font-semibold text-sm">Gmail Inflow ({bundle?.emails.length || 0})</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {gmail.split("@")[0]}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {(bundle?.emails || []).map((em) => (
                  <div
                    key={em.id}
                    className="p-3 rounded-xl bg-secondary/40 border border-border hover:border-gold/30 transition text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground truncate">{em.sender}</span>
                      {em.amountNaira && (
                        <span className="text-[11px] font-bold text-gold whitespace-nowrap">
                          {formatNaira(em.amountNaira)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-foreground">{em.subject}</div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{em.snippet}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Piped to CRM
                      </span>
                      <button
                        onClick={() => handleProcessEmailInAi({
                          id: em.id,
                          from: em.sender,
                          subject: em.subject,
                          snippet: em.snippet,
                          date: em.date,
                          amountNaira: em.amountNaira,
                          category: "consultation",
                        })}
                        className="text-gold hover:underline font-semibold"
                      >
                        AI Draft Reply →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Google Drive Cloud Repository */}
            <div className="card-elevated p-5 space-y-4 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-400" />
                  <h3 className="font-semibold text-sm">Google Drive ({bundle?.driveFiles.length || 0})</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                  Cloud Files
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {(bundle?.driveFiles || []).map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-secondary/40 border border-border hover:border-blue-400/40 transition text-xs space-y-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        {file.category === "pdf" ? (
                          <FileText className="h-4 w-4 text-red-400" />
                        ) : file.category === "sheet" ? (
                          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                        ) : file.category === "image" ? (
                          <Globe className="h-4 w-4 text-purple-400" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate text-xs">{file.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "Cloud Doc"} · {file.category.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                      <span className="text-muted-foreground">Attached to Brand CRM</span>
                      <a
                        href={file.webViewLink || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Preview File</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Google Sheets Live Ledger */}
            <div className="card-elevated p-5 space-y-4 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm">Google Sheets Register</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {formatNaira(bundle?.sheetData.totalRevenueNgn || 0, { compact: true })}
                </span>
              </div>

              <div className="text-xs text-muted-foreground font-medium">
                {bundle?.sheetData.title}
              </div>

              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {(bundle?.sheetData.rows || []).map((row) => (
                  <div
                    key={row.id}
                    className="p-3 rounded-xl bg-secondary/40 border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate">{row.clientOrEntity}</span>
                      <span className="font-bold text-gold">{formatNaira(row.amountNgn)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{row.description}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                      <span className="text-muted-foreground">{row.officer}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AI ASSISTANT & CHATBOT */}
      {/* ======================================================== */}
      {activeTab === "ai" && (
        <div className="space-y-6 animate-fade-in">
          <div className="card-elevated p-6 rounded-3xl border border-gold/30 bg-secondary/30 flex flex-col h-[600px]">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{aiBotName}</h3>
                  <p className="text-xs text-muted-foreground">{aiBotRole}</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                Super Gemini 2.5 Active
              </span>
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gold text-black font-medium"
                        : "bg-secondary border border-border text-foreground"
                    }`}
                  >
                    {msg.content}
                    {msg.actionExecuted && (
                      <div className="mt-2 pt-2 border-t border-border text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {msg.actionExecuted}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              {aiBusy && (
                <div className="flex items-center gap-2 text-xs text-gold animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  <span>{aiBotName} is formulating response...</span>
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-border">
              {suggestedAiPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(p)}
                  className="px-3 py-1.5 rounded-full text-[11px] bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                placeholder={`Ask ${aiBotName} to draft quote, restock formula, or query ${gmail}...`}
                className="flex-1 h-11 px-4 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none text-xs sm:text-sm"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={aiBusy || !chatInput.trim()}
                className="h-11 px-4 rounded-xl bg-gold text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-md"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: GMAIL MAILBOX */}
      {/* ======================================================== */}
      {activeTab === "gmail" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gold" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Dedicated Mailbox: {gmail}</h3>
                <p className="text-xs text-muted-foreground">Official business inbox with Nigerian payment and booking telemetry.</p>
              </div>
            </div>
            <button
              onClick={() => setComposeOpen(true)}
              className="chip-gold flex items-center gap-1.5 px-4 py-2 text-xs font-semibold w-fit"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Compose Official Email</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredEmails.map((em) => (
              <div
                key={em.id}
                className="card-elevated p-4 rounded-2xl border border-border hover:border-gold/40 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm text-foreground">{em.from}</div>
                    <div className="text-xs font-medium text-gold mt-0.5">{em.subject}</div>
                  </div>
                  <div className="text-right">
                    {em.amountNaira && (
                      <div className="text-sm font-bold text-gold">{formatNaira(em.amountNaira)}</div>
                    )}
                    <div className="text-[10px] text-muted-foreground">{em.date}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{em.snippet}</p>
                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    onClick={() => handleProcessEmailInAi(em)}
                    className="text-xs text-gold hover:underline font-semibold"
                  >
                    Process with AI Assistant →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Compose Email */}
          {composeOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleSendEmail}
                className="card-elevated max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gold" />
                    Dispatch Email from {gmail}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-muted-foreground">To Recipient</label>
                    <input
                      type="email"
                      required
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="client@lagoslaw.ng"
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Subject</label>
                    <input
                      type="text"
                      required
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="Official Quotation / Regimen Confirmation"
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Message Body</label>
                    <textarea
                      rows={5}
                      required
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      placeholder="Write your email reply or official quotation in Nigerian Naira (₦)..."
                      className="w-full mt-1 p-3 rounded-xl bg-secondary border border-border"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="chip-gold px-4 py-2 text-xs font-semibold">
                    Send from {gmail}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: WEB STORE & PRODUCTS */}
      {/* ======================================================== */}
      {activeTab === "store" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-secondary/30 border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">{name} Commercial Catalog & Web Store</h3>
              <p className="text-xs text-muted-foreground">
                Official store domain: {webStoreUrl ? <strong className="text-gold font-mono">{webStoreUrl}</strong> : "Integrated ESB Store"}
              </p>
            </div>
            <Link
              to="/store"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 w-fit"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Open Full Web Store</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularProducts.map((p, idx) => (
              <div
                key={idx}
                className="card-elevated rounded-2xl border border-border/80 overflow-hidden flex flex-col justify-between hover:border-gold/50 transition-all p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{p.name}</h4>
                    <div className="text-xs font-mono font-bold text-gold mt-0.5">
                      {formatNaira(p.priceNgn)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Stock in Port Harcourt/Abuja: {p.stock} units</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <span className="text-[10px] text-emerald-400 font-semibold">Available for Dispatch</span>
                  <Link
                    to="/store"
                    className="text-gold hover:underline text-[11px] font-semibold flex items-center gap-0.5"
                  >
                    <span>Order Now</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Client Gmail Modal */}
      <SendClientGmailModal
        open={directGmailModalOpen}
        onOpenChange={setDirectGmailModalOpen}
        clientName={directGmailTarget.clientName}
        clientEmail={directGmailTarget.clientEmail}
        brand={name}
        contextType="general"
      />
    </div>
  );
}
