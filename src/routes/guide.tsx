import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Compass, Play, Pause, ChevronLeft, ChevronRight, Download,
  Printer, Copy, Check, Users, ShieldCheck, Crown, Briefcase,
  Calculator, Truck, Sparkles, MapPin, Receipt, Package,
  HardDrive, ShoppingBag, Eye, Layers, HelpCircle, Smartphone,
  CheckCircle2, ArrowRight, ExternalLink, Laptop, FileText,
  Calendar, MessageCircle, AlertTriangle, Star, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";
import { formatNaira } from "@/lib/currency";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "App Navigation Guide & 3D Tour — ESB Brand Suite" },
      {
        name: "description",
        content:
          "Simplified, non-technical visual guide, 3D animated walkthrough tour, staff ranking matrix, and downloadable presentation for ESB Brand Suite.",
      },
    ],
  }),
  component: GuidePage,
});

interface TourStop {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: any;
  targetRoute: string;
  simpleExplanation: string;
  keyActions: string[];
  tipsForNonTech: string;
  mockVisual: {
    heading: string;
    metrics: Array<{ label: string; value: string }>;
    sampleSnippet: string;
    tag: string;
  };
}

const TOUR_STOPS: TourStop[] = [
  {
    id: "stop-nav",
    stepNumber: 1,
    title: "Executive Overview & Global Navigation",
    subtitle: "Your Command Center at a Glance",
    badge: "Basics & Navigation",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    icon: Compass,
    targetRoute: "/",
    simpleExplanation:
      "Think of this as the main dashboard of your car. The top bar shows your current location, network connection (Always Online), and quick buttons to jump anywhere in the application with one tap.",
    keyActions: [
      "Use the top navigation bar to switch between Overview, Web Store, Google Hub, and App Guide.",
      "Press ⌘K (or tap Search) from anywhere to find any client, doctor, or inventory formula instantly.",
      "Tap the 'Download App' button anytime to save the mobile application onto your phone or tablet.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: You can never get lost. Just click 'Overview' or the ESB Brand logo in the top left to return home.",
    mockVisual: {
      heading: "ESB Global Enterprise Dashboard",
      metrics: [
        { label: "Active Revenue", value: "₦142.8M" },
        { label: "Clinics Online", value: "3 Hubs" },
        { label: "Uptime", value: "100% Online" },
      ],
      sampleSnippet: "Nav Bar: Overview · Web Store · Google Hub · CRM · Inventory · Staff",
      tag: "Header & Global Bar",
    },
  },
  {
    id: "stop-brands",
    stepNumber: 2,
    title: "The 3 Sub-Brand Intelligence Hubs",
    subtitle: "Derma Aesthetics · Skincare Kitchen · Skin Clinic",
    badge: "Brand Dashboards",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    icon: ShoppingBag,
    targetRoute: "/brands/derma",
    simpleExplanation:
      "ESB Brand Suite manages three distinct clinical businesses. Each brand has its own official Gmail mailbox, Google Drive folder, revenue targets in ₦ NGN, and custom AI chatbot assistant.",
    keyActions: [
      "Derma Aesthetics: Clinical sunscreen (SPF 50+), hyperpigmentation products, and wholesale clinic orders.",
      "Skincare Kitchen: Handcrafted organic shea butter, custom serum mixing bar, and laboratory formulations.",
      "Skin Clinic: Doctor appointments, private suite laser resurfacing, and exosome infusion therapy.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: Click 'Brands' in the navigation menu to jump directly to any sub-brand's dedicated headquarters.",
    mockVisual: {
      heading: "Derma Aesthetics Flagship HQ",
      metrics: [
        { label: "Official Gmail", value: "dermaaesthetics.ng@gmail.com" },
        { label: "Web Store", value: "dermaaesthetics.ng" },
        { label: "Monthly Target", value: "₦35.0M NGN" },
      ],
      sampleSnippet: "Connected: Gmail Inflow · Drive Cloud Certs · Live Sheets Ledger",
      tag: "Sub-Brand Engine",
    },
  },
  {
    id: "stop-crm",
    stepNumber: 3,
    title: "Client 360, Tax Invoices & Stamped Receipts",
    subtitle: "Complete Customer Care & Automated Billing",
    badge: "CRM & Finance",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    icon: Users,
    targetRoute: "/crm",
    simpleExplanation:
      "No more paper files or lost invoices! Search any client to see their skin allergies, past treatments, loyalty rewards, and issue official Nigerian Tax Invoices with 7.5% VAT in 10 seconds.",
    keyActions: [
      "Find any client by typing their name, phone number, or skin concern into the search box.",
      "Click 'Issue Invoice' to generate a luxury invoice with your bank account details (Zenith, GTB, Providus).",
      "Click 'WhatsApp Concierge' to send a pre-written appointment reminder or payment receipt directly to their phone.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: Click 'Print / Save PDF' on any invoice to print a physical paper copy or save it for accounting.",
    mockVisual: {
      heading: "Client Profile: Chief Adewale Adeleke",
      metrics: [
        { label: "Tier", value: "VIP Diamond" },
        { label: "Total Spent", value: "₦8,750,000" },
        { label: "Loyalty Points", value: "1,240 Pts" },
      ],
      sampleSnippet: "Tax Invoice INV-2026-1049: ₦792,700 (Zenith Bank PLC 1018992044)",
      tag: "Client 360 & Billing",
    },
  },
  {
    id: "stop-inventory",
    stepNumber: 4,
    title: "Inventory & Google Maps Delivery Tracking",
    subtitle: "GPS Van Tracking & AI Auto-Restock",
    badge: "Logistics & Fleet",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    icon: Truck,
    targetRoute: "/inventory",
    simpleExplanation:
      "Watch your delivery vans move across Lagos and Abuja on a live Google Maps tracker. The app alerts you when any serum or cream runs low, and AI can create a supplier Purchase Order automatically.",
    keyActions: [
      "Check current stock levels across Port Harcourt Flagship and Abuja branches.",
      "See live delivery status: 'In Transit', 'Out for Delivery', or 'Delivered' with driver names and phone numbers.",
      "Click 'Gemini Auto-Restock' to scan all low-stock items and generate supplier orders in one click.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: Tap 'Notify on WhatsApp' next to any delivery to send an instant tracking update to your client.",
    mockVisual: {
      heading: "Fleet Tracker: Van 02 (Lekki Phase 1)",
      metrics: [
        { label: "Package", value: "ESB-DEL-9841" },
        { label: "Status", value: "In Transit" },
        { label: "ETA", value: "14 mins away" },
      ],
      sampleSnippet: "GPS Radar: Passing Lekki-Ikoyi Toll Bridge · Driver: Babatunde Lawal",
      tag: "Live Fleet Radar",
    },
  },
  {
    id: "stop-workspace",
    stepNumber: 5,
    title: "Google Workspace Hub & Cloud Uploader",
    subtitle: "Gmail, Calendar, Drive, Sheets & Live Camera",
    badge: "Cloud Integration",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    icon: HardDrive,
    targetRoute: "/workspace",
    simpleExplanation:
      "Connect your Google Workspace to read executive emails, sync appointments with Google Calendar, and upload patient before/after photos straight from your device camera into secure Google Drive folders.",
    keyActions: [
      "Gmail: View incoming emails from VIP clients and suppliers with instant 'Analyze with AI' buttons.",
      "Calendar: Book appointments that automatically reflect on clinicians' phones.",
      "Camera & Drive: Snap photos of treatments or documents and upload directly to Google Drive.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: Even if you are offline, all files and notes are saved safely on your device and sync when you reconnect.",
    mockVisual: {
      heading: "Google Workspace Central Hub",
      metrics: [
        { label: "Gmail", value: "Live Sync" },
        { label: "Cloud Drive", value: "128 Files" },
        { label: "Spreadsheets", value: "Auto-Updated" },
      ],
      sampleSnippet: "Direct Camera Viewfinder & Instant Cloud Uploader Active",
      tag: "Google Workspace Hub",
    },
  },
  {
    id: "stop-store",
    stepNumber: 6,
    title: "Luxury Web Store & E-Commerce",
    subtitle: "Shop Medical Skincare in Nigerian Naira (₦)",
    badge: "E-Commerce",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/40",
    icon: ShoppingBag,
    targetRoute: "/store",
    simpleExplanation:
      "Your digital storefront for retail customers and wholesale clinics. Browse clinical sunscreens, botanical body soufflés, and anti-aging ampoules with easy shopping cart checkout.",
    keyActions: [
      "Filter by brand (Derma Aesthetics, Skincare Kitchen, Skin Clinic, Dental Care).",
      "Add products to cart and see live order summaries in Nigerian Naira (₦).",
      "Integrated checkout with Bank Transfer, Paystack, and doorstep delivery selection.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: Share product links directly with clients on WhatsApp so they can order with zero hassle.",
    mockVisual: {
      heading: "ESB Luxury E-Commerce Store",
      metrics: [
        { label: "Derma SPF 50+", value: "₦36,000" },
        { label: "Whipped Shea", value: "₦32,500" },
        { label: "Exosome Cream", value: "₦62,000" },
      ],
      sampleSnippet: "Cart: ₦185,000 NGN · Dispatched via ESB Express Delivery",
      tag: "Luxury Web Store",
    },
  },
  {
    id: "stop-staff",
    stepNumber: 7,
    title: "Staff Ranks, Access Hierarchy & Geofence Verification",
    subtitle: "Roles, Permissions, Salaries & GPS Attendance",
    badge: "Staff & Governance",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
    icon: ShieldCheck,
    targetRoute: "/staff",
    simpleExplanation:
      "Every staff member has a clear rank with customized access rights. Attendance is verified using GPS Geofencing — staff can only clock in when physically inside the Port Harcourt or Abuja clinic premises!",
    keyActions: [
      "Super Admin (CEO): Complete access to all financial accounts, strategic decisions, and AI overrides.",
      "Admin (Accountant / Ops): Approves invoices, monitors cashflow, reconciles bank statements, and runs payroll.",
      "Manager: Manages daily branch shifts, room allocations, doctor appointments, and delivery dispatch.",
      "Clinical Staff (Doctors, Nurses, Formulators): Records clinical notes, performs treatments, and earns KPI rewards.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: Punctual staff who arrive on time earn reward points and monthly bonuses in Nigerian Naira (₦)!",
    mockVisual: {
      heading: "Staff Registry & GPS Geofence Check",
      metrics: [
        { label: "Premises Check", value: "GPS Locked (100m)" },
        { label: "On Duty", value: "18 Staff" },
        { label: "Punctuality", value: "98.4%" },
      ],
      sampleSnippet: "Ranks: Super Admin (CEO) > Admin (Accountant) > Manager > Clinical Staff",
      tag: "Governance & Roles",
    },
  },
  {
    id: "stop-ai",
    stepNumber: 8,
    title: "Super Gemini Multi-Brain AI Concierge",
    subtitle: "Voice Chat, Camera Vision & Autonomous Actions",
    badge: "Artificial Intelligence",
    badgeColor: "bg-gold/20 text-gold border-gold/40",
    icon: Sparkles,
    targetRoute: "/ai/ceo",
    simpleExplanation:
      "Your personal digital business manager. You don't need technical skills — just talk to the AI or type instructions in plain English, and it will execute real actions on your invoices, stock, and staff records.",
    keyActions: [
      "Voice Chat: Tap the golden microphone to speak naturally. The AI transcribes your voice in real time.",
      "Camera Analysis: Snap photos of skin conditions, invoices, or delivery labels for instant AI diagnosis.",
      "Executive Commands: Tell it to 'Restock 50 serums', 'Generate ₦450k invoice for Mrs. Doherty', or 'Check staff attendance'.",
    ],
    tipsForNonTech:
      "💡 Pro-Tip: You can switch between 4 AI brains: Super Gemini 2.5, ChatGPT-4o, Grok-2, and Claude 3.5 anytime!",
    mockVisual: {
      heading: "Super Gemini 2.5 Pro Autonomous Action",
      metrics: [
        { label: "Speech-to-Text", value: "Voice Active" },
        { label: "Camera Vision", value: "HD Live" },
        { label: "Auto Action", value: "Executed" },
      ],
      sampleSnippet: "'Invoice INV-2026-1049 created for Chief Adewale Adeleke (₦792,700)'",
      tag: "Gemini AI Brain",
    },
  },
];

const STAFF_ROLES_TABLE = [
  {
    role: "Super Admin (CEO / Founder)",
    level: "Tier 1 — Full Executive Control",
    color: "text-gold bg-gold/10 border-gold/30",
    description: "Complete unrestricted access across all 5 clinical brands, financial vaults, AI directives, and user management.",
    permissions: [
      "All financial ledgers & banking coordinates",
      "Executive AI multi-brain override authority",
      "Staff hiring, salary & promotion approvals",
      "System security and brand configuration",
    ],
  },
  {
    role: "Admin (Chief Accountant & Ops Lead)",
    level: "Tier 2 — Financial & Procurement Governance",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    description: "Oversees revenue reconciliation, tax invoices, stamped payment receipts, supplier purchase orders, and monthly payroll in ₦.",
    permissions: [
      "Tax invoice generation & payment receipts",
      "Zenith, GTB & Providus virtual account reconciliation",
      "Supplier PO clearance & goods delivery waybills",
      "Staff monthly salary & bonus disbursements",
    ],
  },
  {
    role: "Manager (Clinic & Branch Manager)",
    level: "Tier 3 — Operational & Facility Management",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    description: "Responsible for day-to-day clinic operations in Lagos & Abuja, doctor scheduling, delivery fleet coordination, and staff punctuality.",
    permissions: [
      "GPS geofenced staff attendance monitoring",
      "Clinic suite allocation & treatment room bookings",
      "Delivery cargo dispatch & Google Maps tracking",
      "Daily stock usage & branch inventory adjustments",
    ],
  },
  {
    role: "Clinical Staff (Doctors, Nurses, Formulators)",
    level: "Tier 4 — Healthcare & Service Delivery",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    description: "Frontline practitioners providing treatments, formulating bespoke serums, recording patient diagnostics, and assisting clients.",
    permissions: [
      "Patient 360 diagnostic profiles & allergy records",
      "Service & treatment history logging",
      "Mobile GPS clock-in at clinic premises",
      "Earning loyalty points & performance bonuses",
    ],
  },
];

const NON_TECH_FAQS = [
  {
    q: "How do I create and send an invoice to a client?",
    a: "Go to 'CRM' in the top menu. Tap the 'Issue Invoice' button, type the client's name and treatment price in Nigerian Naira (₦), and click 'Save'. You can immediately click 'WhatsApp' to send the bill straight to their phone, or click 'Print' to get a physical paper receipt.",
  },
  {
    q: "How do staff clock in every morning?",
    a: "Staff simply open the app on their phone or tablet when they arrive at the Port Harcourt or Abuja clinic. The app automatically checks their GPS location. As long as they are within the clinic grounds (100 meters), tap 'Clock In' and their attendance is verified instantly with zero paperwork.",
  },
  {
    q: "How do I track delivery orders on Google Maps?",
    a: "Click 'Inventory & Maps' in the menu, then tap the 'Google Maps Tracking' tab. You will see a live map showing every dispatch van in Lagos and Abuja with estimated arrival times. Tap 'Notify on WhatsApp' to send the driver's contact details to the customer.",
  },
  {
    q: "What do I do if our internet goes offline?",
    a: "Do not worry! The app has a 100% Always-Online offline engine. You can continue creating invoices, looking up patients, and logging treatments. As soon as the Wi-Fi or mobile data reconnects, the app automatically syncs everything in the background without losing a single piece of data.",
  },
  {
    q: "How do I speak to the AI instead of typing?",
    a: "Click the floating golden robot or brain icon in the bottom corner. Tap the golden microphone icon and speak normally in English. The AI listens, writes down what you said, and answers immediately.",
  },
  {
    q: "Can I install this on my iPhone, Android, or laptop?",
    a: "Yes! Tap the 'Download App' button in the top right. For Android, tap 'Download Android APK'. For iPhone, open the app in Safari, tap the Share icon, and select 'Add to Home Screen'.",
  },
];

function GuidePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [view3dAngle, setView3dAngle] = useState<"isometric" | "front" | "tablet">("isometric");
  const [copiedPresentation, setCopiedPresentation] = useState(false);

  const currentStop = TOUR_STOPS[currentStepIndex];

  // Auto-play tour effect
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % TOUR_STOPS.length);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentStepIndex((prev) => (prev + 1) % TOUR_STOPS.length);
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => (prev - 1 + TOUR_STOPS.length) % TOUR_STOPS.length);
  };

  const handleDownloadPresentation = () => {
    toast.success("Preparing Navigation Guide Presentation...", {
      description: "Generating complete executive walkthrough document.",
    });

    setTimeout(() => {
      const markdownContent = `# ESB BRAND SUITE — COMPLETE NAVIGATION & OPERATIONAL GUIDE
Executive Reference Manual & Staff Onboarding Presentation
Version: 3.8.0 Enterprise Release | Currency: Nigerian Naira (₦ NGN)

===================================================================
1. EXECUTIVE SUMMARY & OVERVIEW
===================================================================
ESB Brand Suite is a unified enterprise management application built for high-luxury aesthetics, medical dermatology, handcrafted cosmetics, and retail operations across Nigeria (Lagos & Abuja).

Core URL: https://esbbrand.app
Always-Online SLA: 100% Uptime with Local Resilient Caching

===================================================================
2. GLOBAL NAVIGATION & SHORTCUTS
===================================================================
• Top Navigation Bar: Quick access to Overview, Web Store, Google Hub, CRM, Inventory, Staff Records.
• Quick Command Bar: Press ⌘K on desktop or tap Search icon on mobile to instantly find clients, SKUs, or doctor shifts.
• Status Pill: Displays live network telemetry ("Always Online 100%") and active Google Workspace synchronization.

===================================================================
3. THE THREE FLAGSHIP SUB-BRANDS
===================================================================
A. DERMA AESTHETICS (Retail & Clinical Sunscreen)
   - Official Mailbox: dermaaesthetics.ng@gmail.com
   - Web Store: dermaaesthetics.ng
   - Key Focus: SPF 50+ Invisible Fluid, hyperpigmentation regimens, aesthetic clinic pre-orders.

B. SKINCARE KITCHEN (Formulation Chemistry & Serum Bar)
   - Official Mailbox: skincarekitchen.com@gmail.com
   - Web Store: skincarekitchen.com.ng
   - Key Focus: Pure Nigerian shea butter batches, bespoke Vitamin C & peptide custom mixing, organic sourcing.

C. SKIN CLINIC (Medical Aesthetics Procedures)
   - Official Mailbox: skinclinic815@gmail.com
   - Key Focus: Doctor consultations, Fractional RF, Exosome Infusion, chemical peels, VIP suite management.

===================================================================
4. CLIENT CRM & INVOICE AUTOMATION
===================================================================
• Tax Invoices (INV-2026-XXXX): Auto-calculates 7.5% Federal VAT, discounts, and itemized treatments in ₦ NGN.
• Official Payment Receipts (REC-2026-XXXX): Stamped proof of payment with cryptographic verification hash (ESB-SHA256-...).
• Nigerian Bank Integration:
   - Zenith Bank PLC: 1018992044 (ESB BRAND GLOBAL ENTERPRISE)
   - Guaranty Trust Bank: 0229481920 (ESB LUXURY HEALTH & AESTHETICS LTD)
   - Providus Virtual VIP: 9902847119 (Instant Reconciliation)
• 1-Click WhatsApp: Dispatches formatted luxury receipts directly to the client's WhatsApp.

===================================================================
5. INVENTORY & GOOGLE MAPS FLEET TRACKING
===================================================================
• Real-time stock counts across Port Harcourt Flagship and Abuja branches.
• Live GPS Fleet Radar: Track delivery vans across Lagos & Abuja with driver details and ETAs.
• Gemini AI Auto-Restock: 1-click scan of low-stock thresholds to generate supplier Purchase Orders (PO-2026-XXXX).
• Goods Delivery Waybills: Printable carrier manifests with driver sign-off and QC approval.

===================================================================
6. STAFF RANKING & ACCESS HIERARCHY
===================================================================
• Tier 1 - Super Admin (CEO / Founder): Unrestricted executive controls, AI overrides, financial ledgers.
• Tier 2 - Admin (Chief Accountant / Ops Lead): Approves invoices, payroll, supplier POs, and cashflow.
• Tier 3 - Manager (Clinic & Branch Manager): Oversees staff shifts, room allocations, delivery dispatch.
• Tier 4 - Clinical Staff (Doctors, Nurses, Formulators): Diagnostic notes, treatment delivery, reward points.
• GPS Geofence Attendance: Staff must be physically within 100 meters of clinic grounds to clock in.

===================================================================
7. SUPER GEMINI MULTI-BRAIN AI
===================================================================
• Voice Chat: Hands-free speech-to-text input with live transcription.
• Camera Diagnostics: Snap photos for instant analysis and cloud upload.
• Autonomous Execution: Instruct AI to restock formulas, draft bills, or verify attendance.
`;

      const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ESB-Brand-Suite-Navigation-Guide.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Presentation Guide Downloaded!", {
        description: "Opened in clean text format for review or presentation export.",
      });
    }, 800);
  };

  const handleCopyPresentation = () => {
    const summary = `ESB Brand Suite Quick Navigation Summary:
1. Overview (/): Live enterprise financial radar in ₦ NGN.
2. Sub-Brands (/brands/...): Derma, Skincare Kitchen & Skin Clinic connected to respective Gmails.
3. CRM (/crm): VIP patient profiles, 7.5% VAT Tax Invoices, and stamped receipts.
4. Inventory (/inventory): Real-time stock & Google Maps delivery van tracking.
5. Google Workspace (/workspace): Live Gmail, Drive, Sheets, and Camera upload.
6. Web Store (/store): Luxury e-commerce with Nigerian checkout.
7. Staff & Rewards (/staff): GPS Geofenced clock-in (100m) and staff tier governance.
8. AI Brain (/ai/ceo): Voice chat, camera vision, and autonomous execution.`;

    navigator.clipboard.writeText(summary);
    setCopiedPresentation(true);
    toast.success("Summary copied to clipboard!", {
      description: "Ready to share with team members or clients.",
    });
    setTimeout(() => setCopiedPresentation(false), 3000);
  };

  return (
    <Shell>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* Hero Section */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-amber-950/30 border border-gold/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-mono font-semibold">
                <Compass className="h-3.5 w-3.5" />
                <span>3D HD VIRTUAL TOUR & EXECUTIVE MANUAL</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground">
                How to Navigate ESB Brand Suite
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                A simplified visual walkthrough engineered so anyone — even a non-technical staff member or executive — can instantly understand every screen, feature, staff rank, and workflow in Nigerian Naira (₦).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleDownloadPresentation}
                className="chip-gold flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Full Guide</span>
              </button>
              <button
                onClick={handleCopyPresentation}
                className="px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copiedPresentation ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedPresentation ? "Copied!" : "Copy Summary"}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-gold border border-border text-xs transition"
                title="Print Presentation Guide"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: INTERACTIVE 3D HD VIRTUAL TOUR STAGE */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-gold" />
                Interactive 3D Walkthrough Tour (Step {currentStepIndex + 1} of {TOUR_STOPS.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Follow the guided tour below or select any stop to see how each part of the app works.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Perspective Angle Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border text-xs">
                <button
                  onClick={() => setView3dAngle("isometric")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    view3dAngle === "isometric" ? "bg-gold text-black" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  3D Isometric
                </button>
                <button
                  onClick={() => setView3dAngle("front")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    view3dAngle === "front" ? "bg-gold text-black" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Front View
                </button>
                <button
                  onClick={() => setView3dAngle("tablet")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    view3dAngle === "tablet" ? "bg-gold text-black" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tablet View
                </button>
              </div>

              {/* Auto Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition font-semibold ${
                  isPlaying
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                }`}
                title={isPlaying ? "Pause automated tour" : "Auto-play tour (6s per step)"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{isPlaying ? "Auto-Playing" : "Auto-Play"}</span>
              </button>
            </div>
          </div>

          {/* 3D Perspective Virtual Stage */}
          <div
            className="card-elevated rounded-3xl border border-gold/40 p-6 sm:p-8 bg-neutral-950 relative overflow-hidden transition-all duration-700 shadow-2xl"
            style={{
              perspective: "1200px",
            }}
          >
            {/* Background Ambient Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

            <div
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-500"
              style={{
                transform:
                  view3dAngle === "isometric"
                    ? "rotateX(8deg) rotateY(-4deg)"
                    : view3dAngle === "tablet"
                    ? "rotateX(14deg) scale(0.96)"
                    : "rotateX(0deg) rotateY(0deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Left Column: Tour Stop Content & Explanation */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-3 py-1 rounded-full border font-semibold ${currentStop.badgeColor}`}>
                    {currentStop.badge}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Step {currentStop.stepNumber} / {TOUR_STOPS.length}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {currentStop.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-gold font-medium mt-0.5">
                    {currentStop.subtitle}
                  </div>
                </div>

                {/* Non-Technical Plain English Box */}
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 space-y-2">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-gold" />
                    <span>In Simple Terms (Non-Tech Translation):</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {currentStop.simpleExplanation}
                  </p>
                </div>

                {/* Key Action Steps */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    What You Can Do Here:
                  </div>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {currentStop.keyActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro-Tip Box */}
                <div className="text-xs text-gold/90 font-medium p-3 rounded-xl bg-gold/10 border border-gold/30">
                  {currentStop.tipsForNonTech}
                </div>

                {/* Quick Jump Action */}
                <div className="pt-2">
                  <Link
                    to={currentStop.targetRoute}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <span>Visit This Screen Now ({currentStop.targetRoute})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3D Hologram Mockup Card */}
              <div className="lg:col-span-5">
                <div
                  className="card-elevated rounded-2xl border-2 border-gold/60 p-6 bg-neutral-900/90 shadow-2xl space-y-4 transform transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    boxShadow: "0 20px 50px rgba(212, 175, 55, 0.15)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold">
                        <currentStop.icon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-bold text-foreground font-mono">{currentStop.mockVisual.tag}</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground">{currentStop.mockVisual.heading}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      {currentStop.mockVisual.sampleSnippet}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    {currentStop.mockVisual.metrics.map((m, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-secondary/50 border border-border text-center">
                        <div className="text-[10px] text-muted-foreground uppercase">{m.label}</div>
                        <div className="text-xs font-bold text-gold mt-0.5 truncate">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-border text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                    <span>Virtual Telemetry: OK</span>
                    <span className="text-emerald-400 font-semibold">100% OPERATIONAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="mt-8 pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground flex items-center gap-1 transition"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 rounded-xl bg-gold text-black text-xs font-bold hover:scale-105 active:scale-95 transition shadow-sm flex items-center gap-1"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Step Dots */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {TOUR_STOPS.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? "w-8 bg-gold"
                        : "w-2.5 bg-secondary hover:bg-muted-foreground/40"
                    }`}
                    title={`Jump to Step ${idx + 1}: ${st.title}`}
                  />
                ))}
              </div>

              <div className="text-xs text-muted-foreground font-mono">
                {currentStepIndex + 1} of {TOUR_STOPS.length} Topics
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: STAFF RANKS, HIERARCHY & ACCESS MATRIX */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              Organizational Governance
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mt-1">
              Staff Hierarchy, Roles & Access Rights
            </h2>
            <p className="text-xs text-muted-foreground">
              Every staff member is assigned a specific rank to protect sensitive medical and financial data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STAFF_ROLES_TABLE.map((role) => (
              <div
                key={role.role}
                className="card-elevated p-6 rounded-2xl border border-border hover:border-gold/40 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${role.color}`}>
                      {role.level}
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-2">{role.role}</h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>

                <div className="pt-2 border-t border-border space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                    Authorized Permissions:
                  </div>
                  <ul className="space-y-1 text-xs text-foreground/90">
                    {role.permissions.map((p, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* GPS Geofence & Rewards Policy Box */}
          <div className="card-elevated p-6 rounded-2xl border border-gold/30 bg-secondary/30 space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold" />
              GPS Geofence Clock-In & Performance Rewards System
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To guarantee accountability, staff attendance uses GPS satellite verification. Personnel must be physically within 100 meters of the <strong>Port Harcourt Flagship Clinic (4.8156° N, 7.0498° E)</strong> or <strong>Maitama Abuja Hub (9.0765° N, 7.4985° E)</strong> to clock in. Staff who maintain 95%+ punctuality and zero patient complaints earn monthly bonuses in Nigerian Naira (₦) and reward points redeemable for custom skincare formulations!
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: SIMPLIFIED NON-TECH "HOW-DO-I" CHEATSHEET */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" />
              Everyday Quick Answers
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mt-1">
              Plain-English "How Do I..." Guide
            </h2>
            <p className="text-xs text-muted-foreground">
              Instant step-by-step solutions for everyday clinic, sales, and inventory questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NON_TECH_FAQS.map((faq, i) => (
              <div key={i} className="card-elevated p-5 rounded-2xl border border-border space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-start gap-2">
                  <span className="text-gold font-mono">Q{i + 1}.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 4: DOWNLOADABLE PRESENTATION & SUMMARY */}
        {/* ======================================================== */}
        <div className="card-elevated p-6 sm:p-8 rounded-3xl border border-gold/40 bg-gradient-to-r from-neutral-950 via-secondary/40 to-neutral-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-gold" />
              Download Staff Onboarding Presentation Packet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Export this entire operational guide in clean formatted text or printable layout to train new staff, print physical binder handbooks, or present to executive investors.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadPresentation}
              className="chip-gold flex items-center gap-1.5 px-5 py-3 text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download Presentation (.txt)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer className="h-4 w-4 text-gold" />
              <span>Print Handbook</span>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
