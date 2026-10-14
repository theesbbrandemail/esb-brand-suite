/**
 * ESB Brand Suite — Sales Intelligence, Demand Analytics & Customer Feedback Engine
 * Document Code: ESB-SALES-KPI-001
 * Implements:
 * - Product demand intelligence (best-sellers, frequently asked, unavailable, abandoned, complaints, unmet demand)
 * - Reasons and products analysis KPI (price sensitivity, stock-outs, uncertainty, customer education gaps)
 * - Client workflow pipeline: Inquiries -> Qualified Leads -> Bookings -> Attended Appointments -> Completed Sales -> Cash Collected
 * - Monthly Sales KPI & Customer Intelligence Report (Sections A through J)
 * - Salesperson 5-part scorecard (35% revenue, 20% conversion, 20% intelligence, 15% retention, 10% CRM discipline)
 * - Multi-brand WhatsApp API generators
 * - Cross-branch customer statistics (Abuja, Port Harcourt, Victoria Island)
 */

export interface ProductIntelligenceItem {
  id: string;
  name: string;
  brand: "Derma Aesthetics" | "Skincare Kitchen" | "Skin Clinic" | "Dental Clinic" | "Rejuvenating";
  category: string;
  priceNgn: number;
  inquiriesCount: number;
  unitsSold: number;
  revenueGeneratedNgn: number;
  stockAvailable: number;
  isAvailable: boolean;
  lostSalesCount: number;
  mainLostReason: "Price too high" | "Out of stock" | "Needs doctor/nurse consult" | "Uncertain about results" | "Delivery delay" | "Other";
  complaintsCount: number;
  repeatPurchaseCount: number;
  needsEducation: boolean;
  unmetDemandNotes?: string;
  recommendedAction: string;
  responsibleDept: "Procurement / Inventory" | "Marketing" | "Pharmacy" | "Clinical Team" | "Sales Lead";
}

export interface ServiceIntelligenceItem {
  id: string;
  name: string;
  brand: string;
  priceNgn: number;
  inquiriesCount: number;
  bookingsCount: number;
  completedAppointmentsCount: number;
  cancellationsCount: number;
  revenueGeneratedNgn: number;
  lostLeadsCount: number;
  mainBarrier: string;
  commonQuestions: string[];
  recommendedAction: string;
}

export interface ProductComplaintRecord {
  id: string;
  productName: string;
  brand: string;
  customerName: string;
  complaintType: "Skin Irritation/Reaction" | "Damaged Packaging" | "Suspected Quality/Defect" | "Unclear Instructions" | "Delivery Delay" | "Price/Expectation";
  customerDescription: string;
  batchLot: string;
  expiryDate: string;
  purchaseDate: string;
  actionTaken: string;
  status: "Open" | "Referred to Pharmacist" | "Under Investigation" | "Resolved";
  responsibleDept: "Pharmacy" | "Clinical Team" | "Operations" | "Management";
  isUrgentSafetyEscalation: boolean;
}

export interface CustomerQuestionReferral {
  id: string;
  question: string;
  customerName: string;
  timesAsked: number;
  productOrService: string;
  referredTo: "Doctor" | "Nurse" | "Pharmacist" | "Operations" | "Management";
  dateReferred: string;
  approvedResponseReceived: boolean;
  approvedResponse?: string;
  furtherActionRequired: string;
}

export interface MarketingContentOpportunity {
  id: string;
  topic: string;
  customerConcernOrGap: string;
  inquiriesCount: number;
  suggestedFormat: "Education Video" | "FAQ Guide" | "Product Comparison" | "Clinical Review" | "WhatsApp Auto-Reply";
  requiredReview: "Clinical Doctor" | "Pharmacist" | "Marketing Lead";
  priority: "High" | "Medium" | "Low";
  status: "Submitted to Marketing" | "In Production" | "Published";
}

