import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users, Search, Plus, Phone, MessageCircle, Star, Sparkles,
  Calendar, DollarSign, Tag, Check, Award, FileText, ChevronRight,
  ShieldCheck, Heart, AlertTriangle, Receipt, CreditCard, Printer,
  Download, Send, ArrowUpRight, CheckCircle2, Clock, Landmark,
  QrCode, Copy, RefreshCw, Zap, Building2, SlidersHorizontal,
  HardDrive, Mail
} from "lucide-react";
import { Shell } from "@/components/esb/Shell";
import { formatNaira } from "@/lib/currency";
import { getStoredPatients } from "@/lib/storage";
import { SendClientGmailModal } from "@/components/esb/SendClientGmailModal";
import { GlobalBranchSwitch } from "@/components/esb/GlobalBranchSwitch";
import { getSelectedBranch, setSelectedBranch, matchesCurrentBranch, type ActiveBranchKey } from "@/lib/branch-manager";
import {
  getStoredInvoices,
  saveStoredInvoices,
  createInvoice,
  createReceipt,
  markInvoiceAsPaid,
  formatInvoiceForWhatsApp,
  ESB_CORPORATE_BANKS,
  type InvoiceReceipt,
  type PaymentMethod,
} from "@/lib/billing";
import {
  fetchBrandWorkspaceData,
  pipeBrandDataToCrm,
  SUB_BRANDS_CONFIG,
  type SubBrandKey,
} from "@/lib/brand-workspace-service";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "Client CRM & AI Invoicing — ESB Brand Suite" },
      {
        name: "description",
        content:
          "Client 360 profiles, automated Tax Invoices, stamped Payment Receipts, Nigerian bank integration, and Super Gemini AI CRM automation.",
      },
    ],
  }),
  component: CrmPage,
});

type CrmPatient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: "VIP Diamond" | "Gold Elite" | "Member";
  lifetimeSpend: number;
  visitsCount: number;
  skinType: string;
  primaryBranch: string;
  allergies: string;
  loyaltyPoints: number;
  lastVisit: string;
  nextAppointment: string | null;
  tags: string[];
  notes: { id: string; author: string; date: string; content: string }[];
  treatmentHistory: { id: string; date: string; service: string; provider: string; cost: number }[];
};

const INITIAL_PATIENTS: CrmPatient[] = [
  {
    id: "crm-1",
    name: "Dr. Amara Okonjo",
    phone: "+2348023341122",
    email: "amara.okonjo@gmail.com",
    tier: "VIP Diamond",
    lifetimeSpend: 4250000,
    visitsCount: 18,
    skinType: "Combination / Sensitive / Mild Erythema",
    primaryBranch: "Port Harcourt",
    allergies: "Strong Salicylic Acid, Fragrance oils",
    loyaltyPoints: 1450,
    lastVisit: "2026-10-04",
    nextAppointment: "Today 09:30 AM",
    tags: ["VIP Diamond", "Prefers WhatsApp", "Hydra-Glow Regular", "High Spender"],
    notes: [
      { id: "n-1", author: "Nurse Kemi", date: "2026-10-04", content: "Loved the cooling compressor in Suite A. Recommended SPF 50 reapplication." },
      { id: "n-2", author: "Dr. Eze", date: "2026-09-12", content: "Cleared for glycolic 20% peeling course." },
    ],
    treatmentHistory: [
      { id: "tr-1", date: "2026-10-04", service: "Hydra-Glow Facial & Skin AI", provider: "Dr. Eze", cost: 180000 },
      { id: "tr-2", date: "2026-09-12", service: "Custom Serum Bar Formulation", provider: "Esthetician Chioma", cost: 95000 },
      { id: "tr-3", date: "2026-08-15", service: "Mineral SPF 50+ & Cleanser Retail", provider: "Blessing Okon", cost: 84000 },
    ],
  },
  {
    id: "crm-2",
    name: "Senator Fatima Aliyu",
    phone: "+2348091118899",
    email: "f.aliyu@gov.ng",
    tier: "VIP Diamond",
    lifetimeSpend: 7890000,
    visitsCount: 24,
    skinType: "Mature / Hydration Deficiency",
    primaryBranch: "Abuja",
    allergies: "None reported",
    loyaltyPoints: 2800,
    lastVisit: "2026-09-28",
    nextAppointment: "Today 10:00 AM",
    tags: ["VIP Diamond", "Private Suite Only", "Exosome Protocol", "Diplomat"],
    notes: [
      { id: "n-3", author: "Dr. Tariq", date: "2026-09-28", content: "Reserved VIP suite 30 minutes in advance with herbal tea preference." },
    ],
    treatmentHistory: [
      { id: "tr-4", date: "2026-09-28", service: "Executive Collagen Renewal + RF", provider: "Dr. Ngozi Eze", cost: 320000 },
      { id: "tr-5", date: "2026-08-30", service: "Laser Porcelain Whitening", provider: "Dr. Tariq Bello", cost: 280000 },
    ],
  },
  {
    id: "crm-3",
    name: "Chinedu Eke",
    phone: "+2348189987766",
    email: "c.eke@investcorp.ng",
    tier: "Gold Elite",
    lifetimeSpend: 1820000,
    visitsCount: 8,
    skinType: "Oily / Blemish Prone",
    primaryBranch: "Port Harcourt",
    allergies: "Benzoyl Peroxide sensitivity",
    loyaltyPoints: 750,
    lastVisit: "2026-10-01",
    nextAppointment: "Today 02:00 PM",
    tags: ["Gold Elite", "Serum Bar Aficionado"],
    notes: [
      { id: "n-5", author: "Esthetician Chioma", date: "2026-10-01", content: "Prefers custom peptide blend with floral scent notes." },
    ],
    treatmentHistory: [
      { id: "tr-7", date: "2026-10-01", service: "Serum Bar Custom Mixing", provider: "Chioma", cost: 95000 },
    ],
  },
  {
    id: "crm-4",
    name: "Folake Adebayo",
    phone: "+2348036678822",
    email: "folake@designstudio.ng",
    tier: "Member",
    lifetimeSpend: 940000,
    visitsCount: 5,
    skinType: "Normal / Hyperpigmentation",
    primaryBranch: "Abuja",
    allergies: "None",
    loyaltyPoints: 320,
    lastVisit: "2026-09-18",
    nextAppointment: null,
    tags: ["Member", "Vitamin C Fan"],
    notes: [
      { id: "n-6", author: "Front Desk", date: "2026-09-18", content: "Purchased Vitamin C Infusion package." },
    ],
    treatmentHistory: [
      { id: "tr-8", date: "2026-09-18", service: "Brightening Vitamin C Infusion", provider: "Cynthia", cost: 135000 },
    ],
  },
];

