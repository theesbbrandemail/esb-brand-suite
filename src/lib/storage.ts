/**
 * Persistent Storage & Automatic Simulated Data Processing Engine
 * Handles local state persistence across sessions and real-time operational feeds.
 */

export interface SalesDeal {
  id: string;
  clientName: string;
  phone: string;
  department: string;
  packageName: string;
  value: number; // in NGN (₦)
  stage: "lead" | "contacted" | "consultation" | "proposal" | "closed_won" | "lost";
  assignedRep: string;
  createdAt: string;
  notes?: string;
}

export interface CrmPatient {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: "VIP Concierge" | "Black Diamond" | "Gold Elite" | "Silver Member";
  lifetimeSpend: number; // in NGN
  lastVisit: string;
  primaryBranch: string;
  preferredBrand: string;
  skinType?: string;
  loyaltyPoints: number;
  notes?: string;
  treatmentHistory: Array<{
    date: string;
    procedure: string;
    practitioner: string;
    cost: number;
  }>;
}

export interface StaffRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  branch: string;
  phone: string;
  avatar: string;
  status: "on_duty" | "off_duty" | "on_break";
  clockInTime?: string;
  verifiedLocation?: string;
  coordinates?: { lat: number; lng: number };
  dailyTasksCompleted: number;
  totalDailyTasks: number;
  shiftHours: number;
  monthlySalaryNgn: number;
}

export interface AiActionExecution {
  id: string;
  brain: "Super Gemini 2.5" | "Chat GPT-4o" | "Grok-2 Brain" | "Claude 3.5";
  command: string;
  actionType: "CREATE_TASK" | "ADD_LEAD" | "LOG_DEAL" | "RESTOCK_INVENTORY" | "SCHEDULE_APPOINTMENT" | "VERIFY_STAFF" | "EXECUTIVE_OVERRIDE";
  details: string;
  targetEntity: string;
  status: "executed" | "pending_review" | "approved";
  timestamp: string;
  impactValueNgn?: number;
}

export interface LiveActivityFeedItem {
  id: string;
  type: "payment" | "booking" | "checkin" | "ai_action" | "inventory";
  title: string;
  description: string;
  amountNgn?: number;
  timestamp: string;
  badge: string;
}

const STORAGE_KEYS = {
  DEALS: "esb_sales_deals_v2",
  CRM: "esb_crm_patients_v2",
  STAFF: "esb_staff_records_v2",
  ACTIONS: "esb_ai_action_log_v2",
  FEED: "esb_live_activity_feed_v2",
};

// Default Realistic Seed Data in Nigerian Naira (₦)
export const DEFAULT_DEALS: SalesDeal[] = [
  {
    id: "deal-1",
    clientName: "Chief Adewale Adeleke",
    phone: "+234 803 452 8891",
    department: "derma",
    packageName: "Stem Cell Anti-Aging Full Protocol",
    value: 2_450_000,
    stage: "proposal",
    assignedRep: "Chioma Okeke",
    createdAt: new Date().toISOString(),
    notes: "Requires Saturday VIP private suite booking at Port Harcourt Flagship.",
  },
  {
    id: "deal-2",
    clientName: "Hajiya Maryam Dangote",
    phone: "+234 802 881 9920",
    department: "skincare-kitchen",
    packageName: "Annual Bespoke Formulation Regimen (12 Months)",
    value: 1_850_000,
    stage: "closed_won",
    assignedRep: "Fatima Al-Hassan",
    createdAt: new Date().toISOString(),
    notes: "Personalized Vitamin C & Ceramide Gold delivered to Abuja residence.",
  },
  {
    id: "deal-3",
    clientName: "Dr. Kunle Williams",
    phone: "+234 814 200 4519",
    department: "dental",
    packageName: "Full Hollywood Veneers & Laser Whitening",
    value: 4_200_000,
    stage: "consultation",
    assignedRep: "Tunde Bakare",
    createdAt: new Date().toISOString(),
    notes: "3D smile scan completed. Awaiting payment authorization.",
  },
  {
    id: "deal-4",
    clientName: "Senator Funke Balogun",
    phone: "+234 809 333 7112",
    department: "rejuvenating",
    packageName: "Deep Rejuvenation & Sculptra Protocol",
    value: 3_100_000,
    stage: "contacted",
    assignedRep: "Chioma Okeke",
    createdAt: new Date().toISOString(),
    notes: "Follow-up scheduled via executive WhatsApp concierge.",
  },
  {
    id: "deal-5",
    clientName: "Amara Nwachukwu",
    phone: "+234 705 918 2234",
    department: "skinclinic",
    packageName: "HydraFacial Deluxe + LED Photo Therapy (6 Sessions)",
    value: 950_000,
    stage: "closed_won",
    assignedRep: "Zainab Bello",
    createdAt: new Date().toISOString(),
    notes: "Paid in full via Monnify Transfer.",
  },
];