export interface SalesRepScorecard {
  repName: string;
  branch: "Abuja" | "Port Harcourt";
  department: string;
  assignedTargetNgn: number;
  actualRevenueNgn: number;
  inquiriesReceived: number;
  qualifiedLeads: number;
  completedSales: number;
  followUpsDue: number;
  followUpsCompleted: number;
  eligibleRepeatCustomers: number;
  repeatPurchases: number;
  intelligenceReportsSubmitted: number; // Max 4 weekly / 1 monthly
  crmRecordsAccuracyPct: number;
  
  // Weighted Scores
  revenueScore: number; // 35%
  conversionScore: number; // 20%
  intelligenceScore: number; // 20%
  retentionScore: number; // 15%
  crmDisciplineScore: number; // 10%
  totalScore: number; // Out of 100%
  grade: "A+ (Excellent)" | "A (Good)" | "B (Improvement Required)" | "C (Formal Review)";
}

export interface MonthlySalesKpiReport {
  documentCode: string;
  reportingMonth: string;
  branch: "All Branches" | "Abuja" | "Port Harcourt";
  preparedBy: string;
  salesTeamLead: string;
  submissionDate: string;
  status: "Draft" | "Submitted" | "Reviewed by Operations" | "Approved by CEO";

  // Section A: Sales Performance
  totalInquiries: number;
  leadsContacted: number;
  qualifiedLeads: number;
  totalSalesCount: number;
  productSalesRevenueNgn: number;
  serviceSalesRevenueNgn: number;
  totalRevenueNgn: number;
  assignedTargetNgn: number;
  targetAchievedPct: number;
  leadToSaleConversionPct: number;
  followUpConversionCount: number;
  lostSalesCount: number;
  estimatedLostSalesValueNgn: number;
  repeatCustomersCount: number;
  cancellationsCount: number;
  refundsCount: number;
  refundsTotalValueNgn: number;
  topLostReasons: Array<{ reason: string; count: number; valueNgn: number }>;

  // Section B & C & D & E counts
  topRequestedProducts: ProductIntelligenceItem[];
  bestSellingProducts: ProductIntelligenceItem[];
  mostUnavailableProducts: ProductIntelligenceItem[];
  complaintsRegister: ProductComplaintRecord[];
  servicesDemand: ServiceIntelligenceItem[];
  customerQuestions: CustomerQuestionReferral[];
  marketingOpportunities: MarketingContentOpportunity[];
  managementRecommendations: string[];
}

// ============================================================================
// REALISTIC SEED DATA FOR ESB BRAND SUITE
// ============================================================================

