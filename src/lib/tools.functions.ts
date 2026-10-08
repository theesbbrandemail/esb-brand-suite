import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamResponsesText } from "@/lib/responses.server";

export type RestockRow = {
  id: string;
  product: string;
  branch: string;
  qty: number;
  threshold: number;
  dailyUse: number;
  daysLeft: number;
};

export type ToolResult = { text: string; error?: string; restock?: RestockRow[] };

const Input = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("treatment"), appointmentId: z.string().uuid(), extra: z.string().max(1000).optional() }),
  z.object({ tool: z.literal("shifts"), branchId: z.string().uuid().optional(), staffCount: z.number().int().min(1).max(50).default(4) }),
  z.object({ tool: z.literal("briefing"), branchId: z.string().uuid().optional() }),
  z.object({ tool: z.literal("restock"), branchId: z.string().uuid().optional() }),
]);

const BASE_RULES =
  "You are an internal operations assistant for ESB Brand, a group of aesthetics, skincare and dental clinics in Nigeria (branches: Abuja, Port Harcourt). Write for clinic staff. Use concise markdown with headings and bullet points. Never invent patient medical history beyond the data given; flag anything needing a clinician's judgement. Currency is NGN (₦).";

export const runOpsTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<ToolResult> => {
    const sb = context.supabase;
    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      sb.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      sb.rpc("has_role", { _user_id: context.userId, _role: "staff" }),
    ]);
    if (!isAdmin && !isStaff) return { text: "", error: "These tools are for ESB staff only." };

    const now = new Date();
    const branchesRes = await sb.from("branches").select("id,name");
    const branchName = new Map((branchesRes.data ?? []).map((b) => [b.id, b.name]));

    let instructions = BASE_RULES;
    let input = "";
    let restock: RestockRow[] | undefined;

    if (data.tool === "treatment") {
      const { data: a, error } = await sb
        .from("appointments")
        .select("patient_name,service,scheduled_at,duration_minutes,status,notes,branch_id")
        .eq("id", data.appointmentId)
        .maybeSingle();
      if (error || !a) return { text: "", error: "Booking not found." };
      const { data: history } = await sb
        .from("appointments")
        .select("service,scheduled_at,status")
        .eq("patient_name", a.patient_name)
        .neq("id", data.appointmentId)
        .order("scheduled_at", { ascending: false })
        .limit(10);
      instructions +=
        " Produce: 1) Treatment plan (goals, protocol steps, session count & spacing, products), 2) Pre-treatment checklist, 3) Aftercare instructions for the patient (day 0, days 1-3, week 1-2), 4) Warning signs to call the clinic, 5) Suggested follow-up booking.";
      input = JSON.stringify({
        booking: { ...a, branch: branchName.get(a.branch_id) },
        previousVisits: history ?? [],
        staffNotes: data.extra ?? "",
      });
    }

    if (data.tool === "shifts") {
      const end = new Date(now.getTime() + 7 * 864e5);
      let q = sb
        .from("appointments")
        .select("service,scheduled_at,duration_minutes,status,branch_id")
        .gte("scheduled_at", now.toISOString())
        .lte("scheduled_at", end.toISOString())
        .neq("status", "cancelled")
        .limit(400);
      if (data.branchId) q = q.eq("branch_id", data.branchId);
      const { data: appts } = await q;
      instructions +=
        ` Build a 7-day staff rota for ${data.staffCount} staff per branch (use role labels like Nurse A, Front desk, not names), covering peak booking hours, plus a daily task checklist per branch. End with a section titled "## Tasks" listing up to 8 one-line actionable tasks, each starting with "- ".`;
      input = JSON.stringify({
        today: now.toISOString(),
        bookings: (appts ?? []).map((x) => ({ ...x, branch: branchName.get(x.branch_id) })),
      });
    }

    if (data.tool === "briefing") {
      const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 864e5);
      const since = new Date(now.getTime() - 30 * 864e5);
      const scope = <T extends { eq: (c: string, v: string) => T }>(q: T) => (data.branchId ? q.eq("branch_id", data.branchId) : q);
      const [today, recent, inv, fu] = await Promise.all([
        scope(sb.from("appointments").select("service,scheduled_at,status,branch_id,price").gte("scheduled_at", dayStart.toISOString()).lt("scheduled_at", dayEnd.toISOString())),
        scope(sb.from("appointments").select("status,branch_id,price,scheduled_at").gte("scheduled_at", since.toISOString()).lt("scheduled_at", now.toISOString()).limit(1000)),
        scope(sb.from("inventory").select("qty,low_stock_threshold,branch_id,product:products(name)")),
        sb.from("follow_ups").select("id", { count: "exact", head: true }).in("delivery_status", ["pending", "ready"]),
      ]);
      const r = recent.data ?? [];
      const revenue = r.filter((x) => x.status === "completed").reduce((s, x) => s + Number(x.price ?? 0), 0);
      const noShow = r.filter((x) => x.status === "no_show").length;
      instructions +=
        " Write a morning ops briefing: Today at a glance, No-show risk, Stock risks, Revenue trend (30 days), and exactly 3 Top actions for today. Keep it under 300 words.";
      input = JSON.stringify({
        date: now.toDateString(),
        branch: data.branchId ? branchName.get(data.branchId) : "All branches",
        todaysBookings: (today.data ?? []).map((x) => ({ ...x, branch: branchName.get(x.branch_id) })),
        last30: { bookings: r.length, completedRevenue: revenue, noShows: noShow, noShowRate: r.length ? +(noShow / r.length).toFixed(3) : 0 },
        lowStock: (inv.data ?? []).filter((i) => i.qty <= i.low_stock_threshold).map((i) => ({ item: (i.product as { name?: string } | null)?.name, qty: i.qty, branch: branchName.get(i.branch_id) })),
        pendingFollowUps: fu.count ?? 0,
      });
    }

    if (data.tool === "restock") {
      const since = new Date(now.getTime() - 30 * 864e5);
      let iq = sb.from("inventory").select("id,qty,low_stock_threshold,branch_id,product:products(name)");
      let aq = sb.from("appointments").select("branch_id").gte("scheduled_at", since.toISOString()).lt("scheduled_at", now.toISOString()).neq("status", "cancelled").limit(2000);
      if (data.branchId) { iq = iq.eq("branch_id", data.branchId); aq = aq.eq("branch_id", data.branchId); }
      const [inv, appts] = await Promise.all([iq, aq]);
      const perBranch = new Map<string, number>();
      for (const a of appts.data ?? []) perBranch.set(a.branch_id, (perBranch.get(a.branch_id) ?? 0) + 1);
      restock = (inv.data ?? []).map((i) => {
        // Estimated usage: ~0.3 units per booking/day share, floored so idle items still deplete slowly.
        const dailyUse = Math.max(0.2, ((perBranch.get(i.branch_id) ?? 0) / 30) * 0.3);
        return {
          id: i.id,
          product: (i.product as { name?: string } | null)?.name ?? "Item",
          branch: branchName.get(i.branch_id) ?? "Branch",
          qty: i.qty,
          threshold: i.low_stock_threshold,
          dailyUse: +dailyUse.toFixed(2),
          daysLeft: Math.round(i.qty / dailyUse),
        };
      }).sort((a, b) => a.daysLeft - b.daysLeft);
      instructions +=
        " Using the forecast, draft a purchase order for items running out within 21 days or below threshold: a markdown table (Item, Branch, Current, Order qty for 30 days cover, Urgency), then 2-3 short notes on ordering strategy.";
      input = JSON.stringify({ forecast: restock.slice(0, 60) });
    }

    const res = await streamResponsesText({ instructions, input });
    if (res.error) return { text: "", error: res.error, restock };
    return { text: res.text, restock };
  });
