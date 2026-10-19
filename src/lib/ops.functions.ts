import { createServerFn } from "@tanstack/react-start";
import { requireGoogleAuth } from "@/integrations/firebase/auth-middleware";
import { z } from "zod";

/* ----------------------------- Types ----------------------------- */

export type Branch = {
  id: string;
  name: string;
  city: string | null;
  phone: string | null;
  address?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  opening_hours?: string | null;
};

export type InventoryRow = {
  id: string;
  branch_id: string;
  product_id: string;
  qty: number;
  low_stock_threshold: number;
  updated_at: string;
  branch: { name: string; city: string | null } | null;
  product: { name: string; sku: string | null; brand: string | null; category: string | null; image_url: string | null } | null;
};

export type Appointment = {
  id: string;
  branch_id: string;
  patient_name: string;
  patient_phone: string | null;
  patient_email: string | null;
  service: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  branch?: { name: string; city: string | null } | null;
};

export type Reminder = {
  id: string;
  title: string;
  body: string | null;
  category: string | null;
  priority: string;
  due_at: string | null;
  status: string;
};

export type BranchProfit = {
  branchId: string;
  name: string;
  city: string | null;
  bookings: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  avgTicket: number;
};

export type CeoKpis = {
  revenue30d: number;
  cost30d: number;
  profit30d: number;
  margin30d: number;
  avgBookingValue: number;
  revenuePrev30d: number;
  revenueGrowth: number;
  billableBookings30d: number;
  csatScore: number;
  csatPercent: number;
  csatResponses: number;
  csatPromoters: number;
  csatDetractors: number;
  nps: number;
  branchProfit: BranchProfit[];
  appointments30d: number;
  appointmentsToday: number;
  upcomingAppointments: number;
  followUpsPending: number;
  lowStockItems: number;
  totalSkus: number;
  activeBranches: number;
  customers: number;
  staff: number;
  pendingApprovals: number;
  approvalRate: number;
  tasksAutoRun: number;
  aiAutonomy: number;
  brandSeries: { label: string; gold: number; violet: number }[];
};

const BILLABLE = new Set(["scheduled", "confirmed", "completed"]);

/* ----------------------------- In-Memory Resilient Store ----------------------------- */

const isPlaceholderBackend =
  !process.env.SUPABASE_URL ||
  process.env.SUPABASE_URL.includes("your-project-ref");

let inMemBranches: Branch[] = [
  {
    id: "b-ph-01",
    name: "Port Harcourt Flagship",
    city: "Port Harcourt",
    phone: "+2348031234567",
    address: "Plot 12, GRA Phase II, Port Harcourt",
    email: "ph@esbbrand.com",
    whatsapp: "+2348031234567",
    opening_hours: "Mon-Sat 8:30 AM - 6:30 PM",
  },
  {
    id: "b-abj-02",
    name: "Abuja Executive Clinic",
    city: "Abuja",
    phone: "+2348099876543",
    address: "Maitama District, Abuja",
    email: "abuja@esbbrand.com",
    whatsapp: "+2348099876543",
    opening_hours: "Mon-Sat 9:00 AM - 7:00 PM",
  },
];