export const SEED_PRODUCT_INTELLIGENCE: ProductIntelligenceItem[] = [
  {
    id: "prod-1",
    name: "Exosome Cellular Repair Serum 30ml",
    brand: "Derma Aesthetics",
    category: "Active Serums",
    priceNgn: 45000,
    inquiriesCount: 142,
    unitsSold: 98,
    revenueGeneratedNgn: 4410000,
    stockAvailable: 28,
    isAvailable: true,
    lostSalesCount: 44,
    mainLostReason: "Price too high",
    complaintsCount: 1,
    repeatPurchaseCount: 42,
    needsEducation: true,
    recommendedAction: "Create 3-minute video explaining exosome cellular recovery benefits vs standard serums.",
    responsibleDept: "Marketing",
  },
  {
    id: "prod-2",
    name: "Whipped Shea & Cocoa Butter Souffle 250g",
    brand: "Skincare Kitchen",
    category: "Body Care",
    priceNgn: 18500,
    inquiriesCount: 188,
    unitsSold: 154,
    revenueGeneratedNgn: 2849000,
    stockAvailable: 112,
    isAvailable: true,
    lostSalesCount: 34,
    mainLostReason: "Delivery delay",
    complaintsCount: 2,
    repeatPurchaseCount: 88,
    needsEducation: false,
    recommendedAction: "Maintain bulk inventory in Maitama Abuja hub to eliminate 2-day delivery wait.",
    responsibleDept: "Procurement / Inventory",
  },
  {
    id: "prod-3",
    name: "Liposomal Vitamin C 25% Radiance Drop",
    brand: "Derma Aesthetics",
    category: "Antioxidants",
    priceNgn: 38000,
    inquiriesCount: 165,
    unitsSold: 120,
    revenueGeneratedNgn: 4560000,
    stockAvailable: 14,
    isAvailable: true,
    lostSalesCount: 45,
    mainLostReason: "Out of stock",
    complaintsCount: 0,
    repeatPurchaseCount: 65,
    needsEducation: false,
    recommendedAction: "Trigger urgent lab formulation reorder; stock currently near critical reorder buffer.",
    responsibleDept: "Procurement / Inventory",
  },
  {
    id: "prod-4",
    name: "Topical Lidocaine 10.56% Numbing Gel 30g",
    brand: "Skin Clinic",
    category: "Clinical Consumables",
    priceNgn: 34000,
    inquiriesCount: 85,
    unitsSold: 32,
    revenueGeneratedNgn: 1088000,
    stockAvailable: 6,
    isAvailable: true,
    lostSalesCount: 53,
    mainLostReason: "Out of stock",
    complaintsCount: 1,
    repeatPurchaseCount: 18,
    needsEducation: true,
    recommendedAction: "Medical consumable must not be sold over-the-counter without clinician sign-off.",
    responsibleDept: "Pharmacy",
  },
  {
    id: "prod-5",
    name: "Turmeric Papaya Radiance Body Polish",
    brand: "Skincare Kitchen",
    category: "Exfoliants",
    priceNgn: 22000,
    inquiriesCount: 110,
    unitsSold: 86,
    revenueGeneratedNgn: 1892000,
    stockAvailable: 64,
    isAvailable: true,
    lostSalesCount: 24,
    mainLostReason: "Uncertain about results",
    complaintsCount: 0,
    repeatPurchaseCount: 39,
    needsEducation: true,
    recommendedAction: "Publish patch-test protocol and realistic 28-day skin renewal timeline on Instagram & WhatsApp.",
    responsibleDept: "Marketing",
  },
  {
    id: "prod-6",
    name: "Sterile Microneedling Cartridges (36-Pin Box of 10)",
    brand: "Skin Clinic",
    category: "Procedures",
    priceNgn: 52000,
    inquiriesCount: 62,
    unitsSold: 45,
    revenueGeneratedNgn: 2340000,
    stockAvailable: 22,
    isAvailable: true,
    lostSalesCount: 17,
    mainLostReason: "Needs doctor/nurse consult",
    complaintsCount: 0,
    repeatPurchaseCount: 24,
    needsEducation: true,
    recommendedAction: "Route inquiries to Nurse Amina for clinical appointment booking instead of raw cartridge sales.",
    responsibleDept: "Clinical Team",
  },
  {
    id: "prod-7",
    name: "TCA 20% Clinical Peel Neutralizer Kit",
    brand: "Derma Aesthetics",
    category: "Chemical Peels",
    priceNgn: 65000,
    inquiriesCount: 78,
    unitsSold: 28,
    revenueGeneratedNgn: 1820000,
    stockAvailable: 0,
    isAvailable: false,
    lostSalesCount: 50,
    mainLostReason: "Out of stock",
    complaintsCount: 3,
    repeatPurchaseCount: 12,
    needsEducation: true,
    recommendedAction: "Professional-only product. Re-train sales rep: never quote without dermatologist clearance.",
    responsibleDept: "Pharmacy",
  },
  {
    id: "prod-8",
    name: "African Black Soap Clarifying Wash 500ml",
    brand: "Skincare Kitchen",
    category: "Cleansers",
    priceNgn: 14500,
    inquiriesCount: 135,
    unitsSold: 118,
    revenueGeneratedNgn: 1711000,
    stockAvailable: 85,
    isAvailable: true,
    lostSalesCount: 17,
    mainLostReason: "Price too high",
    complaintsCount: 1,
    repeatPurchaseCount: 72,
    needsEducation: false,
    recommendedAction: "Introduce 2-bottle bundle with free delivery across Lagos & Abuja.",
    responsibleDept: "Sales Lead",
  },
  {
    id: "prod-9",
    name: "Laser Tooth Whitening Home Maintenance Pen",
    brand: "Dental Clinic",
    category: "Oral Wellness",
    priceNgn: 28000,
    inquiriesCount: 94,
    unitsSold: 58,
    revenueGeneratedNgn: 1624000,
    stockAvailable: 19,
    isAvailable: true,
    lostSalesCount: 36,
    mainLostReason: "Uncertain about results",
    complaintsCount: 1,
    repeatPurchaseCount: 22,
    needsEducation: true,
    recommendedAction: "Explain shade guide expectation: only works as post-laser procedure maintenance.",
    responsibleDept: "Clinical Team",
  },
  {
    id: "prod-10",
    name: "Glutathione & Vitamin C Oral Elixir",
    brand: "Rejuvenating",
    category: "Wellness",
    priceNgn: 48000,
    inquiriesCount: 112,
    unitsSold: 64,
    revenueGeneratedNgn: 3072000,
    stockAvailable: 15,
    isAvailable: true,
    lostSalesCount: 48,
    mainLostReason: "Needs doctor/nurse consult",
    complaintsCount: 0,
    repeatPurchaseCount: 31,
    needsEducation: true,
    recommendedAction: "Highlight pharmacist formulation certification and evidence-based absorption rate.",
    responsibleDept: "Pharmacy",
  },
];