export const DEFAULT_CRM_PATIENTS: CrmPatient[] = [
  {
    id: "crm-1",
    name: "Chief Adewale Adeleke",
    phone: "+234 803 452 8891",
    email: "a.adeleke@luxuryholdings.ng",
    tier: "Black Diamond",
    lifetimeSpend: 8_750_000,
    lastVisit: "2 days ago",
    primaryBranch: "Port Harcourt Flagship, Rivers State",
    preferredBrand: "Derma Aesthetics",
    skinType: "Fitzpatrick IV, Mature Sensitive",
    loyaltyPoints: 1240,
    notes: "Prefers evening appointments after 5 PM. Executive beverage service.",
    treatmentHistory: [
      { date: "2026-04-02", procedure: "Laser Skin Resurfacing", practitioner: "Dr. Ngozi Eze", cost: 1_200_000 },
      { date: "2026-03-14", procedure: "Exosome Infusion Therapy", practitioner: "Dr. Ngozi Eze", cost: 950_000 },
    ],
  },
  {
    id: "crm-2",
    name: "Hajiya Maryam Dangote",
    phone: "+234 802 881 9920",
    email: "maryam.d@kano-inv.com",
    tier: "VIP Concierge",
    lifetimeSpend: 14_200_000,
    lastVisit: "Yesterday",
    primaryBranch: "Maitama, Abuja",
    preferredBrand: "Skincare Kitchen",
    skinType: "Fitzpatrick III, Dry Hyperpigmentation",
    loyaltyPoints: 3100,
    notes: "Orders monthly custom batches for family. Direct courier dispatched.",
    treatmentHistory: [
      { date: "2026-04-08", procedure: "Custom Formulation Refill (Batch #44)", practitioner: "Pharmacist Kemi", cost: 850_000 },
      { date: "2026-02-28", procedure: "Bio-Cellular Rejuvenation", practitioner: "Dr. Ibrahim Musa", cost: 2_400_000 },
    ],
  },
  {
    id: "crm-3",
    name: "Dr. Kunle Williams",
    phone: "+234 814 200 4519",
    email: "kunle.williams@ortho.ng",
    tier: "Gold Elite",
    lifetimeSpend: 5_400_000,
    lastVisit: "5 days ago",
    primaryBranch: "Ikeja GRA, Lagos",
    preferredBrand: "Dental Clinic",
    skinType: "Normal",
    loyaltyPoints: 780,
    notes: "Referred 3 high-net-worth colleagues this quarter.",
    treatmentHistory: [
      { date: "2026-04-05", procedure: "Comprehensive Smile Architecture Scan", practitioner: "Dr. Chidi Dental", cost: 350_000 },
    ],
  },
  {
    id: "crm-4",
    name: "Senator Funke Balogun",
    phone: "+234 809 333 7112",
    email: "f.balogun@senate.gov.ng",
    tier: "VIP Concierge",
    lifetimeSpend: 11_800_000,
    lastVisit: "Last week",
    primaryBranch: "Maitama, Abuja",
    preferredBrand: "Rejuvenating Aesthetics",
    skinType: "Combination Glow",
    loyaltyPoints: 2450,
    notes: "VIP Security escort coordinates arrivals with branch manager.",
    treatmentHistory: [
      { date: "2026-03-30", procedure: "Ultra-Sound Skin Tightening (HIFU)", practitioner: "Dr. Ngozi Eze", cost: 1_650_000 },
    ],
  },
];