function CrmPage() {
  const [activeTab, setActiveTab] = useState<"clients" | "invoices" | "automation">("clients");

  // Client Directory State
  const [patients, setPatients] = useState<CrmPatient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<CrmPatient | null>(INITIAL_PATIENTS[0]);

  // Billing / Invoice State
  const [invoices, setInvoices] = useState<InvoiceReceipt[]>(() => getStoredInvoices());
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "invoices" | "receipts" | "pending" | "paid">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceReceipt | null>(null);

  // Modals
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  // Create Invoice Form State
  const [invBrand, setInvBrand] = useState<InvoiceReceipt["brand"]>("Derma Aesthetics");
  const [invClientName, setInvClientName] = useState("");
  const [invClientEmail, setInvClientEmail] = useState("");
  const [invClientPhone, setInvClientPhone] = useState("+234 ");
  const [invServiceDesc, setInvServiceDesc] = useState("Executive Bespoke Clinical Consultation & Regimen");
  const [invQty, setInvQty] = useState(1);
  const [invPrice, setInvPrice] = useState(350000);
  const [invDiscount, setInvDiscount] = useState(0);
  const [invVat, setInvVat] = useState(true);
  const [invBank, setInvBank] = useState<"zenith" | "gtbank" | "providus">("zenith");
  const [invNotes, setInvNotes] = useState("Official Tax Invoice issued by ESB Brand Group.");

  // Receipt Form State
  const [recPaymentMethod, setRecPaymentMethod] = useState<PaymentMethod>("zenith_bank_transfer");
  const [recPaymentRef, setRecPaymentRef] = useState(`ZEN-TX-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [recAmountPaid, setRecAmountPaid] = useState(350000);

  // New patient intake form
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    email: "",
    tier: "Member" as const,
    skinType: "Combination / Sensitive",
    branch: "Port Harcourt",
    allergies: "None reported",
    note: "",
  });

  const [syncingBrands, setSyncingBrands] = useState(false);

  // Active branch & Gmail state
  const [activeBranch, setActiveBranch] = useState<ActiveBranchKey>(() => getSelectedBranch());
  const [gmailModal, setGmailModal] = useState<{
    open: boolean;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    brand: string;
    contextType?: "general" | "invoice" | "appointment" | "treatment_followup" | "quotation";
    invoiceNumber?: string;
    amountNgn?: number;
  }>({
    open: false,
    clientName: "",
    clientEmail: "",
    brand: "Derma Aesthetics",
  });

  // Sync invoices and branch when storage/broadcast updates
  useEffect(() => {
    const handleUpdate = () => {
      setInvoices(getStoredInvoices());
      setPatients(getStoredPatients());
    };
    const handleBranchChange = (e: Event) => {
      const custom = e as CustomEvent<{ branch: ActiveBranchKey }>;
      if (custom.detail?.branch) {
        setActiveBranch(custom.detail.branch);
      } else {
        setActiveBranch(getSelectedBranch());
      }
    };
    window.addEventListener("esb_invoices_updated", handleUpdate);
    window.addEventListener("esb_crm_synced", handleUpdate);
    window.addEventListener("esb_workspace_synced", handleUpdate);
    window.addEventListener("esb_branch_changed", handleBranchChange);
    return () => {
      window.removeEventListener("esb_invoices_updated", handleUpdate);
      window.removeEventListener("esb_crm_synced", handleUpdate);
      window.removeEventListener("esb_workspace_synced", handleUpdate);
      window.removeEventListener("esb_branch_changed", handleBranchChange);
    };
  }, []);

  const handlePullAllSubBrandData = async () => {
    setSyncingBrands(true);
    try {
      const brands: SubBrandKey[] = ["derma", "skincare-kitchen", "skinclinic"];
      let totalPipedLeads = 0;
      let totalPipedDeals = 0;
      let totalPipedInvoices = 0;
      let totalPipedValue = 0;

      for (const b of brands) {
        const data = await fetchBrandWorkspaceData(b);
        const res = pipeBrandDataToCrm(data);
        totalPipedLeads += res.createdPatientsCount;
        totalPipedDeals += res.createdDealsCount;
        totalPipedInvoices += res.createdInvoicesCount;
        totalPipedValue += res.totalPipedValueNgn;
      }

      setPatients(getStoredPatients());
      setInvoices(getStoredInvoices());

      toast.success("Sub-Brands Data Piped to CRM!", {
        description: `Imported from Derma, Skincare Kitchen & Skin Clinic: ${totalPipedLeads} new patients, ${totalPipedDeals} pipeline deals, and ${totalPipedInvoices} invoices (₦${totalPipedValue.toLocaleString()}).`,
      });
    } catch (e) {
      console.error("Sub-brand pull failed", e);
      toast.error("Failed to pull sub-brand workspace data");
    } finally {
      setSyncingBrands(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchTier = tierFilter === "all" || p.tier === tierFilter;
    const matchBranch = activeBranch === "all" || matchesCurrentBranch(p.primaryBranch, activeBranch);
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.skinType.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchTier && matchBranch && matchSearch;
  });

  const handleOpenGmailModalForPatient = (patient: CrmPatient) => {
    setGmailModal({
      open: true,
      clientName: patient.name,
      clientEmail: patient.email || `${patient.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      clientPhone: patient.phone,
      brand: "Derma Aesthetics",
      contextType: "treatment_followup",
    });
  };

  const handleOpenGmailModalForInvoice = (inv: InvoiceReceipt) => {
    setGmailModal({
      open: true,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail || `${inv.clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      clientPhone: inv.clientPhone,
      brand: inv.brand,
      contextType: "invoice",
      invoiceNumber: inv.id,
      amountNgn: inv.totalAmountNgn,
    });
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (invoiceFilter === "invoices") return inv.type === "invoice";
    if (invoiceFilter === "receipts") return inv.type === "receipt";
    if (invoiceFilter === "pending") return inv.status === "pending" || inv.status === "partially_paid";
    if (invoiceFilter === "paid") return inv.status === "paid";
    return true;
  });

  const totalInvoicedNgn = invoices.reduce((sum, inv) => sum + inv.totalAmountNgn, 0);
  const totalPaidNgn = invoices.reduce((sum, inv) => sum + inv.amountPaidNgn, 0);
  const totalPendingNgn = invoices.reduce((sum, inv) => sum + inv.balanceDueNgn, 0);

  const handleOpenInvoiceModalForPatient = (patient: CrmPatient) => {
    setInvClientName(patient.name);
    setInvClientEmail(patient.email);
    setInvClientPhone(patient.phone);
    setShowInvoiceModal(true);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientName || !invPrice) {
      toast.error("Please fill in client name and item price");
      return;
    }

    const created = createInvoice({
      brand: invBrand,
      clientName: invClientName,
      clientEmail: invClientEmail || `${invClientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      clientPhone: invClientPhone,
      items: [
        {
          description: invServiceDesc,
          quantity: Number(invQty) || 1,
          unitPriceNgn: Number(invPrice) || 0,
        },
      ],
      discountNgn: Number(invDiscount) || 0,
      vatRatePct: invVat ? 7.5 : 0,
      notes: invNotes,
      bankKey: invBank,
      createdBy: "ESB CRM Billing Desk",
    });

    setInvoices(getStoredInvoices());
    setSelectedInvoice(created);
    setShowInvoiceModal(false);
    toast.success(`Tax Invoice ${created.id} created successfully!`, {
      description: `Total ${formatNaira(created.totalAmountNgn)} for ${created.clientName}.`,
    });
  };

  const handleCreateReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createReceipt({
      brand: invBrand,
      clientName: invClientName,
      clientEmail: invClientEmail || `${invClientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      clientPhone: invClientPhone,
      items: [
        {
          description: invServiceDesc,
          quantity: Number(invQty) || 1,
          unitPriceNgn: Number(invPrice) || 0,
        },
      ],
      paymentMethod: recPaymentMethod,
      paymentReference: recPaymentRef,
      amountPaidNgn: Number(recAmountPaid) || Number(invPrice),
      notes: "Official Stamped Receipt authorized via CRM desk.",
      createdBy: "Chioma Okeke (Finance)",
      bankKey: invBank,
    });

    setInvoices(getStoredInvoices());
    setSelectedInvoice(created);
    setShowReceiptModal(false);
    toast.success(`Official Payment Receipt ${created.id} generated!`, {
      description: `Stamped and sealed with hash ${created.verificationHash.slice(0, 16)}...`,
    });
  };

  const handleSettleInvoice = (inv: InvoiceReceipt) => {
    const updated = markInvoiceAsPaid(inv.id, {
      paymentMethod: "zenith_bank_transfer",
      paymentReference: `ZEN-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      amountPaidNgn: inv.balanceDueNgn,
    });
    if (updated) {
      setInvoices(getStoredInvoices());
      setSelectedInvoice(updated);
      toast.success(`Invoice ${inv.id} marked as PAID!`, {
        description: `Cleared ${formatNaira(inv.balanceDueNgn)} in full.`,
      });
    }
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      toast.error("Please provide at least a name and phone number");
      return;
    }
    const created: CrmPatient = {
      id: `crm-${Date.now()}`,
      name: newPatient.name,
      phone: newPatient.phone,
      email: newPatient.email,
      tier: newPatient.tier,
      lifetimeSpend: 0,
      visitsCount: 1,
      skinType: newPatient.skinType,
      primaryBranch: newPatient.branch,
      allergies: newPatient.allergies || "None reported",
      loyaltyPoints: 100,
      lastVisit: new Date().toISOString().split("T")[0],
      nextAppointment: null,
      tags: [newPatient.tier, newPatient.branch],
      notes: newPatient.note
        ? [{ id: `n-${Date.now()}`, author: "Concierge", date: new Date().toISOString().split("T")[0], content: newPatient.note }]
        : [],
      treatmentHistory: [],
    };
    setPatients([created, ...patients]);
    setSelectedPatient(created);
    setShowAddPatientModal(false);
    toast.success("New client profile saved to CRM");
  };

  const handleAddNote = () => {
    if (!selectedPatient || !newNoteContent.trim()) return;
    const note = {
      id: `n-${Date.now()}`,
      author: "Clinical Staff",
      date: new Date().toISOString().split("T")[0],
      content: newNoteContent.trim(),
    };
    const updated = {
      ...selectedPatient,
      notes: [note, ...selectedPatient.notes],
    };
    setPatients(patients.map((p) => (p.id === selectedPatient.id ? updated : p)));
    setSelectedPatient(updated);
    setNewNoteContent("");
    setShowNoteModal(false);
    toast.success("Clinical note logged");
  };

  const handleAddPoints = (pts: number) => {
    if (!selectedPatient) return;
    const updated = {
      ...selectedPatient,
      loyaltyPoints: selectedPatient.loyaltyPoints + pts,
    };
    setPatients(patients.map((p) => (p.id === selectedPatient.id ? updated : p)));
    setSelectedPatient(updated);
    toast.success(`+${pts} loyalty points awarded to ${selectedPatient.name}`);
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header & Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-secondary/30 border border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  Client CRM, Invoicing & Payment Automation
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  360° VIP clinical records, instant Tax Invoices, stamped receipts, and Nigerian banking integration (₦ NGN).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePullAllSubBrandData}
              disabled={syncingBrands}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
              title="Pull real-time data from Gmail, Drive & Sheets for Derma, Skincare Kitchen & Skin Clinic"
            >
              <HardDrive className={`h-3.5 w-3.5 ${syncingBrands ? "animate-spin" : ""}`} />
              <span>{syncingBrands ? "Piping Workspace..." : "Pull Sub-Brands Google Data"}</span>
            </button>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background border border-border">
              <button
                onClick={() => setActiveTab("clients")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "clients" ? "bg-gold text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
              <Users className="h-3.5 w-3.5" />
              <span>Clients & Patients</span>
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "invoices" ? "bg-gold text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Invoices & Receipts</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white font-mono">
                {invoices.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("automation")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "automation" ? "bg-gold text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Gemini AI Automation</span>
            </button>
          </div>
        </div>
      </div>

        {/* ======================================================== */}
        {/* TAB 1: CLIENT DIRECTORY & 360 PROFILES */}
        {/* ======================================================== */}
        {activeTab === "clients" && (
          <div className="space-y-6 animate-fade-in">
            {/* Highlights Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-elevated p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Patients</div>
                <div className="text-2xl font-display font-semibold mt-1">{patients.length}</div>
                <div className="text-xs text-emerald-400 mt-1">Active in Suite</div>
              </div>
              <div className="card-elevated p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">VIP Diamonds</div>
                <div className="text-2xl font-display font-semibold mt-1 text-gold">
                  {patients.filter((p) => p.tier === "VIP Diamond").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">High-touch care</div>
              </div>
              <div className="card-elevated p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Lifetime Spend</div>
                <div className="text-2xl font-display font-semibold mt-1 text-gold">
                  {formatNaira(
                    Math.round(patients.reduce((acc, p) => acc + p.lifetimeSpend, 0) / (patients.length || 1)),
                    { compact: true }
                  )}
                </div>
                <div className="text-xs text-purple-400 mt-1">High value retention</div>
              </div>
              <div className="card-elevated p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Loyalty Points Bank</div>
                <div className="text-2xl font-display font-semibold mt-1">
                  {patients.reduce((acc, p) => acc + p.loyaltyPoints, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gold mt-1">Redeemable for serums</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Search & Patient List */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search patient, phone, skin type..."
                      className="w-full rounded-xl bg-secondary/60 border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="chip-gold flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" /> Intake
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {["all", "VIP Diamond", "Gold Elite", "Member"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setTierFilter(tier)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        tierFilter === tier
                          ? "bg-gold text-black font-semibold"
                          : "border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tier === "all" ? "All Tiers" : tier}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredPatients.map((p) => {
                    const isSelected = selectedPatient?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPatient(p)}
                        className={`card-elevated p-4 cursor-pointer transition border ${
                          isSelected ? "border-gold/60 bg-secondary/80" : "border-border hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-sm flex items-center gap-2">
                              {p.name}
                              {p.tier === "VIP Diamond" && (
                                <span className="chip-gold text-[10px] px-2 py-0.5">VIP</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {p.phone} · {p.primaryBranch}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gold">{formatNaira(p.lifetimeSpend)}</div>
                            <div className="text-[10px] text-muted-foreground">{p.visitsCount} visits</div>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground truncate">
                          Skin: <span className="text-foreground">{p.skinType}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Full Patient 360 View */}
              <div className="lg:col-span-7">
                {selectedPatient ? (
                  <div className="card-elevated p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-display font-semibold">{selectedPatient.name}</h2>
                          <span className="chip-gold text-xs">{selectedPatient.tier}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedPatient.email} · {selectedPatient.phone} · {selectedPatient.primaryBranch}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenInvoiceModalForPatient(selectedPatient)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 hover:bg-gold/25 text-xs font-semibold transition"
                        >
                          <Receipt className="h-4 w-4" /> Issue Invoice
                        </button>
                        <button
                          onClick={() => setShowWhatsAppModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition"
                        >
                          <MessageCircle className="h-4 w-4" /> WhatsApp
                        </button>
                        <button
                          onClick={() => handleOpenGmailModalForPatient(selectedPatient)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-semibold transition"
                          title="Compose message to client Gmail inbox"
                        >
                          <Mail className="h-4 w-4" /> Gmail Inbox
                        </button>
                      </div>
                    </div>

                    {/* Skin Profile & Allergies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="text-xs text-muted-foreground uppercase font-semibold">Skin Profile</div>
                        <div className="text-sm font-medium mt-1">{selectedPatient.skinType}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1 text-red-400">
                          <AlertTriangle className="h-3 w-3" /> Allergies & Contraindications
                        </div>
                        <div className="text-sm font-medium mt-1 text-foreground">{selectedPatient.allergies}</div>
                      </div>
                    </div>

                    {/* Loyalty Points */}
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-purple-400 font-semibold">ESB LOYALTY REWARDS</div>
                        <div className="text-xl font-bold mt-0.5">{selectedPatient.loyaltyPoints} Points</div>
                        <div className="text-xs text-muted-foreground">Eligible for complimentary bespoke Serum Bar formulation.</div>
                      </div>
                      <button
                        onClick={() => handleAddPoints(100)}
                        className="chip-gold text-xs px-3 py-1.5 hover:opacity-90 transition"
                      >
                        +100 Points
                      </button>
                    </div>

                    {/* Clinical Notes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gold" /> Clinical & Staff Observations
                        </h3>
                        <button
                          onClick={() => setShowNoteModal(true)}
                          className="text-xs text-gold hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Note
                        </button>
                      </div>

                      <div className="space-y-2">
                        {selectedPatient.notes.length === 0 ? (
                          <div className="text-xs text-muted-foreground">No notes logged yet.</div>
                        ) : (
                          selectedPatient.notes.map((n) => (
                            <div key={n.id} className="p-3 rounded-xl bg-secondary/40 border border-border text-xs">
                              <div className="flex justify-between items-center text-muted-foreground mb-1">
                                <span className="font-semibold text-foreground">{n.author}</span>
                                <span>{n.date}</span>
                              </div>
                              <p className="text-muted-foreground">{n.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Treatment History */}
                    <div>
                      <h3 className="font-display text-base flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-gold" /> Treatment & Service History
                      </h3>
                      <div className="space-y-2">
                        {selectedPatient.treatmentHistory.map((tr) => (
                          <div
                            key={tr.id}
                            className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-medium text-foreground">{tr.service}</div>
                              <div className="text-muted-foreground text-[11px]">
                                {tr.date} · Provider: {tr.provider}
                              </div>
                            </div>
                            <div className="font-semibold text-gold">{formatNaira(tr.cost)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card-elevated p-12 text-center text-muted-foreground">
                    Select a client profile to view 360° diagnostics and billing options.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: INVOICES & RECEIPTS BILLING HUB */}
        {/* ======================================================== */}
        {activeTab === "invoices" && (
          <div className="space-y-6 animate-fade-in">
            {/* Financial Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-elevated p-4 border border-blue-500/30">
                <div className="text-xs text-blue-400 uppercase font-semibold">Total Revenue Invoiced</div>
                <div className="text-2xl font-bold mt-1 text-foreground">{formatNaira(totalInvoicedNgn)}</div>
                <div className="text-xs text-muted-foreground mt-1">Across all 5 ESB brand divisions</div>
              </div>
              <div className="card-elevated p-4 border border-emerald-500/30">
                <div className="text-xs text-emerald-400 uppercase font-semibold">Settled & Stamped Receipts</div>
                <div className="text-2xl font-bold mt-1 text-emerald-400">{formatNaira(totalPaidNgn)}</div>
                <div className="text-xs text-muted-foreground mt-1">Received via Zenith, GTB & Providus Virtual</div>
              </div>
              <div className="card-elevated p-4 border border-amber-500/30">
                <div className="text-xs text-amber-400 uppercase font-semibold">Pending Client Balance</div>
                <div className="text-2xl font-bold mt-1 text-amber-400">{formatNaira(totalPendingNgn)}</div>
                <div className="text-xs text-muted-foreground mt-1">Due within current billing cycle</div>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border">
                {[
                  { key: "all", label: "All Records" },
                  { key: "invoices", label: "Tax Invoices" },
                  { key: "receipts", label: "Official Receipts" },
                  { key: "pending", label: "Pending Payment" },
                  { key: "paid", label: "Paid in Full" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setInvoiceFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      invoiceFilter === f.key
                        ? "bg-gold text-black font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="chip-gold flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> New Tax Invoice
                </button>
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Receipt className="h-3.5 w-3.5" /> Issue Receipt
                </button>
              </div>
            </div>

            {/* Invoice Table / Grid */}
            <div className="space-y-3">
              {filteredInvoices.length === 0 ? (
                <div className="card-elevated p-8 text-center text-muted-foreground">
                  No billing records match the selected filter.
                </div>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === "paid";
                  return (
                    <div
                      key={inv.id}
                      className="card-elevated p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/80 hover:border-gold/40 transition"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                            inv.type === "receipt"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {inv.type === "receipt" ? "REC" : "INV"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-foreground">{inv.id}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isPaid
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {inv.status.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                              {inv.brand}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-foreground mt-1">
                            {inv.clientName} · <span className="text-xs text-muted-foreground">{inv.clientPhone}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {inv.items.map((i) => `${i.description} (${i.quantity}x)`).join(", ")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                        <div className="text-left md:text-right">
                          <div className="text-xs text-muted-foreground">Total (incl. 7.5% VAT)</div>
                          <div className="text-base font-bold text-gold">{formatNaira(inv.totalAmountNgn)}</div>
                          {inv.balanceDueNgn > 0 && (
                            <div className="text-[11px] text-amber-400">Due: {formatNaira(inv.balanceDueNgn)}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!isPaid && (
                            <button
                              onClick={() => handleSettleInvoice(inv)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Settle
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowPrintModal(true);
                            }}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs transition"
                            title="Print / View Luxury Receipt"
                          >
                            <Printer className="h-4 w-4 text-gold" />
                          </button>
                          <a
                            href={`https://wa.me/${inv.clientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              formatInvoiceForWhatsApp(inv)
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-emerald-400 border border-border text-xs transition"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenGmailModalForInvoice(inv)}
                            className="p-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs transition"
                            title="Email Invoice to Client Gmail Inbox"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: GEMINI AI CRM AUTOMATION */}
        {/* ======================================================== */}
        {activeTab === "automation" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                Autonomous CRM & Financial Workflow Execution
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold mt-1">
                Super Gemini 2.5 Pro Executive Assistant
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                Execute end-to-end client billing, bank virtual account provisioning, and debt reconciliation commands with real persistent updates in Nigerian Naira (₦).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-elevated p-5 space-y-3 border border-border hover:border-gold/40 transition">
                <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
                  <Receipt className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">Instant VIP Invoice Generation</h3>
                <p className="text-xs text-muted-foreground">
                  Creates compliant tax invoices with 7.5% VAT, line items, and Zenith/GTB account details for high-net-worth clients.
                </p>
                <button
                  onClick={() => {
                    const created = createInvoice({
                      brand: "Derma Aesthetics",
                      clientName: "Chief Adewale Adeleke",
                      clientEmail: "a.adeleke@luxuryholdings.ng",
                      clientPhone: "+234 803 452 8891",
                      items: [
                        {
                          description: "Hollywood Facial & Laser Porcelain Whitening Course",
                          quantity: 1,
                          unitPriceNgn: 450000,
                        },
                      ],
                      notes: "Generated via Gemini AI 1-Click Executive Action.",
                    });
                    setInvoices(getStoredInvoices());
                    setSelectedInvoice(created);
                    setShowPrintModal(true);
                    toast.success(`Tax Invoice ${created.id} issued!`);
                  }}
                  className="w-full chip-gold py-2 text-xs font-semibold"
                >
                  Run: Generate ₦450k Invoice →
                </button>
              </div>

              <div className="card-elevated p-5 space-y-3 border border-border hover:border-emerald-500/40 transition">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">Official Stamped Receipt & Seal</h3>
                <p className="text-xs text-muted-foreground">
                  Produces official stamped proof-of-payment receipts with cryptographic verification hash and audit entry.
                </p>
                <button
                  onClick={() => {
                    const created = createReceipt({
                      brand: "Skin Clinic",
                      clientName: "Senator Fatima Aliyu",
                      clientEmail: "f.aliyu@gov.ng",
                      clientPhone: "+234 809 111 8899",
                      items: [
                        {
                          description: "VIP Exosome Infusion & Fractional RF Treatment",
                          quantity: 1,
                          unitPriceNgn: 750000,
                        },
                      ],
                      paymentMethod: "zenith_bank_transfer",
                      notes: "Generated via Gemini AI Stamped Receipt Engine.",
                    });
                    setInvoices(getStoredInvoices());
                    setSelectedInvoice(created);
                    setShowPrintModal(true);
                    toast.success(`Official Receipt ${created.id} stamped!`);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold transition"
                >
                  Run: Issue ₦750k Stamped Receipt →
                </button>
              </div>

              <div className="card-elevated p-5 space-y-3 border border-border hover:border-purple-500/40 transition">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">Corporate Bank Accounts Dispatch</h3>
                <p className="text-xs text-muted-foreground">
                  Displays official corporate settlement coordinates for Zenith Bank, GTBank, and Providus VIP Virtual Account.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Zenith Bank: 1018992044 | GTBank: 0229481920 | Providus Virtual: 9902847119 (ESB Brand Global Enterprise)`
                    );
                    toast.success("Bank accounts copied to clipboard!");
                  }}
                  className="w-full py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Bank Coordinates
                </button>
              </div>
            </div>

            {/* Corporate Settlement Information Panel */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display text-base font-semibold flex items-center gap-2">
                <Landmark className="h-5 w-5 text-gold" />
                Configured Nigerian Corporate Bank Accounts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(ESB_CORPORATE_BANKS).map(([k, b]) => (
                  <div key={k} className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gold uppercase">{b.bankName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">NGN</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-foreground tracking-wider">
                      {b.accountNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">{b.accountName}</div>
                    <div className="text-[10px] text-muted-foreground">TIN: {b.tin}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: CREATE TAX INVOICE */}
        {/* ======================================================== */}
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-elevated p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-gold" />
                  Create Tax Invoice
                </h2>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Brand Division *</label>
                    <select
                      value={invBrand}
                      onChange={(e) => setInvBrand(e.target.value as any)}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                    >
                      <option value="Derma Aesthetics">Derma Aesthetics</option>
                      <option value="Skincare Kitchen">Skincare Kitchen</option>
                      <option value="Skin Clinic">Skin Clinic</option>
                      <option value="Dental Care">Dental Care</option>
                      <option value="Rejuvenating Aesthetics">Rejuvenating Aesthetics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Bank Settlement *</label>
                    <select
                      value={invBank}
                      onChange={(e) => setInvBank(e.target.value as any)}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                    >
                      <option value="zenith">Zenith Bank (1018992044)</option>
                      <option value="gtbank">GTBank (0229481920)</option>
                      <option value="providus">Providus VIP Virtual (9902847119)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Client Name *</label>
                  <input
                    required
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    placeholder="e.g. Chief Adewale Adeleke"
                    className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Phone Number</label>
                    <input
                      value={invClientPhone}
                      onChange={(e) => setInvClientPhone(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Client Email</label>
                    <input
                      value={invClientEmail}
                      onChange={(e) => setInvClientEmail(e.target.value)}
                      placeholder="client@gmail.com"
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Service / Package Description *</label>
                  <input
                    required
                    value={invServiceDesc}
                    onChange={(e) => setInvServiceDesc(e.target.value)}
                    className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={invQty}
                      onChange={(e) => setInvQty(Number(e.target.value))}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Unit Price (₦ NGN) *</label>
                    <input
                      type="number"
                      step={1000}
                      value={invPrice}
                      onChange={(e) => setInvPrice(Number(e.target.value))}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs font-semibold text-gold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vatCheck"
                      checked={invVat}
                      onChange={(e) => setInvVat(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="vatCheck" className="text-xs text-foreground cursor-pointer">
                      Apply Federal 7.5% VAT (₦{Math.round((invPrice * invQty * (invVat ? 0.075 : 0))).toLocaleString()})
                    </label>
                  </div>
                  <span className="text-xs font-bold text-gold">
                    Total: ₦{Math.round(invPrice * invQty * (invVat ? 1.075 : 1)).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Invoice Notes / Instructions</label>
                  <textarea
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    rows={2}
                    className="w-full mt-1 rounded-xl bg-secondary border border-border p-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="chip-gold px-4 py-2 text-xs font-semibold">
                    Issue Tax Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ISSUE OFFICIAL RECEIPT */}
        {/* ======================================================== */}
        {showReceiptModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-elevated p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-lg font-display font-semibold flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                  Issue Stamped Payment Receipt
                </h2>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateReceiptSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Brand Division *</label>
                    <select
                      value={invBrand}
                      onChange={(e) => setInvBrand(e.target.value as any)}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                    >
                      <option value="Derma Aesthetics">Derma Aesthetics</option>
                      <option value="Skincare Kitchen">Skincare Kitchen</option>
                      <option value="Skin Clinic">Skin Clinic</option>
                      <option value="Dental Care">Dental Care</option>
                      <option value="Rejuvenating Aesthetics">Rejuvenating Aesthetics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Payment Method *</label>
                    <select
                      value={recPaymentMethod}
                      onChange={(e) => setRecPaymentMethod(e.target.value as any)}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                    >
                      <option value="zenith_bank_transfer">Zenith Bank Transfer</option>
                      <option value="gtbank_transfer">GTBank Transfer</option>
                      <option value="providus_virtual_account">Providus VIP Virtual Account</option>
                      <option value="paystack_online">Paystack Online Checkout</option>
                      <option value="pos_terminal">Clinic POS Terminal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Client Name *</label>
                  <input
                    required
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    placeholder="e.g. Senator Fatima Aliyu"
                    className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Payment Reference / TxID</label>
                    <input
                      value={recPaymentRef}
                      onChange={(e) => setRecPaymentRef(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Amount Received (₦ NGN) *</label>
                    <input
                      type="number"
                      step={1000}
                      value={recAmountPaid}
                      onChange={(e) => setRecAmountPaid(Number(e.target.value))}
                      className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs font-bold text-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Service Rendered</label>
                  <input
                    value={invServiceDesc}
                    onChange={(e) => setInvServiceDesc(e.target.value)}
                    className="w-full mt-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold"
                  >
                    Generate Stamped Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: PRINT / EXPORT LUXURY INVOICE OR RECEIPT */}
        {/* ======================================================== */}
        {showPrintModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="card-elevated p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto bg-neutral-950 border border-gold/40 space-y-6">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-border/80 pb-5">
                <div>
                  <div className="text-xl font-display font-bold gold-text">ESB BRAND GLOBAL ENTERPRISE</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    RC No: 1849204 · Federal TIN: 2849102-001
                  </div>
                  <div className="text-xs text-muted-foreground">
                    14B Bourdillon Road, Ikoyi, Lagos & Maitama, Abuja, Nigeria
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-block px-3 py-1 rounded-md text-xs font-bold font-mono uppercase ${
                      selectedInvoice.type === "receipt"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                    }`}
                  >
                    {selectedInvoice.type === "receipt" ? "OFFICIAL PAYMENT RECEIPT" : "OFFICIAL TAX INVOICE"}
                  </div>
                  <div className="text-sm font-mono font-bold mt-1.5 text-foreground">{selectedInvoice.id}</div>
                  <div className="text-[11px] text-muted-foreground">Date: {selectedInvoice.issueDate}</div>
                </div>
              </div>

              {/* Client & Bank Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">BILLED TO:</div>
                  <div className="font-semibold text-sm text-foreground">{selectedInvoice.clientName}</div>
                  <div className="text-muted-foreground">{selectedInvoice.clientPhone}</div>
                  <div className="text-muted-foreground">{selectedInvoice.clientEmail}</div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">PAYMENT SETTLEMENT:</div>
                  <div className="font-semibold text-gold">{selectedInvoice.bankAccount.bankName}</div>
                  <div className="font-mono text-foreground font-semibold">
                    Acct: {selectedInvoice.bankAccount.accountNumber}
                  </div>
                  <div className="text-muted-foreground text-[10px]">{selectedInvoice.bankAccount.accountName}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-secondary/80 font-bold p-2.5 text-muted-foreground">
                  <div className="col-span-7">DESCRIPTION</div>
                  <div className="col-span-2 text-center">QTY</div>
                  <div className="col-span-3 text-right">AMOUNT (₦)</div>
                </div>
                {selectedInvoice.items.map((it) => (
                  <div key={it.id} className="grid grid-cols-12 p-3 border-t border-border items-center">
                    <div className="col-span-7 font-medium text-foreground">{it.description}</div>
                    <div className="col-span-2 text-center text-muted-foreground">{it.quantity}</div>
                    <div className="col-span-3 text-right font-semibold text-foreground">
                      {formatNaira(it.totalNgn)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatNaira(selectedInvoice.subtotalNgn)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT ({selectedInvoice.vatRatePct}%):</span>
                    <span>{formatNaira(selectedInvoice.vatNgn)}</span>
                  </div>
                  {selectedInvoice.discountNgn > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount:</span>
                      <span>-{formatNaira(selectedInvoice.discountNgn)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5 text-gold">
                    <span>TOTAL:</span>
                    <span>{formatNaira(selectedInvoice.totalAmountNgn)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-400">
                    <span>Amount Paid:</span>
                    <span>{formatNaira(selectedInvoice.amountPaidNgn)}</span>
                  </div>
                  {selectedInvoice.balanceDueNgn > 0 && (
                    <div className="flex justify-between text-xs font-bold text-amber-400">
                      <span>Balance Due:</span>
                      <span>{formatNaira(selectedInvoice.balanceDueNgn)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Seal & Verification Hash */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-dashed border-border flex items-center justify-between text-[11px]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="h-4 w-4" /> Cryptographic Verification Hash
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {selectedInvoice.verificationHash}
                  </div>
                </div>
                <div className="text-right text-[10px] text-muted-foreground">
                  Status: <span className="font-bold text-foreground">{selectedInvoice.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Print Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="chip-gold flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                >
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD PATIENT INTAKE */}
        {showAddPatientModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-elevated p-6 max-w-md w-full">
              <h2 className="text-xl font-display font-semibold mb-4">New Client Intake Form</h2>
              <form onSubmit={handleAddPatient} className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Full Name *</label>
                  <input
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Chief Nnamdi"
                    className="w-full mt-1 rounded-xl bg-secondary/80 border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone Number *</label>
                  <input
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="+234..."
                    className="w-full mt-1 rounded-xl bg-secondary/80 border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Skin Profile & Concerns</label>
                  <input
                    value={newPatient.skinType}
                    onChange={(e) => setNewPatient({ ...newPatient, skinType: e.target.value })}
                    placeholder="e.g. Sensitive / Dry / Hyperpigmentation"
                    className="w-full mt-1 rounded-xl bg-secondary/80 border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Allergies / Contraindications</label>
                  <input
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    placeholder="e.g. Salicylic acid allergy"
                    className="w-full mt-1 rounded-xl bg-secondary/80 border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPatientModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="chip-gold px-4 py-2 text-xs font-semibold">
                    Save Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CLINICAL NOTE */}
        {showNoteModal && selectedPatient && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-elevated p-6 max-w-md w-full">
              <h2 className="text-lg font-display font-semibold mb-2">Log Observation Note</h2>
              <p className="text-xs text-muted-foreground mb-4">Patient: {selectedPatient.name}</p>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
                placeholder="Clinical observation, tolerance, or treatment preference..."
                className="w-full rounded-xl bg-secondary/80 border border-border p-3 text-sm focus:outline-none focus:border-gold/50"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button onClick={handleAddNote} className="chip-gold px-4 py-2 text-xs font-semibold">
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: WHATSAPP CONCIERGE */}
        {showWhatsAppModal && selectedPatient && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-elevated p-6 max-w-lg w-full">
              <h2 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                WhatsApp Outreach: {selectedPatient.name}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Send instant VIP notifications or payment coordinates directly via WhatsApp:
              </p>

              <div className="space-y-3">
                {[
                  {
                    title: "Appointment Reminder & VIP Suite",
                    text: `Hello ${selectedPatient.name}, this is ESB Brand Concierge confirming your consultation at our ${selectedPatient.primaryBranch} private suite. Looking forward to hosting you!`,
                  },
                  {
                    title: "Official Bank Transfer Details",
                    text: `Dear ${selectedPatient.name}, for your convenience, official settlement can be made to Zenith Bank (Account: 1018992044, ESB BRAND GLOBAL ENTERPRISE). Kindly share receipt once done.`,
                  },
                  {
                    title: "Post-Treatment Regimen & SPF 50",
                    text: `Hi ${selectedPatient.name}, checking in post-procedure! How is your skin feeling? Please remember to reapply your ESB Mineral SPF 50+ generously today.`,
                  },
                ].map((tmpl) => (
                  <div key={tmpl.title} className="p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="font-semibold text-xs text-gold mb-1">{tmpl.title}</div>
                    <p className="text-xs text-muted-foreground mb-3">{tmpl.text}</p>
                    <a
                      href={`https://wa.me/${selectedPatient.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        tmpl.text
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setShowWhatsAppModal(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Send to WhatsApp →
                    </a>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
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
          clientPhone={gmailModal.clientPhone}
          brand={gmailModal.brand}
          contextType={gmailModal.contextType}
          invoiceNumber={gmailModal.invoiceNumber}
          amountNgn={gmailModal.amountNgn}
        />
      </div>
    </Shell>
  );
}