export const SEED_UNMET_DEMAND_PRODUCTS = [
  { name: "Spironolactone 5% Topical Acne Cream", inquiriesCount: 38, category: "Prescription Dermatology", reason: "Customers seeking alternative to oral tablets without systemic side effects" },
  { name: "Tinted Physical SPF 50 Mineral Drops (Fitzpatrick V-VI)", inquiriesCount: 52, category: "Sun Protection", reason: "Current mineral sunscreens leave white cast on deeper skin tones" },
  { name: "Cysteamine 5% Intensive Pigment Correcting Cream", inquiriesCount: 29, category: "Hyperpigmentation", reason: "Alternative to hydroquinone for melasma maintenance" },
  { name: "Kojic Acid & Arbutin Underarm Brightening Serum", inquiriesCount: 44, category: "Body Care", reason: "Frequent inquiries in Skincare Kitchen WhatsApp for friction dark patches" },
];

export const SEED_PRODUCT_COMPLAINTS: ProductComplaintRecord[] = [
  {
    id: "comp-1",
    productName: "TCA 20% Clinical Peel Neutralizer Kit",
    brand: "Derma Aesthetics",
    customerName: "Mrs. Nkiru Danjuma",
    complaintType: "Skin Irritation/Reaction",
    customerDescription: "Customer applied peel at home without reading dilution instructions; reported burning sensation on cheekbones.",
    batchLot: "TCA-2026-B04",
    expiryDate: "11/2027",
    purchaseDate: "2026-10-04",
    actionTaken: "Immediately instructed to rinse with chilled sterile saline and apply cold compress. Case transferred to Dr. Ngozi Eze for clinical review.",
    status: "Referred to Pharmacist",
    responsibleDept: "Clinical Team",
    isUrgentSafetyEscalation: true,
  },
  {
    id: "comp-2",
    productName: "Whipped Shea Cocoa Souffle",
    brand: "Skincare Kitchen",
    customerName: "Alhaji Kabir Bello",
    complaintType: "Damaged Packaging",
    customerDescription: "Jar seal was partially open on arrival via courier delivery in Abuja.",
    batchLot: "SK-COCOA-981",
    expiryDate: "08/2027",
    purchaseDate: "2026-10-08",
    actionTaken: "Issued free replacement from Maitama Abuja stock within 4 hours. Courier packaging bubble-wrap SOP reinforced.",
    status: "Resolved",
    responsibleDept: "Operations",
    isUrgentSafetyEscalation: false,
  },
  {
    id: "comp-3",
    productName: "Exosome Cellular Repair Serum 30ml",
    brand: "Derma Aesthetics",
    customerName: "Barrister Funmi Adeleke",
    complaintType: "Price/Expectation",
    customerDescription: "Expected acne scars to disappear within 5 days; felt ₦45,000 was not justified by day 5.",
    batchLot: "EXO-2026-092",
    expiryDate: "03/2028",
    purchaseDate: "2026-10-01",
    actionTaken: "Nurse Amina explained cellular turnover cycle (28–42 days). Scheduled complimentary skin barrier assessment scan.",
    status: "Resolved",
    responsibleDept: "Clinical Team",
    isUrgentSafetyEscalation: false,
  },
];