export const DEFAULT_STAFF: StaffRecord[] = [
  {
    id: "staff-1",
    name: "Dr. Ngozi Eze",
    role: "Lead Dermatologist & Medical Director",
    department: "Clinical & Aesthetics",
    branch: "Port Harcourt Flagship",
    phone: "+234 803 111 2233",
    avatar: "https://images.unsplash.com/photo-1594824813580-c11456d2cf99?w=150&auto=format&fit=crop&q=80",
    status: "on_duty",
    clockInTime: "07:48 AM",
    verifiedLocation: "Port Harcourt Office Premises (GPS Locked)",
    coordinates: { lat: 4.8156, lng: 7.0498 },
    dailyTasksCompleted: 6,
    totalDailyTasks: 8,
    shiftHours: 8.5,
    monthlySalaryNgn: 3_800_000,
  },
  {
    id: "staff-2",
    name: "Nurse Amina Bello",
    role: "Senior Aesthetic Registered Nurse",
    department: "Clinical Procedures",
    branch: "Port Harcourt Flagship",
    phone: "+234 802 444 5566",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    status: "on_duty",
    clockInTime: "07:55 AM",
    verifiedLocation: "Port Harcourt Office Premises (GPS Locked)",
    coordinates: { lat: 4.8158, lng: 7.0499 },
    dailyTasksCompleted: 9,
    totalDailyTasks: 10,
    shiftHours: 8.0,
    monthlySalaryNgn: 1_250_000,
  },
  {
    id: "staff-3",
    name: "Tunde Bakare",
    role: "Lead Dental Surgeon",
    department: "Dental Clinic",
    branch: "Abuja Executive Clinic",
    phone: "+234 814 666 7788",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    status: "on_duty",
    clockInTime: "08:10 AM",
    verifiedLocation: "Abuja Maitama Dental Wing (GPS Locked)",
    coordinates: { lat: 9.0765, lng: 7.4985 },
    dailyTasksCompleted: 4,
    totalDailyTasks: 6,
    shiftHours: 7.5,
    monthlySalaryNgn: 3_200_000,
  },
  {
    id: "staff-4",
    name: "Chioma Okeke",
    role: "Executive Sales & VIP Client Director",
    department: "Sales & Client Relations",
    branch: "Port Harcourt Flagship",
    phone: "+234 809 777 8899",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "on_duty",
    clockInTime: "08:02 AM",
    verifiedLocation: "Port Harcourt Executive Lounge (GPS Locked)",
    coordinates: { lat: 4.8155, lng: 7.0496 },
    dailyTasksCompleted: 11,
    totalDailyTasks: 12,
    shiftHours: 8.0,
    monthlySalaryNgn: 1_850_000,
  },
  {
    id: "staff-5",
    name: "Zainab Aliyu",
    role: "Operations & Inventory Controller",
    department: "Logistics & Supply Chain",
    branch: "Abuja Executive Clinic",
    phone: "+234 805 333 4411",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    status: "on_duty",
    clockInTime: "08:15 AM",
    verifiedLocation: "Abuja Distribution Hub (GPS Locked)",
    coordinates: { lat: 9.0765, lng: 7.4985 },
    dailyTasksCompleted: 7,
    totalDailyTasks: 8,
    shiftHours: 7.8,
    monthlySalaryNgn: 1_400_000,
  },
  {
    id: "staff-6",
    name: "Emeka Obi",
    role: "Chief Pharmacist & Formulations Lead",
    department: "Skincare Kitchen",
    branch: "Port Harcourt Flagship",
    phone: "+234 812 999 1000",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    status: "on_duty",
    clockInTime: "08:05 AM",
    verifiedLocation: "Port Harcourt Sterile Lab (GPS Locked)",
    coordinates: { lat: 4.8157, lng: 7.0500 },
    dailyTasksCompleted: 8,
    totalDailyTasks: 9,
    shiftHours: 8.0,
    monthlySalaryNgn: 2_600_000,
  },
];

export const DEFAULT_AI_ACTIONS: AiActionExecution[] = [
  {
    id: "act-1",
    brain: "Super Gemini 3.8 Flash",
    command: "Restock 50 units Vitamin C Brightening Serum to Port Harcourt branch",
    actionType: "RESTOCK_INVENTORY",
    details: "PO #ESB-PO-8821 dispatched to Skincare Kitchen laboratory. Estimated delivery: 24h.",
    targetEntity: "Skincare Kitchen Stock",
    status: "executed",
    timestamp: "10 mins ago",
    impactValueNgn: 450_000,
  },
  {
    id: "act-2",
    brain: "Chat GPT-4o",
    command: "Auto-assign high-value VIP lead Chief Adeleke to Senior Aesthetic Consultant Chioma",
    actionType: "ADD_LEAD",
    details: "Assigned deal ₦2,450,000. WhatsApp follow-up scheduled with VIP template.",
    targetEntity: "Chief Adewale Adeleke",
    status: "executed",
    timestamp: "32 mins ago",
    impactValueNgn: 2_450_000,
  },
  {
    id: "act-3",
    brain: "Grok-2 Brain",
    command: "Verify and enforce geo-fenced premises clock-in for morning shift medical team",
    actionType: "VERIFY_STAFF",
    details: "Checked GPS telemetry against Port Harcourt Flagship (4.8156, 7.0498) radius 200m. 6 staff verified.",
    targetEntity: "Staff Attendance System",
    status: "executed",
    timestamp: "1 hour ago",
  },
];

// Memory fallback for SSR / environments without window
let memDeals = [...DEFAULT_DEALS];
let memCrm = [...DEFAULT_CRM_PATIENTS];
let memStaff = [...DEFAULT_STAFF];
let memActions = [...DEFAULT_AI_ACTIONS];

export function getStoredDeals(): SalesDeal[] {
  if (typeof window === "undefined") return memDeals;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(DEFAULT_DEALS));
      return DEFAULT_DEALS;
    }
    return JSON.parse(raw);
  } catch {
    return memDeals;
  }
}

export function saveStoredDeals(deals: SalesDeal[]) {
  memDeals = deals;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }
}

export function getStoredPatients(): CrmPatient[] {
  if (typeof window === "undefined") return memCrm;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CRM);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CRM, JSON.stringify(DEFAULT_CRM_PATIENTS));
      return DEFAULT_CRM_PATIENTS;
    }
    return JSON.parse(raw);
  } catch {
    return memCrm;
  }
}