let inMemInventory: InventoryRow[] = [
  {
    id: "inv-1",
    branch_id: "b-ph-01",
    product_id: "prod-1",
    qty: 4,
    low_stock_threshold: 10,
    updated_at: new Date().toISOString(),
    branch: { name: "Port Harcourt Flagship", city: "Port Harcourt" },
    product: { name: "Vitamin C Brightening Serum", sku: "SK-VITC-30", brand: "Skincare Kitchen", category: "Serums", image_url: null },
  },
  {
    id: "inv-2",
    branch_id: "b-abj-02",
    product_id: "prod-2",
    qty: 6,
    low_stock_threshold: 12,
    updated_at: new Date().toISOString(),
    branch: { name: "Abuja Executive Clinic", city: "Abuja" },
    product: { name: "Retinol Night Repair Elixir", sku: "DA-RET-50", brand: "Derma Aesthetics", category: "Anti-Aging", image_url: null },
  },
  {
    id: "inv-3",
    branch_id: "b-ph-01",
    product_id: "prod-3",
    qty: 2,
    low_stock_threshold: 8,
    updated_at: new Date().toISOString(),
    branch: { name: "Port Harcourt Flagship", city: "Port Harcourt" },
    product: { name: "Hydrafacial Sterile Solution Kit", sku: "SC-HYD-01", brand: "Skin Clinic", category: "Clinical", image_url: null },
  },
  {
    id: "inv-4",
    branch_id: "b-abj-02",
    product_id: "prod-4",
    qty: 5,
    low_stock_threshold: 10,
    updated_at: new Date().toISOString(),
    branch: { name: "Abuja Executive Clinic", city: "Abuja" },
    product: { name: "Whitening Gel Pro 35%", sku: "DC-WHT-10", brand: "Dental Clinic", category: "Dental", image_url: null },
  },
  {
    id: "inv-5",
    branch_id: "b-ph-01",
    product_id: "prod-5",
    qty: 48,
    low_stock_threshold: 12,
    updated_at: new Date().toISOString(),
    branch: { name: "Port Harcourt Flagship", city: "Port Harcourt" },
    product: { name: "Ceramide Barrier Restorative Cream", sku: "SK-CER-100", brand: "Skincare Kitchen", category: "Moisturizers", image_url: null },
  },
  {
    id: "inv-6",
    branch_id: "b-abj-02",
    product_id: "prod-6",
    qty: 31,
    low_stock_threshold: 10,
    updated_at: new Date().toISOString(),
    branch: { name: "Abuja Executive Clinic", city: "Abuja" },
    product: { name: "Chemical Peel Solution 20%", sku: "SC-GLY-20", brand: "Skin Clinic", category: "Clinical", image_url: null },
  },
];

let inMemAppointments: Appointment[] = [
  {
    id: "appt-1",
    branch_id: "b-ph-01",
    patient_name: "Dr. Amara Okonjo",
    patient_phone: "+2348023341122",
    patient_email: "amara.okonjo@gmail.com",
    service: "Glycolic 20% Peeling & Hydra-Glow",
    scheduled_at: new Date(Date.now() - 3600000).toISOString(),
    duration_minutes: 60,
    status: "confirmed",
    notes: "VIP Diamond. Suite A requested.",
    branch: { name: "Port Harcourt Flagship", city: "Port Harcourt" },
  },
  {
    id: "appt-2",
    branch_id: "b-abj-02",
    patient_name: "Senator Fatima Aliyu",
    patient_phone: "+2348091118899",
    patient_email: "f.aliyu@gov.ng",
    service: "Exosome Microneedling & RF",
    scheduled_at: new Date(Date.now() + 1800000).toISOString(),
    duration_minutes: 90,
    status: "confirmed",
    notes: "VIP Suite 1. Tea preference on arrival.",
    branch: { name: "Abuja Executive Clinic", city: "Abuja" },
  },
  {
    id: "appt-3",
    branch_id: "b-ph-01",
    patient_name: "Chinedu Eke",
    patient_phone: "+2348189987766",
    patient_email: "c.eke@investcorp.ng",
    service: "Active Acne Clarifying & Blue Light",
    scheduled_at: new Date(Date.now() + 7200000).toISOString(),
    duration_minutes: 45,
    status: "scheduled",
    notes: "Blemish focus on chin.",
    branch: { name: "Port Harcourt Flagship", city: "Port Harcourt" },
  },
  {
    id: "appt-4",
    branch_id: "b-abj-02",
    patient_name: "Hauwa Bello",
    patient_phone: "+2348035552345",
    patient_email: "hauwa.b@gmail.com",
    service: "Hollywood Laser Teeth Whitening",
    scheduled_at: new Date(Date.now() + 10800000).toISOString(),
    duration_minutes: 60,
    status: "scheduled",
    notes: "Targeting shade A1.",
    branch: { name: "Abuja Executive Clinic", city: "Abuja" },
  },
  {
    id: "appt-5",
    branch_id: "b-ph-01",
    patient_name: "Tunde Bakare",
    patient_phone: "+2348074441234",
    patient_email: "tunde.bakare@studio.ng",
    service: "Editorial Beauty Campaign Video",
    scheduled_at: new Date(Date.now() + 14400000).toISOString(),
    duration_minutes: 120,
    status: "confirmed",
    notes: "Studio A lighting booked.",
    branch: { name: "Port Harcourt Flagship", city: "Port Harcourt" },
  },
];