export const SEED_CUSTOMER_QUESTIONS: CustomerQuestionReferral[] = [
  {
    id: "q-1",
    question: "Is this Exosome serum safe to use while I am on prescription tretinoin 0.05%?",
    customerName: "Dr. Amara Okonjo",
    timesAsked: 28,
    productOrService: "Exosome Cellular Repair Serum",
    referredTo: "Pharmacist",
    dateReferred: "2026-10-09",
    approvedResponseReceived: true,
    approvedResponse: "Yes, compatible when used as a soothing barrier layer 20 minutes after tretinoin application. Reduces retinization erythema.",
    furtherActionRequired: "Add compatibility note to WhatsApp automated catalogue.",
  },
  {
    id: "q-2",
    question: "Why is one side of my face feeling numb longer than the other after laser whitening?",
    customerName: "Senator Fatima Aliyu",
    timesAsked: 6,
    productOrService: "Laser Whitening + Guard Kit",
    referredTo: "Doctor",
    dateReferred: "2026-10-11",
    approvedResponseReceived: true,
    approvedResponse: "Transient asymmetry in topical lidocaine absorption. Resolves spontaneously within 90 minutes. Clinical check-in logged.",
    furtherActionRequired: "Ensure post-procedure patient handout highlights expected sensation recovery.",
  },
  {
    id: "q-3",
    question: "Can I use the Turmeric Papaya body polish on active inflammatory chest acne?",
    customerName: "Chinedu Eke",
    timesAsked: 34,
    productOrService: "Turmeric Papaya Polish",
    referredTo: "Nurse",
    dateReferred: "2026-10-07",
    approvedResponseReceived: true,
    approvedResponse: "Contraindicated on active pustules/cysts. Recommend Salicylic Wash first until lesions flatten, then introduce gentle polish.",
    furtherActionRequired: "Create Instagram infographic: 'Active Breakouts vs Dark Spots — What to Use First'.",
  },
  {
    id: "q-4",
    question: "When will the TCA 20% Neutralizer be restocked in Maitama Abuja?",
    customerName: "Hajiya Maryam",
    timesAsked: 41,
    productOrService: "TCA Peel Neutralizer Kit",
    referredTo: "Operations",
    dateReferred: "2026-10-10",
    approvedResponseReceived: true,
    approvedResponse: "Transit waybill WAY-APX-8812 arriving Monday morning via DHL Logistics.",
    furtherActionRequired: "Notify 14 pre-order customers upon warehouse arrival.",
  },
];

export const SEED_MARKETING_OPPORTUNITIES: MarketingContentOpportunity[] = [
  {
    id: "mkt-1",
    topic: "Why Cheap Vitamin C Turns Orange (And How ESB Liposomal Stays Active)",
    customerConcernOrGap: "Customers confuse oxidation with potency; question why ESB Vitamin C costs ₦38,000 vs cheap market imports.",
    inquiriesCount: 68,
    suggestedFormat: "Education Video",
    requiredReview: "Pharmacist",
    priority: "High",
    status: "In Production",
  },
  {
    id: "mkt-2",
    topic: "The 28-Day Exosome Protocol: What Real Cellular Healing Looks Like Week by Week",
    customerConcernOrGap: "Customers expect overnight scars eradication; need visual timeline to set realistic expectations.",
    inquiriesCount: 54,
    suggestedFormat: "FAQ Guide",
    requiredReview: "Clinical Doctor",
    priority: "High",
    status: "Published",
  },
  {
    id: "mkt-3",
    topic: "Skincare Kitchen Organic vs Commercial Supermarket Lotions: Ingredients Breakdown",
    customerConcernOrGap: "Customers compare ₦18,500 whipped butter to commercial mineral oil creams.",
    inquiriesCount: 47,
    suggestedFormat: "Product Comparison",
    requiredReview: "Pharmacist",
    priority: "Medium",
    status: "Submitted to Marketing",
  },
  {
    id: "mkt-4",
    topic: "Dental Laser Whitening vs Home Whitening Pens: Which One Do You Actually Need?",
    customerConcernOrGap: "Inquiries asking why home pens alone don't give Hollywood veneer brightness.",
    inquiriesCount: 42,
    suggestedFormat: "Clinical Review",
    requiredReview: "Clinical Doctor",
    priority: "Medium",
    status: "Submitted to Marketing",
  },
];