export function saveStoredPatients(patients: CrmPatient[]) {
  memCrm = patients;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.CRM, JSON.stringify(patients));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }
}

export function getStoredStaff(): StaffRecord[] {
  if (typeof window === "undefined") return memStaff;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return memStaff;
  }
}

export function saveStoredStaff(staff: StaffRecord[]) {
  memStaff = staff;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }
}

export function getStoredAiActions(): AiActionExecution[] {
  if (typeof window === "undefined") return memActions;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(DEFAULT_AI_ACTIONS));
      return DEFAULT_AI_ACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return memActions;
  }
}

export function saveStoredAiActions(actions: AiActionExecution[]) {
  memActions = actions;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }
}

// ----------------------------------------------------
// DELIVERY & GOOGLE MAPS INVENTORY TRACKING
// ----------------------------------------------------

export interface DeliveryOrder {
  id: string;
  trackingNumber: string;
  type: "incoming" | "outgoing";
  title: string;
  items: string;
  origin: string;
  destination: string;
  city: "Lagos" | "Abuja" | "Port Harcourt" | "International";
  recipient: string;
  phone: string;
  status: "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "customs";
  courier: string;
  courierPhone: string;
  vehicle: string;
  currentLocationDesc: string;
  coordinates: { lat: number; lng: number };
  estimatedEta: string;
  valueNgn: number;
  dispatchTime: string;
  notes?: string;
}