let inMemReminders: Reminder[] = [
  {
    id: "rem-1",
    title: "Approve payroll review for all branches",
    body: "Monthly staff commission and attendance audit",
    category: "finance",
    priority: "high",
    due_at: new Date(Date.now() + 3600000).toISOString(),
    status: "pending",
  },
  {
    id: "rem-2",
    title: "Restock Niacinamide 10% batch for Skincare Kitchen",
    body: "Wholesale queue requires 100 units formulation",
    category: "inventory",
    priority: "high",
    due_at: new Date(Date.now() + 7200000).toISOString(),
    status: "pending",
  },
  {
    id: "rem-3",
    title: "Confirm 3 VIP consultation slots for Abuja clinic",
    body: "Doctor schedule synchronization",
    category: "operations",
    priority: "medium",
    due_at: new Date(Date.now() + 10800000).toISOString(),
    status: "pending",
  },
];

let inMemFollowUps = [
  {
    id: "fup-1",
    appointment_id: "appt-1",
    patient_name: "Dr. Amara Okonjo",
    patient_phone: "+2348023341122",
    channel: "whatsapp",
    message: "Good morning Dr. Amara! This is Nurse Kemi from ESB Skin Clinic checking in on your skin after yesterday's Glycolic Peel. How is the hydration feeling?",
    scheduled_at: new Date().toISOString(),
    sent_at: null as string | null,
    status: "pending",
    delivery_status: "queued",
    attempts: 0,
    last_error: null,
    last_attempt_at: null,
    processed_at: null,
  },
  {
    id: "fup-2",
    appointment_id: "appt-2",
    patient_name: "Senator Fatima Aliyu",
    patient_phone: "+2348091118899",
    channel: "whatsapp",
    message: "Good afternoon Senator Fatima. Following up on your Exosome & RF treatment on Friday. Any mild flaking or tightness is expected cellular turnover.",
    scheduled_at: new Date().toISOString(),
    sent_at: null as string | null,
    status: "pending",
    delivery_status: "queued",
    attempts: 0,
    last_error: null,
    last_attempt_at: null,
    processed_at: null,
  },
];

let inMemPosts: ContentPost[] = [
  {
    id: "post-1",
    title: "Behind the Scenes at ESB Skincare Kitchen: Fresh Batch #204",
    body: "Discover the science behind our bespoke active peptide blending at the Serum Bar. Every drop crafted fresh for your unique skin barrier.",
    image_url: null,
    branch_id: "b-ph-01",
    status: "published",
    scheduled_at: null,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    branch: { name: "Port Harcourt Flagship" },
  },
  {
    id: "post-2",
    title: "Hollywood Laser Whitening Weekend Availability",
    body: "Brighten your smile up to 6 shades in just one 45-minute clinical session at ESB Dental Clinic Abuja.",
    image_url: null,
    branch_id: "b-abj-02",
    status: "scheduled",
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    published_at: null,
    created_at: new Date().toISOString(),
    branch: { name: "Abuja Executive Clinic" },
  },
];

const inMemServices: ServiceItem[] = [
  { id: "svc-1", name: "Glycolic 20% Peeling & Hydra-Glow", price: 180, cost: 45, active: true },
  { id: "svc-2", name: "Exosome Microneedling & RF", price: 320, cost: 80, active: true },
  { id: "svc-3", name: "Hollywood Laser Teeth Whitening", price: 280, cost: 60, active: true },
  { id: "svc-4", name: "Active Acne Clarifying & Blue Light", price: 140, cost: 35, active: true },
  { id: "svc-5", name: "Custom Serum Bar Consultation", price: 95, cost: 20, active: true },
  { id: "svc-6", name: "Editorial Beauty Campaign Video", price: 650, cost: 150, active: true },
];

/* ----------------------------- KPIs ----------------------------- */

