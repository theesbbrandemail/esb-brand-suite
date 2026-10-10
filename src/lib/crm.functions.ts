import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/zoho_crm";

export const CRM_MODULES = ["Leads", "Contacts", "Accounts", "Deals", "Tasks", "Calls", "Meetings"] as const;
export type CrmModule = (typeof CRM_MODULES)[number];

/** Default list columns per module (standard Zoho API names). */
const FIELDS: Record<CrmModule, string[]> = {
  Leads: ["Full_Name", "Last_Name", "First_Name", "Email", "Phone", "Company", "Lead_Status", "Owner", "Modified_Time"],
  Contacts: ["Full_Name", "Last_Name", "First_Name", "Email", "Phone", "Account_Name", "Owner", "Modified_Time"],
  Accounts: ["Account_Name", "Phone", "Website", "Industry", "Owner", "Modified_Time"],
  Deals: ["Deal_Name", "Stage", "Amount", "Closing_Date", "Account_Name", "Owner", "Modified_Time"],
  Tasks: ["Subject", "Status", "Priority", "Due_Date", "What_Id", "Owner", "Modified_Time"],
  Calls: ["Subject", "Call_Type", "Call_Start_Time", "Call_Duration", "Owner", "Modified_Time"],
  Meetings: ["Event_Title", "Start_DateTime", "End_DateTime", "Venue", "Owner", "Modified_Time"],
};

export type CrmRecord = Record<string, unknown> & { id: string };
export type CrmResult<T> = { ok: true; data: T } | { ok: false; error: string; code: "not_connected" | "auth" | "rate_limited" | "forbidden" | "error" };

type Ctx = { supabase: any; userId: string };

async function assertStaff(ctx: Ctx) {
  const { data } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.some((r: string) => r !== "public")) throw new Error("Forbidden: staff only");
}

async function logIntegration(action: string, status: number | null, message: string, userId: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("integration_logs").insert({ integration: "zoho_crm", action, status, message: message.slice(0, 2000), user_id: userId });
  } catch (e) {
    console.error("[crm] log failed", e);
  }
}