export const SEED_SALES_REPS_SCORECARDS: SalesRepScorecard[] = [
  {
    repName: "Blessing Okon",
    branch: "Port Harcourt",
    department: "Skin Clinic & Derma",
    assignedTargetNgn: 50000000,
    actualRevenueNgn: 47800000,
    inquiriesReceived: 210,
    qualifiedLeads: 165,
    completedSales: 78,
    followUpsDue: 85,
    followUpsCompleted: 82,
    eligibleRepeatCustomers: 60,
    repeatPurchases: 46,
    intelligenceReportsSubmitted: 4,
    crmRecordsAccuracyPct: 98,
    revenueScore: 33.5, // 47.8/50 * 35 = 33.46
    conversionScore: 18.9, // (78/165) * 20 / 0.5 = 18.9
    intelligenceScore: 20.0, // 4/4 reports
    retentionScore: 14.5, // (46/60)
    crmDisciplineScore: 9.8,
    totalScore: 96.7,
    grade: "A+ (Excellent)",
  },
  {
    repName: "Chioma Nwosu",
    branch: "Abuja",
    department: "Rejuvenating Suite",
    assignedTargetNgn: 45000000,
    actualRevenueNgn: 41200000,
    inquiriesReceived: 185,
    qualifiedLeads: 140,
    completedSales: 62,
    followUpsDue: 70,
    followUpsCompleted: 66,
    eligibleRepeatCustomers: 50,
    repeatPurchases: 38,
    intelligenceReportsSubmitted: 4,
    crmRecordsAccuracyPct: 96,
    revenueScore: 32.0,
    conversionScore: 17.7,
    intelligenceScore: 19.5,
    retentionScore: 13.8,
    crmDisciplineScore: 9.6,
    totalScore: 92.6,
    grade: "A+ (Excellent)",
  },
  {
    repName: "Kareem Adeleke",
    branch: "Port Harcourt",
    department: "Skincare Kitchen & B2B",
    assignedTargetNgn: 40000000,
    actualRevenueNgn: 36500000,
    inquiriesReceived: 195,
    qualifiedLeads: 150,
    completedSales: 68,
    followUpsDue: 75,
    followUpsCompleted: 71,
    eligibleRepeatCustomers: 55,
    repeatPurchases: 42,
    intelligenceReportsSubmitted: 4,
    crmRecordsAccuracyPct: 95,
    revenueScore: 31.9,
    conversionScore: 18.1,
    intelligenceScore: 19.0,
    retentionScore: 14.2,
    crmDisciplineScore: 9.5,
    totalScore: 92.7,
    grade: "A+ (Excellent)",
  },
  {
    repName: "Zainab Mohammed",
    branch: "Abuja",
    department: "Dental & Aesthetics",
    assignedTargetNgn: 35000000,
    actualRevenueNgn: 29800000,
    inquiriesReceived: 140,
    qualifiedLeads: 95,
    completedSales: 39,
    followUpsDue: 55,
    followUpsCompleted: 48,
    eligibleRepeatCustomers: 35,
    repeatPurchases: 22,
    intelligenceReportsSubmitted: 3,
    crmRecordsAccuracyPct: 92,
    revenueScore: 29.8,
    conversionScore: 16.4,
    intelligenceScore: 15.0,
    retentionScore: 12.1,
    crmDisciplineScore: 9.2,
    totalScore: 82.5,
    grade: "A (Good)",
  },
];

// ============================================================================
// BRAND WHATSAPP API HUBS & TEMPLATES
// ============================================================================

export interface BrandWhatsAppData {
  key: string;
  name: string;
  phoneNumber: string; // e.g. "2348032214982"
  formattedPhone: string;
  defaultMessage: string;
  leadCategory: string;
  responsibleStaff: string;
  quickTemplates: Array<{ label: string; text: string }>;
}