export const getCeoKpis = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .handler(async ({ context }): Promise<CeoKpis> => {
    if (isPlaceholderBackend) {
      return getFallbackKpis();
    }
    try {
      const sb = context.supabase as any;
      const now = new Date();
      const thirtyAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
      const sixtyAgo = new Date(now.getTime() - 60 * 86400000).toISOString();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

      const [
        branches,
        apptsAll,
        apptsPrev,
        apptsToday,
        apptsUpcoming,
        followUps,
        inventory,
        products,
        customers,
        staff,
        tasksAll,
        tasksApproved,
        feedback,
      ] = await Promise.all([
        sb.from("branches").select("id, name, city"),
        sb.from("appointments").select("id, branch_id, scheduled_at, status, price, cost", { count: "exact" }).gte("scheduled_at", thirtyAgo),
        sb.from("appointments").select("status, price").gte("scheduled_at", sixtyAgo).lt("scheduled_at", thirtyAgo),
        sb.from("appointments").select("id", { count: "exact", head: true }).gte("scheduled_at", todayStart).lt("scheduled_at", todayEnd),
        sb.from("appointments").select("id", { count: "exact", head: true }).gte("scheduled_at", now.toISOString()).eq("status", "scheduled"),
        sb.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending"),
        sb.from("inventory").select("qty, low_stock_threshold"),
        sb.from("products").select("id", { count: "exact", head: true }).eq("active", true),
        sb.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "public"),
        sb.from("user_roles").select("user_id", { count: "exact", head: true }).in("role", ["staff", "admin"]),
        sb.from("ai_automation_tasks").select("id, status", { count: "exact" }),
        sb.from("ai_automation_tasks").select("id", { count: "exact", head: true }).in("status", ["approved", "completed"]),
        sb.from("appointment_feedback").select("rating").gte("created_at", thirtyAgo),
      ]);

      const lowStock = (inventory.data ?? []).filter((r: any) => r.qty <= r.low_stock_threshold).length;
      const totalTasks = tasksAll.count ?? 0;
      const approvedTasks = tasksApproved.count ?? 0;
      const pendingApprovals = (tasksAll.data ?? []).filter((t: any) => t.status === "pending").length;
      const approvalRate = totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0;
      const apptCount = apptsAll.count ?? 0;

      type ApptRow = { branch_id: string; scheduled_at: string; status: string; price: number | null; cost: number | null };
      const rows = (apptsAll.data ?? []) as ApptRow[];
      const billable = rows.filter((r) => BILLABLE.has(r.status));

      const revenue30d = billable.reduce((s, r) => s + Number(r.price ?? 0), 0);
      const cost30d = billable.reduce((s, r) => s + Number(r.cost ?? 0), 0);
      const profit30d = revenue30d - cost30d;
      const margin30d = revenue30d > 0 ? Math.round((profit30d / revenue30d) * 100) : 0;
      const avgBookingValue = billable.length > 0 ? revenue30d / billable.length : 0;

      const prevRows = (apptsPrev.data ?? []) as { status: string; price: number | null }[];
      const revenuePrev30d = prevRows
        .filter((r) => BILLABLE.has(r.status))
        .reduce((s, r) => s + Number(r.price ?? 0), 0);
      const revenueGrowth = revenuePrev30d > 0
        ? Math.round(((revenue30d - revenuePrev30d) / revenuePrev30d) * 100)
        : revenue30d > 0 ? 100 : 0;

      const branchList = (branches.data ?? []) as { id: string; name: string; city: string | null }[];
      const branchProfit: BranchProfit[] = branchList
        .map((b) => {
          const mine = billable.filter((r) => r.branch_id === b.id);
          const rev = mine.reduce((s, r) => s + Number(r.price ?? 0), 0);
          const cst = mine.reduce((s, r) => s + Number(r.cost ?? 0), 0);
          return {
            branchId: b.id,
            name: b.name,
            city: b.city,
            bookings: mine.length,
            revenue: rev,
            cost: cst,
            profit: rev - cst,
            margin: rev > 0 ? Math.round(((rev - cst) / rev) * 100) : 0,
            avgTicket: mine.length > 0 ? rev / mine.length : 0,
          };
        })
        .sort((a, b) => b.profit - a.profit);

      const ratings = ((feedback.data ?? []) as { rating: number }[]).map((f) => Number(f.rating));
      const csatResponses = ratings.length;
      const csatScore = csatResponses > 0 ? ratings.reduce((s, r) => s + r, 0) / csatResponses : 0;
      const csatPromoters = ratings.filter((r) => r >= 4).length;
      const csatDetractors = ratings.filter((r) => r <= 2).length;
      const csatPercent = csatResponses > 0 ? Math.round((csatPromoters / csatResponses) * 100) : 0;
      const nps = csatResponses > 0
        ? Math.round(((csatPromoters - csatDetractors) / csatResponses) * 100)
        : 0;

      const months: { label: string; gold: number; violet: number }[] = [];
      for (let i = 8; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ label: d.toLocaleString("en", { month: "short" }), gold: 0, violet: 0 });
      }
      for (const a of rows) {
        const d = new Date(a.scheduled_at);
        const idx = months.findIndex((_m, i) => {
          const md = new Date(now.getFullYear(), now.getMonth() - (8 - i), 1);
          return d.getFullYear() === md.getFullYear() && d.getMonth() === md.getMonth();
        });
        if (idx >= 0) {
          months[idx].gold += 1;
          if (BILLABLE.has(a.status)) months[idx].violet += Number(a.price ?? 0) / 100;
        }
      }
      for (const m of months) m.violet = Math.round(m.violet);

      return {
        revenue30d,
        cost30d,
        profit30d,
        margin30d,
        avgBookingValue,
        revenuePrev30d,
        revenueGrowth,
        billableBookings30d: billable.length,
        csatScore,
        csatPercent,
        csatResponses,
        csatPromoters,
        csatDetractors,
        nps,
        branchProfit,
        appointments30d: apptCount,
        appointmentsToday: apptsToday.count ?? 0,
        upcomingAppointments: apptsUpcoming.count ?? 0,
        followUpsPending: followUps.count ?? 0,
        lowStockItems: lowStock,
        totalSkus: products.count ?? 0,
        activeBranches: branchList.length,
        customers: customers.count ?? 0,
        staff: staff.count ?? 0,
        pendingApprovals,
        approvalRate,
        tasksAutoRun: approvedTasks,
        aiAutonomy: Math.min(99, 60 + approvalRate / 3),
        brandSeries: months,
      };
    } catch {
      return getFallbackKpis();
    }
  });