export const DEFAULT_DELIVERIES: DeliveryOrder[] = [
  {
    id: "del-1",
    trackingNumber: "ESB-DEL-9841-NG",
    type: "outgoing",
    title: "VIP Bespoke Serum Kit & Exosome Care",
    items: "3x Custom Ceramide Elixir, 1x Post-Procedure Repair Cream",
    origin: "ESB Ikoyi Central Formulation Lab, Lagos",
    destination: "Plot 12 Admiralty Way, Lekki Phase 1, Lagos",
    city: "Lagos",
    recipient: "Mrs. Folashade Alakija-Peters",
    phone: "+234 803 992 4110",
    status: "in_transit",
    courier: "Tunde Balogun",
    courierPhone: "+234 812 550 9102",
    vehicle: "ESB Mercedes Sprinter Van 02",
    currentLocationDesc: "Passing Lekki-Ikoyi Link Bridge toll, 14 mins away",
    coordinates: { lat: 6.4474, lng: 3.4402 },
    estimatedEta: "14 mins",
    valueNgn: 1_850_000,
    dispatchTime: new Date(Date.now() - 35 * 60000).toISOString(),
    notes: "Signature required upon delivery at residence gate.",
  },
  {
    id: "del-2",
    trackingNumber: "ESB-DEL-9842-NG",
    type: "outgoing",
    title: "Derma Aesthetics Clinical Wholesale Crate",
    items: "50x SPF 50+ Invisible Fluid, 30x Retinol 0.5% Serum",
    origin: "ESB Ikeja Main Distribution Warehouse",
    destination: "Suite 4, Wuse II Medical Complex, Abuja",
    city: "Abuja",
    recipient: "Dr. Farouk Bello (Abuja Branch Lead)",
    phone: "+234 802 331 8872",
    status: "out_for_delivery",
    courier: "Musa Danjuma",
    courierPhone: "+234 809 112 3445",
    vehicle: "ESB Inter-State Freight 04",
    currentLocationDesc: "Approaching Wuse II Aminu Kano Crescent, Abuja",
    coordinates: { lat: 9.0765, lng: 7.4723 },
    estimatedEta: "8 mins",
    valueNgn: 4_600_000,
    dispatchTime: new Date(Date.now() - 120 * 60000).toISOString(),
    notes: "Cold storage compliance verified at 18°C.",
  },
  {
    id: "del-3",
    trackingNumber: "ESB-CARGO-IN-204",
    type: "incoming",
    title: "Frankfurt Airfreight: Cosmetic Grade Hyaluronic Acid & Peptides",
    items: "25kg Raw Hyaluronic Polymer, 10,000 Medical Glass Dropper Vials",
    origin: "Frankfurt Cargo Terminal (FRA) -> MMIA Lagos",
    destination: "ESB Skincare Kitchen R&D Lab, Ikeja GRA, Lagos",
    city: "International",
    recipient: "Lead Chemist (Skincare Kitchen)",
    phone: "+234 814 550 9012",
    status: "customs",
    courier: "DHL Global Forwarding Aviation",
    courierPhone: "+234 1 270 0000",
    vehicle: "Cargo Flight LH8244",
    currentLocationDesc: "NAFDAC & Customs clearance inspection at MMIA Cargo Hub",
    coordinates: { lat: 6.5774, lng: 3.3211 },
    estimatedEta: "Tomorrow, 10:00 AM",
    valueNgn: 18_400_000,
    dispatchTime: new Date(Date.now() - 480 * 60000).toISOString(),
    notes: "Raw active ingredients import certificate verified.",
  },
  {
    id: "del-4",
    trackingNumber: "ESB-DEL-9844-NG",
    type: "outgoing",
    title: "Dental Clinic Laser Whitening Kits",
    items: "12x Home Maintenance Whitening Pens, 24x Enamel Polish",
    origin: "Port Harcourt Flagship Clinic",
    destination: "Kano Crescent, Maitama, Abuja",
    city: "Abuja",
    recipient: "Senator Bello Maitama",
    phone: "+234 803 111 2233",
    status: "dispatched",
    courier: "Ibrahim Sani",
    courierPhone: "+234 818 998 7766",
    vehicle: "Express Dispatch Bike 07",
    currentLocationDesc: "Departed Abuja Airport hub towards Maitama",
    coordinates: { lat: 9.0820, lng: 7.4980 },
    estimatedEta: "25 mins",
    valueNgn: 920_000,
    dispatchTime: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

let memDeliveries = DEFAULT_DELIVERIES;

export function getStoredDeliveries(): DeliveryOrder[] {
  if (typeof window === "undefined") return memDeliveries;
  try {
    const raw = localStorage.getItem("esb_deliveries_v1");
    if (!raw) {
      localStorage.setItem("esb_deliveries_v1", JSON.stringify(DEFAULT_DELIVERIES));
      return DEFAULT_DELIVERIES;
    }
    return JSON.parse(raw);
  } catch {
    return memDeliveries;
  }
}

export function saveStoredDeliveries(deliveries: DeliveryOrder[]) {
  memDeliveries = deliveries;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("esb_deliveries_v1", JSON.stringify(deliveries));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }
}

// ----------------------------------------------------
// PURCHASE ORDERS & AUTO-RESTOCK AUTOMATION
// ----------------------------------------------------

export interface PurchaseOrderItem {
  name: string;
  quantity: number;
  unitCostNgn: number;
  totalCostNgn: number;
}

export interface PurchaseOrder {
  id: string; // PO-2026-XXXX
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  brand: string;
  destinationWarehouse: string;
  items: PurchaseOrderItem[];
  totalCostNgn: number;
  status: "draft" | "approved" | "dispatched" | "received";
  expectedDeliveryDate: string;
  createdDate: string;
  notes: string;
  waybillNumber?: string;
  paymentTerms: string;
}

export const DEFAULT_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-2026-4401",
    supplierName: "Apex Pharma & Active Cosmetics Ltd (Lagos)",
    supplierEmail: "orders@apexcosmetics.ng",
    supplierPhone: "+234 803 221 4982",
    brand: "Derma Aesthetics",
    destinationWarehouse: "Port Harcourt Central Formulation Depot",
    items: [
      { name: "Raw Hyaluronic Acid 4D Powder (1kg)", quantity: 5, unitCostNgn: 180_000, totalCostNgn: 900_000 },
      { name: "Medical SPF 50+ Broad-Spectrum Base (50L)", quantity: 2, unitCostNgn: 650_000, totalCostNgn: 1_300_000 },
      { name: "Amber Dropper Bottles 30ml (Crate of 500)", quantity: 4, unitCostNgn: 125_000, totalCostNgn: 500_000 },
    ],
    totalCostNgn: 2_700_000,
    status: "approved",
    expectedDeliveryDate: "2026-10-15",
    createdDate: "2026-10-11",
    notes: "Urgent replenishment for Derma Aesthetics Sun Protection line.",
    waybillNumber: "WAY-APX-882910",
    paymentTerms: "50% Advance via Zenith Bank, 50% on Lab Delivery QC",
  },
  {
    id: "PO-2026-4402",
    supplierName: "Northern Organic Botanicals & Shea Cooperative",
    supplierEmail: "cooperative@nigerbutters.com",
    supplierPhone: "+234 802 884 1920",
    brand: "Skincare Kitchen",
    destinationWarehouse: "Skincare Kitchen Maitama Suite, Abuja",
    items: [
      { name: "Grade A Cold-Pressed Unrefined Shea Butter (50kg Drum)", quantity: 3, unitCostNgn: 210_000, totalCostNgn: 630_000 },
      { name: "Cold-Pressed Marula Kernel Oil (20L)", quantity: 2, unitCostNgn: 340_000, totalCostNgn: 680_000 },
    ],
    totalCostNgn: 1_310_000,
    status: "dispatched",
    expectedDeliveryDate: "2026-10-14",
    createdDate: "2026-10-10",
    notes: "Direct courier dispatch from Minna processing unit to Abuja warehouse.",
    waybillNumber: "WAY-NOB-119283",
    paymentTerms: "100% Confirmed Settlement via GTBank Transfer",
  },
];

let memPurchaseOrders = DEFAULT_PURCHASE_ORDERS;

