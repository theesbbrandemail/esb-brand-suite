import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamResponsesText } from "@/lib/responses.server";

const Input = z.object({
  question: z.string().trim().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(6000) }))
    .max(12)
    .default([]),
});

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<{ text: string; error?: string }> => {
    const sb = context.supabase;
    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      sb.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      sb.rpc("has_role", { _user_id: context.userId, _role: "staff" }),
    ]);
    if (!isAdmin && !isStaff) return { text: "", error: "The assistant is for ESB staff only." };

    // Day boundaries in Africa/Lagos (UTC+1, no DST)
    const now = new Date();
    const lagos = new Date(now.getTime() + 3600e3);
    const dayStart = new Date(Date.UTC(lagos.getUTCFullYear(), lagos.getUTCMonth(), lagos.getUTCDate()) - 3600e3);
    const dayEnd = new Date(dayStart.getTime() + 864e5);
    const weekEnd = new Date(dayStart.getTime() + 7 * 864e5);
    const past = new Date(dayStart.getTime() - 14 * 864e5);

    const [branches, appts, inv, services] = await Promise.all([
      sb.from("branches").select("id,name"),
      sb
        .from("appointments")
        .select("patient_name,service,scheduled_at,duration_minutes,status,notes,price,branch_id")
        .gte("scheduled_at", past.toISOString())
        .lt("scheduled_at", weekEnd.toISOString())
        .order("scheduled_at")
        .limit(300),
      sb.from("inventory").select("qty,low_stock_threshold,branch_id,product:products(name)").limit(300),
      sb.from("service_catalog").select("name,category,price").limit(100),
    ]);
    const bn = new Map((branches.data ?? []).map((b) => [b.id, b.name]));
    const rows = (appts.data ?? []).map((a) => ({
      ...a,
      branch: bn.get(a.branch_id),
      branch_id: undefined,
      when: new Date(a.scheduled_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
    }));
    const t0 = dayStart.getTime(), t1 = dayEnd.getTime();
    const db = {
      nowLagos: now.toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
      todaysAppointments: rows.filter((r) => { const t = +new Date(r.scheduled_at); return t >= t0 && t < t1; }),
      next7Days: rows.filter((r) => +new Date(r.scheduled_at) >= t1),
      last14Days: rows.filter((r) => +new Date(r.scheduled_at) < t0),
      stock: (inv.data ?? []).map((i) => ({
        item: (i.product as { name?: string } | null)?.name,
        branch: bn.get(i.branch_id),
        qty: i.qty,
        lowAt: i.low_stock_threshold,
        low: i.qty <= i.low_stock_threshold,
      })),
      services: services.data ?? [],
    };

    const instructions =
      "You are the ESB Brand Suite command assistant for internal clinic staff (aesthetics, skincare, dental; branches Abuja and Port Harcourt, Nigeria). Answer ONLY from the DATABASE JSON provided. If the data doesn't contain the answer, say so plainly — never invent appointments, patients, stock or prices. Times are Africa/Lagos; currency NGN (₦). Use concise markdown (short headings, bullets, tables for lists). For treatment plans, base them on the patient's booking/service and notes, include protocol, aftercare and warning signs, and add a note that a clinician must review it.";
    const convo = data.history.map((m) => `${m.role === "user" ? "Staff" : "Assistant"}: ${m.text}`).join("\n\n");
    const input = `DATABASE:\n${JSON.stringify(db)}\n\n${convo ? `CONVERSATION SO FAR:\n${convo}\n\n` : ""}Staff question: ${data.question}`;

    return streamResponsesText({ instructions, input });
  });