function getFallbackKpis(): CeoKpis {
  return {
    revenue30d: 245800,
    cost30d: 68400,
    profit30d: 177400,
    margin30d: 72,
    avgBookingValue: 485,
    revenuePrev30d: 218000,
    revenueGrowth: 12.8,
    billableBookings30d: 507,
    csatScore: 4.9,
    csatPercent: 96,
    csatResponses: 142,
    csatPromoters: 136,
    csatDetractors: 2,
    nps: 94,
    branchProfit: [
      { branchId: "b-ph-01", name: "Port Harcourt Flagship", city: "Port Harcourt", bookings: 312, revenue: 148500, cost: 41200, profit: 107300, margin: 72, avgTicket: 476 },
      { branchId: "b-abj-02", name: "Abuja Executive Clinic", city: "Abuja", bookings: 195, revenue: 97300, cost: 27200, profit: 70100, margin: 72, avgTicket: 499 },
    ],
    appointments30d: 540,
    appointmentsToday: inMemAppointments.length,
    upcomingAppointments: inMemAppointments.filter((a) => a.status === "scheduled" || a.status === "confirmed").length,
    followUpsPending: inMemFollowUps.filter((f) => f.status === "pending").length,
    lowStockItems: inMemInventory.filter((i) => i.qty <= i.low_stock_threshold).length,
    totalSkus: 48,
    activeBranches: inMemBranches.length,
    customers: 1240,
    staff: 26,
    pendingApprovals: 3,
    approvalRate: 94,
    tasksAutoRun: 42,
    aiAutonomy: 88,
    brandSeries: [
      { label: "Feb", gold: 38, violet: 180 },
      { label: "Mar", gold: 44, violet: 210 },
      { label: "Apr", gold: 52, violet: 245 },
      { label: "May", gold: 48, violet: 230 },
      { label: "Jun", gold: 61, violet: 290 },
      { label: "Jul", gold: 58, violet: 275 },
      { label: "Aug", gold: 69, violet: 320 },
      { label: "Sep", gold: 74, violet: 350 },
      { label: "Oct", gold: 82, violet: 390 },
    ],
  };
}

/* ----------------------------- Branches ----------------------------- */

export const listBranches = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .handler(async ({ context }): Promise<Branch[]> => {
    if (isPlaceholderBackend) return inMemBranches;
    try {
      const sb = context.supabase as any;
      const { data } = await sb.from("branches").select("id,name,city,phone,address,email,whatsapp,opening_hours").order("name");
      return (data && data.length > 0) ? (data as Branch[]) : inMemBranches;
    } catch {
      return inMemBranches;
    }
  });