export const BRAND_WHATSAPP_CONFIG: Record<string, BrandWhatsAppData> = {
  "derma": {
    key: "derma",
    name: "Derma Aesthetics Official",
    phoneNumber: "2348032214982",
    formattedPhone: "+234 803 221 4982",
    defaultMessage: "Hello Derma Aesthetics! I would like to inquire about your clinical skincare formulations and available products.",
    leadCategory: "Clinical Skincare Retail",
    responsibleStaff: "Blessing Okon (Senior Consultant)",
    quickTemplates: [
      { label: "Product Order & Verification", text: "Hello Derma Aesthetics, I would like to order and verify batch authenticity for the Exosome Cellular Repair Serum." },
      { label: "Skin Consultation Request", text: "Hello Derma Aesthetics, I have hyperpigmentation and would like to schedule a private skin consultation." },
      { label: "Track Shipment", text: "Hello Derma Aesthetics, could you please provide the tracking update for my recent product order?" },
    ],
  },
  "skincare-kitchen": {
    key: "skincare-kitchen",
    name: "Skincare Kitchen Official",
    phoneNumber: "2348145509012",
    formattedPhone: "+234 814 550 9012",
    defaultMessage: "Hello Skincare Kitchen! I am interested in your organic whipped butters, custom formulation serum bar, and wholesale packages.",
    leadCategory: "Organic Formulation & B2B",
    responsibleStaff: "Kareem Adeleke (Formulation Specialist)",
    quickTemplates: [
      { label: "Whipped Butter & Polish Order", text: "Hello Skincare Kitchen, I want to order the Whipped Shea Cocoa Souffle and Turmeric Papaya Body Polish." },
      { label: "B2B Wholesale / Bulk Inquiries", text: "Hello Skincare Kitchen, I run a salon/spa and would like to inquire about wholesale pricing for custom serums." },
      { label: "Custom Formulation Regimen", text: "Hello Skincare Kitchen, I want a personalized 12-month skincare formulation created for my skin type." },
    ],
  },
  "skinclinic": {
    key: "skinclinic",
    name: "Skin Clinic Institute",
    phoneNumber: "2348039924110",
    formattedPhone: "+234 803 992 4110",
    defaultMessage: "Hello Skin Clinic! I would like to book an appointment for clinical aesthetics, medical peels, or laser treatment.",
    leadCategory: "Medical Aesthetics Procedures",
    responsibleStaff: "Nurse Amina / Dr. Ngozi Eze",
    quickTemplates: [
      { label: "Book Doctor Consultation", text: "Hello Skin Clinic, I would like to book a clinical consultation with Dr. Ngozi Eze." },
      { label: "HydraFacial & Peel Treatment", text: "Hello Skin Clinic, what appointment slots are available this week for the Deluxe HydraFacial protocol?" },
      { label: "Post-Treatment Aftercare Question", text: "Hello Skin Clinic, I had a procedure done recently and have a quick question about my post-care barrier mist." },
    ],
  },
  "dental": {
    key: "dental",
    name: "Dental Aesthetic Clinic",
    phoneNumber: "2348189987766",
    formattedPhone: "+234 818 998 7766",
    defaultMessage: "Hello Dental Aesthetics! I would like to inquire about laser teeth whitening, cosmetic veneers, and 3D smile design.",
    leadCategory: "Cosmetic Dentistry",
    responsibleStaff: "Dr. Tunde Bakare (Surgeon)",
    quickTemplates: [
      { label: "Laser Teeth Whitening Booking", text: "Hello Dental Clinic, I would like to book an in-office Hollywood Laser Teeth Whitening session." },
      { label: "Veneers & Smile Architecture", text: "Hello Dental Clinic, could you provide pricing and consultation details for porcelain veneers?" },
      { label: "Post-Treatment Sensitivity Care", text: "Hello Dental Clinic, I completed laser whitening and would like advice on tooth sensitivity." },
    ],
  },
  "rejuvenating": {
    key: "rejuvenating",
    name: "Rejuvenating Aesthetics Suite",
    phoneNumber: "2348091118899",
    formattedPhone: "+234 809 111 8899",
    defaultMessage: "Hello Rejuvenating Aesthetics! I would like information regarding executive anti-aging, exosome therapy, and IV wellness infusions.",
    leadCategory: "Executive Anti-Aging & Longevity",
    responsibleStaff: "Chioma Nwosu (VIP Concierge)",
    quickTemplates: [
      { label: "Executive IV Drip Therapy", text: "Hello Rejuvenating Suite, I would like to schedule a private VIP Glutathione & Vitamin C IV drip session." },
      { label: "HIFU / Skin Tightening Booking", text: "Hello Rejuvenating Suite, I want to book an Ultra-Sound HIFU lifting session in Abuja." },
      { label: "Concierge VIP Suite Reservation", text: "Hello Rejuvenating Suite, I need a private escort-accessible VIP room booking for Saturday." },
    ],
  },
};