export function getStoredPurchaseOrders(): PurchaseOrder[] {
  if (typeof window === "undefined") return memPurchaseOrders;
  try {
    const raw = localStorage.getItem("esb_purchase_orders_v1");
    if (!raw) {
      localStorage.setItem("esb_purchase_orders_v1", JSON.stringify(DEFAULT_PURCHASE_ORDERS));
      return DEFAULT_PURCHASE_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return memPurchaseOrders;
  }
}

export function saveStoredPurchaseOrders(orders: PurchaseOrder[]) {
  memPurchaseOrders = orders;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("esb_purchase_orders_v1", JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent("esb_purchase_orders_updated", { detail: orders }));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }
}

// ----------------------------------------------------
// STAFF REWARDS, GAMIFICATION & PERFORMANCE METRICS
// ----------------------------------------------------

export interface StaffPerformanceRecord {
  staffId: string;
  name: string;
  role: string;
  branch: string;
  avatar: string;
  monthlyRevenueGeneratedNgn: number;
  patientSatisfactionRate: number; // percentage
  geofencePunctualityRate: number; // percentage
  shiftsCompleted: number;
  consultationsHandled: number;
  rewardPoints: number;
  bonusEarnedNgn: number;
  wellnessEngagementScore: number; // 0 - 100
  badges: Array<{ name: string; icon: string; date: string }>;
  kpiRank: number;
}

export const DEFAULT_STAFF_PERFORMANCE: StaffPerformanceRecord[] = [
  {
    staffId: "staff-1",
    name: "Dr. Farouk Bello",
    role: "Lead Aesthetic Physician",
    branch: "Port Harcourt Flagship",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&q=80",
    monthlyRevenueGeneratedNgn: 34_800_000,
    patientSatisfactionRate: 99.4,
    geofencePunctualityRate: 98.8,
    shiftsCompleted: 22,
    consultationsHandled: 84,
    rewardPoints: 4850,
    bonusEarnedNgn: 750_000,
    wellnessEngagementScore: 97,
    badges: [
      { name: "Top Revenue Generator", icon: "Crown", date: "Oct 2026" },
      { name: "Zero Clinical Complications", icon: "ShieldCheck", date: "Sep 2026" },
      { name: "Geofence Punctuality Master", icon: "MapPin", date: "Aug 2026" },
    ],
    kpiRank: 1,
  },
  {
    staffId: "staff-2",
    name: "Nurse Chidinma Okonjo",
    role: "Senior Aesthetics Nurse",
    branch: "Port Harcourt Flagship",
    avatar: "https://images.unsplash.com/photo-1594824813576-90f772e2764b?w=150&q=80",
    monthlyRevenueGeneratedNgn: 18_400_000,
    patientSatisfactionRate: 99.1,
    geofencePunctualityRate: 100.0,
    shiftsCompleted: 24,
    consultationsHandled: 112,
    rewardPoints: 3920,
    bonusEarnedNgn: 500_000,
    wellnessEngagementScore: 98,
    badges: [
      { name: "100% Geofence Legend", icon: "MapPin", date: "Oct 2026" },
      { name: "Patient Care Champion", icon: "Heart", date: "Sep 2026" },
    ],
    kpiRank: 2,
  },
  {
    staffId: "staff-3",
    name: "Kelechi Nnamdi",
    role: "Master Cosmetic Formulator",
    branch: "Skincare Kitchen Ikeja",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    monthlyRevenueGeneratedNgn: 26_200_000,
    patientSatisfactionRate: 98.6,
    geofencePunctualityRate: 96.5,
    shiftsCompleted: 21,
    consultationsHandled: 45,
    rewardPoints: 3400,
    bonusEarnedNgn: 600_000,
    wellnessEngagementScore: 94,
    badges: [
      { name: "Batch Purity Champion", icon: "Sparkles", date: "Oct 2026" },
      { name: "Innovation Award", icon: "Award", date: "Sep 2026" },
    ],
    kpiRank: 3,
  },
  {
    staffId: "staff-4",
    name: "Amina Yusuf",
    role: "Front Desk & VIP Concierge Lead",
    branch: "Abuja Wuse II Clinic",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80",
    monthlyRevenueGeneratedNgn: 12_500_000,
    patientSatisfactionRate: 99.8,
    geofencePunctualityRate: 97.2,
    shiftsCompleted: 23,
    consultationsHandled: 140,
    rewardPoints: 3100,
    bonusEarnedNgn: 400_000,
    wellnessEngagementScore: 99,
    badges: [
      { name: "VIP Concierge of Excellence", icon: "Award", date: "Oct 2026" },
    ],
    kpiRank: 4,
  },
];

let memStaffPerf = DEFAULT_STAFF_PERFORMANCE;

export function getStoredStaffPerformance(): StaffPerformanceRecord[] {
  if (typeof window === "undefined") return memStaffPerf;
  try {
    const raw = localStorage.getItem("esb_staff_perf_v1");
    if (!raw) {
      localStorage.setItem("esb_staff_perf_v1", JSON.stringify(DEFAULT_STAFF_PERFORMANCE));
      return DEFAULT_STAFF_PERFORMANCE;
    }
    return JSON.parse(raw);
  } catch {
    return memStaffPerf;
  }
}