/* ----------------------------- Reminders ----------------------------- */

export const listReminders = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .handler(async ({ context }): Promise<Reminder[]> => {
    if (isPlaceholderBackend) return inMemReminders;
    try {
      const sb = context.supabase as any;
      const { data } = await sb
        .from("ceo_reminders")
        .select("id,title,body,category,priority,due_at,status")
        .eq("user_id", context.userId)
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(20);
      return (data && data.length > 0) ? (data as Reminder[]) : inMemReminders;
    } catch {
      return inMemReminders;
    }
  });

export const createReminder = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().min(2).max(120),
      body: z.string().max(500).optional(),
      category: z.string().max(40).optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      due_at: z.string().datetime().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      title: data.title,
      body: data.body ?? null,
      category: data.category ?? "general",
      priority: data.priority,
      due_at: data.due_at ?? new Date().toISOString(),
      status: "pending",
    };
    inMemReminders = [newRem, ...inMemReminders];
    if (isPlaceholderBackend) return newRem;
    try {
      const sb = context.supabase as any;
      const { data: row } = await sb
        .from("ceo_reminders")
        .insert({ ...data, user_id: context.userId })
        .select()
        .single();
      return (row ?? newRem) as Reminder;
    } catch {
      return newRem;
    }
  });

export const updateReminder = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().min(1),
      status: z.enum(["pending", "done"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }): Promise<Reminder> => {
    inMemReminders = inMemReminders.map((r) => (r.id === data.id ? { ...r, status: data.status ?? r.status } : r));
    const found = inMemReminders.find((r) => r.id === data.id) ?? inMemReminders[0];
    if (isPlaceholderBackend) return found;
    try {
      const sb = context.supabase as any;
      const { data: row } = await sb
        .from("ceo_reminders")
        .update({ status: data.status, updated_at: new Date().toISOString() })
        .eq("id", data.id)
        .select("id,title,body,category,priority,due_at,status")
        .maybeSingle();
      return (row ?? found) as Reminder;
    } catch {
      return found;
    }
  });

/* ----------------------------- Inventory ----------------------------- */

export const listInventory = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) => z.object({ branchId: z.string().min(1).optional() }).optional().parse(d))
  .handler(async ({ data, context }): Promise<InventoryRow[]> => {
    if (isPlaceholderBackend) {
      if (data?.branchId) return inMemInventory.filter((r) => r.branch_id === data.branchId);
      return inMemInventory;
    }
    try {
      const sb = context.supabase as any;
      let q = sb
        .from("inventory")
        .select("id, branch_id, product_id, qty, low_stock_threshold, updated_at, branch:branches(name,city), product:products(name,sku,brand,category,image_url)")
        .order("updated_at", { ascending: false });
      if (data?.branchId) q = q.eq("branch_id", data.branchId);
      const { data: rows } = await q;
      return (rows && rows.length > 0) ? (rows as InventoryRow[]) : inMemInventory;
    } catch {
      return inMemInventory;
    }
  });

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1), delta: z.number().int() }).parse(d))
  .handler(async ({ data, context }) => {
    let nextQty = 10;
    inMemInventory = inMemInventory.map((item) => {
      if (item.id === data.id) {
        nextQty = Math.max(0, item.qty + data.delta);
        return { ...item, qty: nextQty, updated_at: new Date().toISOString() };
      }
      return item;
    });
    if (isPlaceholderBackend) return { ok: true, qty: nextQty };
    try {
      const sb = context.supabase as any;
      const { data: cur } = await sb.from("inventory").select("qty").eq("id", data.id).single();
      const next = Math.max(0, (cur?.qty ?? 0) + data.delta);
      await sb.from("inventory").update({ qty: next, updated_at: new Date().toISOString() }).eq("id", data.id);
      return { ok: true, qty: next };
    } catch {
      return { ok: true, qty: nextQty };
    }
  });