/**
 * Generate a pre-formatted WhatsApp Click-to-Chat URL
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// ============================================================================
// BRAND CUSTOMER STATISTICS
// ============================================================================

export interface BrandCustomerStats {
  brandKey: string;
  name: string;
  totalCustomers: number;
  vipCustomers: number;
  monthlyInquiries: number;
  conversionRatePct: number;
  avgOrderValueNgn: number;
  satisfactionRating: number;
  returnCustomerRatePct: number;
  topInquiryQuestion: string;
  commonLostReason: string;
}

export const BRAND_CUSTOMER_STATS: BrandCustomerStats[] = [
  {
    brandKey: "derma",
    name: "Derma Aesthetics",
    totalCustomers: 1420,
    vipCustomers: 310,
    monthlyInquiries: 380,
    conversionRatePct: 41.2,
    avgOrderValueNgn: 48500,
    satisfactionRating: 4.9,
    returnCustomerRatePct: 58.4,
    topInquiryQuestion: "How long before post-inflammatory hyperpigmentation fades?",
    commonLostReason: "Out of stock on clinical active neutralizers",
  },
  {
    brandKey: "skincare-kitchen",
    name: "Skincare Kitchen",
    totalCustomers: 2680,
    vipCustomers: 440,
    monthlyInquiries: 520,
    conversionRatePct: 46.8,
    avgOrderValueNgn: 26000,
    satisfactionRating: 4.8,
    returnCustomerRatePct: 64.2,
    topInquiryQuestion: "Can I combine the black soap with the papaya body polish daily?",
    commonLostReason: "Delivery time to northern states takes 2-3 days",
  },
  {
    brandKey: "skinclinic",
    name: "Skin Clinic",
    totalCustomers: 980,
    vipCustomers: 285,
    monthlyInquiries: 290,
    conversionRatePct: 48.5,
    avgOrderValueNgn: 92000,
    satisfactionRating: 4.9,
    returnCustomerRatePct: 71.0,
    topInquiryQuestion: "Does microneedling hurt if I have sensitive skin?",
    commonLostReason: "Clients need doctor consultation before committing to procedure",
  },
  {
    brandKey: "dental",
    name: "Dental Clinic",
    totalCustomers: 640,
    vipCustomers: 190,
    monthlyInquiries: 195,
    conversionRatePct: 34.5,
    avgOrderValueNgn: 145000,
    satisfactionRating: 4.7,
    returnCustomerRatePct: 42.0,
    topInquiryQuestion: "Will laser whitening cause nerve sensitivity or damage enamel?",
    commonLostReason: "Price sensitivity on porcelain veneers vs composite",
  },
  {
    brandKey: "rejuvenating",
    name: "Rejuvenating Suite",
    totalCustomers: 590,
    vipCustomers: 240,
    monthlyInquiries: 175,
    conversionRatePct: 51.0,
    avgOrderValueNgn: 185000,
    satisfactionRating: 5.0,
    returnCustomerRatePct: 74.5,
    topInquiryQuestion: "How often should I do IV Glutathione and Exosome maintenance?",
    commonLostReason: "Executive VIP suite availability on weekends is fully booked",
  },
];