async function zoho<T>(ctx: Ctx, action: string, path: string, init?: { method?: string; body?: unknown }): Promise<CrmResult<T>> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const zohoKey = process.env["ZOHO_CRM_API_KEY"];
  if (!lovableKey || !zohoKey) return { ok: false, code: "not_connected", error: "Zoho CRM is not connected yet." };
  let res: Response;
  try {
    res = await fetch(`${GATEWAY_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": zohoKey,
        "Content-Type": "application/json",
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
  } catch (e) {
    await logIntegration(action, null, String(e), ctx.userId);
    return { ok: false, code: "error", error: "Couldn't reach Zoho CRM. Please try again." };
  }
  if (res.status === 204) return { ok: true, data: { data: [], info: { more_records: false } } as T };
  const text = await res.text();
  if (!res.ok) {
    await logIntegration(action, res.status, text, ctx.userId);
    if (res.status === 401) return { ok: false, code: "auth", error: "Zoho authorisation expired. An admin needs to reconnect Zoho CRM." };
    if (res.status === 403) return { ok: false, code: "forbidden", error: "Your Zoho account doesn't have permission for this action." };
    if (res.status === 429) return { ok: false, code: "rate_limited", error: "Zoho rate limit reached. Wait a minute and retry." };
    let msg = "Zoho CRM returned an error.";
    try { msg = JSON.parse(text)?.data?.[0]?.message ?? JSON.parse(text)?.message ?? msg; } catch { /* keep */ }
    return { ok: false, code: "error", error: msg };
  }
  const json = text ? JSON.parse(text) : {};
  // Zoho returns per-record status in 2xx bodies for writes.
  const first = json?.data?.[0];
  if (first && first.status === "error") {
    await logIntegration(action, res.status, text, ctx.userId);
    return { ok: false, code: "error", error: first.message ?? "Zoho rejected the change." };
  }
  return { ok: true, data: json as T };
}

const ModuleZ = z.enum(CRM_MODULES);

export const crmStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const connected = !!process.env["ZOHO_CRM_API_KEY"];
    if (!connected) return { connected: false, user: null as string | null, error: null as string | null, checkedAt: new Date().toISOString() };
    const r = await zoho<{ users?: { full_name?: string; email?: string }[] }>(context, "status", "/users?type=CurrentUser");
    return {
      connected: r.ok,
      user: r.ok ? r.data.users?.[0]?.full_name ?? r.data.users?.[0]?.email ?? null : null,
      error: r.ok ? null : r.error,
      checkedAt: new Date().toISOString(),
    };
  });

export const crmList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ module: ModuleZ, page: z.number().int().min(1).max(500).default(1), search: z.string().max(100).optional(), sortBy: z.string().max(40).optional(), sortOrder: z.enum(["asc", "desc"]).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const fields = FIELDS[data.module].join(",");
    let path: string;
    if (data.search && data.search.trim().length >= 2) {
      path = `/${data.module}/search?word=${encodeURIComponent(data.search.trim())}&page=${data.page}&per_page=25`;
    } else {
      const sort = data.sortBy ? `&sort_by=${encodeURIComponent(data.sortBy)}&sort_order=${data.sortOrder ?? "desc"}` : "&sort_by=Modified_Time&sort_order=desc";
      path = `/${data.module}?fields=${encodeURIComponent(fields)}&page=${data.page}&per_page=25${sort}`;
    }
    const r = await zoho<{ data: CrmRecord[]; info?: { more_records?: boolean } }>(context, `list:${data.module}`, path);
    if (!r.ok) return r;
    return { ok: true as const, data: { records: r.data.data ?? [], more: !!r.data.info?.more_records, fields: FIELDS[data.module], syncedAt: new Date().toISOString() } };
  });

export const crmGet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ module: ModuleZ, id: z.string().regex(/^\d{5,25}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const [rec, notes] = await Promise.all([
      zoho<{ data: CrmRecord[] }>(context, `get:${data.module}`, `/${data.module}/${data.id}`),
      zoho<{ data: CrmRecord[] }>(context, `notes:${data.module}`, `/${data.module}/${data.id}/Notes?fields=Note_Title,Note_Content,Created_Time,Owner&per_page=20`),
    ]);
    if (!rec.ok) return rec;
    return { ok: true as const, data: { record: rec.data.data?.[0] ?? null, notes: notes.ok ? notes.data.data ?? [] : [] } };
  });

const Values = z.record(z.string().max(60), z.union([z.string().max(2000), z.number(), z.boolean(), z.null()]));

export const crmFindDuplicates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ module: ModuleZ, email: z.string().max(200).optional(), phone: z.string().max(40).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const found: CrmRecord[] = [];
    if (data.email) {
      const r = await zoho<{ data: CrmRecord[] }>(context, `dupe:${data.module}`, `/${data.module}/search?email=${encodeURIComponent(data.email)}`);
      if (r.ok) found.push(...(r.data.data ?? []));
    }
    if (data.phone) {
      const r = await zoho<{ data: CrmRecord[] }>(context, `dupe:${data.module}`, `/${data.module}/search?phone=${encodeURIComponent(data.phone)}`);
      if (r.ok) for (const x of r.data.data ?? []) if (!found.some((f) => f.id === x.id)) found.push(x);
    }
    return { duplicates: found.slice(0, 5) };
  });

export const crmSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ module: ModuleZ, id: z.string().regex(/^\d{5,25}$/).optional(), values: Values }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const body = { data: [data.id ? { id: data.id, ...data.values } : data.values] };
    const r = await zoho<{ data: { details?: { id?: string } }[] }>(context, `${data.id ? "update" : "create"}:${data.module}`, `/${data.module}`, { method: data.id ? "PUT" : "POST", body });
    if (!r.ok) return r;
    return { ok: true as const, data: { id: r.data.data?.[0]?.details?.id ?? data.id ?? null } };
  });

export const crmAddNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ module: ModuleZ, id: z.string().regex(/^\d{5,25}$/), title: z.string().max(120).optional(), content: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const r = await zoho(context, `note:${data.module}`, `/${data.module}/${data.id}/Notes`, {
      method: "POST",
      body: { data: [{ Note_Title: data.title ?? "Note", Note_Content: data.content }] },
    });
    if (!r.ok) return r;
    return { ok: true as const, data: true };
  });

export const crmLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("integration_logs").select("id,action,status,message,created_at").order("created_at", { ascending: false }).limit(30);
    return data ?? [];
  });