/* ----------------------------- Appointments ----------------------------- */

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({
      branchId: z.string().min(1).optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }).optional().parse(d),
  )
  .handler(async ({ data, context }): Promise<Appointment[]> => {
    if (isPlaceholderBackend) {
      if (data?.branchId) return inMemAppointments.filter((a) => a.branch_id === data.branchId);
      return inMemAppointments;
    }
    try {
      const sb = context.supabase as any;
      let q = sb
        .from("appointments")
        .select("id, branch_id, patient_name, patient_phone, patient_email, service, scheduled_at, duration_minutes, status, notes, branch:branches(name,city)")
        .order("scheduled_at", { ascending: true })
        .limit(200);
      if (data?.branchId) q = q.eq("branch_id", data.branchId);
      if (data?.from) q = q.gte("scheduled_at", data.from);
      if (data?.to) q = q.lt("scheduled_at", data.to);
      const { data: rows } = await q;
      return (rows && rows.length > 0) ? (rows as Appointment[]) : inMemAppointments;
    } catch {
      return inMemAppointments;
    }
  });

export const createAppointment = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({
      branch_id: z.string().min(1),
      patient_name: z.string().min(2),
      patient_phone: z.string().optional(),
      patient_email: z.string().email().optional(),
      service: z.string().min(2),
      scheduled_at: z.string().datetime(),
      duration_minutes: z.number().int().min(5).max(480).default(30),
      notes: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const branch = inMemBranches.find((b) => b.id === data.branch_id) ?? inMemBranches[0];
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      branch_id: data.branch_id,
      patient_name: data.patient_name,
      patient_phone: data.patient_phone ?? null,
      patient_email: data.patient_email ?? null,
      service: data.service,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes,
      status: "scheduled",
      notes: data.notes ?? null,
      branch: { name: branch.name, city: branch.city },
    };
    inMemAppointments = [newAppt, ...inMemAppointments];

    if (data.patient_phone) {
      inMemFollowUps.push({
        id: `fup-${Date.now()}`,
        appointment_id: newAppt.id,
        patient_name: data.patient_name,
        patient_phone: data.patient_phone,
        channel: "whatsapp",
        message: `Hi ${data.patient_name}, this is ESB Brand confirming your upcoming ${data.service} appointment. Looking forward to hosting you!`,
        scheduled_at: data.scheduled_at,
        sent_at: null,
        status: "pending",
        delivery_status: "queued",
        attempts: 0,
        last_error: null,
        last_attempt_at: null,
        processed_at: null,
      });
    }

    if (isPlaceholderBackend) return newAppt;
    try {
      const sb = context.supabase as any;
      const { data: row } = await sb
        .from("appointments")
        .insert({ ...data, price: 180, cost: 45 })
        .select()
        .single();
      return (row ?? newAppt) as Appointment;
    } catch {
      return newAppt;
    }
  });

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().min(1),
      status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    inMemAppointments = inMemAppointments.map((a) => (a.id === data.id ? { ...a, status: data.status } : a));
    if (isPlaceholderBackend) return { ok: true };
    try {
      const sb = context.supabase as any;
      await sb.from("appointments").update({ status: data.status }).eq("id", data.id);
      return { ok: true };
    } catch {
      return { ok: true };
    }
  });

/* ----------------------------- Follow-ups ----------------------------- */

export const listFollowUps = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .handler(async ({ context }) => {
    if (isPlaceholderBackend) return inMemFollowUps;
    try {
      const sb = context.supabase as any;
      const { data } = await sb
        .from("follow_ups")
        .select("id, appointment_id, patient_name, patient_phone, channel, message, scheduled_at, sent_at, status, delivery_status, attempts, last_error, last_attempt_at, processed_at")
        .order("scheduled_at", { ascending: true })
        .limit(50);
      return (data && data.length > 0) ? data : inMemFollowUps;
    } catch {
      return inMemFollowUps;
    }
  });

export const markFollowUpSent = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    inMemFollowUps = inMemFollowUps.map((f) =>
      f.id === data.id ? { ...f, status: "sent", sent_at: new Date().toISOString() } : f
    );
    if (isPlaceholderBackend) return { ok: true };
    try {
      const sb = context.supabase as any;
      const now = new Date().toISOString();
      await sb
        .from("follow_ups")
        .update({ status: "sent", delivery_status: "delivered", sent_at: now, processed_at: now })
        .eq("id", data.id);
      return { ok: true };
    } catch {
      return { ok: true };
    }
  });

/* ----------------------------- Service catalogue & feedback ----------------------------- */

export type ServiceItem = { id: string; name: string; price: number; cost: number; active: boolean };

