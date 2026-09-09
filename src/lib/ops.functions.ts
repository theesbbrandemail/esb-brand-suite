import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* ----------------------------- Types ----------------------------- */

export type Branch = { id: string; name: string; city: string | null; phone: string | null };

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

/** Statuses that count as realised revenue. */
const BILLABLE = new Set(["scheduled", "confirmed", "completed"]);

/* ----------------------------- KPIs ----------------------------- */

export const getCeoKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CeoKpis> => {
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

    // Real revenue: sum of the price actually attached to each billable booking.
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

    // Branch profitability from real bookings.
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

    // Customer satisfaction from real feedback ratings.
    const ratings = ((feedback.data ?? []) as { rating: number }[]).map((f) => Number(f.rating));
    const csatResponses = ratings.length;
    const csatScore = csatResponses > 0 ? ratings.reduce((s, r) => s + r, 0) / csatResponses : 0;
    const csatPromoters = ratings.filter((r) => r >= 4).length;
    const csatDetractors = ratings.filter((r) => r <= 2).length;
    const csatPercent = csatResponses > 0 ? Math.round((csatPromoters / csatResponses) * 100) : 0;
    const nps = csatResponses > 0
      ? Math.round(((csatPromoters - csatDetractors) / csatResponses) * 100)
      : 0;

    // Brand series — last 9 months: gold = bookings, violet = revenue in hundreds.
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
  });


/* ----------------------------- Branches ----------------------------- */

export const listBranches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Branch[]> => {
    const sb = context.supabase as any;
    const { data } = await sb.from("branches").select("id,name,city,phone").order("name");
    return (data ?? []) as Branch[];
  });

/* ----------------------------- Reminders ----------------------------- */

export const listReminders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Reminder[]> => {
    const sb = context.supabase as any;
    const { data } = await sb
      .from("ceo_reminders")
      .select("id,title,body,category,priority,due_at,status")
      .eq("user_id", context.userId)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(20);
    return (data ?? []) as Reminder[];
  });

export const createReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
    const sb = context.supabase as any;
    const { data: row, error } = await sb
      .from("ceo_reminders")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as Reminder;
  });

export const updateReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "done"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }): Promise<Reminder> => {
    const sb = context.supabase as any;
    if (!data.status) throw new Error("Nothing to update");
    const { data: row, error } = await sb
      .from("ceo_reminders")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id,title,body,category,priority,due_at,status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Reminder not found");
    return row as Reminder;
  });

/* ----------------------------- Inventory ----------------------------- */

export const listInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ branchId: z.string().uuid().optional() }).optional().parse(d))
  .handler(async ({ data, context }): Promise<InventoryRow[]> => {
    const sb = context.supabase as any;
    let q = sb
      .from("inventory")
      .select("id, branch_id, product_id, qty, low_stock_threshold, updated_at, branch:branches(name,city), product:products(name,sku,brand,category,image_url)")
      .order("updated_at", { ascending: false });
    if (data?.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as InventoryRow[];
  });

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), delta: z.number().int() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const { data: cur, error: e1 } = await sb.from("inventory").select("qty").eq("id", data.id).single();
    if (e1) throw new Error(e1.message);
    const next = Math.max(0, (cur?.qty ?? 0) + data.delta);
    const { error } = await sb.from("inventory").update({ qty: next, updated_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, qty: next };
  });

/* ----------------------------- Appointments ----------------------------- */

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      branchId: z.string().uuid().optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }).optional().parse(d),
  )
  .handler(async ({ data, context }): Promise<Appointment[]> => {
    const sb = context.supabase as any;
    let q = sb
      .from("appointments")
      .select("id, branch_id, patient_name, patient_phone, patient_email, service, scheduled_at, duration_minutes, status, notes, branch:branches(name,city)")
      .order("scheduled_at", { ascending: true })
      .limit(200);
    if (data?.branchId) q = q.eq("branch_id", data.branchId);
    if (data?.from) q = q.gte("scheduled_at", data.from);
    if (data?.to) q = q.lt("scheduled_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as Appointment[];
  });

export const createAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      branch_id: z.string().uuid(),
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
    const sb = context.supabase as any;
    // Price the booking from the service catalogue so revenue KPIs are real.
    const { data: svc } = await sb
      .from("service_catalog")
      .select("price, cost")
      .ilike("name", data.service.trim())
      .maybeSingle();
    const { data: row, error } = await sb
      .from("appointments")
      .insert({ ...data, price: svc?.price ?? null, cost: svc?.cost ?? null })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Auto-schedule a follow-up 24h after appointment if phone is provided.
    if (row?.patient_phone) {
      const followAt = new Date(new Date(data.scheduled_at).getTime() + 24 * 3600000).toISOString();
      // idempotency_key ensures we never enqueue two follow-ups for the same
      // appointment+scheduled_at, even if createAppointment is retried.
      const idemSource = `${row.id}:${followAt}`;
      const idemBuf = new TextEncoder().encode(idemSource);
      const hash = await crypto.subtle.digest("SHA-256", idemBuf);
      const idempotency_key = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0")).join("");
      await sb.from("follow_ups").upsert({
        appointment_id: row.id,
        patient_name: data.patient_name,
        patient_phone: data.patient_phone,
        patient_email: data.patient_email,
        channel: "whatsapp",
        message: `Hi ${data.patient_name}, this is ESB Brand following up on your ${data.service} appointment. How are you feeling? Reply here to chat with our team.`,
        scheduled_at: followAt,
        idempotency_key,
      }, { onConflict: "idempotency_key", ignoreDuplicates: true });
    }
    return row as Appointment;
  });

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const { error } = await sb.from("appointments").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------- Follow-ups ----------------------------- */

export const listFollowUps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const { data } = await sb
      .from("follow_ups")
      .select("id, appointment_id, patient_name, patient_phone, channel, message, scheduled_at, sent_at, status, delivery_status, attempts, last_error, last_attempt_at, processed_at")
      .order("scheduled_at", { ascending: true })
      .limit(50);
    return (data ?? []) as Array<{
      id: string; appointment_id: string | null; patient_name: string; patient_phone: string | null;
      channel: string; message: string; scheduled_at: string; sent_at: string | null; status: string;
      delivery_status: string; attempts: number; last_error: string | null;
      last_attempt_at: string | null; processed_at: string | null;
    }>;
  });

export const markFollowUpSent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const now = new Date().toISOString();
    const { error } = await sb
      .from("follow_ups")
      .update({ status: "sent", delivery_status: "delivered", sent_at: now, processed_at: now, locked_at: null, locked_by: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