export function saveStoredStaffPerformance(records: StaffPerformanceRecord[]) {
  memStaffPerf = records;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("esb_staff_perf_v1", JSON.stringify(records));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }
}

// ----------------------------------------------------
// WEB STORE PRODUCTS & LUXURY E-COMMERCE
// ----------------------------------------------------

export interface WebStoreProduct {
  id: string;
  brand: string;
  name: string;
  tagline: string;
  description: string;
  priceNgn: number;
  category: "Skincare Kitchen" | "Derma Aesthetics" | "Skin Clinic" | "Dental Care" | "Rejuvenating";
  image: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  bestseller?: boolean;
  ingredients: string;
  usageGuide: string;
  bumperUrl?: string;
  sku?: string;
}

export const DEFAULT_STORE_PRODUCTS: WebStoreProduct[] = [
  {
    id: "prod-1",
    brand: "Skincare Kitchen",
    name: "Vitamin C 20% + Niacinamide Radiance Elixir",
    tagline: "Custom batch formulated in Port Harcourt & Lagos for African melanin glow",
    description: "Cold-pressed pure L-ascorbic acid blended with organic hyaluronic acid and African botanical extracts. Penetrates deep to erase hyperpigmentation and stimulate collagen synthesis.",
    priceNgn: 48_500,
    category: "Skincare Kitchen",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
    rating: 4.9,
    reviewsCount: 312,
    inStock: true,
    bestseller: true,
    ingredients: "20% L-Ascorbic Acid, 5% Niacinamide, Ferulic Acid, Hyaluronic Acid, Orange Peel Extract.",
    usageGuide: "Apply 3-4 drops in the morning on cleansed damp skin before moisturizer and sunscreen.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/vitamin-c-20-radiance-elixir",
    sku: "ESB-SK-VITC-01",
  },
  {
    id: "prod-2",
    brand: "Derma Aesthetics",
    name: "Advanced Cellular Protection SPF 50+ Invisible Fluid",
    tagline: "Zero white cast formula engineered for tropical Nigerian heat",
    description: "Broad spectrum UVA/UVB and HEV blue light shield. Ultra-light matte finish water-resistant formula tested in Port Harcourt and Abuja climate conditions.",
    priceNgn: 36_000,
    category: "Derma Aesthetics",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    rating: 5.0,
    reviewsCount: 489,
    inStock: true,
    bestseller: true,
    ingredients: "Micronized Zinc Oxide, Ectoin, Vitamin E, Centella Asiatica, Green Tea.",
    usageGuide: "Generously smooth 2 finger lengths over face and neck 15 minutes before sun exposure.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/spf50-invisible-fluid",
    sku: "ESB-DA-SPF50-02",
  },
  {
    id: "prod-3",
    brand: "Derma Aesthetics",
    name: "Alpha Arbutin 2% + Kojic Depigmenting Night Serum",
    tagline: "Targeted clinical correction for stubborn dark spots and melasma",
    description: "Medical-grade tyrosinase inhibition complex specifically developed for deep melanin-rich skin. Effectively fades post-inflammatory hyperpigmentation without skin thinning.",
    priceNgn: 42_000,
    category: "Derma Aesthetics",
    image: "https://images.unsplash.com/photo-1608248597359-5975459392e2?w=600&q=80",
    rating: 4.9,
    reviewsCount: 274,
    inStock: true,
    bestseller: true,
    ingredients: "2% Alpha Arbutin, 1% Kojic Acid, Tranexamic Acid, Licorice Root Extract, Hyaluronic Acid.",
    usageGuide: "Apply nightly to targeted hyperpigmented areas or full face. Always follow with SPF during daytime.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/alpha-arbutin-kojic-serum",
    sku: "ESB-DA-ARB-03",
  },
  {
    id: "prod-4",
    brand: "Skin Clinic",
    name: "Post-Procedure Exosome Intensive Repair Cream",
    tagline: "Medical-grade barrier reconstruction and cellular DNA recovery",
    description: "Designed for immediate skin soothing and rapid healing following microneedling, chemical peels, and laser resurfacing treatments at Port Harcourt and Abuja clinics.",
    priceNgn: 62_000,
    category: "Skin Clinic",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
    rating: 4.8,
    reviewsCount: 140,
    inStock: true,
    bestseller: false,
    ingredients: "Plant Exosomes, Multi-Ceramide Complex (NP, AP, EOP), Madecassoside, Squalane.",
    usageGuide: "Gently press into sensitized skin morning and evening as directed by your clinician.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/exosome-repair-cream",
    sku: "ESB-SC-EXO-04",
  },
  {
    id: "prod-5",
    brand: "Dental Care",
    name: "ESB Hollywood Smile Precision Whitening Pen",
    tagline: "Dentist formulated PAP+ active enamel whitening",
    description: "Safe, hydrogen peroxide-free whitening formula that lifts stubborn coffee, tea, and red wine stains in 10 minutes without tooth sensitivity.",
    priceNgn: 28_000,
    category: "Dental Care",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",
    rating: 4.7,
    reviewsCount: 198,
    inStock: true,
    bestseller: true,
    ingredients: "Phthalimidoperoxycaproic Acid (PAP+), Hydroxyapatite, Potassium Citrate, Mint Oil.",
    usageGuide: "Twist bottom to dispense gel. Brush thin layer onto dry teeth and leave for 10 minutes.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/hollywood-smile-whitening-pen",
    sku: "ESB-DC-WHITEPEN-05",
  },
  {
    id: "prod-6",
    brand: "Dental Care",
    name: "PAP+ Dual-Wave LED Sonic Whitening Master Kit",
    tagline: "Professional clinical teeth shade advancement up to 8 shades",
    description: "Dentist-grade wireless LED mouthpiece with blue light activating wavelength and red light gum soothing therapy. Delivers clinic-level whitening in 16-minute sessions.",
    priceNgn: 58_000,
    category: "Dental Care",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    rating: 4.9,
    reviewsCount: 165,
    inStock: true,
    bestseller: false,
    ingredients: "3x PAP+ Pods, Nano-Hydroxyapatite Remineralizing Gel, Dual-Wavelength Sonic LED Tray.",
    usageGuide: "Load gel into mouthpiece tray, insert, and initiate 16-minute programmed blue-light cycle.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/pap-led-master-kit",
    sku: "ESB-DC-LEDKIT-06",
  },
  {
    id: "prod-7",
    brand: "Rejuvenating",
    name: "Tri-Peptide Firming & Neck Sculpting Ampoule Set",
    tagline: "Non-invasive anti-gravity peptide infusion",
    description: "Concentrated 14-day intensive lifting course for collagen restoration and jawline contour tightening.",
    priceNgn: 85_000,
    category: "Rejuvenating",
    image: "https://images.unsplash.com/photo-1608248597359-5975459392e2?w=600&q=80",
    rating: 4.9,
    reviewsCount: 92,
    inStock: true,
    bestseller: false,
    ingredients: "Matrixyl 3000, Copper Tripeptide-1, Argireline Amplified, Marine Collagen Peptides.",
    usageGuide: "Snap 1 ampoule nightly and massage upward from décolletage to jawline.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/tri-peptide-ampoules",
    sku: "ESB-RJ-TRIPEPTIDE-07",
  },
  {
    id: "prod-8",
    brand: "Skincare Kitchen",
    name: "Raw Whipped Shea & Golden Marula Body Soufflé",
    tagline: "Handcrafted unrefined Nigerian butter infusion",
    description: "Deeply moisturizing whipped body crème that melts into dry skin, delivering 48-hour moisture with shimmering gold pearl essence.",
    priceNgn: 32_500,
    category: "Skincare Kitchen",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&q=80",
    rating: 4.9,
    reviewsCount: 260,
    inStock: true,
    bestseller: false,
    ingredients: "Wildcrafted Nigerian Shea Butter, Cold-Pressed Marula Oil, Cocoa Butter, Vanilla Extract.",
    usageGuide: "Massage into damp skin after showering for rich velvet hydration.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/raw-whipped-shea-souffle",
    sku: "ESB-SK-SHEA-08",
  },
  {
    id: "prod-9",
    brand: "Derma Aesthetics",
    name: "Clarifying Salicylic & Zinc BHA Cleansing Gel",
    tagline: "Deep pore unclogging and sebum control for tropical humidity",
    description: "Gentle non-stripping micro-foaming cleanser with 2% BHA and botanical tea tree to prevent acne breakouts and refine enlarged facial pores.",
    priceNgn: 28_500,
    category: "Derma Aesthetics",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    rating: 4.8,
    reviewsCount: 310,
    inStock: true,
    bestseller: false,
    ingredients: "2% Salicylic Acid (BHA), 1% Zinc PCA, Australian Tea Tree Oil, Aloe Barbadensis Leaf Juice.",
    usageGuide: "Lather small pump with lukewarm water, massage over face for 60 seconds, and rinse cleanly.",
    bumperUrl: "https://dermaaesthetics.bumper.shop/products/salicylic-zinc-cleanser",
    sku: "ESB-DA-SALCL-09",
  },
];

let memStoreProducts = DEFAULT_STORE_PRODUCTS;

export function getStoredStoreProducts(): WebStoreProduct[] {
  if (typeof window === "undefined") return memStoreProducts;
  try {
    const raw = localStorage.getItem("esb_store_products_v1");
    if (!raw) {
      localStorage.setItem("esb_store_products_v1", JSON.stringify(DEFAULT_STORE_PRODUCTS));
      return DEFAULT_STORE_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return memStoreProducts;
  }
}