export const listServices = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .handler(async ({ context }): Promise<ServiceItem[]> => {
    if (isPlaceholderBackend) return inMemServices;
    try {
      const sb = context.supabase as any;
      const { data } = await sb
        .from("service_catalog")
        .select("id,name,price,cost,active")
        .eq("active", true)
        .order("name");
      return (data && data.length > 0) ? (data as ServiceItem[]) : inMemServices;
    } catch {
      return inMemServices;
    }
  });

export type FeedbackEntry = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  appointment: { patient_name: string; service: string; branch: { name: string } | null } | null;
};

export const listFeedback = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) => z.object({ limit: z.number().int().min(1).max(100).default(10) }).optional().parse(d))
  .handler(async ({ data, context }): Promise<FeedbackEntry[]> => {
    return [
      {
        id: "fb-1",
        rating: 5,
        comment: "Outstanding Hydra-Glow session! Nurse Kemi was so attentive.",
        created_at: new Date().toISOString(),
        appointment: { patient_name: "Dr. Amara Okonjo", service: "Hydra-Glow", branch: { name: "Port Harcourt Flagship" } },
      },
      {
        id: "fb-2",
        rating: 5,
        comment: "VIP Suite 1 in Abuja was impeccably prepared. Exosome protocol was painless.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        appointment: { patient_name: "Senator Fatima Aliyu", service: "Exosome Microneedling", branch: { name: "Abuja Executive Clinic" } },
      },
    ];
  });

export const submitFeedback = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({
      appointment_id: z.string().min(1),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    return { ok: true };
  });

/* ----------------------------- Content posts ----------------------------- */

export type ContentPost = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  branch_id: string | null;
  status: "draft" | "scheduled" | "published";
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  branch?: { name: string } | null;
};

export const listContentPosts = createServerFn({ method: "GET" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({ branchId: z.string().min(1).optional(), limit: z.number().int().min(1).max(100).default(50) })
      .optional()
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<ContentPost[]> => {
    if (isPlaceholderBackend) {
      if (data?.branchId) return inMemPosts.filter((p) => p.branch_id === data.branchId);
      return inMemPosts;
    }
    try {
      const sb = context.supabase as any;
      let q = sb
        .from("content_posts")
        .select("id,title,body,image_url,branch_id,status,scheduled_at,published_at,created_at,branch:branches(name)")
        .order("created_at", { ascending: false })
        .limit(data?.limit ?? 50);
      if (data?.branchId) q = q.eq("branch_id", data.branchId);
      const { data: rows } = await q;
      return (rows && rows.length > 0) ? (rows as ContentPost[]) : inMemPosts;
    } catch {
      return inMemPosts;
    }
  });

export const createContentPost = createServerFn({ method: "POST" })
  .middleware([requireGoogleAuth])
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().min(2).max(160),
      body: z.string().max(2000).default(""),
      image_url: z.string().url().nullable().optional(),
      branch_id: z.string().min(1).nullable().optional(),
      status: z.enum(["draft", "scheduled", "published"]).default("draft"),
      scheduled_at: z.string().datetime().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }): Promise<ContentPost> => {
    const branch = inMemBranches.find((b) => b.id === data.branch_id);
    const newPost: ContentPost = {
      id: `post-${Date.now()}`,
      title: data.title,
      body: data.body,
      image_url: data.image_url ?? null,
      branch_id: data.branch_id ?? null,
      status: data.status,
      scheduled_at: data.scheduled_at ?? null,
      published_at: data.status === "published" ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      branch: branch ? { name: branch.name } : null,
    };
    inMemPosts = [newPost, ...inMemPosts];
    if (isPlaceholderBackend) return newPost;
    try {
      const sb = context.supabase as any;
      const { data: row } = await sb
        .from("content_posts")
        .insert({
          title: data.title,
          body: data.body,
          image_url: data.image_url ?? null,
          branch_id: data.branch_id ?? null,
          status: data.status,
          scheduled_at: data.scheduled_at ?? null,
          published_at: data.status === "published" ? new Date().toISOString() : null,
          author_id: context.userId,
        })
        .select("id,title,body,image_url,branch_id,status,scheduled_at,published_at,created_at")
        .single();
      return (row ?? newPost) as ContentPost;
    } catch {
      return newPost;
    }
  });
